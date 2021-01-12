import Axios from "axios";
import React, { useEffect, useState } from "react";
// import "./OrdinalForm.css";
import decode from "urldecode";
import Link from "./Link";
import { Frag } from "./OrdinalForm";
const instance = Axios.create({
  headers: {
    get: {
      "X-Requested-With": "XMLHttpRequest",
      "Access-Control-Allow-Origin": "*",
    },
  },
});

async function linksArrayToObject(linksArray) {
  let linksObj = {};
  let newLinksArray = [];

  linksArray.forEach((link) => {
    let simpleKey = link.key.split(".");
    simpleKey.shift();
    simpleKey = simpleKey.join(".");
    newLinksArray.push({
      key: simpleKey,
      value: { index: link.index, value: link.translation },
    });
  });

  await Axios.post("/api/logic/key-string-parser", newLinksArray).then(
    (res) => {
      linksObj = res.data;
    }
  );

  return linksObj;
}

function linkParser(link, original) {
  let sections = link.split("/");
  let origSecs = original.split("/");
  let shouldBreak = false;

  if (sections[0] !== "https:") {
    alert('Please copy the whole link starting from "https://"');
    shouldBreak = true;
  }
  if (sections.length !== origSecs.length) {
    alert(
      "The format of the link that you input does not seem to match the original link"
    );
    shouldBreak = true;
  }

  return { origSecs: origSecs, sections: sections, shouldBreak: shouldBreak };
}

function linkFormatter(links, wwwOrwol, original) {
  let origSecs = original.split("/");

  let link = "";

  if (!links[wwwOrwol]) {
    return "";
  }

  origSecs.forEach((sec, index) => {
    if (sec === "en") {
      link += links.languageTag.value + "/";
    } else if (links[wwwOrwol][sec]) {
      link += links[wwwOrwol][sec].value + "/";
    } else if (sec === "nwtsty" || sec === "study-bible") {
      link += links.hasStudyBible.value ? sec : "nwt";
      link += "/";
    } else {
      link += sec + "/";
    }
  });

  return link;
}

function LinkParsingForm(props) {
  const { links, mainLink, onChange, wwwOrwol } = props;
  const [link, setLink] = useState("");

  const _handleLinkInputChange = async ({ target }) => {
    const { value } = target;
    let newLink = decode(value);
    let { origSecs, sections, shouldBreak } = linkParser(newLink, mainLink);
    let finderLocale = links.finderLocale.value;

    if (!shouldBreak) {
      let updatedValues = [];

      if (finderLocale === "E" && wwwOrwol === "www") {
        //Then it hasn't changed yet and we need to scrape a webpage to get the value
        await instance
          .get("https://cors-anywhere.herokuapp.com/" + newLink)
          .then(({ data }) => {
            let found = data.match(/wtlocale=(?<locale>[A-Z]*)./);

            updatedValues.push({
              index: links.finderLocale.index,
              value: found.groups.locale,
            });
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

  return (
    <div>
      <p>
        Go to the link below, change to your target language, copy the new link
        and paste the copied link below
      </p>

      <Link href={mainLink}>Link</Link>
      <input
        style={{ borderColor: link ? "orange" : "gray", width: "50%" }}
        value={link}
        onChange={_handleLinkInputChange}
      />
    </div>
  );
}

export default function LinksForm(props) {
  const { onChange, links } = props;
  const [linksObj, setLinksObj] = useState({});
  let finderLocale = linksObj.finderLocale ? linksObj.finderLocale.value : "E";
  let hasStudyBible = linksObj.hasStudyBible
    ? linksObj.hasStudyBible.value
    : false;
  const testLink1 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/202018087#h=3:652-6:400"
  );
  const testLink2 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/2012049#h=1:0-6:503"
  );
  const testLink3 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/2017006#h=2:0-17:37"
  );
  const testLink4 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/3/14#study=discover&v=3:14:14-3:14:26"
  );
  const testLink5 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/2016364#h=14:0-25:930"
  );
  const testLink6 = `https://www.jw.org/finder?wtlocale=${finderLocale}&docid=10010${
    hasStudyBible ? "70" : "61"
  }103&prefer=content&Book=40&Chapter=1`;

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
          links={linksObj}
          onChange={onChange}
          mainLink="https://www.jw.org/en/library/bible/nwt/introduction/how-to-read-the-bible/"
          wwwOrwol="www"
        />
        <LinkParsingForm
          links={linksObj}
          onChange={onChange}
          mainLink="https://www.jw.org/en/library/bible/nwt/books/genesis/1/"
          wwwOrwol="www"
        />
        <LinkParsingForm
          links={linksObj}
          onChange={onChange}
          mainLink="https://wol.jw.org/en/wol/b/r1/lp-e/nwt/1/1#study=discover"
          wwwOrwol="wol"
        />
        <p>Please test the extracted link elements with all of these links</p>
        <Link href={testLink1}>Test Link 1</Link>
        <Link href={testLink2}>Test Link 2</Link>
        <Link href={testLink3}>Test Link 3</Link>
        <Link href={testLink4}>Test Link 4</Link>
        <Link href={testLink5}>Test Link 5</Link>
        <Link href={testLink6}>Test Link 6</Link>
      </div>
    </div>
  );
}
