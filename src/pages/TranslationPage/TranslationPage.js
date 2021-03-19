import React, { useEffect, useState } from "react";
import Page from "../Page/Page";
import TranslationList from "./components/TranslationList";
import StickyFooter from "./components/StickyFooter";
import Axios from "axios";
import "./TranslationPage.css";
import TranslationReminders from "./components/TranslationReminders";
import { binarySearch } from "../../logic/logic";

var baseVariables = {};

export default function TranslationPage() {
  const [language, setLanguage] = useState();
  const [languageList, setLanguageList] = useState([]);
  const [translationItems, setTranslationItems] = useState([]);
  const [template, setTemplate] = useState([]);
  const [variables, setVariables] = useState({});
  const [variablesPaused, setVariablesPaused] = useState(false);
  const [completedHidden, setCompletedHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const _handleSave = () => {
    //Update the translation file to the appropriate values
    setIsLoading(true);
    Axios.put(`api/translation/${language.key}`, translationItems).then(() => {
      setIsLoading(false);
      alert(
        "Language file has been saved. \nThank you for your contribution. \nIf you haven't yet please sign up to receive email notifications when there are changes to the translation so that your target language can stay up to date with future updates"
      );
    });

    //Set all translation items to not have been edited and update the isSameAsOriginal flag
    let tempTransItems = translationItems.map((item) => {
      let isSameAsOriginal = item.isSameAsOriginal;
      if (isSameAsOriginal) {
        isSameAsOriginal = item.translation === item.original;
      }
      return { ...item, isEdited: false, isSameAsOriginal: isSameAsOriginal };
    });
    setTranslationItems(tempTransItems);
  };

  const toggleHidden = () => {
    setCompletedHidden(!completedHidden);
  };

  const toggleVariablesPaused = () => {
    setVariablesPaused(!variablesPaused);
  };

  const _handleSelectLanguage = (language) => {
    setIsLoading(true);
    // Will have to doccument better later, this function assumes that the template and
    // translation both have the same keys and that they are sorted arrays
    // (both of these requirements are handled by the server)
    Axios.get("api/translation/" + language.key).then((res) => {
      let { values, keys } = res.data;
      let tempVars = { ...baseVariables };
      let indexAdj = 0;
      let isOrdinalKey = false;

      let ordinalCountIndex = binarySearch(keys, "ordinal.special.count");
      let ordinalStartIndex = ordinalCountIndex - values[ordinalCountIndex];

      // Subtract 3 from the value because there are 3 in the template from english
      let ordinalCount = values[ordinalCountIndex] - 3;

      let ordinalStartOrder = template[ordinalStartIndex + 3].order;

      let tempItems = values.map((v, index) => {
        //Check for the count of special ordinals and adjust index accordingly
        if (index === ordinalStartIndex) {
          isOrdinalKey = true;
          indexAdj++;
        }

        if (template[index] && template[index].variable) {
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
        let original = template[i].value;
        let isSameAsOriginal = translation === original;
        let key = template[i].key;
        let order = template[i].order;

        if (order > ordinalStartOrder) {
          order += ordinalCount;
        }

        if (keys[index] !== key) {
          key = keys[index];
        }

        if (isOrdinalKey && ordinalCount > 0) {
          ordinalCount--;
          indexAdj--;
          order = ordinalStartOrder;
        } else {
          isOrdinalKey = false;
        }

        if (indexAdj < 0) {
          order += 0 - indexAdj;
        }

        return {
          key: key,
          original: original,
          description: template[i].description,
          link: template[i].link,
          order: order,
          isEdited: false,
          isSameAsOriginal: isSameAsOriginal,
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
      setLanguage(language);
      setIsLoading(false);
    });
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

  const showLoadingPopup = (val) => {
    setIsLoading(val);
  };

  const languageIsSet = language ? true : false;

  return (
    <Page className="translation-page" isLoading={isLoading}>
      <TranslationReminders />

      {languageIsSet && (
        <TranslationList
          completedHidden={completedHidden}
          listItems={translationItems}
          language={language.name}
          onChange={_handleTranslationChange}
          showLoadingPopup={showLoadingPopup}
          variables={variables}
          variablesPaused={variablesPaused}
        />
      )}

      <StickyFooter
        completedHidden={completedHidden}
        languageList={languageList}
        onSave={_handleSave}
        onSelectLanguage={_handleSelectLanguage}
        toggleHidden={toggleHidden}
        toggleVariablesPaused={toggleVariablesPaused}
        variablesPaused={variablesPaused}
      />
    </Page>
  );
}
