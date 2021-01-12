import Axios from "axios";
import React from "react";
import "./StickyFooter.css";

export default function StickyFooter(props) {
  const { language, translation } = props;

  const _handleSave = () => {
    Axios.put(`api/translation/${language.key}`, translation);
  };

  const _handleSend = () => {
    Axios.post(`api/translation/${language.key}`, translation);
  };

  return (
    <div className="sticky-footer">
      <button onClick={_handleSave}>Save</button>
      <button onClick={_handleSend}>Send</button>
    </div>
  );
}
