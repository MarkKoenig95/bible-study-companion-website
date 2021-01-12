import Axios from "axios";
import React, { useEffect, useState } from "react";
import Page from "../Page/Page";
import "./TemplateEditPage.css";

function setTemplateItemValues(obj, index) {
  let value;
  let desc;
  let link;
  let order;
  let variable;

  if (obj) {
    if (typeof obj.value !== "undefined") {
      value = obj.value;
    } else {
      value = "";
    }
    if (typeof obj.description !== "undefined") {
      desc = obj.description;
    } else {
      desc = "";
    }
    if (typeof obj.link !== "undefined") {
      link = obj.link;
    } else {
      link = "";
    }
    if (typeof obj.order !== "undefined") {
      order = obj.order;
    } else {
      order = index;
    }
    if (typeof obj.variable !== "undefined") {
      variable = obj.variable;
    } else {
      variable = "";
    }
  }

  return { obj, value, desc, link, order, variable };
}

async function getData() {
  let template;
  let variables;

  await Axios.get("/api/template").then((res) => {
    template = res.data.values;
    template.sort((a, b) => {
      return a.order - b.order;
    });
  });

  await Axios.get("/api/template/variables").then((res) => {
    variables = res.data;
  });

  return { template, variables };
}

const OrderInput = (props) => {
  const { index, onChange, order, updateOrder } = props;
  return (
    <div className="order-input">
      <button
        onClick={() => {
          updateOrder(index, order - 1);
        }}
      >
        -
      </button>
      <input
        name={index + "|&|order"}
        value={order}
        onChange={onChange}
        onBlur={() => {
          updateOrder(index);
        }}
      />
      <button
        onClick={() => {
          updateOrder(index, order + 1);
        }}
      >
        +
      </button>
    </div>
  );
};

const VariableSelector = (props) => {
  const { index, onVariablesChange, variable, variables } = props;
  const [dropdown, setDropdown] = useState(variable);
  const _handleChange = ({ target }) => {
    let { value } = target;
    onVariablesChange(index, value);
    setDropdown(value);
  };
  const options = variables ? variables._keys : [];

  return (
    <div>
      <select value={dropdown} onChange={_handleChange}>
        {options.map((o, i) => (
          <option key={"dropdown" + o + i} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
};

const TemplateSeciton = (props) => {
  const {
    desc,
    index,
    keyStr,
    link,
    onChange,
    onVariablesChange,
    order,
    updateOrder,
    value,
    variable,
    variables,
  } = props;

  const [isHidden, setIsHidden] = useState(false);

  return (
    <div
      style={{ display: !isHidden ? "block" : "none" }}
      className="template-section"
    >
      <h5>Key String:</h5>
      <p>{keyStr}</p>

      <h5>Value:</h5>
      <p>{value}</p>

      <h5>Description:</h5>
      <textarea
        name={index + "|&|description"}
        value={desc}
        onChange={onChange}
      />

      <h5>Link:</h5>
      <input name={index + "|&|link"} value={link} onChange={onChange} />

      <h5>Order:</h5>
      <OrderInput
        index={index}
        onChange={onChange}
        order={order}
        updateOrder={updateOrder}
      />

      <h5>Use value for variable:</h5>
      <VariableSelector
        index={index}
        onVariablesChange={onVariablesChange}
        variable={variable}
        variables={variables}
      />

      <h5>Hide:</h5>
      <input type="checkbox" checked={isHidden} onChange={setIsHidden} />
    </div>
  );
};

export default function TemplateEditPage() {
  const [template, setTemplate] = useState([]);
  const [variables, setVariables] = useState();

  useEffect(() => {
    getData().then(({ template, variables }) => {
      setVariables(variables);
      setTemplate(template);
    });
  }, []);

  const updateOrder = (index, newIndex) => {
    let temp = [...template];
    newIndex = newIndex || temp[index].order;
    temp[index].order = newIndex;
    let old = temp.splice(index, 1);
    temp.splice(newIndex, 0, old[0]);

    temp.forEach((t, i) => {
      temp[i].order = i;
    });

    setTemplate(temp);
  };

  const onChange = ({ target }) => {
    const { name, value } = target;
    const [index, key] = name.split("|&|");
    let temp = [...template];
    temp[index][key] = value;

    setTemplate(temp);
  };
  const onVariablesChange = (index, variable) => {
    let vars = { ...variables };
    vars[variable].push(template[index].key);
    let temp = [...template];
    temp[index].variable = variable;

    setTemplate(temp);
    setVariables(vars);
  };

  const sendTemplate = () => {
    let newTemplate = [...template];

    newTemplate.push({ ...variables });
    Axios.post("api/template", newTemplate);
  };

  return (
    <Page>
      <h3>Choose new file to update template</h3>
      <form
        action="/api/template/keys"
        method="post"
        encType="multipart/form-data"
      >
        <input type="file" name="filetoupload" />
        <input type="submit" />
      </form>
      <button onClick={sendTemplate}>Send Template</button>

      {template.map((item, index) => {
        let obj = item;
        const { value, desc, link, order, variable } = setTemplateItemValues(
          obj,
          index
        );

        return (
          <TemplateSeciton
            key={item.key + index}
            desc={desc}
            index={index}
            keyStr={item.key}
            link={link}
            onChange={onChange}
            onVariablesChange={onVariablesChange}
            order={order}
            updateOrder={updateOrder}
            value={value}
            variable={variable}
            variables={variables}
          />
        );
      })}
    </Page>
  );
}
