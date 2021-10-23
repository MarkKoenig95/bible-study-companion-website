const {
  binarySearch,
  saveFile,
  keyStringParser,
  checkItemKey,
  getFile,
  parseTranslation,
  compareStrings,
} = require("./logic");
const { parseTemplate } = require("./template");
const {
  getBaseVariables,
  setSpecialVariables,
  handleVariablesChange,
} = require("./variables");

/**
 * Given a language key retrieves the appropriate language file and returns the appropriate fileName corresponding to it
 * @param {string} languageKey - In the form en, en-us, etc.
 * @returns {object} With keys file and fileName
 */
const getLanguageFile = async (languageKey) => {
  let fileName = languageKey + ".json";
  let file;

  await getFile(fileName)
    .then((res) => {
      file = res;
    })
    .catch(console.error);

  return { file, fileName };
};
module.exports.getLanguageFile = getLanguageFile;

/**
 * Given a language key and a set of translation items updates the value of the language file at the source
 * @param {string} languageKey - In the form en, en-us, etc.
 * @param {any[]} translationItems
 */
const setLanguageFile = async (languageKey, translationItems) => {
  let { fileName, file } = await getLanguageFile(languageKey);
  if (!file) {
    file = { ordinal: { special: {} } };
  }

  if (translationItems && typeof translationItems === "object") {
    file.ordinal.special = {};
    translationItems.forEach(({ key, translation, isEdited }) => {
      let isOrdinal = checkItemKey(key, "ordinal");
      if (isEdited || isOrdinal) {
        file = { ...keyStringParser(file, key, translation) };
      }
    });
  }

  await saveFile(file, fileName).catch(console.error);
};
module.exports.setLanguageFile = setLanguageFile;

const getTranslation = async (languageKey) => {
  let { file } = await getLanguageFile(languageKey);

  if (!file) {
    let frags = languageKey.split("-");
    if (frags.length > 1) {
      console.log("now trying key", frags[0]);
      await getLanguageFile(frags[0]).then((res) => {
        file = res.file;
      });
    }
  }

  if (!file) {
    file = {
      ordinal: {
        after: true,
        special: { count: 0 },
      },
      updateDate: new Date(0).toISOString(),
    };
  }

  let { keys, values } = parseTranslation(file);

  return { transKeys: keys, transValues: values };
};

const getUpdateDate = (keys, values) => {
  let updateDateIndex = binarySearch(keys, "updateDate");
  let updateDateString = values[updateDateIndex];
  let updateDate = new Date(updateDateString);

  return updateDate;
};

const createTranslationInfoItem = (
  index,
  indexAdj,
  isOrdinalKey,
  specialOrdinalCount,
  specialOrdinalStartIndex,
  specialOrdinalStartOrder,
  templateValues,
  transKey,
  transValue,
  transVars
) => {
  let i = index + indexAdj;
  let translation =
    typeof transValue !== "undefined" ? transValue : templateValues[i].value;
  let original = templateValues[i].value;
  let isSameAsOriginal = translation === original;
  let key = templateValues[i].key;
  let order = templateValues[i].order;

  //Check for the count of special ordinals and adjust index accordingly
  if (index === specialOrdinalStartIndex) {
    isOrdinalKey = true;
  }

  if (templateValues[index] && templateValues[index].variable) {
    transVars = {
      ...handleVariablesChange(
        translation,
        templateValues[index].variable,
        translation,
        transVars,
        false
      ),
    };
  }

  if (order >= specialOrdinalStartOrder) {
    order += specialOrdinalCount;
  }

  if (transKey !== key && typeof transKey !== "undefined") {
    let keyParts = transKey.split(".");
    if (keyParts[0] === "ordinal" && keyParts[1] === "special") {
      key = transKey;
      translation = transValue;
    }
  }

  if (isOrdinalKey && specialOrdinalCount > 0) {
    specialOrdinalCount--;
    indexAdj--;
    order = specialOrdinalStartOrder - 1;
  } else {
    isOrdinalKey = false;
  }

  if (indexAdj < 0) {
    order += 0 - indexAdj;
  }

  if (typeof transKey == "undefined" || compareStrings(transKey, key)) {
    //Then this is a new key and we need to increase the adjustment accordingly
    indexAdj++;
  }

  let infoItem = {
    key: key,
    original: original,
    description: templateValues[i].description,
    link: templateValues[i].link,
    order: order,
    isEdited: false,
    isSameAsOriginal: isSameAsOriginal,
    translation: translation,
    variable: templateValues[i].variable,
  };
  return { infoItem, indexAdj, isOrdinalKey, specialOrdinalCount, transVars };
};

/**
 * Given translation and template values compares the two and returns values for tracking what the final translation result will be for special values
 * @param {string[]} transKeys
 * @param {any[]} transValues
 * @param {string[]} templateKeys
 * @param {any[]} templateValues
 * @returns
 */
