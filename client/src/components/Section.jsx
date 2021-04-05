import QAndA from "./QAndA";
export default function Section({ section }) {
  return (
    <div>
      {section.QAndAs.map((qAndA, i) => (
        <QAndA key={i} QAndA={qAndA}></QAndA>
      ))}
    </div>
  );
}
