"use strict";

const fs = require("node:fs");
const path = require("node:path");
const app = require("../app/app.js");

const html = fs.readFileSync(path.resolve(__dirname, "../app/index.html"), "utf8");
const markup = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
const course = {
  id: "calc-201", code: "MAT-201", name: "Cálculo", teacher: "Dra. Elena Torres",
  schedule: "Lun", room: "B-204", credits: 4, average: 15,
  grades: { t1: 15, t2: 15, t3: 15, final: 15 },
};

beforeEach(() => {
  document.body.innerHTML = markup;
  app.setCourses([course]);
  app.setMessages([]);
});

test("control: acepta una consulta válida", () => {
  expect(app.validateMessagePayload({ courseId: "calc-201", subject: "Consulta", body: "Texto válido" })).toBe("");
});

test("control: una nota final de 11 se muestra aprobada", () => {
  app.setCourses([{ ...course, grades: { ...course.grades, final: 11 } }]);
  app.renderCourses();
  expect(document.querySelector("#grades-body tr:last-child").textContent).toContain("Aprobado");
});

test("una nota desaprobatoria debe indicarse en la tabla", () => {
  app.setCourses([{ ...course, grades: { ...course.grades, final: 10.9 } }]);
  app.renderCourses();
  expect(document.querySelector("#grades-body tr:last-child").textContent).toContain("Desaprobado");
});

test("el curso con espacios se rechaza antes de llamar a la API", () => {
  expect(app.validateMessagePayload({ courseId: "   ", subject: "Consulta", body: "Texto válido" })).not.toBe("");
});

test("courseId debe ser una cadena", () => {
  expect(app.validateMessagePayload({ courseId: { id: "calc-201" }, subject: "Consulta", body: "Texto válido" })).not.toBe("");
});

test("el formulario rechaza IDs de cursos inexistentes", () => {
  expect(app.validateMessagePayload({ courseId: "curso-inexistente", subject: "Consulta", body: "Texto válido" })).not.toBe("");
});

test("el progreso de una nota negativa se limita a cero", () => {
  expect(app.renderCourseRow({ ...course, average: -4 }, 0)).toContain("width-0");
});

test("cambiar de sección agrega una entrada al historial", () => {
  const pushState = jest.spyOn(history, "pushState");
  app.showView("cursos");
  expect(pushState).toHaveBeenCalled();
});

test("volver en el navegador sincroniza la sección visible", () => {
  app.bindEvents();
  app.showView("perfil");
  history.pushState(null, "", "#cursos");
  window.dispatchEvent(new PopStateEvent("popstate"));
  expect(document.querySelector("#view-cursos").classList.contains("hidden")).toBe(false);
});

test("el menú conserva los dos apellidos del estudiante", async () => {
  global.fetch = jest.fn(async (url) => ({
    ok: true,
    json: async () => url === "/api/student"
      ? { student: { firstName: "María", lastName: "García López", code: "202310458", email: "maria@example.edu" } }
      : url === "/api/courses" ? { courses: [course] } : { messages: [] },
  }));
  await app.initialize();
  expect(document.querySelector("#sidebar-name").textContent).toBe("María García López");
});

test("una fecha inválida no interrumpe el renderizado de la bandeja", () => {
  app.setMessages([{ teacherInitials: "ET", teacher: "Elena Torres", subject: "Consulta", courseName: "Cálculo", body: "Texto", createdAt: "fecha-inválida" }]);
  expect(() => app.renderMessages()).not.toThrow();
});

test("la lista vacía de cursos muestra una explicación", () => {
  app.setCourses([]);
  app.renderCourses();
  expect(document.querySelector("#all-courses").textContent).toMatch(/no tienes cursos/i);
});

test("Escape cierra el menú lateral en móviles", () => {
  app.bindEvents();
  document.querySelector("#menu-toggle").click();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  expect(document.querySelector("#sidebar").classList.contains("open")).toBe(false);
});

test("sin cursos, el acceso a redactar un mensaje queda deshabilitado", () => {
  app.setCourses([]);
  app.renderCourses();
  expect(document.querySelector("[data-open-message]").disabled).toBe(true);
});
