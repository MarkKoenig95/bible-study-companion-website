const fs = require("fs");
const path = require("path");

const clearTempDir = (folder) => {
  let fileNames = fs.readdirSync(path.join(__dirname, "..", "files", folder));
  fileNames.forEach((fileName) => {
    fs.unlinkSync(path.join(__dirname, "..", "files", folder, fileName));
  });
};
module.exports.clearTempDir = clearTempDir;

const setTempDir = () => {
  let fileNames = fs.readdirSync(
    path.join(__dirname, "..", "files", "__base__")
  );
  fileNames.forEach((fileName) => {
    let file = fs.readFileSync(
      path.join(__dirname, "..", "files", "__base__", fileName)
    );
    fs.writeFileSync(
      path.join(__dirname, "..", "files", "bucket", fileName),
      file
    );
  });
};
module.exports.setTempDir = setTempDir;
