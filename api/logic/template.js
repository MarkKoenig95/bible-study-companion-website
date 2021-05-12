const {
  parseTranslation,
  parseObjKeys,
  keyStringParser,
  compareStrings,
  binarySearch,
} = require("./logic");

const filterBaseKeys = (baseKeys) => {
  let filteredBaseKeys = [...baseKeys];
  let specialCountIndex = binarySearch(baseKeys, "ordinal.special.count");
  let specialCount = 3; // 11th, 12th, and 13th This won't change unless english does
  let specialStartIndex = specialCountIndex - specialCount;
  filteredBaseKeys.splice(specialStartIndex, specialCount);
  return filteredBaseKeys;
};

const parseTemplate = (baseKeys, template) => {
  let filteredBaseKeys = filterBaseKeys(baseKeys);
  let { keys, values } = parseTranslation(template, filteredBaseKeys);
  return { keys, values };
};
module.exports.parseTemplate = parseTemplate;

const templateUpdater = (base, origBaseKeys, template) => {
  let baseKeys = filterBaseKeys(origBaseKeys);
  let templateKeys = parseObjKeys(template);
  let tempTemplate = { ...template };

  const templateInnerKeys = [
    "key",
    "value",
    "description",
    "link",
    "order",
    "status",
    "updateDate",
    "variable",
  ];

  let expandedBaseKeys = [];

  //create a new array that will look similar to the templates array
  //['key1', 'key2'] becomes
  //['key1.key', 'key1.value', 'key1.description', 'key1.link', 'key2.key', 'key2.value', ...etc]
  baseKeys.forEach((key) => {
    templateInnerKeys.forEach((innerKey) => {
      expandedBaseKeys.push(key + "." + innerKey);
    });
  });

  expandedBaseKeys.sort();
  templateKeys.sort();

  //Maximum length possible. This way we won't end our loop early, but we also won't have an infinite loop
  let maxLength = expandedBaseKeys.length + templateKeys.length;

  let baseKeysIndex = 0;
  let templateKeysIndex = 0;

  for (let i = 0; i < maxLength; i++) {
    let baseKey;
    let isOutOfBaseBounds = false;

    if (baseKeysIndex < expandedBaseKeys.length) {
      baseKey = expandedBaseKeys[baseKeysIndex];
    } else {
      isOutOfBaseBounds = true;
    }

    if (templateKeysIndex >= templateKeys.length) {
      if (isOutOfBaseBounds) {
        console.log("Determined to break loop after", i, "itterations");
        break;
      } else {
        //We need to add this to the template
        tempTemplate = { ...keyStringParser(tempTemplate, baseKey, "") };
        baseKeysIndex++;
        continue;
      }
    }

    for (let j = templateKeysIndex; j < templateKeys.length; j++) {
      let templateKey = templateKeys[j];
      if (templateKey.split("")[0] === "_") continue;

      if (baseKey === templateKey) {
        // Then, the key already exists in our template
        // Update the correct value to show that it's not updated
        // We can break this inner loop and continue with the outer loop

        baseKeysIndex++;
        templateKeysIndex = j + 1;
        break;
      }

      // Check if current base key is less than the currently checked template key
      if (
        typeof baseKey !== "undefined" &&
        !compareStrings(baseKey, templateKey)
      ) {
        //Then we need to add this to the template
        let keyParts = baseKey.split(".");
        let val = "";

        switch (keyParts[keyParts.length - 1]) {
          case "key":
            keyParts.pop();
            val = keyParts.join(".");
            break;
          case "order":
            val = parseInt(i / templateInnerKeys.length, 10);
            break;
          case "updateDate":
            let today = new Date();
            val = today.toISOString();
            break;
          case "value":
            keyParts.pop();
            let key = keyParts.join(".");
            val = keyStringParser(base, key);
            break;
          default:
            break;
        }

        console.log(`adding "${val}" to template at key`, baseKey);

        tempTemplate = { ...keyStringParser(tempTemplate, baseKey, val) };
        // Then we break to continue with the next keys
        baseKeysIndex++;
        templateKeysIndex = j;
        break;
      }

      if (typeof baseKey !== "undefined") {
        // Then this current key in the template has been deleted from the original file
        // Update flag accordingly
        templateKeysIndex = j;
        console.log(baseKey);
        console.log(
          "Key '",
          templateKey,
          "' has been deleted baseKey is",
          baseKey
        );
      } else {
        console.error("baseKey is undefined where templateKey is", templateKey);
        templateKeysIndex = j + 1;
      }
    }
  }

  return { ...tempTemplate };
};
module.exports.templateUpdater = templateUpdater;
