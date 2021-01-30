import React from "react";
import LanguageSelect from "./LanguageSelect";
import "./StickyFooter.css";

export default function StickyFooter(props) {
  const {
    completedHidden,
    languageList,
    onSave,
    onSelectLanguage,
    toggleHidden,
    toggleVariablesPaused,
    variablesPaused,
  } = props;

  return (
    <div className="sticky-footer">
      <div className="hide-completed">
        <p>Hide Completed:</p>
        <input
          type="checkbox"
          value={completedHidden}
          onChange={toggleHidden}
        />
      </div>
      <div className="hide-completed">
        <p>Pause Variables:</p>
        <input
          type="checkbox"
          value={variablesPaused}
          onChange={toggleVariablesPaused}
        />
      </div>
      <LanguageSelect languageList={languageList} onSelect={onSelectLanguage} />
      <button onClick={onSave}>Save</button>
    </div>
  );
}
