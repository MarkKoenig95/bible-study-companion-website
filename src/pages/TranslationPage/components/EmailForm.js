import React, { useState } from "react";
import Axios from "axios";
import "./EmailForm.css";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const submitForm = () => {
    Axios.post(`/api/translation/email?email=${email}`)
      .then(() => {
        alert(
          "Email sent successfully. Please check that you recieved your copy. Otherwise there was a problem."
        );
      })
      .catch(console.error);
  };

  const _handleEmailChange = ({ target }) => {
    let { value } = target;
    setEmail(value);
  };

  return (
    <div className="email-form">
      <input value={email} onChange={_handleEmailChange} />
      <button onClick={submitForm}>Send</button>
    </div>
  );
}
