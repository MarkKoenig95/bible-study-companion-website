export function translationVariableParser(translation) {
  if (typeof translation !== "string") return;

  let found = [...translation.matchAll(/\{\{(\w+)\}\}/g)];
  return found;
}

export function checkItemKey(key, checkValue) {
  return key.split(".")[0] === checkValue;
}
