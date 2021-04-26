require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { uploadFile, downloadFile } = require("../storage/storage");

const localDir = process.env.PRODUCTION
  ? path.join(__dirname, "..", "..", "..", "tmp")
  : path.join(__dirname, "..", "..", "__temp__", "local");

/**
 * Itterates through an object and finds the values for every key creating an array of key strings
 * i.e. if obj is {key1: {key2: {key3: value}}} it will return an array of 1 key string 'key1.key2.key3'
 * @param {object} obj The object you would like to generate an array of key strings for
 * @param {string} prevKey Optional: Typically will not need to use this value
 */
const parseObjKeys = (obj, prevKey) => {
  const entries = Object.entries(obj);
  const result = [];

  for (const [key, value] of entries) {
    let newKey = prevKey ? prevKey + "." + key : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result.push(...parseObjKeys(value, newKey));
      continue;
    }
    result.push(newKey);
  }

  return result;
};
module.exports.parseObjKeys = parseObjKeys;

/**
 * A function for updating an object or accessing an object's value based on a string of keys
 * @param {object} obj The object you will be updating or accessing
 * @param {string} key The key string you will use i.e 'key1.key2.key3'
 * @param {*} value Optional: The value you would like to update the key location to. If left blank, will return the value at the key location.
 * @returns {object|*} If a value parameter is given, will return a copy of the original object with the updated value at the given key. Otherwise it will return the value at the given value
 */
const keyStringParser = (obj, key, value) => {
  let keys = key.split(".");
  let objectLevels = [{ ...obj }];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let level = objectLevels[i][key];
    //The undefined case is for building an object from just the keys
    //However there is a bug in javascript where typeof null evaluates to 'object'
    if ((level && typeof level === "object") || typeof level === "undefined") {
      if (Array.isArray(level)) {
        level = [...level];
      } else {
        objectLevels.push({ ...level });
        continue;
      }
    }
    objectLevels.push(level);
  }

  if (value !== undefined) {
    objectLevels[objectLevels.length - 1] = value;

    //In order to update the value of an embedded object we need to update each object at a time copying
    //all other current values
    for (let i = objectLevels.length - 1; i > 0; i--) {
      const level = objectLevels[i];
      objectLevels[i - 1][keys[i - 1]] = level;
    }
    let newObj = { ...objectLevels[0] };

    return newObj;
  } else {
    value = objectLevels[objectLevels.length - 1];

    return value;
  }
};
module.exports.keyStringParser = keyStringParser;

module.exports.checkItemKey = (key, checkValue) => {
  return key.split(".")[0] === checkValue;
};

module.exports.sendEmail = async (destEmail) => {
  const myEmail = "humanappmaker@gmail.com";
  const sendEmails = [myEmail];

  if (destEmail) {
    sendEmails.push(destEmail);
  }

  console.log("Sending.....");

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: myEmail,
      pass: process.env.SENDINBLUE_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Hugh Mann" <${myEmail}>`,
    to: sendEmails,
    subject: "Bible Study Companion Translation",
    html: `<h2>Thank you for your contribution!</h2>
           <br/>
           <p>Thank you for signing up to be notified of future additions to translation.</p>
           <p>I hope you enjoy the app!</p>`,
  });

  console.log("Message sent: %s", info.messageId);
};

/**
 * A function for retrieving a file from Google Cloud Storage
 * @param {string} fileName
 * @returns the contents of the recieved file
 */
module.exports.getFile = async (fileName) => {
  let newFilePath = path.join(localDir, fileName);
  await downloadFile(fileName, newFilePath);

  let file = JSON.parse(fs.readFileSync(newFilePath, "utf8"));

  return file;
};

/**
 * A function for saving a file to Google Cloud Storage
 * @param {*} file typically a json file to be uploaded
 * @param {string} fileName
 */
module.exports.saveFile = async (file, fileName) => {
  let newFilePath = path.join(localDir, fileName);

  fs.writeFileSync(newFilePath, JSON.stringify(file));

  await uploadFile(newFilePath);
};

/**
 * A function for comparing if a string (string1) is greater than another string (string2)
 * @param {string} string1
 * @param {string} string2
 */
const compareStrings = (string1, string2) => {
  let chars1 = string1.split("");
  let chars2 = string2.split("");

  if (chars1.length <= 0 && chars2.length <= 0) {
    return false;
  }

  if (chars1[0] === chars2[0]) {
    chars1.shift();
    chars2.shift();

    if (chars1.length > 0 && chars2.length > 0) {
      return compareStrings(chars1.join(""), chars2.join(""));
    } else {
      return false;
    }
  } else if (chars1[0] > chars2[0]) {
    return true;
  } else {
    return false;
  }
};
module.exports.compareStrings = compareStrings;

/**
 * Given a translation object returns an object containing an array of its values and an array of its keys
 *
 * @param {object} translation The translation object to be parsed
 * @param {string[]} keyStrings Optional: An array of key strings for the translation to be parsed
 * @returns {object} {keys: string[], values: any[]}
 */
const parseTranslation = (translation, keyStrings) => {
  let values = [];
  keyStrings = keyStrings || parseObjKeys(translation);
  keyStrings.forEach((key) => {
    values.push(keyStringParser(translation, key));
  });

  return { keys: keyStrings, values: values };
};
module.exports.parseTranslation = parseTranslation;

module.exports.translationVariableParser = (translation) => {
  if (typeof translation !== "string") {
    return;
  }

  let found = [...translation.matchAll(/\{\{(\w+)\}\}/g)];
  return found;
};
