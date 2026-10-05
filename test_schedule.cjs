const fs = require('fs');
const scheduleData = require('./src/lib/schedule-data.json').cs['1']['1'];

const DAYS_ORDER = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const PERIODS_ORDER = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة"];

const getBaseSubject = (subject) => subject.trim();

const allSubjects = new Set();
const sectionDays = {};

Object.values(scheduleData).forEach(sectionData => {
  DAYS_ORDER.forEach(day => {
    const dayEntries = sectionData[day] || [];
    dayEntries.forEach(entry => {
      const base = getBaseSubject(entry.subject);
      allSubjects.add(base);
      if (!sectionDays[base]) sectionDays[base] = new Set();
      sectionDays[base].add(day);
    });
  });
});

const generateCombos = (size) => {
  const combos = [];
  const recurse = (start, current) => {
    if (current.length === size) {
      combos.push([...current]);
      return;
    }
    for (let i = start; i < DAYS_ORDER.length; i++) {
      current.push(DAYS_ORDER[i]);
      recurse(i + 1, current);
      current.pop();
    }
  };
  recurse(0, []);
  return combos;
};

const isValidCombo = (combo) => {
  for (const subject of allSubjects) {
    const hasSection = sectionDays[subject] && combo.some(d => sectionDays[subject].has(d));
    if (!hasSection) return false;
  }
  return true;
};

const valid3Day = generateCombos(3).filter(isValidCombo);
console.log("Valid 3-day combos:", valid3Day);

const selectedDayCombos = valid3Day[0];
console.log("Testing combo:", selectedDayCombos);

const requirements = [];
allSubjects.forEach(base => {
  const sectionOptions = [];
  const seenSections = new Set();

  Object.entries(scheduleData).forEach(([sec, sectionData]) => {
    selectedDayCombos.forEach(day => {
      const dayEntries = sectionData[day] || [];
      dayEntries.forEach(entry => {
        if (getBaseSubject(entry.subject) === base) {
          const opt = { day, period: entry.period, entry, section: sec };
          const uniqueKey = `${day}-${entry.period}-${entry.instructor}`;
          if (!seenSections.has(uniqueKey)) {
            seenSections.add(uniqueKey);
            sectionOptions.push(opt);
          }
        }
      });
    });
  });

  if (sectionOptions.length > 0) {
    requirements.push({ base, type: "section", options: sectionOptions });
  }
});

console.log("Requirements count:", requirements.length);
requirements.forEach(r => console.log(r.base, r.options.length, "options"));

const allResults = [];
const currentAssignment = [];
const usedSlots = new Set();
let iterations = 0;

const backtrackAll = (reqIndex) => {
  if (allResults.length >= 1 || iterations >= 50000) return;
  iterations++;

  if (reqIndex === requirements.length) {
    allResults.push([...currentAssignment]);
    return;
  }

  const req = requirements[reqIndex];
  for (const opt of req.options) {
    if (allResults.length >= 1 || iterations >= 50000) break;
    
    const slotKey = `${opt.day}-${opt.period}`;
    if (!usedSlots.has(slotKey)) {
      usedSlots.add(slotKey);
      currentAssignment.push(opt);
      backtrackAll(reqIndex + 1);
      currentAssignment.pop();
      usedSlots.delete(slotKey);
    }
  }
};

backtrackAll(0);
console.log("Results found:", allResults.length, "Iterations:", iterations);
