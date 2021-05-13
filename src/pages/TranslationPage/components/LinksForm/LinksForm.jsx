import React, { useCallback, useEffect, useState } from "react";
import { Frag } from "../OrdinalForm";
import { LinkParsingForm, TestLinkSection } from "./components";
import {
  getDisplayValuesForLinksForm,
  getTestLinks,
  linksArrayToObject,
} from "./logic";
import "./LinksForm.css";

export default function LinksForm(props) {
  const { completedHidden, links, onChange, showLoadingPopup } = props;
  const baseOrder = 1;

  const [linksObj, setLinksObj] = useState({});
  const [testLinks, setTestLinks] = useState({});
  const [hasStudyBible, setHasStudyBible] = useState(false);
  const [finderLocale, setFinderLocale] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(baseOrder);
  const [display, setDisplay] = useState("flex");
  const [borderColor, setBorderColor] = useState("gray");
  const [isRestarted, setIsRestarted] = useState(true);

  const maxOrder = 4;

  const updateOrder = useCallback(
    (order) => {
      let newOrder = order || currentOrder;
      newOrder = newOrder + 1;
      if (newOrder === maxOrder) {
        setIsRestarted(false);
      }
      setCurrentOrder(newOrder);
    },
    [currentOrder]
  );

  const restartSetup = useCallback(() => {
    setIsRestarted(true);
    setCurrentOrder(baseOrder);
  }, []);

  useEffect(() => {
    let displayValues = getDisplayValuesForLinksForm(
      currentOrder,
      baseOrder,
      maxOrder,
      completedHidden
    );
    setDisplay(displayValues.display);
    setBorderColor(displayValues.borderColor);
  }, [completedHidden, currentOrder]);

  useEffect(() => {
    let newFinderLocale = linksObj.finderLocale
      ? linksObj.finderLocale.value
      : "E";
    setFinderLocale(newFinderLocale);

    let newHasStudyBible = linksObj.hasStudyBible
      ? linksObj.hasStudyBible.value
      : false;
    setHasStudyBible(newHasStudyBible);

    let newTestLinks = getTestLinks(finderLocale, hasStudyBible, linksObj);
    setTestLinks(newTestLinks);
  }, [finderLocale, hasStudyBible, linksObj]);

  useEffect(() => {
    linksArrayToObject(links).then((obj) => {
      setLinksObj(obj);
    });
  }, [links]);

  const toggleHasStudyBible = () => {
    let index = linksObj.hasStudyBible.index;
    let value = !hasStudyBible;
    onChange(index, value);
  };

  return (
    <div
      className="translation-form"
      style={{ display: display, borderColor: borderColor }}
    >
      <h2>Links</h2>
      <div className="form-sections">
        <div className="checkbox-input">
          <Frag>Target language has Study Bible: </Frag>
          <input
            type="checkbox"
            checked={hasStudyBible}
            onChange={toggleHasStudyBible}
          />
        </div>
        <LinkParsingForm
          currentOrder={currentOrder}
          isRestarted={isRestarted}
          links={linksObj}
          mainLink="https://www.jw.org/en/library/bible/nwt/introduction/how-to-read-the-bible/"
          onChange={onChange}
          order={baseOrder}
          showLoadingPopup={showLoadingPopup}
          updateOrder={updateOrder}
          wwwOrwol="www"
        />
        <LinkParsingForm
          currentOrder={currentOrder}
          isRestarted={isRestarted}
          links={linksObj}
          mainLink="https://www.jw.org/en/library/bible/nwt/books/genesis/1/"
          onChange={onChange}
          order={baseOrder + 1}
          showLoadingPopup={showLoadingPopup}
          updateOrder={updateOrder}
          wwwOrwol="www"
        />
        <LinkParsingForm
          currentOrder={currentOrder}
          isRestarted={isRestarted}
          links={linksObj}
          mainLink="https://wol.jw.org/en/wol/b/r1/lp-e/nwt/1/1#study=discover"
          onChange={onChange}
          order={baseOrder + 2}
          showLoadingPopup={showLoadingPopup}
          updateOrder={updateOrder}
          wwwOrwol="wol"
        />
        <TestLinkSection
          currentOrder={currentOrder}
          finderLocale={finderLocale}
          order={maxOrder}
          restartSetup={restartSetup}
          testLinks={testLinks}
        />
      </div>
    </div>
  );
}
