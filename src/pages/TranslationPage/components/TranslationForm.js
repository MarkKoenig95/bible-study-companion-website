import React, { useCallback, useEffect, useRef, useState } from "react";
import { translationVariableParser } from "../../../logic/logic";
import Link from "./Link";
import "./TranslationForm.css";

const INPUT_TYPES = { VARIABLE: 0, INPUT: 1 };

let isOnComposition = false;

function cycleVariables(inputs, setInputs, variables) {
  let tempInputs = [...inputs];
  let specialFlag = 0;

  const checkSpecialVars = (flag, matchIndex, matchVal) => {
    let display = "";

    if (!flag) {
      flag = Math.floor(Math.random() * 3) + 1;
    }

    if (flag === matchIndex) {
      display = matchVal;
    }

    return { display, flag };
  };

  inputs.forEach((input, i) => {
    if (input.type === INPUT_TYPES.VARIABLE) {
      let varArray = variables[input.value];
      let displayVal;

      //There is a special case where only one variable will be used at a time. For that we
      //need some special logic
      switch (input.value) {
        case "about":
          let a = checkSpecialVars(specialFlag, 1, varArray[1]);
          displayVal = a.display;
          specialFlag = a.flag;
          break;
        case "after":
          let b = checkSpecialVars(specialFlag, 2, varArray[1]);
          displayVal = b.display;
          specialFlag = b.flag;
          break;
        case "before":
          let c = checkSpecialVars(specialFlag, 3, varArray[1]);
          displayVal = c.display;
          specialFlag = c.flag;
          break;
        default:
          if (varArray) {
            let randomIndex = Math.floor(Math.random() * varArray.length);
            displayVal = varArray[randomIndex];
          }
          break;
      }

      tempInputs[i].displayVal = displayVal;
    }
  });
  setInputs(tempInputs);
}

function createVariableInputs(translation) {
  let newInputs = [];
  let vars = translationVariableParser(translation);
  let trans = translation;
  if (typeof vars === "object" && vars.length > 0) {
    vars.forEach((v) => {
      let varString = v[0]; //"{{variable}}"
      let key = v[1]; //"variable"
      //Remove the current variable from the string, see if any normal text came before it and
      //add it as a normal text input if so. Then remove that from the string as well and rejoin
      let transSplit = trans.split(varString);
      if (transSplit[0]) {
        newInputs.push({ type: INPUT_TYPES.INPUT, value: transSplit[0] });
        transSplit.shift();
        trans = transSplit.join("");
      } else if (typeof transSplit[1] !== "undefined") {
        transSplit.shift();
        trans = transSplit.join("");
      }
      //Then continue to add the variable input marker
      let tempInput = { type: INPUT_TYPES.VARIABLE, value: key };
      newInputs.push(tempInput);
    });
  }

  if (trans !== "") {
    //Input has no variables, just return the one input
    let tempInput = { type: INPUT_TYPES.INPUT, value: trans };
    newInputs.push(tempInput);
  } else if (newInputs.length < 1) {
    //Input has no variables, just return the one input
    let tempInput = { type: INPUT_TYPES.INPUT, value: "" };
    newInputs.push(tempInput);
  }

  return newInputs;
}

