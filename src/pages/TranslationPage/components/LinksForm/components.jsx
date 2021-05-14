import Axios from "axios";
import React, { useEffect, useState } from "react";
import decode from "urldecode";
import Link from "../Link";
import { getIsSameAsOriginalFromLink, linkParser } from "./logic";

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
    isRestarted,
    showLoadingPopup,
    updateOrder,
    wwwOrwol,
  } = props;
  const [link, setLink] = useState("");
  const [display, setDisplay] = useState("none");
  const [isFinished, setIsFinished] = useState(false);
  const [inputID, setInputID] = useState(Math.random() * 100000);

  useEffect(() => {
    if (isRestarted && currentOrder <= order) {
      setIsFinished(false);
      return;
    }

    let isSameAsOriginal = getIsSameAsOriginalFromLink(
      links,
      wwwOrwol,
      mainLink
    );

    if (!isSameAsOriginal) {
      updateOrder(order);
    }

    setIsFinished(!isSameAsOriginal);
  }, [
    currentOrder,
    isRestarted,
    links,
    mainLink,
    order,
    updateOrder,
    wwwOrwol,
  ]);

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
          .get("https://corsanywhere.herokuapp.com/" + newLink)
          .then(({ data }) => {
            let found = data.match(/wtlocale=(?<locale>[A-Z]*)./);
            updatedValues.push({
              index: links.finderLocale.index,
              value: found.groups.locale,
            });
          })
          .catch((e) => {
            console.error(e);
            alert(
              "There was a problem getting some information for the links, please contact the developer to inform them of this. Thank you for your patience and support!"
            );
          });

        showLoadingPopup(false);
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
      setIsFinished(true);
      updateOrder(order);
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
      <div
        className="link-parsing-form"
        style={{ display: isFinished ? "none" : "flex" }}
      >
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
    </div>
  );
};

export const TestLinkSection = (props) => {
  const { currentOrder, order, restartSetup, testLinks } = props;
  const [display, setDisplay] = useState("none");

  useEffect(() => {
    if (currentOrder >= order) {
      setDisplay("flex");
    } else {
      setDisplay("none");
    }
  }, [currentOrder, order]);

  return (
    <div className="test-links" style={{ display: display }}>
      <p>
        Please check that everything was added correctly by going to these links
        and making sure that they display the right information in your target
        language
      </p>
      <div className="test-links-row">
        <Link href={testLinks.l1}>Test Link 1</Link>
        <Link href={testLinks.l2}>Test Link 2</Link>
        <Link href={testLinks.l3}>Test Link 3</Link>
        <Link href={testLinks.l4}>Test Link 4</Link>
        <Link href={testLinks.l5}>Test Link 5</Link>
        <Link href={testLinks.l6}>Test Link 6</Link>
      </div>
      <button onClick={restartSetup}>Restart Link Setup</button>
    </div>
  );
};