const setTranslationValues = (
  transKeys,
  transValues,
  templateKeys,
  templateValues
) => {
  //Template special ordinal values
  let templateOrdinalCountIndex = binarySearch(
    templateKeys,
    "ordinal.special.count"
  );

  let templateOrdinalCount = templateValues[templateOrdinalCountIndex].value;

  //Translation special ordinal values
  let transOrdinalCountIndex = binarySearch(transKeys, "ordinal.special.count");

  let transOrdinalCount = transValues[transOrdinalCountIndex];

  //Compare the two to get what the final value will be when we are done
  let specialOrdinalCount = transOrdinalCount - templateOrdinalCount;

  let translationLength = templateValues.length + specialOrdinalCount;

  let specialOrdinalStartIndex =
    templateOrdinalCountIndex - templateOrdinalCount;

  let specialOrdinalStartOrder = templateValues[specialOrdinalStartIndex].order;

  return {
    specialOrdinalCount,
    specialOrdinalStartOrder,
    specialOrdinalStartIndex,
    translationLength,
  };
};

/**
 * Given the keys and values for a translation file as well as the template file's values, returns an array of objects to be used for providing translators with the neccessary information needed to translate the file
 * @param {string[]} transKeys - The keys from the current translation file
 * @param {object[]} templateValues - The values from the template file for translation
 * @param {object} variables -
 * @param {string[]} transValues - The values from the current translation file
 * @returns {object} An object with key 'transItems' containing an array of translation objects and key 'transVars' the revised variables object
 */
const createTranslationInfo = (
  transKeys,
  transValues,
  templateKeys,
  templateValues,
  variables
) => {
  let transItems = [];
  let transVars = { ...variables };
  let indexAdj = 0;
  let isOrdinalKey = false;

  let {
    specialOrdinalCount,
    specialOrdinalStartOrder,
    specialOrdinalStartIndex,
    translationLength,
  } = setTranslationValues(
    transKeys,
    transValues,
    templateKeys,
    templateValues
  );

  const transUpdateDate = getUpdateDate(transKeys, transValues);

  // Loop through the array of translation values and create translation info items for each
  // also adding in new items that are not included in the original file
  for (let index = 0; index < translationLength; index++) {
    //Just to prevent endless loops in the case of bugs
    if (
      index > templateValues.length * 2 ||
      !templateValues[index + indexAdj]
    ) {
      break;
    }

    let transValue;

    const templateUpdateDate = new Date(
      templateValues[index + indexAdj].updateDate
    );

    if (transUpdateDate.getTime() >= templateUpdateDate.getTime()) {
      transValue = transValues[index];
    }

    let initialIndexAdj = indexAdj;

    const info = createTranslationInfoItem(
      index,
      indexAdj,
      isOrdinalKey,
      specialOrdinalCount,
      specialOrdinalStartIndex,
      specialOrdinalStartOrder,
      templateValues,
      transKeys[index],
      transValue,
      transVars
    );

    indexAdj = info.indexAdj;
    isOrdinalKey = info.isOrdinalKey;
    specialOrdinalCount = info.specialOrdinalCount;
    transVars = info.transVars;

    let { infoItem } = info;

    if (transUpdateDate.getTime() < templateUpdateDate.getTime()) {
      infoItem.isEdited = true;
    }

    if (initialIndexAdj < indexAdj) {
      //This means we added a new value to translation values that was not there before. In this case, we want to add a new value to the transValues.
      //That way, the ordinalCount index won't be reached too early and buldozed over possibly wrecking the whole function
      transValues.splice(index, 0, infoItem.translation);
      transKeys.splice(index, 0, infoItem.key);
      indexAdj--;
    }

    transItems.push(infoItem);
  }

  transItems.sort((a, b) => {
    return a.order - b.order;
  });

  // Now that all of the variables are set up there are some special variables we need to
  // set manually because they are slightly complicated or will come from the database in the app
  transVars = { ...setSpecialVariables(transVars) };

  return { transItems, transVars };
};

const getTemplate = (template, base) => {
  let parsedBase = parseTranslation(base);
  let { keys, values } = parseTemplate(parsedBase.keys, template);
  return { templateKeys: keys, templateValues: values };
};

const getTranslationInfo = async (languageKey) => {
  let base = await getFile("en.json");
  let template = await getFile("template.json");
  let variables = await getBaseVariables(template);
  let { templateKeys, templateValues } = getTemplate(template, base);
  let { transKeys, transValues } = await getTranslation(languageKey, base);

  let { transItems, transVars } = createTranslationInfo(
    transKeys,
    transValues,
    templateKeys,
    templateValues,
    variables
  );

  return { transItems, transVars };
};
module.exports.getTranslationInfo = getTranslationInfo;
