import React, { useEffect, useState } from "react";
import Page from "../Page/Page";
import TranslationList from "./components/TranslationList";
import LanguageSelect from "./components/LanguageSelect";
import StickyFooter from "./components/StickyFooter";
import Axios from "axios";

var baseVariables = {};

export default function TranslationPage() {
  const [language, setLanguage] = useState();
  const [languageList, setLanguageList] = useState([]);
  const [translationItems, setTranslationItems] = useState([]);
  const [template, setTemplate] = useState([]);
  const [variables, setVariables] = useState({});

  useEffect(() => {
    Axios.get("api/translation/language-list").then(({ data }) => {
      setLanguageList(data);
    });

    Axios.get("api/template/variables").then(({ data }) => {
      let vars = {};

      let keys = Object.keys(data);
      keys.forEach((v) => {
        if (v !== "_keys") {
          vars[v] = [];
          vars[v].push(`[${v}]`);
        }
      });

      baseVariables = { ...vars };

      setVariables(vars);
    });

    Axios.get("api/template").then(({ data }) => {
      let { values } = data;
      setTemplate(values);
    });
  }, []);

  const _handleSelectLanguage = (language) => {
    let indexAdj = 0;
    Axios.get("api/translation/" + language.key).then((res) => {
      let { values } = res.data;

      let tempVars = { ...baseVariables };

      let tempItems = values.map((v, index) => {
        //Check for the count of special ordinals and adjust index accordingly
        if (template[index].key === "ordinal.special.0") {
          indexAdj = template[index].value - v;
        }

        if (template[index].variable) {
          tempVars = {
            ..._handleVariablesChange(
              v,
              template[index].variable,
              v,
              tempVars,
              false
            ),
          };
        }

        let i = index + indexAdj;
        let translation = typeof v !== "undefined" ? v : template[i].value;

        return {
          key: template[i].key,
          original: template[i].value,
          description: template[i].description,
          link: template[i].link,
          order: template[i].order,
          isEdited: false,
          translation: translation,
          variable: template[i].variable,
        };
      });

      tempItems.sort((a, b) => {
        return a.order - b.order;
      });

      //Now that all of the variables are set up there are some special variables we need to
      //set manually because they are slightly complicated or will come from the database
      //in the app
      tempVars = { ...setSpecialVariables(tempVars) };
      tempVars = { ...checkSpecialVariables("year", tempVars) };
      tempVars = { ...checkSpecialVariables("initialChapter", tempVars) };
      tempVars = { ...checkSpecialVariables("initialVerse", tempVars) };
      tempVars = { ...checkSpecialVariables("startChapter", tempVars) };
      tempVars = { ...checkSpecialVariables("startVerse", tempVars) };

      setVariables(tempVars);
      setTranslationItems(tempItems);
    });
    setLanguage(language);
  };

  const checkSpecialVariables = (variable, vars, prevValue) => {
    let values = [];

    const setSpecialDates = () => {
      let newDate = vars.startDate[1];
      let date1 = vars.date[2];
      let date2 = vars.date[3];
      let varIndex = 1;

      if (variable === "startDate") {
        //startDate specifically holds the value that all dates look to in order to format
        //the date correctly. So we need to adjust the index accordingly
        varIndex += 1;
      }

      //Date 1 "After 100 B.C.E."
      newDate = newDate.replace("{{date}}", date1);
      newDate = newDate.replace("{{about}}", "");
      newDate = newDate.replace("{{before}}", "");
      newDate = newDate.replace("{{after}}", vars.after[1]);
      values.push({
        value: newDate,
        prevValue: vars[variable][varIndex],
      });
      varIndex += 1;

      //Date 2 "Before 100 C.E."
      newDate = vars.startDate[1];
      newDate = newDate.replace("{{date}}", date2);
      newDate = newDate.replace("{{about}}", "");
      newDate = newDate.replace("{{before}}", vars.before[1]);
      newDate = newDate.replace("{{after}}", "");
      values.push({
        value: newDate,
        prevValue: vars[variable][varIndex],
      });
      varIndex += 1;

      //Date 3 "About 100 B.C.E."
      newDate = vars.startDate[1];
      newDate = newDate.replace("{{date}}", date1);
      newDate = newDate.replace("{{about}}", vars.about[1]);
      newDate = newDate.replace("{{before}}", "");
      newDate = newDate.replace("{{after}}", "");
      values.push({
        value: newDate,
        prevValue: vars[variable][varIndex],
      });
      varIndex += 1;

      //Date 4 "100 C.E."
      values.push({
        value: date2,
        prevValue: vars[variable][varIndex],
      });
    };

    switch (variable) {
      case "date":
        let date = vars.date[1];
        if (!date || !vars.bceOrCe[0] || !vars.bceOrCe[1]) {
          return vars;
        }
        date = date.replace("{{year}}", 100);
        date = date.replace("{{bceOrCe}}", vars.bceOrCe[1]);
        values.push({
          value: date,
          prevValue: vars.date[2],
        });
        date = vars.date[1];
        date = date.replace("{{year}}", 100);
        date = date.replace("{{bceOrCe}}", vars.bceOrCe[2]);
        values.push({
          value: date,
          prevValue: vars.date[3],
        });
        break;
      case "year":
        values.push({
          value: 100,
          prevValue: 100,
        });
        values.push({
          value: 4026,
          prevValue: 4026,
        });
        values.push({
          value: 607,
          prevValue: 607,
        });
        values.push({
          value: 1040,
          prevValue: 1040,
        });
        break;
      case "startDate":
        setSpecialDates();
        break;
      case "endDate":
        setSpecialDates();
        break;
      case "startYear":
        setSpecialDates();
        break;
      case "endYear":
        setSpecialDates();
        break;
      case "initialChapter":
        values.push({
          value: 1,
          prevValue: 1,
        });
        break;
      case "initialVerse":
        values.push({
          value: 231,
          prevValue: 231,
        });
        break;
      case "startChapter":
        values.push({
          value: 2,
          prevValue: 2,
        });
        break;
      case "startVerse":
        values.push({
          value: 1,
          prevValue: 1,
        });
        break;
      default:
        return vars;
    }

    values.forEach((value) => {
      vars = {
        ..._handleVariablesChange(
          value.value,
          variable,
          value.prevValue,
          vars,
          false
        ),
      };
    });

    return vars;
  };

  const setSpecialVariables = (vars, variable) => {
    if (
      !variable ||
      variable === "before" ||
      variable === "after" ||
      variable === "about" ||
      variable === "bceOrCe" ||
      variable === "year" ||
      variable === "startDate" ||
      variable === "date"
    ) {
      vars = { ...checkSpecialVariables("date", vars) };
      vars = { ...checkSpecialVariables("startDate", vars) };
      vars = { ...checkSpecialVariables("endDate", vars) };
      vars = { ...checkSpecialVariables("startYear", vars) };
      vars = { ...checkSpecialVariables("endYear", vars) };
    }

    return vars;
  };

  const _handleVariablesChange = (
    newVal,
    variable,
    prevVal,
    vars,
    isFirstRun = true
  ) => {
    let shouldReturn = true;
    let insertIndex;

    if (variable) {
      if (!vars) {
        vars = { ...variables };
        shouldReturn = false;
      }

      let prevVarArray = vars[variable];
      let newVarArray = prevVarArray.map((prevVar, index) => {
        if (prevVar !== prevVal) {
          return prevVar;
        } else {
          insertIndex = index;
        }
      });

      if (typeof insertIndex !== "undefined") {
        newVarArray.splice(insertIndex, 1, newVal);
      } else {
        newVarArray.push(newVal);
      }
      vars[variable] = newVarArray;

      if (isFirstRun) {
        vars = { ...setSpecialVariables(vars, variable, prevVal) };
      }

      if (!shouldReturn) {
        setVariables(vars);
      } else {
        return vars;
      }
    }
  };

  const _handleTranslationChange = (index, value, key) => {
    let tempItems = [...translationItems];

    if (key) {
      //Insert a value at the given index
      let newValue = {
        key: key,
        original: "",
        description: "",
        link: "",
        isEdited: true,
        translation: value,
      };
      tempItems.splice(index, 0, newValue);
    } else if (typeof index === "object") {
      //Then this is a multiple edit request
      //For use with this, the index should be an array of objects with an index and value attribute
      index.forEach((val) => {
        let i = val.index;
        let v = val.value;
        let variable = val.variable;
        _handleVariablesChange(v, variable, tempItems[i].translation);
        tempItems[i].translation = v;
        tempItems[i].isEdited = true;
      });
    } else if (typeof value !== "undefined") {
      //Edit the existing value
      let variable = tempItems[index].variable;
      _handleVariablesChange(value, variable, tempItems[index].translation);
      tempItems[index].translation = value;
      tempItems[index].isEdited = true;
    } else {
      //Delete the value at the given index
      tempItems.splice(index, 1);
    }

    setTranslationItems(tempItems);
  };

  return (
    <Page>
      <h3>[Some instructions on how to go about translating... ]</h3>
      <h3>
        [A place where you can browse for a file you already started translating
        in the past]
      </h3>
      <h3>[A checkbox for hiding completed translations]</h3>
      <p>
        [This should have colors for things that haven't been translated yet,
        things that have been edited but not submitted, and green for things
        that have been translated and submitted]
      </p>
      <p>
        [on submit, if the language selected for translation has a hyphen in it
        and there is no base translation for this language, then we will save
        this as the base translation]
      </p>
      <LanguageSelect
        languageList={languageList}
        onSelect={_handleSelectLanguage}
      />
      {language && (
        <TranslationList
          listItems={translationItems}
          language={language.name}
          onChange={_handleTranslationChange}
          variables={variables}
        />
      )}
      <StickyFooter language={language} translation={translationItems} />
    </Page>
  );
}