function AdjInput(props) {
  const { index, onBlur, onChange, value } = props;
  const [width, setWidth] = useState((value.length + 1) * 7);
  const [height, setHeight] = useState(0);
  const val = useRef(value);

  const _handleComposition = (e) => {
    console.log("type", e.type);
    if (e.type === "compositionend") {
      isOnComposition = false;
      if (!isOnComposition) {
        _handleChange(e);
      }
    } else {
      isOnComposition = true;
    }
  };

  const _handleChange = ({ target }) => {
    if (!isOnComposition) {
      let { value } = target;

      checkInputDims(value);

      onChange(value, index);
    }
  };

  const checkInputDims = (value) => {
    let newWidth = (value.length + 1) * 13;
    let maxWidth = window.innerWidth / 3;
    if (newWidth > maxWidth) {
      let rowNum = newWidth / maxWidth;
      newWidth = maxWidth;
      setHeight(12 + rowNum * 10);
    }
    setWidth(newWidth);
  };

  useEffect(() => {
    checkInputDims(value);
  }, [value]);

  const Component = height ? (
    <textarea
      style={{ height: height, width: width + "px" }}
      onChange={_handleChange}
      onBlur={onBlur}
      value={value}
    />
  ) : (
    <input
      ref={val}
      type="text"
      style={{ width: width + "px" }}
      onChange={_handleChange}
      onCompositionStart={_handleComposition}
      onCompositionUpdate={_handleComposition}
      onCompositionEnd={_handleComposition}
      onBlur={onBlur}
      defaultValue={value}
    />
  );

  return Component;
}

