const fs = require('fs');
const oldData = require('./schedule-data.cjs');

// Read and fix SCHEDULE.JSON
let rawSchedule = fs.readFileSync('../../SCHEDULE.JSON', 'utf-8');
rawSchedule = '[' + rawSchedule.replace(/\}\s*\{/g, '},{') + ']';
const newSchedules = JSON.parse(rawSchedule);

// Create base object
const fullData = {
  cs: oldData.csScheduleData || {},
  cyber: oldData.cyberScheduleData || {},
  ai: oldData.aiScheduleData || {}
};

// Reset cs year 1 semester 1 to empty so we replace it with new data
if (!fullData.cs["1"]) fullData.cs["1"] = {};
fullData.cs["1"]["1"] = {};

const PERIOD_NAMES = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة"];
const DAYS_ARABIC = {
  "Sunday": "الأحد",
  "Monday": "الإثنين",
  "Tuesday": "الثلاثاء",
  "Wednesday": "الأربعاء",
  "Thursday": "الخميس"
};

for (const groupData of newSchedules) {
  for (const sectionData of groupData.schedule) {
    const secNum = sectionData.section.replace(/\D/g, ''); // e.g. "Section 1" -> "1"
    
    const secObj = {};
    for (const [enDay, arDay] of Object.entries(DAYS_ARABIC)) {
      secObj[arDay] = [];
      const dayClasses = sectionData[enDay] || [];
      dayClasses.forEach((cls, index) => {
        let subjectName = cls.subject;
        // Prepend "محاضرة " if it's a lecture
        if (cls.type === "Lecture" && !subjectName.includes("محاضرة")) {
          subjectName = "محاضرة " + subjectName;
        }
        secObj[arDay].push({
          period: PERIOD_NAMES[index],
          subject: subjectName,
          instructor: cls.instructor,
          location: cls.location
        });
      });
    }
    
    fullData.cs["1"]["1"][secNum] = secObj;
  }
}

fs.writeFileSync('./schedule-data.json', JSON.stringify(fullData, null, 2));
console.log("Successfully converted and merged the schedules!");
