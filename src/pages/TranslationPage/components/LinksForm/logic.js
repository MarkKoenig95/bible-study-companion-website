import Axios from "axios";

export const linksArrayToObject = async (linksArray) => {
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
};

export const linkParser = (link, original) => {
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
};

const linkFormatter = (links, wwwOrwol, original) => {
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
};

export const getTestLinks = (finderLocale, hasStudyBible, linksObj) => {
  let testLinks = {};
  testLinks.l1 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/202018087#h=3:652-6:400"
  );
  testLinks.l2 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/2012049#h=1:0-6:503"
  );
  testLinks.l3 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/2017006#h=2:0-17:37"
  );
  testLinks.l4 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/3/14#study=discover&v=3:14:14-3:14:26"
  );
  testLinks.l5 = linkFormatter(
    linksObj,
    "wol",
    "https://wol.jw.org/en/wol/d/r1/lp-e/2016364#h=14:0-25:930"
  );
  testLinks.l6 = `https://www.jw.org/finder?wtlocale=${finderLocale}&docid=10010${
    hasStudyBible ? "70" : "61"
  }103&prefer=content&Book=40&Chapter=1`;
  return testLinks;
};