function VariableDisplay(props) {
  const { displayVal, index, numOfInputs, onChangeVarOrder } = props;
  let left = index === 0 ? true : false;
  let right = index === numOfInputs - 1 ? true : false;

  return (
    <div className="variable-display">
      <button
        style={{ display: left ? "none" : "inline-block" }}
        onClick={() => {
          onChangeVarOrder(index, index - 1);
        }}
      >
        <i className="fas fa-chevron-left" />
      </button>
      <p>{displayVal}</p>
      <button
        style={{ display: right ? "none" : "inline-block" }}
        onClick={() => {
          onChangeVarOrder(index, index + 1);
        }}
      >
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
}

function TranslationInput(props) {
  const { index, onBlur, trans, variables, variablesPaused } = props;
  const [inputs, setInputs] = useState([]);
  const [text, setText] = useState([]);

  const [preview, setPreview] = useState("");

  const _handleChange = useCallback(
    (value, i) => {
      let tempInputs = [...inputs];
      tempInputs[i].value = value;
      setInputs(tempInputs);
    },
    [inputs]
  );

  const _handleBlur = useCallback(() => {
    let newTrans = setTransFromInputs(inputs);

    onBlur(newTrans);
  }, [inputs, onBlur]);

  const setTransFromInputs = (inputs) => {
    let newTrans = "";

    inputs.forEach((input) => {
      if (input.type === INPUT_TYPES.VARIABLE) {
        newTrans += `{{${input.value}}}`;
      } else {
        newTrans += input.value;
      }
    });

    return newTrans;
  };

  useEffect(() => {
    let newInputs = createVariableInputs(trans);
    setInputs(newInputs);
  }, [trans]);

  const onChangeVarOrder = useCallback(
    (curIndex, newIndex) => {
      let ins = [...inputs];
      let isShiftRight = curIndex < newIndex;
      let inputBefore = curIndex !== 0 ? ins[curIndex - 1] : false;
      let inputAfter = ins[curIndex + 1];
      let textAfter = false;
      let textBefore = false;
      let varAfter = false;
      let varBefore = false;
      if (inputBefore) {
        if (inputBefore.type === INPUT_TYPES.INPUT) {
          textBefore = true;
        } else {
          varBefore = true;
        }
      }
      if (inputAfter) {
        if (inputAfter.type === INPUT_TYPES.INPUT) {
          textAfter = true;
        } else {
          varAfter = true;
        }
      }

      let input = ins.splice(curIndex, 1)[0];
      ins.splice(newIndex, 0, input);

      //In some cases this is all we need to do. In others we need to split the text inputs by
      //adding a new textbox input in the correct position
      let newInput = { type: INPUT_TYPES.INPUT, value: " " };
      if (isShiftRight) {
        if (
          (varBefore && textAfter) ||
          (!varBefore && !textBefore && textAfter)
        ) {
          //This covers a case where there is either no inputs or variables to the left and text to the right
          //Or there is a variable to the left and text to the right.
          //If it is shifting right we need to add the new input to the index after it's current new index
          ins.splice(newIndex + 1, 0, newInput);
        }
      } else {
        //Is shifting left
        if (
          (varAfter && textBefore) ||
          (textBefore && !varAfter && !textAfter)
        ) {
          //This covers a case where there is either no inputs or variables to the left and text to the right
          //Or there is a variable to the left and text to the right.
          //If it is shifting right we need to add the new input to the index at it's current new index
          ins.splice(newIndex, 0, newInput);
        }
      }

      let newTrans = setTransFromInputs(ins);

      onBlur(newTrans);
    },
    [inputs, onBlur]
  );

  useEffect(() => {
    let interval = setInterval(() => {
      if (!variablesPaused) {
        cycleVariables(inputs, setInputs, variables);
      }
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [inputs, variables, variablesPaused]);

  useEffect(() => {
    let items = [];
    let prev = "";
    inputs.forEach((input, i) => {
      if (input.type === INPUT_TYPES.INPUT) {
        prev += input.value;
        items.push(
          <AdjInput
            key={"input" + i + index}
            index={i}
            onChange={_handleChange}
            onBlur={_handleBlur}
            value={input.value}
          />
        );
      }
      if (input.type === INPUT_TYPES.VARIABLE) {
        prev += input.displayVal;
        items.push(
          <VariableDisplay
            key={"variable" + index + i}
            displayVal={input.displayVal}
            index={i}
            numOfInputs={inputs.length}
            onChangeVarOrder={onChangeVarOrder}
          />
        );
      }
    });
    setPreview(prev);
    setText(items);
  }, [
    _handleBlur,
    _handleChange,
    index,
    inputs,
    onBlur,
    onChangeVarOrder,
    variables,
  ]);

  return (
    <div className="translation-input">
      {text.map((t) => t)}
      <h3>Preview</h3>
      <p>{preview}</p>
    </div>
  );
}

export default function TranslationForm(props) {
  const {
    description,
    completedHidden,
    index,
    isEdited,
    isSameAsOriginal,
    language,
    link,
    original,
    onChange,
    translation,
    variables,
    variablesPaused,
  } = props;

  const [trans, setTrans] = useState(translation);
  const [edited, setEdited] = useState(isEdited);
  const [sameAsOriginal, setSameAsOriginal] = useState(isSameAsOriginal);
  const [borderColor, setBorderColor] = useState("gray");
  const [display, setDisplay] = useState("flex");

  useEffect(() => {
    if (completedHidden) {
      if (isEdited || !isSameAsOriginal) {
        setDisplay("none");
      }
    } else if (display === "none") {
      setDisplay("flex");
    }

    if (edited) {
      setBorderColor("orange");
    } else if (sameAsOriginal) {
      setBorderColor("red");
    } else {
      setBorderColor("green");
    }
  }, [
    completedHidden,
    display,
    edited,
    isEdited,
    isSameAsOriginal,
    sameAsOriginal,
  ]);

  const _onTextChange = ({ target }) => {
    setTrans(target.value);
    setEdited(true);
    setSameAsOriginal(target.value === original);
  };

  const _onBlur = (val) => {
    onChange(val);
  };

  return (
    <div
      style={{ borderColor: borderColor, display: display }}
      className="translation-form"
    >
      <div className="form-sections">
        <div className="form-section-1">
          <h3>Original Text</h3>
          <h5>{original}</h5>
          <hr />
          <h3>Description</h3>
          <h5>{description}</h5>
        </div>
        <hr />
        <div className="form-section-2">
          <h3>Translation into {language}</h3>

          <TranslationInput
            variables={variables}
            trans={trans}
            onChange={_onTextChange}
            onBlur={_onBlur}
            index={index}
            variablesPaused={variablesPaused}
          />
        </div>
      </div>

      <Link href={link}>{link}</Link>
    </div>
  );
}
