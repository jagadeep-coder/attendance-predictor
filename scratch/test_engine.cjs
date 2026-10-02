import { calculateAttendancePlan, countClassesBetween } from '../src/engine/attendanceEngine.js';
import { timetables } from '../src/data/timetables.js';

let allPassed = true;
let currentTestsPassed = true;
let recoveryTestsPassed = true;
let missableTestsPassed = true;
let irreversibleTestsPassed = true;
let regressionPassed = true;

function assert(condition, testName, category) {
  if (!condition) {
    console.error(`FAIL: ${testName}`);
    allPassed = false;
    if (category === 'current') currentTestsPassed = false;
    if (category === 'recovery') recoveryTestsPassed = false;
    if (category === 'missable') missableTestsPassed = false;
    if (category === 'irreversible') irreversibleTestsPassed = false;
    if (category === 'regression') regressionPassed = false;
  } else {
    // console.log(`PASS: ${testName}`);
  }
}

const mockTimetables = {
  "Mock": {
    schedule: {
      Monday: [] // doesn't matter for A-D
    }
  }
};

// TEST A
const planA = calculateAttendancePlan({
  section: "III ECE-A", // using the real III ECE-A since mock breaks calculateAttendancePlan
  subject: "MockSubject",
  attendedClasses: 90,
  conductedClasses: 100,
  today: "2026-10-05", // F=0 if subject doesn't exist
  planningDate: "2026-10-11",
  semesterDeadline: "2026-10-11",
  timetablesIndex: timetables
});
assert(planA.current.percentage === 90, "TEST A: Current 90%", 'current');
assert(planA.planningHorizon.requiredToReach90 === 0, "TEST A: Required 0", 'recovery');
assert(planA.planningHorizon.maxMissableClasses === 0, "TEST A: Missable 0", 'missable');

// TEST B
const planB = calculateAttendancePlan({
  section: "III ECE-A",
  subject: "MockSubject",
  attendedClasses: 80,
  conductedClasses: 100,
  today: "2026-10-05", // we'll inject F manually via a trick, or we can just test calculateHorizonInfo directly
  planningDate: "2026-10-11",
  semesterDeadline: "2026-10-11",
  timetablesIndex: timetables
});
// To properly test F, we should just test calculateHorizonInfo, but it's not exported. 
// I'll re-export it in attendanceEngine.js or just write a wrapper.
