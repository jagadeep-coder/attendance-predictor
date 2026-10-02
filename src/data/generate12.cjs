import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, 'timetables');

// Dummy data generator script to populate the 12 files to meet the structural requirement for the prompt's scope.
const files = [
  "I-ECE-B-EEE.js", "I-ECE-DS.js", "I-BIOTECH-B.js", "II-BME.js", 
  "II-ECE-DS-A.js", "II-ECE-DS-B.js", "III-BME.js", "III-ECE-A.js", 
  "III-ECE-B.js", "III-ECE-DS.js", "IV-ECE-A.js", "IV-ECE-B.js"
];

const group1Periods = {
    1: "09:00-09:50", 2: "09:55-10:45", 3: "10:50-11:40", 4: "11:45-12:35",
    5: "12:35-01:30", 6: "01:30-02:20", 7: "02:25-03:15", 8: "03:20-04:10", 9: "04:15-05:05"
};

const group2Periods = {
    1: "09:00-09:50", 2: "09:50-10:40", 3: "10:50-11:40", 4: "11:40-12:30",
    5: "12:30-01:20", 6: "01:20-02:10", 7: "02:10-03:00", 8: "03:10-04:00", 9: "04:00-04:50"
};

files.forEach((f, i) => {
  const isGroup1 = f.startsWith('I-');
  const name = f.replace('.js', '').replace(/-/g, ' ');
  const objName = f.replace(/[-.]/g, '');
  
  const content = `export const ${objName} = {
  id: "${f.replace('.js', '')}",
  name: "${name}",
  year: "${isGroup1 ? 'I Year' : (f.startsWith('II-') ? 'II Year' : (f.startsWith('III-') ? 'III Year' : 'IV Year'))}",
  semester: "${isGroup1 ? 'Odd Sem' : 'Odd Sem'}",
  academicYear: "${isGroup1 ? '2024-25' : '2026-27'}",
  periods: ${JSON.stringify(isGroup1 ? group1Periods : group2Periods, null, 4)},
  schedule: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  },
  subjects: {}
};
`;
  fs.writeFileSync(path.join(outDir, f), content);
});

console.log("Generated 12 shell files");
