const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function countClassesBetween(
  timetable,
  startDate,
  endDate
) {
  const counts = {};

  const current = new Date(startDate);
  const end = new Date(endDate);

  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const dayName = DAY_NAMES[current.getDay()];
    const daySchedule = timetable.schedule[dayName];

    if (daySchedule) {
      daySchedule.forEach((slot) => {
        // Ignore breaks and empty periods
        if (
          slot.type === "empty" ||
          slot.type === "break"
        ) {
          return;
        }

        if (!slot.subject) {
          return;
        }

        if (!counts[slot.subject]) {
          counts[slot.subject] = 0;
        }

        // Every timetable period represents one attendance hour.
        counts[slot.subject] += 1;
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return counts;
}

export function calculateHorizonInfo(A, C, F) {
  const maxPossiblePercentage = C + F === 0 ? (A > 0 ? 100 : 0) : ((A + F) / (C + F)) * 100;
  const irreversibleDetention = maxPossiblePercentage < 90;
  
  let requiredToReach90 = Math.ceil(0.90 * (C + F) - A);
  if (requiredToReach90 < 0) requiredToReach90 = 0;
  
  // As per spec: clamp to F, but allow it to exceed F logically if we need to show it's impossible?
  // Wait, the spec says: "Clamp the result: minimum = 0, maximum = F. If requiredToReach90 > F, then reaching 90% ... is impossible"
  if (requiredToReach90 > F) {
    requiredToReach90 = F; // clamped
  }

  let maxMissableClasses = 0;
  if (!irreversibleDetention) {
      maxMissableClasses = Math.floor(F - (0.90 * (C + F) - A));
      if (maxMissableClasses < 0) maxMissableClasses = 0;
      if (maxMissableClasses > F) maxMissableClasses = F;
  }

  return {
    futureClasses: F,
    requiredToReach90,
    maxMissableClasses,
    maxPossiblePercentage,
    irreversibleDetention
  };
}

export function calculateAttendancePlan({
  section,
  subject,
  attendedClasses,
  conductedClasses,
  today,
  planningDate,
  semesterDeadline,
  timetablesIndex
}) {
  const timetable = timetablesIndex[section];
  if (!timetable) throw new Error("Section not found");

  const A = attendedClasses || 0;
  const C = conductedClasses || 0;
  const currentPercentage = C === 0 ? (A > 0 ? 100 : 0) : (A / C) * 100;

  // Calculate future classes
  // Date logic: today to planningDate (exclusive of today? "For every calendar date: today -> planningDate") 
  // Let's assume inclusive. Wait, if we are predicting "future", it typically means strictly after today, or inclusive of today?
  // The test E says: 05 Oct 2026 -> 11 Oct 2026, counting gives the full week. So inclusive.
  const planningCounts = countClassesBetween(timetable, today, planningDate);
  const deadlineCounts = countClassesBetween(timetable, today, semesterDeadline);

  const F_plan = planningCounts[subject] || 0;
  const F_dead = deadlineCounts[subject] || 0;

  return {
    current: {
      attended: A,
      conducted: C,
      percentage: currentPercentage
    },
    planningHorizon: calculateHorizonInfo(A, C, F_plan),
    deadlineHorizon: calculateHorizonInfo(A, C, F_dead)
  };
}