import Axios from "axios";
import { useState, useEffect, useCallback } from "react";

export const setSpecialDates = (vars, variable, values = []) => {
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
  return values;
};

export const checkSpecialVariables = (variable, vars) => {
  let values = [];

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
      values = [...setSpecialDates(vars, variable, values)];
      break;
    case "endDate":
      values = [...setSpecialDates(vars, variable, values)];
      break;
    case "startYear":
      values = [...setSpecialDates(vars, variable, values)];
      break;
    case "endYear":
      values = [...setSpecialDates(vars, variable, values)];
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
      ...handleVariablesChange(
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

export const setSpecialVariables = (vars, variable) => {
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

export const handleVariablesChange = (
  newVal,
  variable,
  prevVal,
  vars,
  isFirstRun = true
) => {
  if (!variable) return;

  let insertIndex;
  let newVars = { ...vars };
  let prevVarArray = newVars[variable];
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
  newVars[variable] = newVarArray;

  if (isFirstRun) {
    newVars = { ...setSpecialVariables(newVars, variable, prevVal) };
  }

  return newVars;
};

export const useVariables = () => {
  const [variables, setVariables] = useState({});
  const [baseVariables, setBaseVariables] = useState({});

  useEffect(() => {
    Axios.get("api/template/variables").then(({ data }) => {
      let vars = {};

      let keys = Object.keys(data);
      keys.forEach((v) => {
        if (v !== "_keys") {
          vars[v] = [];
          vars[v].push(`[${v}]`);
        }
      });

      setBaseVariables({ ...vars });

      setVariables(vars);
    });
  }, []);

  const _handleVariablesChange = useCallback(
    (newVal, variable, prevVal, vars, isFirstRun = true) => {
      let shouldReturn = true;

      if (!vars) {
        vars = { ...variables };
        shouldReturn = false;
      }

      let newVars = handleVariablesChange(
        newVal,
        variable,
        prevVal,
        vars,
        isFirstRun
      );

      if (shouldReturn) return newVars;

      setVariables(newVars);
    },
    [variables]
  );

  return {
    _handleVariablesChange,
    baseVariables,
    checkSpecialVariables,
    setSpecialVariables,
    setVariables,
    variables,
  };
};
