import React, { useEffect, useState } from "react";
import TranslationForm from "./TranslationForm";
import OrdinalForm from "./OrdinalForm";
import LinksForm from "./LinksForm/LinksForm";
import { checkItemKey } from "../../../logic/logic";

export default function TranslationList(props) {
  const {
    completedHidden,
    language,
    listItems,
    onChange,
    showLoadingPopup,
    variables,
    variablesPaused,
  } = props;

  const [translationItems, setTranslationItems] = useState([]);

  useEffect(() => {
    let ordinals = [];
    let links = [];
    let items = [];
    for (let i = 0; i < listItems.length; i++) {
      let result;
      let item = listItems[i];

      if (checkItemKey(item.key, "ordinal")) {
        let newItem = { ...item };
        newItem.index = i;
        ordinals.push(newItem);
        continue;
      }

      if (checkItemKey(item.key, "links")) {
        let newItem = { ...item };
        newItem.index = i;
        links.push(newItem);
        continue;
      }

      if (checkItemKey(item.key, "updateDate")) {
        continue;
      }

      if (ordinals.length > 0) {
        //Get a count of the number of special ordinals
        let newCount = ordinals.length - 12;
        let count = ordinals.filter(
          (o) => o.key === "ordinal.special.count"
        )[0];
        //compare with the previous count and adjust if necessary
        if (newCount !== count.translation) {
          onChange(count.index, newCount);
        }

        items.push(
          <OrdinalForm
            key={JSON.stringify(item) + (i - 1)}
            completedHidden={completedHidden}
            ordinals={ordinals}
            onChange={onChange}
          />
        );

        ordinals = [];
      }

      if (links.length > 0) {
        items.push(
          <LinksForm
            key={JSON.stringify(item) + (i - 1)}
            links={links}
            onChange={onChange}
            showLoadingPopup={showLoadingPopup}
          />
        );
        links = [];
      }

      result = (
        <TranslationForm
          key={JSON.stringify(item) + i}
          label={item.key}
          original={item.original}
          onChange={(value) => {
            onChange(i, value);
          }}
          description={item.description}
          completedHidden={completedHidden}
          language={language}
          link={item.link}
          index={i}
          isEdited={item.isEdited}
          isSameAsOriginal={item.isSameAsOriginal}
          translation={item.translation}
          variable={item.variable}
          variables={variables}
          variablesPaused={variablesPaused}
        />
      );
      items.push(result);
    }
    setTranslationItems(items);
  }, [
    completedHidden,
    language,
    listItems,
    onChange,
    showLoadingPopup,
    variables,
    variablesPaused,
  ]);

  return <div>{translationItems.map((item) => item)}</div>;
}
