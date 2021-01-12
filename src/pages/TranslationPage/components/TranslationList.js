import React, { useEffect, useState } from "react";
import TranslationForm from "./TranslationForm";
import OrdinalForm from "./OrdinalForm";
import LinksForm from "./LinksForm";

function checkItemKey(key, checkValue) {
  return key.split(".")[0] === checkValue;
}

export default function TranslationList(props) {
  const { language, listItems, onChange, variables } = props;

  const [translationItems, setTranslationItems] = useState(listItems);

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

      if (ordinals.length > 0) {
        //Get a count of the number of special ordinals
        let newCount = ordinals.length - 12;
        let count = ordinals[11];
        //compare with the previous count and adjust if necessary
        if (newCount !== count.translation) {
          onChange(count.index, newCount);
        }

        items.push(
          <OrdinalForm
            key={JSON.stringify(item) + i}
            ordinals={ordinals}
            onChange={onChange}
          />
        );
        ordinals = [];
      }

      if (links.length > 0) {
        items.push(
          <LinksForm
            key={JSON.stringify(item) + i}
            links={links}
            onChange={onChange}
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
          language={language}
          link={item.link}
          index={i}
          isEdited={item.isEdited}
          translation={item.translation}
          variable={item.variable}
          variables={variables}
        />
      );
      items.push(result);
    }
    setTranslationItems(items);
  }, [language, listItems, onChange, variables]);

  return <div>{translationItems.map((item) => item)}</div>;
}
