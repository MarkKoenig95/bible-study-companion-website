import "regenerator-runtime/runtime";
import { checkItemKey } from "../../../src/logic/logic";
const {
  parseObjKeys,
  keyStringParser,
  parseTranslation,
  binarySearch,
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

describe("binarySearch", () => {
  let array = [];
  let randomMiddleItem = Math.floor(Math.random() * 10000000);
  beforeAll(() => {
    // Set up a randomized array
    let randomLength = Math.random() * 10000;
    for (let i = 0; i < randomLength; i++) {
      let randomItem = Math.floor(Math.random() * 10000000);
      array.push(randomItem);
    }

    // Add a random item for use in a comparison in a later test before we sort
    array.push(randomMiddleItem);

    // Sort the array to conform with binary search requirements
    array.sort((a, b) => a - b);
  });

  test("given a sorted array finds an object with a matching value at the far end", () => {
    // Add the item we are looking for to it (an item larger than any other)
    let ourItem = 100000000;
    array.push(ourItem);

    let resultIndex = binarySearch(array, ourItem);
    let result = array[resultIndex];

    expect(result).toBe(ourItem);
  });

  test("given a sorted array finds an object with a matching value at the far begining", () => {
    // Add the item we are looking for to it (an item smaller than any other)
    let ourItem = -1;
    array.unshift(ourItem);

    let resultIndex = binarySearch(array, ourItem);
    let result = array[resultIndex];

    expect(result).toBe(ourItem);
  });

  test("given a sorted array finds an object with a matching value in the middle", () => {
    // The item was already added in the "beforeAll" setup
    let resultIndex = binarySearch(array, randomMiddleItem);
    let result = array[resultIndex];

    expect(result).toBe(randomMiddleItem);
  });
});
