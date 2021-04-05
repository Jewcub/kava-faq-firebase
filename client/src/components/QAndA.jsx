import { useState } from "react";
import { GoTriangleRight } from "react-icons/go";
export default function QAndA({ QAndA }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="q-and-a">
      <div className="question-container">
        <h4 onClick={() => setShowAnswer(!showAnswer)} className="question">
          {QAndA.question}
        </h4>
        <GoTriangleRight
          className={`triangle ${
            showAnswer ? "triangle-selected" : "triangle-unselected"
          }`}
          id={"triangle-" + QAndA.question}
        ></GoTriangleRight>
      </div>
      <div
        className={`answers ${showAnswer ? "answers-show" : "answers-hide"}`}
      >
        {showAnswer
          ? QAndA.answers.map((answer, i) => {
              // console.log("answer", answer);
              return (
                <div
                  key={i}
                  className="answer"
                  dangerouslySetInnerHTML={{
                    __html: !answer.includes("script") ? answer : null,
                  }}
                />
              );
            })
          : ""}
      </div>
    </div>
  );
}
