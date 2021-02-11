import React from "react";
import Page from "../Page/Page";

export default function NotFoundPage() {
  return (
    <Page>
      <div className="column-content">
        <h1>Error 404</h1>
        <h3>Could not find the page you were looking for. </h3>
        <p>
          We're sorry for the inconvenience. Please use one of the links on this
          page. If they don't work, then please contact us at
          <a href="mailto:humanappmaker@gmail.com">HumanAppMaker@gmail.com</a>
        </p>
      </div>
    </Page>
  );
}
