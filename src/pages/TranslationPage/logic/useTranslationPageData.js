import Axios from "axios";
import { useState, useEffect } from "react";

export const useTranslationPageData = () => {
  const [languageList, setLanguageList] = useState([]);
  const [template, setTemplate] = useState([]);

  useEffect(() => {
    Axios.get("api/translation/language-list").then(({ data }) => {
      setLanguageList(data);
    });

    Axios.get("api/template").then(({ data }) => {
      let { values } = data;
      setTemplate(values);
    });
  }, []);

  return { languageList, template };
};

export const useHideCompleted = () => {
  const [completedHidden, setCompletedHidden] = useState(false);

  const toggleHidden = () => {
    setCompletedHidden(!completedHidden);
  };

  return { completedHidden, toggleHidden };
};

export const useVariablePause = () => {
  const [variablesPaused, setVariablesPaused] = useState(false);

  const toggleVariablesPaused = () => {
    setVariablesPaused(!variablesPaused);
  };

  return { toggleVariablesPaused, variablesPaused };
};

export const useLoadingPopup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoadingPopup = (val) => {
    setIsLoading(val);
  };

  return { isLoading, showLoadingPopup };
};
