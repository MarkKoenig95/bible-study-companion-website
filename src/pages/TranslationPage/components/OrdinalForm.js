import React, { useEffect, useState } from "react";
import "./OrdinalForm.css";

const SPECIAL_CASE_DESC =
  "If there are any special numbers that do not have the same ordinal as they typically do, then adjust them below. Ex. (11th instead of 11st, 12th instead of 12nd).";

let lastSpecialIndex;
var specials = {};

export function Frag(props) {
  return <p className="text-fragment">{props.children}</p>;
}

function In(props) {
  const { name, onChange, textAlign, value } = props;
  return (
    <input
      style={{ textAlign: textAlign }}
      className="tiny-input"
      onChange={onChange}
      name={name}
      value={value}
    />
  );
}

function DisplayNumber(props) {
  const { isAfter, number, ordinal } = props;
  const [text, setText] = useState("");

  useEffect(() => {
    let temp = isAfter ? "" : ordinal;
    temp += number;
    temp += isAfter ? ordinal : "";
    setText(temp);
  }, [isAfter, number, ordinal]);
  return <Frag>{text}</Frag>;
}

function OrdinalInput(props) {
  const { isAfter, onChange, number, value } = props;
  return (
    <div className="text-fragment ordinal-section">
      {!isAfter && (
        <In onChange={onChange} textAlign="right" value={value} name={number} />
      )}
      <Frag>{number}</Frag>
      {isAfter && (
        <In textAlign="left" value={value} onChange={onChange} name={number} />
      )}
    </div>
  );
}

function SpecialCaseInput(props) {
  const { number, isAfter, isEdited, onChange, ordinal } = props;
  const [isEditable, setIsEditable] = useState(isEdited);
  const newSpecialIndex = lastSpecialIndex + 1;
  const toggleVisibility = () => {
    if (isEditable) {
      //Delete the special since we are making it not editable
      onChange(ordinal.index);
    } else {
      //Insert a new special one index higher than the previous highest index
      onChange(
        newSpecialIndex,
        ordinal.translation,
        `ordinal.special.${number}`
      );
    }
    setIsEditable(!isEditable);
  };

  return (
    <div
      style={{ borderColor: !isEditable ? "gray" : "orange" }}
      className="special-case"
    >
      {!isEditable ? (
        <DisplayNumber
          number={number}
          isAfter={isAfter}
          ordinal={ordinal.translation}
        />
      ) : (
        <OrdinalInput
          isAfter={isAfter}
          onChange={({ target }) => {
            onChange(ordinal.index, target.value);
          }}
          number={number}
          value={ordinal.translation}
        />
      )}

      <button onClick={toggleVisibility}>
        {!isEditable ? (
          <i className="fas fa-pen"></i>
        ) : (
          <i className="fas fa-times"></i>
        )}
      </button>
    </div>
  );
}

function OrdinalBaseInput(props) {
  const { isAfter, number, onChange, ordinal } = props;
  const [isEdited, setIsEdited] = useState(false);

  const _onChange = (...args) => {
    if (!isEdited) {
      setIsEdited(true);
    }
    onChange(...args);
  };

  return (
    <div
      style={{ borderColor: !isEdited ? "gray" : "orange" }}
      className="ordinal-section special-case"
    >
      <OrdinalInput
        isAfter={isAfter}
        onChange={_onChange}
        number={number}
        value={ordinal}
      />
      <Frag>(</Frag>
      <DisplayNumber number={number} isAfter={isAfter} ordinal={ordinal} />
      <Frag>)</Frag>
    </div>
  );
}

function OrdinalSection(props) {
  const { description, isAfter, number, onChange, ordinal, specials } = props;
  const [otherNumbers, setOtherNumbers] = useState([]);

  useEffect(() => {
    let other = [];
    for (let i = 1; i < 6; i++) {
      let num = i * 10 + number;
      other.push(num);
    }
    setOtherNumbers(other);
  }, [number]);

  return (
    <div className="ordinal-section">
      <hr />

      <h2>Ordinal {number} base</h2>

      <OrdinalBaseInput
        isAfter={isAfter}
        number={number}
        onChange={({ target }) => {
          onChange(ordinal.index, target.value);
        }}
        ordinal={ordinal.translation}
      />

      <div className="ordinal-section">
        <h3>Description:</h3>
        <p>{description}</p>
      </div>

      <br />

      <div className="ordinal-section">
        <h3>Other Numbers:</h3>
        <p>{SPECIAL_CASE_DESC}</p>
        {otherNumbers.map((num) => {
          let isEdited = typeof specials[num] !== "undefined";
          let ord = ordinal;
          if (isEdited) {
            ord = specials[num];
            lastSpecialIndex = ord.index;
          }
          return (
            <SpecialCaseInput
              key={num + ord}
              isEdited={isEdited}
              number={num}
              isAfter={isAfter}
              ordinal={ord}
              onChange={onChange}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function OrdinalForm(props) {
  const { onChange, ordinals } = props;

  const [typicals, setTypicals] = useState([]);
  const isAfter = ordinals[10].translation;

  useEffect(() => {
    let typs = [];
    let temp = ordinals.slice(11);
    specials = {};

    lastSpecialIndex = ordinals[11].index;

    temp.forEach((special) => {
      let key = special.key.split(".");
      specials[key[2]] = special;
    });

    for (let i = 0; i < 10; i++) {
      typs.push(
        <OrdinalSection
          key={ordinals[i].toString() + i}
          description={ordinals[i].description}
          isAfter={isAfter}
          number={i}
          onChange={onChange}
          ordinal={ordinals[i]}
          specials={specials}
        />
      );
    }
    setTypicals(typs);
  }, [isAfter, onChange, ordinals]);

  return (
    <div className="translation-form">
      <h2>Ordinals</h2>
      <div className="form-sections">
        <Frag>Ordinal is after number</Frag>
        <input
          type="checkbox"
          checked={isAfter}
          onChange={() => {
            onChange(ordinals[10].index, !isAfter);
          }}
        />
      </div>
      <h3>Description:</h3>
      <p>
        In English the ordinal comes after the number (10th), however in chinese
        the ordinal comes before (第10). If the ordinal comes after the number
        in your target language, then check this box. If it comes before,
        uncheck it.
      </p>
      {typicals.map((typ) => typ)}
    </div>
  );
}
