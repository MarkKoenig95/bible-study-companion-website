const express = require("express");
const router = express.Router();
const path = require("path");

var languages = require("../localizations/languageKeys.js");
var base = require("../localizations/en.json");

const {
  keyStringParser,
  parseTranslation,
  sendEmail,
  saveFile,
  getFile,
} = require("../logic/logic");

const getLanguageFile = async (languageKey, translationItems) => {
  let key = languageKey;
  let fileName = key + ".json";
  let file;

  await getFile(fileName)
    .then((res) => {
      file = res;
    })
    .catch(console.error);

  if (typeof translationItems === "object") {
    file.ordinal.special = {};
    translationItems.forEach((item) => {
      if (item.isEdited) {
        file = { ...keyStringParser(file, item.key, item.translation) };
      }
    });
  }

  return { file, fileName };
};

router.route("/language-list").get((req, res) => {
  res.send(languages);
});

router.route("/email").post((req, res) => {
  let email = req.query.email;
  sendEmail(email).then(() => {
    res.end();
  });
});

router
  .route("/:languageKey")
  .get(async (req, res) => {
    let key = req.params.languageKey;
    let fileName = key + ".json";
    let file;

    await getLanguageFile(key).then((res) => {
      file = res.file;
    });

    if (!file) {
      let frags = key.split("-");
      if (frags.length > 1) {
        console.log("now trying key", frags[0] + ".json");
        await getLanguageFile(key).then((res) => {
          file = res.file;
        });
      }
    }

    if (!file) {
      file = base;
      saveFile(file, fileName);
    }

    res.send(parseTranslation(file));
  })
  .put(async (req, res) => {
    let file, fileName;

    await getLanguageFile(req.params.languageKey, req.body).then((res) => {
      file = res.file;
      fileName = res.fileName;
    });

    await saveFile(file, fileName).catch(console.error);

    res.end();
  });

module.exports = router;
