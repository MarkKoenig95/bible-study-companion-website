const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { keyParser, sendFile, compareStrings } = require("../logic/logic");

var template = require("../template.json");
var baseKeys = [];
var base = require("../en.json");

const parseObjKeys = (obj, prevKey) => {
  const entries = Object.entries(obj);
  const result = [];

  for (const [key, value] of entries) {
    let newKey = prevKey ? prevKey + "." + key : key;
    if (typeof value === "object") {
      result.push(...parseObjKeys(value, newKey));
    } else {
      result.push(newKey);
    }
  }

  return result;
};

const parseTemplate = () => {
  let result = [];
  baseKeys.forEach((key) => {
    result.push(keyParser(template, key));
  });
  return result;
};

router
  .route("/")
  .get((req, res) => {
    res.send(parseTemplate());
  })
  .post((req, res) => {
    let newTemplate = {};
    req.body.forEach((item) => {
      newTemplate = { ...keyParser(newTemplate, item.key, item) };
    });

    console.log(JSON.stringify(newTemplate));
    // write JSON string to a file
    fs.writeFileSync(
      path.join(__dirname, "..", "template.json"),
      JSON.stringify(newTemplate)
    );

    let file = fs.readFileSync(
      path.join(__dirname, "..", "template.json"),
      "utf8"
    );

    sendFile(file, "template.json").catch(console.error);
  });

router
  .route("/keys")
  .get((req, res) => {
    if (baseKeys.length < 1) {
      baseKeys = parseObjKeys(base);
    }
    res.send(baseKeys);
  })
  .post((req, res, next) => {
    var form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }

      base = JSON.parse(fs.readFileSync(files.filetoupload.path, "utf8"));

      baseKeys = parseObjKeys(base);

      templateUpdater();

      baseKeys.forEach((key) => {
        let curVal = keyParser(base, key);
        let curTemplateVal = keyParser(template, key);
        let wasAdjusted = false;

        if (curTemplateVal.value !== curVal) {
          curTemplateVal.value = curVal;
          wasAdjusted = true;
        }
        if (curTemplateVal.key !== key) {
          curTemplateVal.key = key;
          wasAdjusted = true;
        }
        if (wasAdjusted) {
          template = { ...keyParser(template, key, curTemplateVal) };
        }
        console.log("now template is", JSON.stringify(template));
      });

      res.end();
    });
  });

const templateUpdater = () => {
  baseKeys = parseObjKeys(base);

  let templateKeys = parseObjKeys(template);

  const templateInnerKeys = ["key", "value", "description", "link", "status"];

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

  //Maximum length possible. This way we won't end our loop early, but we also won't have an infinite loop
  let maxLength = expandedBaseKeys.length + templateKeys.length;

  let baseKeysIndex = 0;
  let templateKeysIndex = 0;

  for (let i = 0; i < maxLength; i++) {
    let baseKey;
    let isOutOfBaseBounds = false;
    if (baseKeysIndex < expandedBaseKeys.length - 1) {
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
        template = { ...keyParser(template, baseKey, "") };
        baseKeysIndex++;
        continue;
      }
    }
    for (let j = templateKeysIndex; j < templateKeys.length; j++) {
      let templateKey = templateKeys[j];

      if (baseKey === templateKey) {
        // Then, the key already exists in our template
        // Update the correct value to show that it's not updated
        // We can break this inner loop and continue with the outer loop
        baseKeysIndex++;
        templateKeysIndex = j + 1;
        break;
      } else {
        // Check if current base key is less than the currently checked template key
        if (!compareStrings(baseKey, templateKey) && baseKey !== undefined) {
          //Then we need to add this to the template
          template = { ...keyParser(template, baseKey, "") };
          // Then we break to continue with the next keys
          baseKeysIndex++;
          templateKeysIndex = j + 1;
          break;
        } else {
          // Then this current key in the template has been deleted from the original file
          // Update flag accordingly
          console.log("Key '", templateKey, "' has been deleted");
        }
      }
    }
  }
};

module.exports = router;
