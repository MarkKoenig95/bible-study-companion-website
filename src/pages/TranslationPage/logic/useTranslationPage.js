import Axios from "axios";
import { useCallback, useState } from "react";
import { binarySearch } from "../../../logic/logic";
import {
  useHideCompleted,
  useLoadingPopup,
  useTranslationPageData,
  useVariablePause,
} from "./useTranslationPageData";
import { useVariables } from "./useVariables";

const handleSave = (languageKey, showLoadingPopup, translationItems) => {
  //Update the translation file to the appropriate values
  showLoadingPopup(true);
  Axios.put(`api/translation/${languageKey}`, translationItems).then(() => {
    showLoadingPopup(false);
    alert(
      "Language file has been saved. \nThank you for your contribution. \nIf you are finished please check the \"hide completed\" checkbox at the bottom of the page to make sure you haven't missed any items\nAlso, if you haven't yet please sign up to receive email notifications when there are changes to the translation so that your target language can stay up to date with future updates"
    );
  });

  //Set all translation items to not have been edited and update the isSameAsOriginal flag
  let tempTransItems = translationItems.map((item) => {
    let isSameAsOriginal = item.isSameAsOriginal;
    if (isSameAsOriginal) {
      isSameAsOriginal = item.translation === item.original;
    }
    return { ...item, isEdited: false, isSameAsOriginal: isSameAsOriginal };
  });

  return tempTransItems;
};

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

const handleSelectLanguage = async (
  _handleVariablesChange,
  baseVariables,
  languageKey,
  template
) => {
  let tempVars = { ...baseVariables };
  let tempItems = [];
  // Will have to doccument better later, this function assumes that the template and
  // translation both have the same keys and that they are sorted arrays
  // (both of these requirements are handled by the server)
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

const handleTranslationChange = (
  _handleVariablesChange,
  index,
  value,
  key,
  translationItems
) => {
  let tempItems = [...translationItems];

  if (key) {
    //Insert a value at the given index
    let newValue = {
      key: key,
      original: "",
      description: "",
      link: "",
      isEdited: true,
      translation: value,
    };
    tempItems.splice(index, 0, newValue);
  } else if (typeof index === "object") {
    //Then this is a multiple edit request
    //For use with this, the index should be an array of objects with an index and value attribute
    index.forEach((val) => {
      let i = val.index;
      let v = val.value;
      let variable = val.variable;
      _handleVariablesChange(v, variable, tempItems[i].translation);
      tempItems[i].translation = v;
      tempItems[i].isEdited = true;
    });
  } else if (typeof value !== "undefined") {
    //Edit the existing value
    let variable = tempItems[index].variable;
    _handleVariablesChange(value, variable, tempItems[index].translation);
    tempItems[index].translation = value;
    tempItems[index].isEdited = true;
  } else {
    //Delete the value at the given index
    tempItems.splice(index, 1);
  }

  return tempItems;
};

export const useTranslationPage = () => {
  const [language, setLanguage] = useState();
  const [translationItems, setTranslationItems] = useState([]);

  const { languageList, template } = useTranslationPageData();
  const { completedHidden, toggleHidden } = useHideCompleted();
  const { toggleVariablesPaused, variablesPaused } = useVariablePause();
  const { isLoading, showLoadingPopup } = useLoadingPopup();
  const {
    _handleVariablesChange,
    baseVariables,
    checkSpecialVariables,
    setSpecialVariables,
    setVariables,
    variables,
  } = useVariables();

  const _handleSave = useCallback(() => {
    showLoadingPopup(true);
    let tempTransItems = handleSave(
      language.key,
      showLoadingPopup,
      translationItems
    );

    setTranslationItems(tempTransItems);
  }, [language, showLoadingPopup, translationItems]);

  const _handleSelectLanguage = useCallback(
    (language) => {
      showLoadingPopup(true);
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
        setLanguage(language);
        showLoadingPopup(false);
      });
    },
    [
      _handleVariablesChange,
      baseVariables,
      checkSpecialVariables,
      setSpecialVariables,
      setVariables,
      showLoadingPopup,
      template,
    ]
  );

  const _handleTranslationChange = useCallback(
    (index, value, key) => {
      let tempItems = handleTranslationChange(
        _handleVariablesChange,
        index,
        value,
        key,
        translationItems
      );
      setTranslationItems(tempItems);
    },
    [_handleVariablesChange, translationItems]
  );

  return {
    _handleSave,
    _handleSelectLanguage,
    _handleTranslationChange,
    completedHidden,
    isLoading,
    language,
    languageList,
    toggleHidden,
    toggleVariablesPaused,
    translationItems,
    showLoadingPopup,
    variables,
    variablesPaused,
  };
};
