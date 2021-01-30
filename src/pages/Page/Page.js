import React from "react";
import Header from "../../components/Header/Header";
import "./Page.css";

export default function Page(props) {
  const { children, className, isLoading } = props;
  let loadingModalClass = "modal";
  loadingModalClass += !isLoading ? "" : " loading";
  return (
    <div className={className}>
      <Header />
      <main>{children}</main>
      <div className={loadingModalClass} />
    </div>
  );
}
