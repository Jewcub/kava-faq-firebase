import Section from "./Section";
import { useState } from "react";

export default function Body({ content }) {
  const [selected, setSelected] = useState(content.sections[0].name);
  // console.log({ content });
  return (
    <div className="faq-body">
      <div className="button-bar">
        {content.sections.map((section, i) => (
          <div
            className={`section-title ${
              selected === section.name ? "section-title-selected" : ""
            }`}
            key={i}
            onClick={() => setSelected(section.name)}
          >
            <h4> {section.name}</h4>
          </div>
        ))}
      </div>

      {content.sections.map((section, i) =>
        section.name === selected ? (
          <Section className="section-body" key={i} section={section}></Section>
        ) : (
          ""
        )
      )}
    </div>
  );
}
