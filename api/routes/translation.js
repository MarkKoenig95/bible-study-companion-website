const express = require("express");
const router = express.Router();

var languages = require("../localizations/languageKeys.js");
var base;

const {
  keyStringParser,
  parseTranslation,
  sendEmail,
  saveFile,
  getFile,
  checkItemKey,
} = require("../logic/logic");

const getBase = async () => {
  if (!base) {
    base = await getFile("en.json");
  }
};

/**
 * Given a language key retrieves the appropriate language file and returns the appropriate fileName corresponding to it
 * @param {string} languageKey - In the form en, en-us, etc.
 * @returns {object} With keys file and fileName
 */
const getLanguageFile = async (languageKey) => {
  let fileName = languageKey + ".json";
  let file;

  await getFile(fileName)
    .then((res) => {
      file = res;
    })
    .catch(console.error);

  return { file, fileName };
};

/**
 * Given a language key and a set of translation items updates the value of the language file at the source
 * @param {string} languageKey - In the form en, en-us, etc.
 * @param {any[]} translationItems
 */
const setLanguageFile = async (languageKey, translationItems) => {
  let { fileName, file } = await getLanguageFile(languageKey);

  if (translationItems && typeof translationItems === "object") {
    file.ordinal.special = {};
    translationItems.forEach(({ key, translation, isEdited }) => {
      let isOrdinal = checkItemKey(key, "ordinal");
      if (isEdited || isOrdinal) {
        file = { ...keyStringParser(file, key, translation) };
      }
    });
  }

  await saveFile(file, fileName).catch(console.error);
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
    let { file, fileName } = await getLanguageFile(key);

    if (!file) {
      let frags = key.split("-");
      if (frags.length > 1) {
        console.log("now trying key", frags[0]);
        await getLanguageFile(frags[0]).then((res) => {
          file = res.file;
        });
      }
    }

    if (!file) {
      await getBase();
      file = base;
      saveFile(file, fileName);
    }

    res.send(parseTranslation(file));
  })
  .put(async (req, res) => {
    let { languageKey } = req.params;
    let translationItems = req.body;
    await setLanguageFile(languageKey, translationItems);

    res.end();
  });

module.exports = router;
