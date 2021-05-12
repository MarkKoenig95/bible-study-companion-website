const express = require("express");
const router = express.Router();

const { sendEmail } = require("../logic/logic");
const {
  getTranslationInfo,
  setLanguageFile,
} = require("../logic/translation.js");

var languages = require("../localizations/languageKeys.js");

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
    let { languageKey } = req.params;

    let { transItems, transVars } = await getTranslationInfo(languageKey);

    res.send({ transItems, transVars });
  })
  .put(async (req, res) => {
    let { languageKey } = req.params;
    let translationItems = req.body;
    await setLanguageFile(languageKey, translationItems);

    res.end();
  });

module.exports = router;
