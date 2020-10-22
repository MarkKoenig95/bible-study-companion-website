const express = require("express");
const app = express();
const path = require("path");
const routes = require("./routes");
const template = require("./routes/template");
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.PRODUCTION) {
  app.use(express.static(path.join(__dirname, "..", "build")));
}

app.use("/api/template", template);
app.use("*", routes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
