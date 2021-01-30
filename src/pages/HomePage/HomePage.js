import React from "react";
import Page from "../Page/Page";
import "./HomePage.css";

export default function HomePage() {
  return (
    <Page>
      <div className="row-content">
        <img
          className="screen-shot-pic"
          alt="App Screenshot"
          src="screen-shot.png"
        />
        <div className="column-content">
          <h1>Keep yourself on track and motivated to study the Bible</h1>
          <h3>Click a button below to download the app</h3>
        </div>
      </div>
      <div className="row-content">
        <button className="download-buttons">
          Google Play Store
          <i className="fab fa-google-play"></i>
        </button>
        <button className="download-buttons">
          APK
          <i className="fab fa-android"></i>
        </button>
        <button className="download-buttons">
          Apple App Store
          <i className="fab fa-apple"></i>
        </button>
      </div>
      <div className="column-content">
        <h1>Features:</h1>
        <h2>- Reading Schedules</h2>
        <h3>Create custom Bible reading schedules</h3>
        <p>
          Choose the pace that you would like to read at. Read the whole Bible
          in 1 year, 2 years, 3.7 years. You decide
        </p>
        <p>Choose from different themes of reading schedules</p>
        <p>Sequential: Read the bible from Genesis to Revelation</p>
        <p>
          Chronological: Read the bible in the order in which events occurred
        </p>
        <p>
          Thematic: Each day, read from a different section of the Bible in a
          weekly cycle: Day 1 - The Law, 2 - History, 3 - Psalms, 4 - Poetry, 5
          - Prophecy, 6 - Gospels, 7 - Letters
        </p>
        <h3>Create a custom schedule for a publication</h3>
        <p>
          Make custom schedules which can help you keep track of, and pace
          yourself in, reading a book, magazine, or whatever you choose
        </p>
        <h2>- Weekly Reading Schedule</h2>
        <p>
          An automatically created schedule which breaks down the weekly reading
          based on the Christian Life and Ministry Meeting Workbook into small
          segments that you can carefully research every day
        </p>
        <h2>- Reading Info</h2>
        <p>
          Bible reading sections display a popup with information about the
          reading
        </p>
        <p>When the account was written, where, who wrote it, etc.</p>
        <p>
          Includes links which open directly in the JW Library app if installed
        </p>
        <h2>- Notifications</h2>
        <p>
          Set notifications to remind you to do your reading for the day, to
          study for your midweek meeting, or that today is your family worship
        </p>
        <h2>- Reminders</h2>
        <p>Create custom reminders for yourself which you can check off</p>
        <p>
          This way you can make sure that you read your Daily Text for the day,
          that you have already studied for your midweek meeting, or that you
          finished reading the current magazines for the month
        </p>
      </div>
    </Page>
  );
}
