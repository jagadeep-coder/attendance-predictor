import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetPath = path.join(__dirname, 'timetable-dataset.md');
const outDir = path.join(__dirname, 'timetables');
const indexFile = path.join(__dirname, 'timetables.js');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const rawText = fs.readFileSync(datasetPath, 'utf8');

const sections = rawText.split('============================================================').map(s => s.trim()).filter(s => s.length > 0);

let parsedSections = [];
const rxTitle = /^\d+\.\s+(.*?)\s+\((.*?)\)/;

let currentSection = null;

for (let i = 0; i < sections.length; i++) {
  const s = sections[i];
  if (rxTitle.test(s)) {
    const match = s.match(rxTitle);
    currentSection = {
      title: match[1],
      sem: match[2],
      content: sections[i+1] || ''
    };
    parsedSections.push(currentSection);
    i++;
  }
}

for (let sec of parsedSections) {
  console.log(sec.title);
}

fs.writeFileSync('parsed.json', JSON.stringify(parsedSections, null, 2));

