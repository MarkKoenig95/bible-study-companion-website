// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Creates a client
const storage = new Storage();

const bucketName = "bsc-translations";

async function uploadFile(filePath) {
  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filePath, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: "public, max-age=31536000",
    },
  });

  console.log(`${filePath} uploaded to ${bucketName}.`);
}

async function downloadFile(srcFileName, destFilePath) {
  const options = {
    // The path to which the file should be downloaded, e.g. "../../tmp/en.json"
    destination: destFilePath,
  };

  // Downloads the file
  await storage.bucket(bucketName).file(srcFileName).download(options);

  console.log(
    `gs://${bucketName}/${srcFileName} downloaded to ${destFilePath}.`
  );
}

module.exports.downloadFile = downloadFile;
module.exports.uploadFile = uploadFile;
