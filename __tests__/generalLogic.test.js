require("regenerator-runtime/runtime");
const { binarySearch } = require("../api/logic/logic");

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
    array.sort();
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
