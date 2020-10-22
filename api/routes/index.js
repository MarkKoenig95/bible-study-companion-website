const express = require("express");
const router = express.Router();
const path = require("path");

router
  .route("/")
  .get((req, res) => {
    if (process.env.PRODUCTION) {
      res.sendFile(path.join(__dirname, "..", "..", "build", "index.html"));
    } else {
      res.sendStatus(404);
    }
  })
  .post((req, res) => {});

module.exports = router;
