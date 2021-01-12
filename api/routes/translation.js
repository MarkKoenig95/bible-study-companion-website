const express = require("express");
const router = express.Router();
const path = require("path");

var languages = require("../localizations/languageKeys.js");
var base = require("../localizations/en.json");

const {
  keyStringParser,
  parseTranslation,
  sendFile,
} = require("../logic/logic");
const fs = require("fs");

const saveLanguageFile = (languageKey, translationItems) => {
  let key = languageKey;
  let fileName = key + ".json";
  let filePath = path.join(__dirname, "..", "localizations", key + ".json");
  let file;

  try {
    file = require(filePath, "utf8");
  } catch (err) {
    console.error(err);
  }

  translationItems.forEach((item) => {
    if (item.isEdited) {
      file = { ...keyStringParser(file, item.key, item.translation) };
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(file));

  return { file, fileName };
};

router.route("/language-list").get((req, res) => {
  res.send(languages);
});

router
  .route("/:languageKey")
  .get((req, res) => {
    let key = req.params.languageKey;
    let filePath = path.join(__dirname, "..", "localizations", key + ".json");
    let file;

    try {
      file = require(filePath, "utf8");
    } catch (err) {
      console.error(err);
    }

    if (!file) {
      let frags = key.split("-");
      if (frags.length > 1) {
        console.log("now trying key", frags[0] + ".json");
        try {
          file = require(path.join(
            "..",
            "localizations",
            frags[0] + ".json"
          ), "utf8");
          fs.writeFileSync(filePath, JSON.stringify(file));
        } catch (err) {
          console.error(err);
        }
      }
    }

    if (!file) {
      file = base;
      fs.writeFileSync(filePath, JSON.stringify(file));
    }

    res.send(parseTranslation(file));
  })
  .post((req, res) => {
    const { file, fileName } = saveLanguageFile(
      req.params.languageKey,
      req.body
    );

    sendFile(file, fileName).catch(console.error);
    res.end();
  })
  .put((req, res) => {
    saveLanguageFile(req.params.languageKey, req.body);
    res.end();
  });

module.exports = router;
