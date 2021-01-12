const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const {
  compareStrings,
  keyStringParser,
  sendFile,
  parseObjKeys,
  parseTranslation,
} = require("../logic/logic");

var template = require("../localizations/template.json");
var base = require("../localizations/en.json");
var baseKeys = [];
let parsedTemplate = [];

const templateUpdater = () => {
  let templateKeys = parseObjKeys(template);

  const templateInnerKeys = [
    "key",
    "value",
    "description",
    "link",
    "order",
    "status",
    "updateDate",
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

  console.log(
    "templateKeys",
    templateKeys,
    "expandedBaseKeys",
    expandedBaseKeys
  );

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
        template = { ...keyStringParser(template, baseKey, "") };
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
          template = { ...keyStringParser(template, baseKey, "") };
          // Then we break to continue with the next keys
          baseKeysIndex++;
          templateKeysIndex = j;
          break;
        } else {
          if (baseKey !== undefined) {
            // Then this current key in the template has been deleted from the original file
            // Update flag accordingly
            templateKeysIndex = j;
            console.log("Key '", templateKey, "' has been deleted");
          } else {
            console.error(
              "baseKey",
              baseKey,
              "is undefined where templateKey is",
              templateKey
            );
            templateKeysIndex = j + 1;
          }
        }
      }
    }
  }
};

router
  .route("/")
  .get((req, res) => {
    if (baseKeys.length < 1) {
      baseKeys = parseObjKeys(base);
    }

    if (parsedTemplate.length < 1) {
      parsedTemplate = parseTranslation(template, baseKeys);
    }
    res.send(parsedTemplate);
  })
  .post((req, res) => {
    let newTemplate = {};
    req.body.forEach((item) => {
      newTemplate = { ...keyStringParser(newTemplate, item.key, item) };
    });

    // write JSON string to a file
    fs.writeFileSync(
      path.join(__dirname, "..", "template.json"),
      JSON.stringify(newTemplate)
    );
    console.log("Template Saved");

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
        let curVal = keyStringParser(base, key);
        let curTemplateVal = keyStringParser(template, key);
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
          template = { ...keyStringParser(template, key, curTemplateVal) };
        }
      });

      res.end();
    });
  });

router
  .route("/variables")
  .get((req, res) => {
    let variables = template._variables;
    res.send(variables);
  })
  .post((req, res) => {
    let newTemplate = {};
    req.body.template.forEach((item) => {
      newTemplate = { ...keyStringParser(newTemplate, item.key, item) };
    });

    newTemplate._variables = req.body.variables;

    // write JSON string to a file
    fs.writeFileSync(
      path.join(__dirname, "..", "template.json"),
      JSON.stringify(newTemplate)
    );
  });

module.exports = router;
