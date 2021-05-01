import React from "react";

import Page from "../Page/Page";
import TranslationList from "./components/TranslationList";
import StickyFooter from "./components/StickyFooter";
import TranslationReminders from "./components/TranslationReminders";

import { useTranslationPage } from "./logic/useTranslationPage";

import "./TranslationPage.css";

export default function TranslationPage() {
  const {
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
  } = useTranslationPage();

  const languageIsSet = language ? true : false;

  return (
    <Page className="translation-page" isLoading={isLoading}>
      <TranslationReminders />

      {languageIsSet && (
        <TranslationList
          completedHidden={completedHidden}
          listItems={translationItems}
          language={language.name}
          onChange={_handleTranslationChange}
          showLoadingPopup={showLoadingPopup}
          variables={variables}
          variablesPaused={variablesPaused}
        />
      )}

      <StickyFooter
        completedHidden={completedHidden}
        languageList={languageList}
        onSave={_handleSave}
        onSelectLanguage={_handleSelectLanguage}
        toggleHidden={toggleHidden}
        toggleVariablesPaused={toggleVariablesPaused}
        variablesPaused={variablesPaused}
      />
    </Page>
  );
}
