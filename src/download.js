import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs, constants } from "fs";
import downloadQuiz from "./downloadQuiz.js";

const downloadDir = process.env.DOWNLOAD_DIR || "data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dir = join(__dirname, `../${downloadDir}`);

async function download() {
  if (!process.env.QUIZES) {
    console.log("No QUIZES environment variable set");
    return;
  }

  const quizes = process.env.QUIZES.split(",");

  try {
    await fs.access(dir, constants.F_OK).catch(() => {
      fs.mkdir(downloadDir);
    });

    console.log("Starting...");
    for (let quiz of quizes) {
      await downloadQuiz(quiz);
    }

    console.log("================");
  } catch (err) {
    console.error(err);
  }
}

export default download;
