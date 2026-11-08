"use strict";

const path = require("node:path");
const { defineConfig } = require("@playwright/test");
const rootDir = path.resolve(__dirname, "..");
const reportsDir = path.join(__dirname, "reports");

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "**/*.e2e.test.js",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ["list"],
    ["junit", { outputFile: path.join(reportsDir, "junit", "playwright.xml") }],
    ["json", { outputFile: path.join(reportsDir, "playwright.json") }],
    ["html", { outputFolder: path.join(reportsDir, "playwright-html"), open: "never" }],
  ],
  outputDir: path.join(reportsDir, "test-results"),
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "on",
  },
  webServer: {
    command: "node backend/server.js",
    cwd: rootDir,
    url: "http://127.0.0.1:4173/api/student",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { PORT: "4173" },
  },
});

