import Axios from "axios";
import React, { useEffect, useState } from "react";
import Page from "../Page/Page";
import "./TemplateEditPage.css";

const TemplateSeciton = (props) => {
  const { desc, index, keyStr, link, onChange, value } = props;

  return (
    <div className="template-section">
      <h5>Key String:</h5>
      <p>{keyStr}</p>
      <h5>Value:</h5>
      <input name={index + "/|value"} value={value} onChange={onChange} />
      <h5>Description:</h5>
      <textarea
        name={index + "/|description"}
        value={desc}
        onChange={onChange}
      />
      <h5>Link:</h5>
      <input name={index + "/|link"} value={link} onChange={onChange} />
    </div>
  );
};

const getData = async () => {
  let keys;
  let template;

  await Axios.get("/api/template").then((res) => {
    template = res.data;
  });

  await Axios.get("/api/template/keys").then((res) => {
    keys = res.data;
  });

  console.log("keys", keys, "template", template);
  return { keys, template };
};

export default function TemplateEditPage() {
  const [keys, setKeys] = useState([]);
  const [template, setTemplate] = useState({});

  useEffect(() => {
    console.log("loaded---------------------------------");
    getData().then(({ keys, template }) => {
      setKeys(keys);
      setTemplate(template);
    });
  }, []);

  const onChange = ({ target }) => {
    const { name, value } = target;
    const [index, key] = name.split("/|");
    let temp = [...template];
    temp[index][key] = value;

    setTemplate(temp);
  };

  const sendTemplate = () => {
    Axios.post("api/template", template);
  };

  return (
    <Page>
      <form
        action="/api/template/keys"
        method="post"
        encType="multipart/form-data"
      >
        <input type="file" name="filetoupload" />
        <input type="submit" />
      </form>
      <button onClick={sendTemplate}>Send Template</button>
      {keys.map((item, index) => {
        let key = item;
        let obj = template[index];
        return (
          <TemplateSeciton
            key={key + index}
            keyStr={key}
            index={index}
            value={obj ? obj.value : "a"}
            desc={obj ? obj.description : "a"}
            link={obj ? obj.link : "a"}
            onChange={onChange}
          />
        );
      })}
    </Page>
  );
}
