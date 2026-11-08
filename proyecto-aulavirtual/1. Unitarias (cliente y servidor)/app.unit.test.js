/** @jest-environment jsdom */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const app = require("../app/app.js");

const html = fs.readFileSync(path.resolve(__dirname, "../app/index.html"), "utf8");
const bodyMarkup = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

const coursesFixture = [
  {
    id: "calc-201", code: "MAT-201", name: "Cálculo diferencial", teacher: "Dra. Elena Torres",
    schedule: "Lun · Mié · 10:00 a. m.", room: "B-204", credits: 4, average: 16.8,
    grades: { t1: 17, t2: 16, t3: 18, final: 17.2 },
  },
  {
    id: "met-220", code: "INV-220", name: "Metodología de investigación", teacher: "Dra. Lucía Herrera",
    schedule: "Mar · Vie · 2:00 p. m.", room: "C-301", credits: 3, average: 15.6,
    grades: { t1: 15, t2: 16, t3: null, final: 15.5 },
  },
];

beforeEach(() => {
  document.body.innerHTML = bodyMarkup;
  app.setCourses(coursesFixture);
  app.setMessages([]);
});

describe("lógica del cliente del aula virtual", () => {
  test("escapa caracteres HTML especiales", () => {
    expect(app.escapeHtml(`<script a="b">'&`)).toBe("&lt;script a=&quot;b&quot;&gt;&#39;&amp;");
  });

  test("renderiza una fila de curso con promedio y progreso", () => {
    const htmlRow = app.renderCourseRow(coursesFixture[0], 0);
    expect(htmlRow).toContain("Cálculo diferencial");
    expect(htmlRow).toContain("Dra. Elena Torres");
    expect(htmlRow).toContain("16.8");
    expect(htmlRow).toContain("width-80");
  });

  test("escapa el contenido no confiable de un curso", () => {
    const htmlRow = app.renderCourseRow({ ...coursesFixture[0], name: "<img src=x onerror=alert(1)>" }, 0);
    expect(htmlRow).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(htmlRow).not.toContain("<img src=x");
  });

  test("renderiza cursos, notas y opciones de selección", () => {
    app.renderCourses();
    expect(document.querySelectorAll("#all-courses .course-tile")).toHaveLength(2);
    expect(document.querySelector("#grades-body").textContent).toContain("15.5");
    expect(document.querySelector("#grades-body").textContent).toContain("—");
    expect(document.querySelectorAll("#message-course option")).toHaveLength(3);
  });

  test("muestra el estado vacío de la bandeja", () => {
    app.renderMessages();
    expect(document.querySelector("#messages-list .empty-messages").textContent)
      .toContain("Todavía no has enviado mensajes");
  });

  test("renderiza mensajes del más reciente al más antiguo", () => {
    app.setMessages([
      { teacherInitials: "ET", teacher: "Dra. Elena Torres", subject: "Primero", courseName: "Cálculo", body: "Mensaje uno", createdAt: "2026-01-01T10:00:00Z" },
      { teacherInitials: "LM", teacher: "Lic. Laura Mora", subject: "Segundo", courseName: "Bases de datos", body: "Mensaje dos", createdAt: "2026-01-02T10:00:00Z" },
    ]);
    app.renderMessages();
    const entries = [...document.querySelectorAll("#messages-list .message-entry")];
    expect(entries).toHaveLength(2);
    expect(entries[0].textContent).toContain("Segundo");
    expect(entries[1].textContent).toContain("Primero");
  });

  test("escapa contenido de mensajes antes de insertarlo en la bandeja", () => {
    app.setMessages([{
      teacherInitials: "ET", teacher: "Dra. Elena Torres", subject: "<b>Asunto</b>", courseName: "Cálculo",
      body: "<img src=x onerror=alert(1)>", createdAt: "2026-01-02T10:00:00Z",
    }]);
    app.renderMessages();
    expect(document.querySelector("#messages-list b")).toBeNull();
    expect(document.querySelector("#messages-list img")).toBeNull();
    expect(document.querySelector("#messages-list").innerHTML).toContain("&lt;img");
  });

  test("muestra una sección válida y actualiza navegación", () => {
    app.showView("cursos");
    expect(document.querySelector("#view-cursos").classList.contains("hidden")).toBe(false);
    expect(document.querySelector("#view-inicio").classList.contains("hidden")).toBe(true);
    expect(document.querySelector("#breadcrumb-current").textContent).toBe("Mis cursos");
    expect(document.querySelector('[data-view="cursos"]').classList.contains("active")).toBe(true);
  });

  test("ignora una sección inexistente sin cambiar la vista", () => {
    app.showView("inicio");
    const breadcrumb = document.querySelector("#breadcrumb-current").textContent;
    const hash = location.hash;
    app.showView("biblioteca");
    expect(document.querySelector("#view-inicio").classList.contains("hidden")).toBe(false);
    expect(document.querySelector("#breadcrumb-current").textContent).toBe(breadcrumb);
    expect(location.hash).toBe(hash);
  });

  test("rechaza curso, asunto o mensaje ausentes y valores con solo espacios", () => {
    expect(app.validateMessagePayload({ subject: "Asunto válido", body: "Mensaje válido" })).not.toBe("");
    expect(app.validateMessagePayload({ courseId: "calc-201", subject: "   ", body: "Mensaje válido" })).not.toBe("");
    expect(app.validateMessagePayload({ courseId: "calc-201", subject: "Asunto válido", body: "    " })).not.toBe("");
  });

  test("valida los límites inferior y superior del asunto", () => {
    const valid = { courseId: "calc-201", subject: "Asunto", body: "Mensaje válido" };
    expect(app.validateMessagePayload({ ...valid, subject: "ab" })).not.toBe("");
    expect(app.validateMessagePayload({ ...valid, subject: "abc" })).toBe("");
    expect(app.validateMessagePayload({ ...valid, subject: "a".repeat(100) })).toBe("");
    expect(app.validateMessagePayload({ ...valid, subject: "a".repeat(101) })).not.toBe("");
  });

  test("valida los límites inferior y superior del mensaje", () => {
    const valid = { courseId: "calc-201", subject: "Consulta", body: "Mensaje" };
    expect(app.validateMessagePayload({ ...valid, body: "abcd" })).not.toBe("");
    expect(app.validateMessagePayload({ ...valid, body: "abcde" })).toBe("");
    expect(app.validateMessagePayload({ ...valid, body: "a".repeat(1000) })).toBe("");
    expect(app.validateMessagePayload({ ...valid, body: "a".repeat(1001) })).not.toBe("");
  });

  test("permite continuar con un mensaje válido", () => {
    expect(app.validateMessagePayload({
      courseId: "calc-201", subject: "Consulta de práctica", body: "¿Puede explicar el ejercicio tres?",
    })).toBe("");
  });
});
