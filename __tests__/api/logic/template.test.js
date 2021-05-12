import "regenerator-runtime/runtime";

const { parseObjKeys } = require("../../../api/logic/logic");
const {
  parseTemplate,
  templateUpdater,
} = require("../../../api/logic/template");
const english = require("../../../__fixtures__/files/__base__/en.json");
const template = require("../../../__fixtures__/files/__base__/template.json");

test("parseTemplate", () => {
  let baseKeys = [
    "a",
    "b.a",
    "b.b",
    "c.a.a",
    "ordinal.special.11",
    "ordinal.special.12",
    "ordinal.special.13",
    "ordinal.special.count",
    "z",
  ];
  let templateInnerValue = {
    a: true,
    b: false,
    c: 99,
    d: "string",
    e: null,
    object: { a: "" },
  };
  let template = {
    a: { key: "a", ...templateInnerValue },
    b: {
      a: { key: "ba", ...templateInnerValue },
      b: { key: "bb", ...templateInnerValue },
    },
    c: { a: { a: { key: "caa", ...templateInnerValue } } },
    ordinal: {
      special: {
        count: { key: "ordinal special count", ...templateInnerValue },
      },
    },
    z: { key: "z", ...templateInnerValue },
  };
  let { keys, values } = parseTemplate(baseKeys, template);

  let expectedKeys = ["a", "b.a", "b.b", "c.a.a", "ordinal.special.count", "z"];
  let expectedValues = [
    { key: "a", ...templateInnerValue },
    { key: "ba", ...templateInnerValue },
    { key: "bb", ...templateInnerValue },
    { key: "caa", ...templateInnerValue },
    { key: "ordinal special count", ...templateInnerValue },
    { key: "z", ...templateInnerValue },
  ];

  expect(keys).toStrictEqual(expectedKeys);
  expect(values).toStrictEqual(expectedValues);
});

describe("templateUpdater tests", () => {
  test("nothing to change", () => {
    let baseKeys = parseObjKeys(english);
    let newTemplate = templateUpdater(english, baseKeys, template);

    expect(newTemplate).toStrictEqual(template);
  });

  test("item added", () => {
    let today = new Date();
    let newEnglish = { ...english };
    newEnglish.newItem = "NEW ITEM";
    newEnglish.bibleBooks[67] = "New Scrolls";
    let baseKeys = parseObjKeys(newEnglish);
    let newTemplate = templateUpdater(newEnglish, baseKeys, template);

    let updateDate = new Date(newTemplate.newItem.updateDate);
    updateDate.setSeconds(0, 0);
    today.setSeconds(0, 0);

    //Check a basic item
    expect(newTemplate.newItem.key).toBe("newItem");
    expect(newTemplate.newItem.order).toBeGreaterThan(0);
    expect(updateDate.getTime()).toBe(today.getTime());
    //Check a nested item
    expect(newTemplate.bibleBooks[67].value).toBe("New Scrolls");
    //Check that it maintained all other values that were it's neighbors
    expect(newTemplate.bibleBooks[1].name.value).toBe("Genesis");
  });
});
