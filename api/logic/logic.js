require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");

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
    if (typeof value === "object") {
      result.push(...parseObjKeys(value, newKey));
    } else {
      result.push(newKey);
    }
  }

  return result;
};

/**
 * A function for updating an object or accessing an object's value based on a string of keys
 * @param {object} obj The object you will be updating or accessing
 * @param {string} key The key string you will use i.e 'key1.key2.key3'
 * @param {*} value Optional: The value you would like to update the key location to. If left blank, will return the value at the key location.
 */

const keyStringParser = (obj, key, value) => {
  let keys = key.split(".");
  let objectLevels = [{ ...obj }];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let level = objectLevels[i][key];
    if (typeof level === "object" || typeof level === "undefined") {
      objectLevels.push({ ...level });
    } else {
      objectLevels.push(level);
    }
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

async function sendFile(file, fileName, destEmail) {
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
    subject: "Bible Study Companion Translation File",
    html: `<h2>Thank you for your contribution!</h2>
           <br/>
           <p>Attatched is the translation file you created for the app Bible Study Companion.</p>
           <p>You can save it for continued use in editing later.</p>`,
    attachments: [{ filename: fileName, content: file }],
  });

  console.log("Message sent: %s", info.messageId);
}

/**
 * A function for comparing if a string (string1) is greater than another string (string2)
 * @param {string} string1
 * @param {string} string2
 */

const compareStrings = (string1, string2) => {
  let chars1 = string1.split("");
  let chars2 = string2.split("");

  if (chars1.length <= 0 && chars2.length <= 0) {
    console.log("No more characters to compare");
    return false;
  }

  if (chars1[0] === chars2[0]) {
    // console.log("characters equal");
    chars1.shift();
    chars2.shift();

    if (chars1.length > 0 && chars2.length > 0) {
      return compareStrings(chars1.join(""), chars2.join(""));
    } else {
      return false;
    }
  } else if (chars1[0] > chars2[0]) {
    console.log("char1 greater than char2");
    return true;
  } else {
    console.log("char1 less than char2");
    return false;
  }
};

/**
 * A function for turning a translation object into an array of its values
 *
 * @param {object} translation The translation object to be parsed
 * @param {array} keyStrings Optional: An array of key strings for the translation to be parsed
 * @returns {object} {keys: [array], values: [array]}
 */

const parseTranslation = (translation, keyStrings) => {
  let values = [];
  keyStrings = keyStrings || parseObjKeys(translation);
  keyStrings.forEach((key) => {
    values.push(keyStringParser(translation, key));
  });

  return { keys: keyStrings, values: values };
};

function translationVariableParser(translation) {
  if (typeof translation !== "string") {
    return;
  }

  let found = [...translation.matchAll(/\{\{(\w+)\}\}/g)];
  return found;
}

//Below are temporary things
// Perhaps will be used in the future to update the variables value in the template, but for now I just used it once in the template edit page to set the values initially

// const getTemplateVariables = () => {
//   let temp = [...template];

//   temp.forEach((t) => {
//     let vars = translationVariableParser(t.value);
//     if (typeof vars === "object" && vars.length > 0) {
//       console.log("vars", vars);
//       vars.forEach((v) => {
//         let key = v[1];
//         let keyExists = variables._keys.filter((k) => k === key).length > 0;

//         if (!keyExists) {
//           variables[key] = [];
//           variables._keys.push(key);
//           console.log(variables);
//         }
//       });
//     }
//   });

//   postVariables();
// };

// const postVariables = () => {
//   Axios.post("/api/template/variables", {
//     variables: variables,
//     template: template,
//   });
// };

//above are temporary things

module.exports.keyStringParser = keyStringParser;
module.exports.sendFile = sendFile;
module.exports.compareStrings = compareStrings;
module.exports.parseTranslation = parseTranslation;
module.exports.parseObjKeys = parseObjKeys;
module.exports.translationVariableParser = translationVariableParser;
