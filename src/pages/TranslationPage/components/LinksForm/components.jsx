import Axios from "axios";
import React, { useEffect, useState } from "react";
import decode from "urldecode";
import Link from "../Link";
import { linkParser } from "./logic";

const instance = Axios.create({
  headers: {
    get: {
      "X-Requested-With": "XMLHttpRequest",
      "Access-Control-Allow-Origin": "*",
    },
  },
});

export const LinkParsingForm = (props) => {
  const {
    currentOrder,
    order,
    links,
    mainLink,
    onChange,
    showLoadingPopup,
    wwwOrwol,
  } = props;
  const [link, setLink] = useState("");
  const [display, setDisplay] = useState("none");
  const [isFinished, setisFinished] = useState(false);
  const [inputID, setInputID] = useState(Math.random() * 100000);

  useEffect(() => {
    setInputID("link-parsing-form-input-" + order);

    if (currentOrder >= order) {
      setDisplay("flex");
    } else {
      setDisplay("none");
    }
  }, [currentOrder, order]);

  const _handleLinkInputChange = async (value) => {
    if (typeof value !== "string") {
      alert("The copied item was not text, please try again");
      return;
    }
    let newLink = decode(value);
    let { origSecs, sections, shouldBreak } = linkParser(newLink, mainLink);
    let finderLocale = links.finderLocale.value;

    if (!shouldBreak) {
      let updatedValues = [];

      if (finderLocale === "E" && wwwOrwol === "www") {
        //Then it hasn't changed yet and we need to scrape a webpage to get the value
        showLoadingPopup(true);
        await instance
          .get("https://cors-anywhere.herokuapp.com/" + newLink)
          .then(({ data }) => {
            let found = data.match(/wtlocale=(?<locale>[A-Z]*)./);
            updatedValues.push({
              index: links.finderLocale.index,
              value: found.groups.locale,
            });
            showLoadingPopup(false);
          })
          .catch((e) => {
            console.error(e);
          });
      }

      updatedValues.push({
        index: links.languageTag.index,
        value: sections[3],
      });

      origSecs.forEach((sec, index) => {
        if (links[wwwOrwol][sec]) {
          updatedValues.push({
            index: links[wwwOrwol][sec].index,
            value: sections[index],
          });
        }
      });

      onChange(updatedValues);
      setLink(newLink);
    }
  };

  const _handlePasteClick = () => {
    navigator.clipboard.readText().then((text) => _handleLinkInputChange(text));
  };

  return (
    <div className="link-parsing-form" style={{ display: display }}>
      <div className="link-parsing-form-row">
        <h3>Link {order}</h3>
        <i
          className="fas fa-check"
          style={{ color: "green", display: isFinished ? "flex" : "none" }}
        />
      </div>
      <Link href={mainLink}>Click this link</Link>
      <p>Once clicked, go to the newly opened tab.</p>
      <p>Change the language of the page to your target language.</p>
      <p>Copy the website's URL (Ex. https://www.jw.org/blah/blah/blah)</p>
      <button onClick={_handlePasteClick}>
        Click here to paste the copied URL
        <i className="fas fa-paste"></i>
      </button>
      <input
        id={inputID}
        style={{ borderColor: link ? "orange" : "gray" }}
        value={link}
        readOnly
      />
    </div>
  );
};

export const TestLinkSection = (props) => {
  const { currentOrder, order, testLinks } = props;
  const [display, setDisplay] = useState("none");

  useEffect(() => {
    if (currentOrder >= order) {
      setDisplay("flex");
    } else {
      setDisplay("none");
    }
  }, [currentOrder, order]);

  return (
    <div style={{ display: display }}>
      <p>
        Please check that everything was added correctly by going to these links
        and making sure that they display the right information in your target
        language
      </p>
      <br />
      <Link href={testLinks.l1}>Test Link 1</Link>
      <Link href={testLinks.l2}>Test Link 2</Link>
      <Link href={testLinks.l3}>Test Link 3</Link>
      <Link href={testLinks.l4}>Test Link 4</Link>
      <Link href={testLinks.l5}>Test Link 5</Link>
      <Link href={testLinks.l6}>Test Link 6</Link>
    </div>
  );
};
