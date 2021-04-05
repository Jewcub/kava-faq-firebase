import testHTML from './testHTML';

import parseHTML, { preFormat } from './parseHTML';
describe('HTML Parser', () => {
  const result = parseHTML(testHTML);
  if ('sections' in result) result.sections.forEach((section) => console.log(section));
  // console.log({ result: JSON.stringify(result) });
  it('returns a result', () => {
    expect(result).toBeTruthy();
  });
  it('pre formatter replaces google styles and classes', () => {
    const preFormatted = preFormat(testHTML);
    // console.log({ preFormatted });
    if (!preFormatted) return console.error('error preformatting');
    expect(
      !preFormatted.includes('style') &&
        !preFormatted.includes('head') &&
        !preFormatted.includes('meta') &&
        !preFormatted.includes('font-weight') &&
        !preFormatted.includes('text-decoration') &&
        !preFormatted.includes('font-style'),
    ).toBeTruthy();
    expect(
      preFormatted.includes('g-bold') &&
        preFormatted.includes('g-italic') &&
        preFormatted.includes('g-underline'),
    ).toBeTruthy();
    expect(!preFormatted.includes('cowc-')).toBeTruthy();
    expect(
      preFormatted.includes('faq-section') &&
        preFormatted.includes('faq-question') &&
        preFormatted.includes('faq-answer') &&
        preFormatted.includes('faq-sub-p'),
    ).toBeTruthy();
  });
  it('returns the right amount of sections', () => {
    expect(result.sections.length).toBe(2);
  });
  it('returns the right amount of  questions', () => {
    let questionCount = 0;
    result.sections.forEach((section) => {
      section.QAndAs.forEach(() => questionCount++);
    });
    expect(questionCount).toBe(4);
  });
  it('returns the right amount of answers', () => {
    let answerCount = 0;
    result.sections.forEach((section) => {
      section.QAndAs.forEach((question) => {
        question.answers.forEach(() => answerCount++);
      });
    });
    expect(answerCount).toBe(12);
  });
});
