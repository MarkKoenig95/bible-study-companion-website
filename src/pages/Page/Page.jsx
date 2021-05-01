import React from "react";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import "./Page.css";

export default function Page(props) {
  const { children, className, isLoading } = props;
  let loadingModalClass = "modal";
  loadingModalClass += !isLoading ? "" : " loading";
  let classN = className ? "page " + className : "page";
  return (
    <div className={classN}>
      <Header />
      <main>{children}</main>
      <Footer />
      <div className={loadingModalClass} />
    </div>
  );
}
