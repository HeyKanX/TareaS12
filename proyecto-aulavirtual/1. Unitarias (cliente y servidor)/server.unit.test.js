"use strict";

const { Readable } = require("node:stream");
const { readJson } = require("../backend/server.js");

function requestWithBody(body) {
  return Readable.from([Buffer.from(body)]);
}

describe("lectura unitaria de solicitudes JSON", () => {
  test("obtiene el objeto de un cuerpo JSON válido", async () => {
    const result = await readJson(requestWithBody('{"courseId":"calc-201"}'));
    expect(result).toEqual({ courseId: "calc-201" });
  });

  test("rechaza un cuerpo JSON mal formado con estado 400", async () => {
    await expect(readJson(requestWithBody("{"))).rejects.toMatchObject({ status: 400 });
  });

  test("rechaza un cuerpo mayor de 16 KiB con estado 413", async () => {
    await expect(readJson(requestWithBody(JSON.stringify({ body: "x".repeat(17 * 1024) }))))
      .rejects.toMatchObject({ status: 413 });
  });
});
