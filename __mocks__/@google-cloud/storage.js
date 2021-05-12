const fs = require("fs");
const path = require("path");

class Storage {
  bucket(bucketName) {
    return {
      upload: (filePath) => {
        let fileName = filePath.split("/").pop();
        let file = fs.readFileSync(
          path.join(
            __dirname,
            "..",
            "..",
            "__fixtures__",
            "files",
            "local",
            fileName
          )
        );

        fs.writeFileSync(
          path.join(
            __dirname,
            "..",
            "..",
            "__fixtures__",
            "files",
            "bucket",
            fileName
          ),
          file,
          "utf8"
        );
      },
      file: (srcFileName) => {
        return {
          download: ({ destination }) => {
            // Duplicate from mock bucket folder and save to mock tmp folder
            let file = fs.readFileSync(
              path.join(
                __dirname,
                "..",
                "..",
                "__fixtures__",
                "files",
                "bucket",
                srcFileName
              )
            );

            fs.writeFileSync(
              path.join(
                __dirname,
                "..",
                "..",
                "__fixtures__",
                "files",
                "local",
                srcFileName
              ),
              file,
              "utf8"
            );
          },
        };
      },
    };
  }
}
module.exports.Storage = Storage;
