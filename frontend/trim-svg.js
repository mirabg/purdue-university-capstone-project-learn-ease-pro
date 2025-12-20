#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, "public/images/logo.svg");
const outputPath = path.join(__dirname, "public/images/logo-trimmed.svg");

// Read the SVG file
const svgContent = fs.readFileSync(svgPath, "utf8");

// Extract current viewBox
const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
if (!viewBoxMatch) {
  console.error("Could not find viewBox in SVG");
  process.exit(1);
}

const [minX, minY, width, height] = viewBoxMatch[1].split(" ").map(Number);
console.log(`Current viewBox: ${minX} ${minY} ${width} ${height}`);

// Calculate new viewBox to trim whitespace
// Assuming we want to crop based on a percentage or fixed values
// For this logo, let's trim the sides and adjust the height

const trimLeft = 50; // pixels to trim from left
const trimRight = 50; // pixels to trim from right
const trimTop = 20; // pixels to trim from top
const trimBottom = 20; // pixels to trim from bottom

const newMinX = minX + trimLeft;
const newMinY = minY + trimTop;
const newWidth = width - trimLeft - trimRight;
const newHeight = height - trimTop - trimBottom;

console.log(`New viewBox: ${newMinX} ${newMinY} ${newWidth} ${newHeight}`);

// Replace viewBox in SVG content
const newSvgContent = svgContent.replace(
  /viewBox="[^"]+"/,
  `viewBox="${newMinX} ${newMinY} ${newWidth} ${newHeight}"`
);

// Write the new SVG file
fs.writeFileSync(outputPath, newSvgContent);
console.log(`\nTrimmed SVG saved to: ${outputPath}`);
console.log(
  `\nTo use the trimmed version, rename it to logo.svg or update your code to reference logo-trimmed.svg`
);
console.log(`\nYou can adjust the trim values in the script if needed.`);
