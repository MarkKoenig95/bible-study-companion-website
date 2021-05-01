require("regenerator-runtime/runtime");
const supertest = require("supertest");
const fs = require("fs");
const path = require("path");

const app = require("../../../api/server");
const { server } = require("../../../api/server");

const { clearTempDir, setTempDir } = require("../helpers");

beforeEach(() => {
  clearTempDir("bucket");
  clearTempDir("local");
  setTempDir();
});

afterAll(() => {
  clearTempDir("bucket");
  clearTempDir("local");
  server.close();
});

test("GET /api/template", async () => {
  await supertest(app).get("/api/template/").expect(200);
});

test("GET /api/template/variables", async () => {
  await supertest(app).get("/api/template/variables").expect(200);
});
