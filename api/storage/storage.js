// Imports the Google Cloud client library
var { Storage } = require("@google-cloud/storage");

if (!process.env.PRODUCTION) {
  let fakeStorage = require("../../__mocks__/@google-cloud/storage");
  Storage = fakeStorage.Storage;
  const {
    clearTempDir,
    setTempDir,
  } = require("../../__fixtures__/testLogic/helpers");
  clearTempDir("bucket");
  clearTempDir("local");
  setTempDir();
}

// Creates a client
const storage = new Storage();

const bucketName = "bsc-translations";

/**
 * Uploads a file from a given file path to the cloud
 * @param {string} filePath
 */
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

/**
 * Given a fileName downloads the file matching that name from the cloud and saves it to the given destination file path
 * @param {string} srcFileName
 * @param {string} destFilePath
 */
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
