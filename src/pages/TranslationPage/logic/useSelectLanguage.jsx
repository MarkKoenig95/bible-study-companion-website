import Axios from "axios";
import { useCallback } from "react";

export function useSelectLanguage(props) {
  const {
    setLanguage,
    showLoadingPopup,
    setTranslationItems,
    setVariables,
  } = props;

  const _handleSelectLanguage = useCallback(
    (language) => {
      setLanguage(language);
      showLoadingPopup(true);
      Axios.get("api/translation/" + language.key).then(({ data }) => {
        let { transItems, transVars } = data;

        setVariables(transVars);
        setTranslationItems(transItems);
        showLoadingPopup(false);
      });
    },
    [setLanguage, setTranslationItems, setVariables, showLoadingPopup]
  );

  return { _handleSelectLanguage };
}
