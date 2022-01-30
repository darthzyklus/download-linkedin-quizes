const clearOption = (option) => {
  return option
    .replace(/^-/, "")
    .replace(/\[(x|\s)\]/gi, "")
    .replace(/\s\s+/g, " ")
    .trim();
};

const isQuestion = (chunk) => {
  return /^###*/.test(chunk);
};

const isOption = (chunk) => {
  return /^-/.test(chunk);
};

const isCorrectAnwser = (chunk) => {
  return /\[x\]/.test(chunk);
};

const isExplanation = (chunk) => {
  return /^\*/.test(chunk) || /\(https?.+\)/g.test(chunk);
};

const isCodeBlock = (chunk) => {
  return /^```/.test(chunk);
};

function clean(chunks) {
  const result = chunks.filter((chunk) => {
    if (chunk.trim() !== "") {
      return true;
    }
  });

  return result;
}

function parse(text) {
  const chunks = text.split("\n").slice(1);
  const cleanedChunks = clean(chunks);

  const result = [];
  let addingCodeBlock = false;

  const insertQuestion = (question) => {
    result.push({
      title: question,
      codeBlock: [],
      options: [],
      codeBlockOptions: {},
      explanation: "",
      correctAnswers: [],
      isMultipleChoice: false,
      isCodeBlockQuestion: false,
    });
  };

  const insertOption = (option) => {
    const obj = result[result.length - 1];

    if (isCorrectAnwser(option)) {
      obj.correctAnswers.push(obj.options.length);

      if (obj.correctAnswers.length > 1 && !obj.isMultipleChoice) {
        obj.isMultipleChoice = true;
      }
    }

    // obj.options.push(option);
    obj.options.push(clearOption(option));
  };

  const insertExplanation = (text) => {
    result[result.length - 1].explanation = text;
  };

  const insertCodeBlock = (text) => {
    const obj = result[result.length - 1];

    if (isCodeBlock(text)) {
      //this means that is starting a code block question statement
      if (obj.options.length === 0 && addingCodeBlock === false) {
        obj.codeBlock.push("");
      }

      addingCodeBlock = !addingCodeBlock;
    }

    if (obj.options.length === 0) {
      // obj.codeBlock.push(text);

      obj.codeBlock[obj.codeBlock.length - 1] += text;

      if (addingCodeBlock) {
        obj.codeBlock[obj.codeBlock.length - 1] += "\n";
      }
    } else {
      const option = obj.options.length - 1;
      const codeBlockOptions = obj.codeBlockOptions;

      /*
      if (!codeBlockOptions[option]) codeBlockOptions[option] = [];
      codeBlockOptions[option].push(text);
      */

      if (!codeBlockOptions[option]) codeBlockOptions[option] = "";
      codeBlockOptions[option] += text;

      if (addingCodeBlock) {
        codeBlockOptions[option] += "\n";
      }

      if (!obj.isCodeBlockQuestion) {
        obj.isCodeBlockQuestion = true;
      }
    }
  };

  for (let chunk of cleanedChunks) {
    if (isQuestion(chunk)) insertQuestion(chunk);
    else if (isOption(chunk)) insertOption(chunk);
    else if (isExplanation(chunk)) insertExplanation(chunk);
    else if (isCodeBlock(chunk) || addingCodeBlock) insertCodeBlock(chunk);
  }

  return result;
}

export default parse;
