import React from "react";
import "./Footer.css";

export default function Footer() {
  let year = new Date().getFullYear();
  return (
    <footer>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms-and-conditions">Terms and Conditions</a>
      <p>Copywrite {year}</p>
    </footer>
  );
}
