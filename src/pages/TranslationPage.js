import React from "react";
import Page from "./Page/Page";
import TranslationForm from "../components/TranslationForm/TranslationForm";

export default function TranslationPage() {
  return (
    <Page>
      <TranslationForm
        label="label"
        original="whatever my original english text was"
        description="i am describing the purpose of the translation"
        language="Chinese"
      />
      <TranslationForm
        label="label"
        original="whatever my original english text was"
        description="i am describing the purpose of the translation"
        language="Chinese"
      />
    </Page>
  );
}
