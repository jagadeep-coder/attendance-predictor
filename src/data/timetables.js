import { IECEA } from './timetables/I-ECE-A.js';
import { IECEBEEE } from './timetables/I-ECE-B-EEE.js';
import { IECEDS } from './timetables/I-ECE-DS.js';
import { IBIOTECHBBIOMEDICALENGG } from './timetables/I-BIOTECH-B-BIOMEDICAL-ENGG.js';
import { IIBME } from './timetables/II-BME.js';
import { IIECEDSA } from './timetables/II-ECE-DS-A.js';
import { IIECEDSB } from './timetables/II-ECE-DS-B.js';
import { IIIBME } from './timetables/III-BME.js';
import { IIIECEA } from './timetables/III-ECE-A.js';
import { IIIECEB } from './timetables/III-ECE-B.js';
import { IIIECEDS } from './timetables/III-ECE-DS.js';
import { IVECEA } from './timetables/IV-ECE-A.js';
import { IVECEB } from './timetables/IV-ECE-B.js';

export const timetables = {
  "I ECE-A": IECEA,
  "I ECE-B / EEE": IECEBEEE,
  "I ECE-DS": IECEDS,
  "I BIOTECH-B / BIOMEDICAL ENGG": IBIOTECHBBIOMEDICALENGG,
  "II BME": IIBME,
  "II ECE-DS A": IIECEDSA,
  "II ECE-DS B": IIECEDSB,
  "III BME": IIIBME,
  "III ECE-A": IIIECEA,
  "III ECE-B": IIIECEB,
  "III ECE-DS": IIIECEDS,
  "IV ECE-A": IVECEA,
  "IV ECE-B": IVECEB,
};