/** @jest-environment jsdom */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const app = require("../app/app.js");

const html = fs.readFileSync(path.resolve(__dirname, "../app/index.html"), "utf8");
const markup = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
const courses = [
  { id: "calc-201", code: "MAT-201", name: "Cálculo", teacher: "Dra. Elena Torres", schedule: "Lun", room: "B-204", credits: 4, average: 16.8, grades: { t1: 17, t2: 16, t3: 18, final: 17.2 } },
  { id: "prog-105", code: "INF-105", name: "Programación", teacher: "Mg. Carlos Mendoza", schedule: "Mar", room: "Lab. 3", credits: 4, average: 18.2, grades: { t1: 18, t2: 19, t3: 17, final: 18.2 } },
  { id: "met-220", code: "INV-220", name: "Metodología", teacher: "Dra. Lucía Herrera", schedule: "Mié", room: "C-301", credits: 3, average: 15.6, grades: { t1: 15, t2: 16, t3: null, final: 15.5 } },
  { id: "bd-210", code: "INF-210", name: "Bases de datos", teacher: "Mg. Andrés Paredes", schedule: "Jue", room: "Lab. 2", credits: 4, average: 15.2, grades: { t1: 16, t2: 14, t3: 16, final: 15.2 } },
];
const student = {
  firstName: "María", lastName: "García López", code: "202310458",
  email: "maria@universidad.edu", program: "Ingeniería", faculty: "Ingeniería", cycle: "VI",
};

function response(data, ok = true) {
  return { ok, json: async () => data };
}

function submit(form) {
  const event = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  document.body.innerHTML = markup;
  app.setCourses(courses);
  app.setMessages([]);
  app.renderCourses();
  document.querySelector("#message-dialog").showModal = jest.fn();
  document.querySelector("#message-dialog").close = jest.fn();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test("initialize carga perfil, cursos y mensajes y respeta la vista inicial", async () => {
  global.fetch.mockImplementation(async (url) => {
    if (url === "/api/student") return response({ student });
    if (url === "/api/courses") return response({ courses });
    return response({ messages: [{ teacherInitials: "ET", teacher: "Dra. Elena Torres", subject: "Consulta", courseName: "Cálculo", body: "Texto de ejemplo", createdAt: "2026-01-02T10:00:00Z" }] });
  });
  history.replaceState(null, "", "#perfil");

  await app.initialize();

  expect(global.fetch).toHaveBeenCalledTimes(3);
  expect(document.querySelector("#sidebar-name").textContent).toBe("María García");
  expect(document.querySelector("#profile-email").textContent).toBe(student.email);
  expect(document.querySelectorAll("#dashboard-courses .course-row")).toHaveLength(4);
  expect(document.querySelector("#view-perfil").classList.contains("hidden")).toBe(false);
  expect(document.querySelector("#messages-list").textContent).toContain("Consulta");
});

test("initialize muestra el error del servidor escapado cuando falla una solicitud", async () => {
  global.fetch.mockResolvedValue(response({ error: "<sin conexión>" }, false));

  await app.initialize();

  expect(document.querySelector(".page-content").textContent).toContain("<sin conexión>");
  expect(document.querySelector(".page-content").innerHTML).toContain("&lt;sin conexión&gt;");
});

test("initialize usa el mensaje genérico cuando fetch falla sin respuesta HTTP", async () => {
  global.fetch.mockRejectedValue(new Error("red caída"));

  await app.initialize();

  expect(document.querySelector(".page-content").textContent).toContain("red caída");
});

test("bindEvents conecta navegación, accesos, diálogo y menú lateral", () => {
  app.bindEvents();
  const dialog = document.querySelector("#message-dialog");
  document.querySelector("#form-feedback").textContent = "Mensaje anterior";
  document.querySelector("[data-open-message]").click();
  expect(dialog.showModal).toHaveBeenCalled();
  expect(document.querySelector("#form-feedback").textContent).toBe("");
  document.querySelector("#close-dialog").click();
  document.querySelector("#cancel-dialog").click();
  expect(dialog.close).toHaveBeenCalledTimes(2);

  document.querySelector("#menu-toggle").click();
  expect(document.querySelector("#sidebar").classList.contains("open")).toBe(true);
  expect(document.querySelector("#menu-toggle").getAttribute("aria-expanded")).toBe("true");
  document.querySelector("#sidebar-scrim").click();
  expect(document.querySelector("#sidebar").classList.contains("open")).toBe(false);
  expect(document.querySelector("#menu-toggle").getAttribute("aria-expanded")).toBe("false");
  document.querySelector("#menu-toggle").click();
  expect(document.querySelector("#sidebar-scrim").classList.contains("show")).toBe(true);
  document.querySelector("#profile-shortcut").click();
  expect(document.querySelector("#view-perfil").classList.contains("hidden")).toBe(false);
  const navEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
  document.querySelector('[data-view="cursos"]').dispatchEvent(navEvent);
  expect(navEvent.defaultPrevented).toBe(true);
  expect(document.querySelector("#view-cursos").classList.contains("hidden")).toBe(false);
});

test("submit del formulario detiene los datos inválidos sin llamar a la API", async () => {
  app.bindEvents();
  document.querySelector("#message-course").value = "calc-201";
  document.querySelector("#message-subject").value = "ab";
  document.querySelector("#message-body").value = "corto";
  const event = submit(document.querySelector("#message-form"));

  await Promise.resolve();

  expect(event.defaultPrevented).toBe(true);
  expect(document.querySelector("#form-feedback").textContent)
    .toBe("El asunto debe tener entre 3 y 100 caracteres.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("submit válido guarda y muestra el mensaje y reactiva el botón", async () => {
  jest.useFakeTimers();
  global.fetch.mockResolvedValue(response({ message: {
    id: "msg-1", teacherInitials: "ET", teacher: "Dra. Elena Torres", subject: "Consulta", courseName: "Cálculo",
    body: "Texto para la profesora", createdAt: "2026-01-02T10:00:00Z",
  } }, true));
  app.bindEvents();
  document.querySelector("#message-course").value = "calc-201";
  document.querySelector("#message-subject").value = "Consulta";
  document.querySelector("#message-body").value = "Texto para la profesora";
  const button = document.querySelector("#send-message");

  submit(document.querySelector("#message-form"));
  expect(button.disabled).toBe(true);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();

  expect(global.fetch).toHaveBeenCalledWith("/api/messages", expect.objectContaining({ method: "POST" }));
  expect(button.disabled).toBe(false);
  expect(document.querySelector("#message-dialog").close).toHaveBeenCalled();
  expect(document.querySelector("#messages-list").textContent).toContain("Consulta");
  expect(document.querySelector("#toast").textContent).toContain("Mensaje enviado correctamente");
  jest.runOnlyPendingTimers();
});

test.each([
  ["fallo HTTP", response({ error: "Docente no disponible" }, false), "Docente no disponible"],
  ["error sin detalle", response({}, false), "No se pudo completar la solicitud."],
])("submit conserva el formulario y muestra %s", async (_label, apiResponse, message) => {
  global.fetch.mockResolvedValue(apiResponse);
  app.bindEvents();
  document.querySelector("#message-course").value = "calc-201";
  document.querySelector("#message-subject").value = "Consulta";
  document.querySelector("#message-body").value = "Texto para la profesora";

  submit(document.querySelector("#message-form"));
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();

  expect(document.querySelector("#form-feedback").textContent).toBe(message);
  expect(document.querySelector("#message-dialog").close).not.toHaveBeenCalled();
  expect(document.querySelector("#send-message").disabled).toBe(false);
});
