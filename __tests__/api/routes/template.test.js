require("regenerator-runtime/runtime");
const supertest = require("supertest");
const path = require("path");

const app = require("../../../api/server");
const { server } = require("../../../api/server");

const {
  clearTempDir,
  setTempDir,
} = require("../../../__fixtures__/testLogic/helpers");
const { getFile, saveFile } = require("../../../api/logic/logic");

beforeAll(() => {
  clearTempDir("bucket");
  clearTempDir("local");
  setTempDir();
});

beforeEach(() => {
  clearTempDir("local");
});

afterEach(() => {
  server.close();
});

afterAll(() => {
  clearTempDir("bucket");
  clearTempDir("local");
});

test("GET /api/template", async () => {
  await supertest(app).get("/api/template/").expect(200);
});

test("POST /api/template/keys", async () => {
  let english = await getFile("en.json");
  english.newItem = "NEW ITEM";
  await saveFile(english, "en.json");

  await supertest(app)
    .post("/api/template/keys")
    .attach(
      "filetoupload",
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "__fixtures__",
        "files",
        "bucket",
        "en.json"
      )
    )
    .expect(200);

  let newTemplate = await getFile("template.json");

  expect(newTemplate.newItem.value).toBe("NEW ITEM");
});

test("GET /api/template/variables", async () => {
  await supertest(app).get("/api/template/variables").expect(200);
});
