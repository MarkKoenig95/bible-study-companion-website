import { useState, useCallback } from "react";

const handleVariablesChange = (newVal, variable, prevVal, vars) => {
  let insertIndex;
  let newVars = { ...vars };

  if (!variable) return newVars;

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

  return newVars;
};

export const useVariables = () => {
  const [variables, setVariables] = useState({});

  const _handleVariablesChange = useCallback(
    (newVal, variable, prevVal, vars) => {
      let shouldReturn = true;

      if (!vars) {
        vars = { ...variables };
        shouldReturn = false;
      }

      let newVars = handleVariablesChange(newVal, variable, prevVal, vars);

      if (shouldReturn) return newVars;

      setVariables(newVars);
    },
    [variables]
  );

  return {
    _handleVariablesChange,
    setVariables,
    variables,
  };
};
