import React from "react";
import EmailForm from "./EmailForm";
import "./TranslationReminders.css";

export default function TranslationReminders() {
  return (
    <div>
      <h2>Notes to translator:</h2>
      <h3>
        Thank you for contributing to the translation of the Bible Study
        Companion app
      </h3>
      <p>
        If you haven't yet downloaded the app please go to the
        <a href="/">home page</a> of this website and follow one of the links
        for download.
      </p>
      <p>
        Please look at the app and try to find the text you are translating.
      </p>
      <p>
        This way you can get a better sense of the meaning trying to be
        conveyed.
      </p>

      <br />

      <h3>The translation input has different color indicators:</h3>
      <table>
        <tbody>
          <tr className="red-row">
            <th>Red:</th>
            <td>
              The translation has not been edited yet. (It still matches the
              English text)
            </td>
          </tr>
          <tr className="orange-row">
            <th>Orange:</th>
            <td>The translation has been edited but has not yet been saved.</td>
          </tr>
          <tr className="green-row">
            <th>Green:</th>
            <td>The translation has been edited and saved.</td>
          </tr>
        </tbody>
      </table>

      <br />

      <h3>Variables:</h3>
      <p>
        In some translations there are values that will change in different
        situations.
      </p>
      <p>
        These will show up as boxes of text with arrow buttons on the left and
        right.
      </p>
      <p>
        You can use these buttons to move the variables to a location
        appropriate for your target languages grammar.
      </p>

      <br />

      <h3>
        If you have suggestions, encounter bugs in the translation page, or have
        clarifying questions please contact me at:
      </h3>
      <a href="mailto:humanappmaker@gmail.com">HumanAppMaker@gmail.com</a>

      <br />

      <h3>
        If you would like to sign up to receive email notifications for future
        additions or updates please input your email below and press send.
      </h3>
      <EmailForm />

      <br />

      <h3>
        To start translating select your target language from the dropdown
        below.
      </h3>
      <p>
        You can click the hide completed checkbox below to hide translations
        that you, or someone else, has already completed.
      </p>
      <p>To save your progress any time press the save button below.</p>
      <h3>
        We reccommend using a device larger than a phone for better visibility
        and formatting.
      </h3>
      <h3>
        DO NOT forget to save your progress when you are done translating or all
        of your work will be lost.
      </h3>
    </div>
  );
}
