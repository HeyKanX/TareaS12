"use strict";

const request = require("supertest");
const { createServer } = require("../backend/server.js");

describe("integración HTTP de Aula Nova", () => {
  let server;
  let baselineMessages;

  beforeEach(async () => {
    server = createServer();
    const response = await request(server).get("/api/messages");
    baselineMessages = response.body.messages.length;
  });

  afterEach(async () => {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  });

  test("sirve la página principal con cabeceras de seguridad", async () => {
    const response = await request(server).get("/");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(response.text).toContain("Aula Nova");
  });

  test("sirve los recursos CSS y JavaScript", async () => {
    const [css, js] = await Promise.all([
      request(server).get("/styles.css"),
      request(server).get("/app.js"),
    ]);
    expect(css.status).toBe(200);
    expect(css.headers["content-type"]).toMatch(/text\/css/);
    expect(js.status).toBe(200);
    expect(js.headers["content-type"]).toMatch(/javascript/);
  });

  test("devuelve el perfil con su estructura académica", async () => {
    const response = await request(server).get("/api/student");
    expect(response.status).toBe(200);
    expect(response.body.student).toMatchObject({
      firstName: expect.any(String),
      lastName: expect.any(String),
      code: "202310458",
      email: expect.any(String),
      program: expect.any(String),
      faculty: expect.any(String),
      cycle: expect.any(String),
    });
  });

  test("devuelve cuatro cursos con notas y T3 pendiente", async () => {
    const response = await request(server).get("/api/courses");
    expect(response.status).toBe(200);
    expect(response.body.courses).toHaveLength(4);
    expect(Object.keys(response.body.courses[0].grades)).toEqual(["t1", "t2", "t3", "final"]);
    expect(response.body.courses.find(course => course.id === "met-220").grades.t3).toBeNull();
  });

  test("devuelve la bandeja como un arreglo de mensajes", async () => {
    const response = await request(server).get("/api/messages");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.messages)).toBe(true);
    expect(response.body.messages).toHaveLength(baselineMessages);
  });

  test("registra un mensaje válido y asigna el docente del curso", async () => {
    const response = await request(server).post("/api/messages").send({
      courseId: "calc-201",
      subject: "  Consulta de práctica  ",
      body: "  ¿Puede explicar el ejercicio tres?  ",
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toMatchObject({
      courseId: "calc-201",
      teacher: "Dra. Elena Torres",
      subject: "Consulta de práctica",
      body: "¿Puede explicar el ejercicio tres?",
    });
    expect(Date.parse(response.body.message.createdAt)).not.toBeNaN();
  });

  test("mantiene temporalmente los mensajes durante la vida del servidor", async () => {
    const first = await request(server).post("/api/messages").send({
      courseId: "calc-201", subject: "Primera consulta", body: "Mensaje de prueba uno.",
    });
    const second = await request(server).post("/api/messages").send({
      courseId: "prog-105", subject: "Segunda consulta", body: "Mensaje de prueba dos.",
    });
    const inbox = await request(server).get("/api/messages");
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(inbox.body.messages).toHaveLength(baselineMessages + 2);
    expect(inbox.body.messages.map(message => message.subject)).toEqual(expect.arrayContaining([
      "Primera consulta", "Segunda consulta",
    ]));
  });

  test("rechaza un curso inexistente sin guardar el mensaje", async () => {
    const response = await request(server).post("/api/messages").send({
      courseId: "curso-inexistente", subject: "Consulta válida", body: "Texto de consulta válido.",
    });
    const inbox = await request(server).get("/api/messages");
    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
    expect(inbox.body.messages).toHaveLength(baselineMessages);
  });

  test("rechaza campos ausentes y longitudes fuera de límites", async () => {
    const invalidPayloads = [
      { subject: "Consulta válida", body: "Texto de consulta válido." },
      { courseId: "calc-201", subject: "ab", body: "Texto de consulta válido." },
      { courseId: "calc-201", subject: "a".repeat(101), body: "Texto de consulta válido." },
      { courseId: "calc-201", subject: "Consulta válida", body: "abcd" },
      { courseId: "calc-201", subject: "Consulta válida", body: "x".repeat(1001) },
    ];
    for (const payload of invalidPayloads) {
      const response = await request(server).post("/api/messages").send(payload);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    }
    const inbox = await request(server).get("/api/messages");
    expect(inbox.body.messages).toHaveLength(baselineMessages);
  });

  test("rechaza JSON mal formado", async () => {
    const response = await request(server)
      .post("/api/messages")
      .set("Content-Type", "application/json")
      .send("{");
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/JSON válido/i);
  });

  test("rechaza cuerpos que superan 16 KiB", async () => {
    const response = await request(server).post("/api/messages").send({ body: "x".repeat(17 * 1024) });
    expect(response.status).toBe(413);
    expect(response.body.error).toMatch(/tamaño permitido/i);
  });

  test("devuelve 404 para rutas desconocidas y 403 fuera de app", async () => {
    const [webRoute, apiRoute, traversal] = await Promise.all([
      request(server).get("/ruta-inexistente"),
      request(server).get("/api/ruta-inexistente"),
      request(server).get("/..%2Fbackend%2Fserver.js"),
    ]);
    expect(webRoute.status).toBe(404);
    expect(apiRoute.status).toBe(404);
    expect(traversal.status).toBe(403);
  });
});
