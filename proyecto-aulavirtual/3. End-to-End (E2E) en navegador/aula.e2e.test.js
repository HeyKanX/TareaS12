"use strict";

const { expect, test } = require("@playwright/test");

test("E2E01 carga el dashboard principal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Hola, María/ })).toBeVisible();
  await expect(page.locator("#dashboard-courses .course-row")).toHaveCount(4);
});

test("E2E02 muestra los datos del perfil", async ({ page }) => {
  await page.goto("/");
  await page.locator("#profile-shortcut").click();
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
  await expect(page.locator("#profile-code")).toHaveText("202310458");
  await expect(page.locator("#profile-email")).toHaveText("maria.garcia@universidad.edu");
});

test("E2E03 muestra los cuatro cursos matriculados", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-view="cursos"]').first().click();
  await expect(page.getByRole("heading", { name: "Mis cursos" })).toBeVisible();
  await expect(page.locator("#all-courses .course-tile")).toHaveCount(4);
});

test("E2E04 presenta las calificaciones registradas", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-view="notas"]').first().click();
  await expect(page.getByRole("heading", { name: "Mis calificaciones" })).toBeVisible();
  await expect(page.locator("#grades-body tr")).toHaveCount(4);
  await expect(page.locator("#grades-body")).toContainText("—");
});

test("E2E05 abre la bandeja de mensajes", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-view="mensajes"]').first().click();
  await expect(page.getByRole("heading", { name: "Mensajes", exact: true })).toBeVisible();
  await expect(page.locator("#messages-list")).toBeVisible();
});

test("E2E06 abre y cierra el diálogo de mensaje", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Escribir a un profesor/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).not.toBeVisible();
});

test("E2E07 envía un mensaje válido al docente del curso", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Escribir a un profesor/ }).click();
  await page.locator("#message-course").selectOption("calc-201");
  await page.locator("#message-subject").fill("Consulta E2E de práctica");
  await page.locator("#message-body").fill("¿Puede explicar el ejercicio tres?");
  await page.getByRole("button", { name: /Enviar mensaje/ }).click();
  await expect(page.locator("#toast")).toContainText("Mensaje enviado correctamente");
  await expect(page.locator("#messages-list")).toContainText("Dra. Elena Torres");
  await expect(page.locator("#messages-list")).toContainText("Consulta E2E de práctica");
});

test("E2E08 valida un mensaje incompleto sin enviarlo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Escribir a un profesor/ }).click();
  await page.locator("#message-course").selectOption("calc-201");
  await page.locator("#message-subject").fill("ab");
  await page.locator("#message-body").fill("corto");
  await page.getByRole("button", { name: /Enviar mensaje/ }).click();
  await expect(page.locator("#form-feedback")).toHaveText("El asunto debe tener entre 3 y 100 caracteres.");
  await expect(page.locator("#message-dialog")).toBeVisible();
});

test("E2E09 navega por todas las secciones", async ({ page }) => {
  await page.goto("/");
  for (const view of ["inicio", "cursos", "notas", "mensajes", "perfil"]) {
    await page.locator(`[data-view="${view}"]`).first().click();
    await expect(page.locator(`#view-${view}`)).toBeVisible();
  }
});

test("E2E10 conserva los mensajes al recargar durante la sesión", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Escribir a un profesor/ }).click();
  await page.locator("#message-course").selectOption("prog-105");
  await page.locator("#message-subject").fill("Consulta después de recargar");
  await page.locator("#message-body").fill("Confirmar persistencia temporal.");
  await page.getByRole("button", { name: /Enviar mensaje/ }).click();
  await expect(page.locator("#toast")).toContainText("Mensaje enviado correctamente");
  await expect(page.locator("#messages-list")).toContainText("Consulta después de recargar");
  await page.reload();
  await page.locator('[data-view="mensajes"]').first().click();
  await expect(page.locator("#messages-list")).toContainText("Consulta después de recargar");
});
