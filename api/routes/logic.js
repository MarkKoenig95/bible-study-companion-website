const express = require("express");
const router = express.Router();
const {
  compareStrings,
  keyStringParser,
  sendFile,
  parseObjKeys,
  parseTranslation,
} = require("../logic/logic");

router.route("/key-string-parser").post((req, res) => {
  // Recieves an array of objects containing key and optionally value attributes
  let newObject = {};
  req.body.forEach((item) => {
    console.log(item);
    newObject = { ...keyStringParser(newObject, item.key, item.value) };
  });
  console.log("newObject", newObject);
  res.send(newObject);
});

module.exports = router;
