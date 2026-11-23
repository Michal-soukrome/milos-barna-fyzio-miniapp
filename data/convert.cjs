const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "data.ndjson");
const outputPath = path.join(__dirname, "diagnoses-review.json");

const input = fs.readFileSync(inputPath, "utf8");

const documents = input
  .split(/\r?\n/)
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line));

fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2) + "\n", "utf8");

console.log(`Hotovo: ${documents.length} dokumentů exportováno.`);
