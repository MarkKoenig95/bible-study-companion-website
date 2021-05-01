import React from "react";

export default function Link(props) {
  const { children, href } = props;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
