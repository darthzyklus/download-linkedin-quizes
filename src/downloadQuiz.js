import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fetch from "node-fetch";
import { promises as fs } from "fs";

import parse from "./parse.js";

const downloadDir = process.env.DOWNLOAD_DIR || "data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dir = join(__dirname, `../${downloadDir}`);

const domain = "raw.githubusercontent.com";

const branch = "master";
const user = "Ebazhanov";
const repo = "linkedin-skill-assessments-quizzes";

async function downloadQuiz(quiz) {
  const filename = quiz.replace(/\./g, "-");
  const file = `${dir}/${filename}.json`;
  const url = `https://${domain}/${user}/${repo}/${branch}/${quiz}/${quiz}-quiz.md`;

  console.log("================");

  try {
    console.log(`Downloading: ${quiz} quiz......`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const questions = parse(text);

    console.log(`Writing: ${quiz} quiz to ${file}`);
    // console.log(JSON.stringify({ questions }, null, 2));

    await fs.writeFile(file, JSON.stringify({ questions }, null, 2));
    console.log(`Finished!!!`);
  } catch (err) {
    console.log("Oops couldn't finish the operation");
    console.error(err.message);
  }
}

export default downloadQuiz;
