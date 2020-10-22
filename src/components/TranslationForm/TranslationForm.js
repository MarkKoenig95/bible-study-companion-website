import Axios from "axios";
import React, { useState } from "react";
import "./TranslationForm.css";

export default function TranslationForm(props) {
  const { description, label, language, original } = props;
  const [translation, setTranslation] = useState(original);

  const _onTextChange = ({ target }) => {
    setTranslation(target.value);
  };
  return (
    <div className="translation-form">
      <div className="form-section-1">
        <h3>Original Text</h3>
        <h5>{original}</h5>
      </div>
      <hr />
      <div className="form-section-1">
        <h3>Description</h3>
        <h5>{description}</h5>
      </div>
      <hr />
      <div className="form-section-2">
        <h3>Translation into {language}</h3>
        <textarea value={translation} onChange={_onTextChange} />
        <button
          onClick={() => {
            Axios.patch("api", { [label]: translation }).then((res) => {
              console.log(res);
            });
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
