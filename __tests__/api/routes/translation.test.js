require("regenerator-runtime/runtime");
const supertest = require("supertest");
const fs = require("fs");
const path = require("path");

const app = require("../../../api/server");
const { server } = require("../../../api/server");

const languageKeys = require("../../../api/localizations/languageKeys");
const { keyStringParser } = require("../../../api/logic/logic");
const {
  clearTempDir,
  setTempDir,
} = require("../../../__fixtures__/testLogic/helpers");

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

test("GET /api/translation/language-list", async () => {
  let { body } = await supertest(app)
    .get("/api/translation/language-list")
    .expect(200);

  expect(body).toStrictEqual(languageKeys);
});

test("PUT /api/translation/:languageId", async () => {
  let newValues = [
    { key: "ordinal.special.count", translation: 0, isEdited: true },
    { key: "this", translation: "This - New", isEdited: true },
    { key: "that", translation: 1, isEdited: true },
    { key: "those.a", translation: false, isEdited: true },
    { key: "those.b", translation: true, isEdited: true },
    { key: "those.c", translation: "Not Null", isEdited: true },
    { key: "these.1", translation: [3, 1, 1, 0], isEdited: true },
    { key: "these.2", translation: 255, isEdited: true },
  ];
  await supertest(app).put("/api/translation/test").send(newValues).expect(200);

  let file = fs.readFileSync(
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "__fixtures__",
      "files",
      "bucket",
      "test.json"
    )
  );

  file = JSON.parse(file);

  expect(keyStringParser(file, newValues[0].key)).toStrictEqual(
    newValues[0].translation
  );
  expect(keyStringParser(file, newValues[1].key)).toBe(
    newValues[1].translation
  );
  expect(keyStringParser(file, newValues[2].key)).toBe(
    newValues[2].translation
  );
  expect(keyStringParser(file, newValues[3].key)).toBe(
    newValues[3].translation
  );
  expect(keyStringParser(file, newValues[4].key)).toBe(
    newValues[4].translation
  );
  expect(keyStringParser(file, newValues[5].key)).toBe(
    newValues[5].translation
  );
  expect(keyStringParser(file, newValues[6].key)).toStrictEqual(
    newValues[6].translation
  );
  expect(keyStringParser(file, newValues[7].key)).toStrictEqual(
    newValues[7].translation
  );
});
