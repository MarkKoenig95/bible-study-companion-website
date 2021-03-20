export function translationVariableParser(translation) {
  if (typeof translation !== "string") return;

  let found = [...translation.matchAll(/\{\{(\w+)\}\}/g)];
  return found;
}

export function checkItemKey(key, checkValue) {
  return key.split(".")[0] === checkValue;
}

/*
 * Given a sorted array and a testing value returns the index of the first element found in the array that satisfies the provided testing value
 * @requires - array is sorted
 * @param {Array} array - A sorted array to search in
 * @param {*} testingValue - A function which will take and item and return a boolean value if it matches a necessary requirement
 * @returns The index of the first element found matching the testing value
 */
export function binarySearch(array, testingValue) {
  let isFinished = false;
  let startPointer = 0;
  let endPointer = array.length - 1;

  // Set these values to make sure that the loop doesn't run forever
  let safetyCount = 0;
  let maxCount = array.length;

  while (!isFinished && safetyCount < maxCount) {
    safetyCount++;

    if (endPointer - startPointer <= 0) isFinished = true;

    // Pick an index in the middle of the array
    let pointerSpanMiddle = Math.floor((endPointer - startPointer) / 2);
    let checkIndex = startPointer + pointerSpanMiddle;

    let checkValue = array[checkIndex];

    if (checkValue === testingValue) return checkIndex;

    // Check if value is less than or greater than the testing value and adjust pointers accordingly
    if (checkValue < testingValue) {
      startPointer = checkIndex + 1;
      continue;
    }

    endPointer = checkIndex - 1;
  }

  // We exited because of the safety counter
  return;
}
