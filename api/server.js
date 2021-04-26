const express = require("express");
const app = express();
const path = require("path");
const routes = require("./routes");
const template = require("./routes/template");
const translation = require("./routes/translation");
const logic = require("./routes/logic");
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/template", template);
app.use("/api/translation", translation);
app.use("/api/logic", logic);

if (process.env.PRODUCTION) {
  app.use(express.static(path.join(__dirname, "..", "build")));
}

app.use("*", routes);

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
module.exports.server = server;
