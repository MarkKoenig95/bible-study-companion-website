import React, { useState } from "react";

export default function LanguageSelect(props) {
  const { languageList, onSelect } = props;
  const [languageID, setLanguageID] = useState(0);

  const _handleLanguageChange = ({ target }) => {
    const { value } = target;
    onSelect(languageList[value]);
    setLanguageID(value);
  };

  return (
    <div>
      <label>Please select the language you would like to translate into</label>
      <select
        value={languageID}
        onChange={_handleLanguageChange}
        name="languages"
      >
        {languageList.map((language, index) => (
          <option key={JSON.stringify(language) + index} value={index}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
