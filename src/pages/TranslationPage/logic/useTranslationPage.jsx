import Axios from "axios";
import { useCallback, useState } from "react";
import { useSelectLanguage } from "./useSelectLanguage";
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

  const { languageList } = useTranslationPageData();
  const { completedHidden, toggleHidden } = useHideCompleted();
  const { toggleVariablesPaused, variablesPaused } = useVariablePause();
  const { isLoading, showLoadingPopup } = useLoadingPopup();
  const { _handleVariablesChange, setVariables, variables } = useVariables();

  const { _handleSelectLanguage } = useSelectLanguage({
    setLanguage,
    showLoadingPopup,
    setTranslationItems,
    setVariables,
  });

  const _handleSave = useCallback(() => {
    showLoadingPopup(true);
    let tempTransItems = handleSave(
      language.key,
      showLoadingPopup,
      translationItems
    );

    setTranslationItems(tempTransItems);
  }, [language, showLoadingPopup, translationItems]);

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
