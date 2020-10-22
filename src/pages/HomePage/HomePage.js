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
        <h3>Features:</h3>
      </div>
    </Page>
  );
}
