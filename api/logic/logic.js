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

const checkItemKey = (key, checkValue) => {
  return key.split(".")[0] === checkValue;
};
module.exports.checkItemKey = checkItemKey;

const sendEmail = async (destEmail) => {
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
module.exports.sendEmail = sendEmail;

/**
 * A function for retrieving a file from Google Cloud Storage
 * @param {string} fileName
 * @returns the contents of the recieved file
 */
const getFile = async (fileName) => {
  let newFilePath = path.join(localDir, fileName);
  await downloadFile(fileName, newFilePath);

  let file = JSON.parse(fs.readFileSync(newFilePath, "utf8"));

  return file;
};
module.exports.getFile = getFile;

/**
 * A function for saving a file to Google Cloud Storage
 * @param {*} file typically a json file to be uploaded
 * @param {string} fileName
 */
const saveFile = async (file, fileName) => {
  let newFilePath = path.join(localDir, fileName);

  fs.writeFileSync(newFilePath, JSON.stringify(file));

  await uploadFile(newFilePath);
};
module.exports.saveFile = saveFile;

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

const translationVariableParser = (translation) => {
  if (typeof translation !== "string") {
    return;
  }

  let found = [...translation.matchAll(/\{\{(\w+)\}\}/g)];
  return found;
};
module.exports.translationVariableParser = translationVariableParser;

const templateUpdater = (base, baseKeys, template) => {
  let templateKeys = parseObjKeys(template);
  let tempTemplate = { ...template };

  const templateInnerKeys = [
    "key",
    "value",
    "description",
    "link",
    "order",
    "status",
    "updateDate",
    "variable",
  ];

  let expandedBaseKeys = [];

  //create a new array that will look similar to the templates array
  //['key1', 'key2'] becomes
  //['key1.key', 'key1.value', 'key1.description', 'key1.link', 'key2.key', 'key2.value', ...etc]
  baseKeys.forEach((key) => {
    templateInnerKeys.forEach((innerKey) => {
      expandedBaseKeys.push(key + "." + innerKey);
    });
  });

  expandedBaseKeys.sort();
  templateKeys.sort();

  //Maximum length possible. This way we won't end our loop early, but we also won't have an infinite loop
  let maxLength = expandedBaseKeys.length + templateKeys.length;

  let baseKeysIndex = 0;
  let templateKeysIndex = 0;

  for (let i = 0; i < maxLength; i++) {
    let baseKey;
    let isOutOfBaseBounds = false;

    if (baseKeysIndex < expandedBaseKeys.length) {
      baseKey = expandedBaseKeys[baseKeysIndex];
    } else {
      isOutOfBaseBounds = true;
    }

    if (templateKeysIndex >= templateKeys.length) {
      if (isOutOfBaseBounds) {
        console.log("Determined to break loop after", i, "itterations");
        break;
      } else {
        //We need to add this to the template
        tempTemplate = { ...keyStringParser(tempTemplate, baseKey, "") };
        baseKeysIndex++;
        continue;
      }
    }

    for (let j = templateKeysIndex; j < templateKeys.length; j++) {
      let templateKey = templateKeys[j];
      if (templateKey.split("")[0] === "_") continue;

      if (baseKey === templateKey) {
        // Then, the key already exists in our template
        // Update the correct value to show that it's not updated
        // We can break this inner loop and continue with the outer loop

        baseKeysIndex++;
        templateKeysIndex = j + 1;
        break;
      }

      // Check if current base key is less than the currently checked template key
      if (
        typeof baseKey !== "undefined" &&
        !compareStrings(baseKey, templateKey)
      ) {
        //Then we need to add this to the template
        let keyParts = baseKey.split(".");
        let val = "";

        switch (keyParts[keyParts.length - 1]) {
          case "key":
            keyParts.pop();
            val = keyParts.join(".");
            break;
          case "order":
            val = parseInt(i / templateInnerKeys.length, 10);
            break;
          case "updateDate":
            let today = new Date();
            val = today.toISOString();
            break;
          case "value":
            keyParts.pop();
            let key = keyParts.join(".");
            val = keyStringParser(base, key);
            break;
          default:
            break;
        }

        console.log(`adding "${val}" to template at key`, baseKey);

        tempTemplate = { ...keyStringParser(tempTemplate, baseKey, val) };
        // Then we break to continue with the next keys
        baseKeysIndex++;
        templateKeysIndex = j;
        break;
      }

      if (typeof baseKey !== "undefined") {
        // Then this current key in the template has been deleted from the original file
        // Update flag accordingly
        templateKeysIndex = j;
        console.log(baseKey);
        console.log(
          "Key '",
          templateKey,
          "' has been deleted baseKey is",
          baseKey
        );
      } else {
        console.error("baseKey is undefined where templateKey is", templateKey);
        templateKeysIndex = j + 1;
      }
    }
  }

  return { ...tempTemplate };
};
module.exports.templateUpdater = templateUpdater;

/**
 * Given a sorted array and a testing value returns the index of the first element found in the array that satisfies the provided testing value
 * @requires - array is sorted
 * @param {Array} array - A sorted array to search in
 * @param {*} testingValue - A function which will take and item and return a boolean value if it matches a necessary requirement
 * @returns The index of the first element found matching the testing value
 */
const binarySearch = (array, testingValue) => {
  let isFinished = false;
  let startPointer = 0;
  let endPointer = array.length - 1;

  // Set these values to make sure that the loop doesn't run forever
  let safetyCount = 0;
  let maxCount = array.length;

  while (!isFinished && safetyCount < maxCount) {
    safetyCount++;

    if (endPointer - startPointer <= 0) isFinished = true;

    // Pick an index in the middle of the array
    let pointerSpanMiddle = Math.floor((endPointer - startPointer) / 2);
    let checkIndex = startPointer + pointerSpanMiddle;

    let checkValue = array[checkIndex];

    if (checkValue === testingValue) return checkIndex;

    // Check if value is less than or greater than the testing value and adjust pointers accordingly
    if (checkValue < testingValue) {
      startPointer = checkIndex + 1;
      continue;
    }

    endPointer = checkIndex - 1;
  }

  // We exited because of the safety counter
  return;
};
module.exports.binarySearch = binarySearch;
