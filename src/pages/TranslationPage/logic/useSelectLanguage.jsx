import { binarySearch } from "../../../logic/logic";

import Axios from "axios";
import { useEffect, useCallback } from "react";
import { setSpecialVariables, checkSpecialVariables } from "./useVariables";
var languageIsSelected = false;

/**
 * Given the keys and values for a translation file as well as the template file's values, returns an array of objects to be used for providing translators with the neccessary information needed to translate the file
 * @param {function} _handleVariablesChange
 * @param {string[]} keys - The keys from the current translation file
 * @param {object[]} template - The values from the template file for translation
 * @param {object} transVars -
 * @param {string[]} values - The values from the current translation file
 * @returns {object} An object with key 'transItems' containing an array of translation objects and key 'transVars' the revised variables object
 */
export const createTranslationInfo = (
  _handleVariablesChange,
  keys,
  template,
  transVars,
  values
) => {
  let transItems = [];
  let indexAdj = 0;
  let isOrdinalKey = false;

  let ordinalCountIndex = binarySearch(keys, "ordinal.special.count");
  let ordinalStartIndex = ordinalCountIndex - values[ordinalCountIndex];

  // Subtract 3 from the value because there are 3 in the template from english
  let ordinalCount = values[ordinalCountIndex] - 3;

  let ordinalStartOrder = template[ordinalStartIndex + 3].order;

  transItems = values.map((value, index) => {
    //Check for the count of special ordinals and adjust index accordingly
    if (index === ordinalStartIndex) {
      isOrdinalKey = true;
    }

    if (template[index] && template[index].variable) {
      transVars = {
        ..._handleVariablesChange(
          value,
          template[index].variable,
          value,
          transVars,
          false
        ),
      };
    }

    let i = index + indexAdj;
    let translation = typeof value !== "undefined" ? value : template[i].value;
    let original = template[i].value;
    let isSameAsOriginal = translation === original;
    let key = template[i].key;
    let order = template[i].order;

    if (order > ordinalStartOrder) {
      order += ordinalCount;
    }

    if (keys[index] !== key) {
      key = keys[index];
    }

    if (isOrdinalKey && ordinalCount > 0) {
      ordinalCount--;
      indexAdj--;
      order = ordinalStartOrder;
    } else {
      isOrdinalKey = false;
    }

    if (indexAdj < 0) {
      order += 0 - indexAdj;
    }

    return {
      key: key,
      original: original,
      description: template[i].description,
      link: template[i].link,
      order: order,
      isEdited: false,
      isSameAsOriginal: isSameAsOriginal,
      translation: translation,
      variable: template[i].variable,
    };
  });

  transItems.sort((a, b) => {
    return a.order - b.order;
  });

  return { transItems, transVars };
};

/**
 *
 * @requires That the template and translation both have the same keys and that they are sorted arrays (both of these requirements are handled by the server)
 * @param {function} _handleVariablesChange
 * @param {object} baseVariables
 * @param {string} languageKey - The key for the language to be used for translation (i.e. 'en', 'en-US', 'zh')
 * @param {object[]} template - The values from the template file for translation
 * @returns {object} An object with key 'transItems' containing an array of translation objects and key 'transVars' the revised variables object
 */
const handleSelectLanguage = async (
  _handleVariablesChange,
  baseVariables,
  languageKey,
  template
) => {
  let tempVars = { ...baseVariables };
  let tempItems = [];
  await Axios.get("api/translation/" + languageKey).then((res) => {
    let { values, keys } = res.data;

    let translationInfo = createTranslationInfo(
      _handleVariablesChange,
      keys,
      template,
      tempVars,
      values
    );

    tempItems = translationInfo.transItems;
    tempVars = translationInfo.transVars;
  });

  return { tempItems, tempVars };
};

export function useSelectLanguage(props) {
  const {
    _handleVariablesChange,
    baseVariables,
    language,
    setLanguage,
    showLoadingPopup,
    setTranslationItems,
    setVariables,
    template,
  } = props;

  const _handleSelectLanguage = useCallback(
    (language) => {
      setLanguage(language);
      showLoadingPopup(true);
      languageIsSelected = true;
    },
    [setLanguage, showLoadingPopup]
  );

  useEffect(() => {
    if (languageIsSelected && template.length > 0 && language.key) {
      languageIsSelected = false;
      handleSelectLanguage(
        _handleVariablesChange,
        baseVariables,
        language.key,
        template
      ).then((res) => {
        let { tempItems, tempVars } = res;

        //Now that all of the variables are set up there are some special variables we need to
        //set manually because they are slightly complicated or will come from the database
        //in the app
        tempVars = { ...setSpecialVariables(tempVars) };
        tempVars = { ...checkSpecialVariables("year", tempVars) };
        tempVars = { ...checkSpecialVariables("initialChapter", tempVars) };
        tempVars = { ...checkSpecialVariables("initialVerse", tempVars) };
        tempVars = { ...checkSpecialVariables("startChapter", tempVars) };
        tempVars = { ...checkSpecialVariables("startVerse", tempVars) };

        setVariables(tempVars);
        setTranslationItems(tempItems);
        showLoadingPopup(false);
      });
    }
  }, [
    _handleSelectLanguage,
    _handleVariablesChange,
    baseVariables,
    language,
    setTranslationItems,
    setVariables,
    showLoadingPopup,
    template,
  ]);

  return { _handleSelectLanguage };
}
