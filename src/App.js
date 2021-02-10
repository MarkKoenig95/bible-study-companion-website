import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.css";
import TranslationPage from "./pages/TranslationPage/TranslationPage";
import Page from "./pages/Page/Page";
import HomePage from "./pages/HomePage/HomePage";
import PrivacyPage from "./pages/PrivacyPage/PrivacyPage";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import TemplateEditPage from "./pages/TemplateEditPage/TemplateEditPage";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route path="/translation">
            <TranslationPage />
          </Route>
          <Route path="/privacy">
            <PrivacyPage />
          </Route>
          <Route path="/terms-and-conditions">
            <TermsAndConditions />
          </Route>
          <Route path="/template-edit">
            <TemplateEditPage />
          </Route>
          <Route path="/">
            <Page>
              <h1>Error 404</h1>
            </Page>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
