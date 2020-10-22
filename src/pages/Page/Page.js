import React from "react";
import Header from "../../components/Header/Header";
import "./Page.css";

export default function Page(props) {
  return (
    <div>
      <Header />
      <main>{props.children}</main>
    </div>
  );
}
