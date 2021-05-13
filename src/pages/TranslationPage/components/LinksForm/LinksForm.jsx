import React, { useEffect, useState } from "react";
import { Frag } from "../OrdinalForm";
import { LinkParsingForm, TestLinkSection } from "./components";
import { getTestLinks, linksArrayToObject } from "./logic";
import "./LinksForm.css";

export default function LinksForm(props) {
  const { onChange, links, showLoadingPopup } = props;
  const [linksObj, setLinksObj] = useState({});
  const [testLinks, setTestLinks] = useState({});
  const [hasStudyBible, setHasStudyBible] = useState(false);
  const [finderLocale, setFinderLocale] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(1);

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
    <div className="translation-form">
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
          links={linksObj}
          mainLink="https://www.jw.org/en/library/bible/nwt/introduction/how-to-read-the-bible/"
          onChange={onChange}
          order={1}
          showLoadingPopup={showLoadingPopup}
          wwwOrwol="www"
        />
        <LinkParsingForm
          currentOrder={currentOrder}
          links={linksObj}
          mainLink="https://www.jw.org/en/library/bible/nwt/books/genesis/1/"
          onChange={onChange}
          order={2}
          showLoadingPopup={showLoadingPopup}
          wwwOrwol="www"
        />
        <LinkParsingForm
          currentOrder={currentOrder}
          links={linksObj}
          mainLink="https://wol.jw.org/en/wol/b/r1/lp-e/nwt/1/1#study=discover"
          onChange={onChange}
          order={3}
          showLoadingPopup={showLoadingPopup}
          wwwOrwol="wol"
        />
        <TestLinkSection
          currentOrder={currentOrder}
          finderLocale={finderLocale}
          order={4}
          testLinks={testLinks}
        />
      </div>
    </div>
  );
}
