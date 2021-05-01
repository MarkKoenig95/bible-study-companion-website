const fs = require("fs");
const path = require("path");

export const clearTempDir = (folder) => {
  let fileNames = fs.readdirSync(
    path.join(__dirname, "..", "..", "__temp__", folder)
  );
  fileNames.forEach((fileName) => {
    fs.unlinkSync(
      path.join(__dirname, "..", "..", "__temp__", folder, fileName)
    );
  });
};

export const setTempDir = () => {
  let fileNames = fs.readdirSync(
    path.join(__dirname, "..", "..", "__temp__", "__base__")
  );
  fileNames.forEach((fileName) => {
    let file = fs.readFileSync(
      path.join(__dirname, "..", "..", "__temp__", "__base__", fileName)
    );
    fs.writeFileSync(
      path.join(__dirname, "..", "..", "__temp__", "bucket", fileName),
      file
    );
  });
};
