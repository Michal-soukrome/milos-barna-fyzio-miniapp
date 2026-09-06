#!/usr/bin/env node

// generate-tree.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ignorePatterns = [
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "coverage",
  "out",
  "dist",
  "logs",
  ".cache",
  "build",
  ".turbo",
];

function shouldIgnore(name) {
  return ignorePatterns.some((pattern) => name.includes(pattern));
}

function generateTree(dir, prefix = "", maxDepth = 10, currentDepth = 0) {
  if (currentDepth >= maxDepth) return "";

  let result = "";
  const items = fs.readdirSync(dir).filter((item) => !shouldIgnore(item));

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    const connector = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");

    result += prefix + connector + item;
    if (stats.isDirectory()) {
      result += "/\n";
      if (currentDepth < maxDepth - 1) {
        result += generateTree(
          itemPath,
          nextPrefix,
          maxDepth,
          currentDepth + 1,
        );
      }
    } else {
      result += "\n";
    }
  });

  return result;
}

function main() {
  const rootDir = process.cwd();
  const tree = generateTree(rootDir);

  const output = `${rootDir}\n${tree}`;

  // Write to filetree.txt
  fs.writeFileSync("filetree.txt", output);
  console.log("File tree generated in filetree.txt");
}

// Run main if this file is executed directly
main();
