const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const {
  keyStringParser,
  parseObjKeys,
  saveFile,
  getFile,
} = require("../logic/logic");
const { templateUpdater, parseTemplate } = require("../logic/template");

var template;
var base;
var baseKeys = [];

const getData = async (force = false) => {
  if (!base || force) {
    base = await getFile("en.json");
  }
  if (baseKeys.length < 1 || force) {
    baseKeys = parseObjKeys(base);
  }
  if (!template || force) {
    template = await getFile("template.json");
  }
  return { base, baseKeys, template };
};

router
  .route("/")
  .get(async (req, res) => {
    let { baseKeys, template } = await getData(true);

    let parsedTemplate = parseTemplate(baseKeys, template);

    res.send(parsedTemplate);
  })
  .post((req, res) => {
    let newTemplate = {};
    req.body.forEach((item) => {
      if (item.key) {
        newTemplate = { ...keyStringParser(newTemplate, item.key, item) };
      }
    });

    saveFile(newTemplate, "template.json").catch(console.error);
  });

router
  .route("/keys")
  .get(async (req, res) => {
    let { baseKeys } = await getData();

    res.send(baseKeys);
  })
  .post(async (req, res, next) => {
    let { base, baseKeys, template } = await getData();

    var form = formidable({ multiples: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }

      let file = fs.readFileSync(files.filetoupload.path, "utf8");

      base = JSON.parse(file);

      saveFile(base, "en.json");

      baseKeys = parseObjKeys(base);

      let newTemplate = templateUpdater(base, baseKeys, template);

      // \/\/ I think this is to adjust values that have been edited. This should probably be moved to the template updater function \/\/
      baseKeys.forEach((key) => {
        let curVal = keyStringParser(base, key);
        let curTemplateVal = keyStringParser(newTemplate, key);
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
          newTemplate = {
            ...keyStringParser(newTemplate, key, curTemplateVal),
          };
        }
      });

      saveFile(newTemplate, "template.json")
        .catch(console.error)
        .then(() => {
          res.end();
        });
    });
  });

router
  .route("/variables")
  .get(async (req, res) => {
    let { template } = await getData();
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
