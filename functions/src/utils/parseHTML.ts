import cheerio = require('cheerio');

export const preFormat = (html: string) => {
  const withoutHead = html.split('</head>')[1].slice(0, -1);
  const $ = cheerio.load(withoutHead);
  // find all the cow-o's and replace to section class
  $(`[class*=cowc-0]`).removeClass().addClass('faq-section');
  $(`[class*=cowc-1]`).removeClass().addClass('faq-question');
  $(`[class*=cowc-2]`).removeClass().addClass('faq-answer');
  $(`[class*=cowc-3]`).removeClass().addClass('faq-sub-p');
  // replace google stylings into classes

  $(`[style*="font-weight:700"]`).addClass('g-bold');
  $(`[style*="font-style:italic"]`).addClass('g-italic');
  $(`[style*="text-decoration:underline"]`).addClass('g-underline');
  $('*').removeAttr('style'); // remove all styles
  return $('body').html();
};
type QAndA = { question: string; answers: string[] };
type Section = { name: string; QAndAs: QAndA[] };

const parseHTML = (html: string): { sections: Section[] } => {
  // console.log(html);
  const preFormatted = preFormat(html);
  if (!preFormatted) {
    console.error('error preformatting');
    return { sections: [] };
  }

  const $ = cheerio.load(preFormatted);

  const output: { sections: Section[] } = { sections: [] };
  // Jquery cannot use arrow function is we want 'this' to be correct
  $('.faq-section').each(function (i, el) {
    //@ts-ignore
    const section = $(this);
    const sectionOutput: Section = { name: section.find('span').text(), QAndAs: [] };
    const questions = section.nextUntil('.faq-section');
    questions.each(function () {
      //@ts-ignore
      const question = $(this);
      if (question.hasClass('faq-question')) {
        const questionOutput: QAndA = { question: question.find('span').text(), answers: [] };
        const answers = question.nextUntil('.faq-question');
        answers.each(function () {
          //@ts-ignore
          const answer = $(this);
          if (answer.hasClass('faq-answer')) {
            const innerAnswers = answer.find('li');
            const subPars = answer.nextUntil('.faq-answer');
            let hasSubPars = false;
            subPars.each(function () {
              //@ts-ignore
              if ($(this).hasClass('faq-sub-p')) {
                hasSubPars = true;
                return;
              }
            });

            innerAnswers.each(function (i) {
              // if it has subPars, attach to the last <li>
              if (hasSubPars && i === innerAnswers.length - 1) {
                const answerOutput = $('<div></div>');
                const p = $('<p></p>');

                p.append(innerAnswers.html() ?? '');
                answerOutput.append(p);
                subPars.each(function () {
                  //@ts-ignore
                  const subPar = $(this);
                  if (subPar.hasClass('faq-sub-p')) {
                    const list = $('<ul></ul>');
                    const subHTML = subPar.html();
                    if (subHTML) list.append(subHTML);
                    answerOutput.append(list);
                  }
                });
                questionOutput.answers.push(answerOutput.html() ?? '');
              } else {
                const answerOutput = $('<div></div>');
                const p = $('<p></p>');
                //@ts-ignore
                if ($(this).html().length > 2) {
                  //@ts-ignore
                  p.append($(this).html() ?? '');
                }
                answerOutput.append(p);
                questionOutput.answers.push(answerOutput.html() ?? '');
              }
            });
          }
        });
        sectionOutput.QAndAs.push(questionOutput);
      }
    });
    output.sections.push(sectionOutput);
  });

  return output;
  // console.log({ output: JSON.stringify(output) });
};

export default parseHTML;
