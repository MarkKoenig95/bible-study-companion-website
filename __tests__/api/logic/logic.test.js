import "regenerator-runtime/runtime";
import { checkItemKey } from "../../../src/logic/logic";
const {
  parseObjKeys,
  keyStringParser,
  parseTranslation,
} = require("../../../api/logic/logic");

test("parseObjKeys", () => {
  const obj = {
    a: { aa: { aaa: undefined } },
    b: null,
    c: { ca: false, cb: { cba: { cbaa: { cbaaa: 0 } } } },
    d: { da: [0, 1, 2, 3] },
  };

  let keys = parseObjKeys(obj);

  let expected = ["a.aa.aaa", "b", "c.ca", "c.cb.cba.cbaa.cbaaa", "d.da"];

  expect(keys).toStrictEqual(expected);
});

test("use keyStringParser to get a value from an object", () => {
  const obj = {
    a: { aa: { aaa: undefined } },
    b: null,
    c: { ca: false, cb: { cba: { cbaa: { cbaaa: 0 } } } },
    d: { da: [0, 1, 2, 3] },
  };

  let aaa = keyStringParser(obj, "aaa");
  let b = keyStringParser(obj, "b");
  let ca = keyStringParser(obj, "c.ca");
  let cbaaa = keyStringParser(obj, "c.cb.cba.cbaa.cbaaa");

  expect(aaa).toStrictEqual({});
  expect(b).toBe(null);
  expect(ca).toBe(false);
  expect(cbaaa).toBe(0);
});

test("use keyStringParser to insert a value into an object", () => {
  const obj = {
    a: { aa: { aaa: undefined } },
    b: null,
    c: { ca: false, cb: { cba: { cbaa: { cbaaa: 0 } } } },
    d: { da: [0, 1, 2, 3] },
  };

  let newObj = keyStringParser(obj, "c.cb.cba.cbaa.cbaaa", "Edited");

  const expected = {
    a: { aa: { aaa: undefined } },
    b: null,
    c: { ca: false, cb: { cba: { cbaa: { cbaaa: "Edited" } } } },
    d: { da: [0, 1, 2, 3] },
  };

  expect(newObj).toStrictEqual(expected);
});

test("checkItemKey", () => {
  let check1 = checkItemKey("ordinals.1", "ordinals");
  let check2 = checkItemKey("ordinal.1", "ordinals");

  expect(check1).toBe(true);
  expect(check2).toBe(false);
});

test("parseTranslation", () => {
  const translation = {
    a: { aa: { aaa: undefined } },
    b: null,
    c: { ca: false, cb: { cba: { cbaa: { cbaaa: 0 } } } },
    d: { da: [0, 1, 2, 3] },
  };

  let keyStrings = ["a.aa.aaa", "b", "c.ca", "c.cb.cba.cbaa.cbaaa", "d.da"];

  let { keys, values } = parseTranslation(translation, keyStrings);

  translation.d.da[0] = 99;

  expect(keys).toStrictEqual(keyStrings);
  expect(values).toStrictEqual([{}, null, false, 0, [0, 1, 2, 3]]);
});
