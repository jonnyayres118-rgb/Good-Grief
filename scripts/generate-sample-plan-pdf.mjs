import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { renderPlanPdfDocument } from "../src/lib/planPdfLayout.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "output", "pdf");
const output = path.join(outputDir, "good-grief-sample-plan.pdf");
fs.mkdirSync(outputDir, { recursive: true });

const steps = [
  ["bigPicture", "The big picture", "What kind of send-off feels most like you?"],
  ["farewell", "The farewell", "Burial, cremation, donation—or something else?"],
  ["setting", "The setting", "Where should it happen?"],
  ["people", "The people", "Who needs to be there or involved?"],
  ["soundtrack", "The soundtrack", "What should everyone hear?"],
  ["words", "The words", "Any readings, stories or messages?"],
  ["style", "The look", "What should the day look and feel like?"],
  ["afterwards", "Afterwards", "What happens when the formal bit is done?"],
  ["noThanks", "Absolutely not", "What would make you haunt the room?"],
  ["practical", "Practical notes", "Anything else the right people should know?"],
].map(([key, title, prompt]) => ({ key, title, prompt }));

const answers = {
  bigPicture: "Warm, funny and full of stories. A proper celebration rather than a sombre ceremony.",
  farewell: "Cremation, followed by ashes scattered on the coast with close family.",
  setting: "The Roundhouse in London—or somewhere with the same energy, good acoustics and room for everyone.",
  people: "My family, old friends and work crew. Alex to lead the welcome and Sam to keep the day moving.",
  soundtrack: "Heroes by David Bowie, Requiem in D Minor by Mozart, and Everything in Its Right Place by Radiohead.",
  words: "A reading from Do Not Go Gentle, then stories from the people who knew me best. Keep it honest and keep it short.",
  style: "Bright colour, no dress code, wild flowers and photographs that make people laugh.",
  afterwards: "Pizza, a playlist and tall tales. Plenty of space for people to stay as long as they want.",
  noThanks: "No sad sandwiches, no euphemisms, no endless formal speeches and absolutely no beige buffet.",
  practical: "Make sure the venue is step-free. Existing arrangements and key contacts are held separately with my executor.",
};

const doc = new PDFDocument({ autoFirstPage: true, size: "A4", margin: 0, info: { Title: "Good Grief sample send-off plan", Author: "Good Grief" } });
doc.registerFont("Anton", path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff"));
doc.registerFont("Inter", path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff"));
doc.registerFont("InterBold", path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff"));
const stream = fs.createWriteStream(output);
doc.pipe(stream);
renderPlanPdfDocument(doc, { answers, steps, ownerName: "Alex", updatedAt: new Date("2026-08-24T08:00:00Z") });
doc.end();
await new Promise((resolve, reject) => { stream.on("finish", resolve); stream.on("error", reject); });
console.log(output);
