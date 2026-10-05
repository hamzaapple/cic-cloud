const fs = require('fs');

let rawText = fs.readFileSync('SCHEDULE.JSON', 'utf8');
rawText = '[' + rawText.replace(/\}\s*\{/g, '},{') + ']';

const rawArray = JSON.parse(rawText);

const finalData = {
  cs: {
    "1": {
      "1": {}
    }
  },
  ai: {},
  cyber: {}
};

const dayMap = {
  "Sunday": "الأحد",
  "Monday": "الإثنين",
  "Tuesday": "الثلاثاء",
  "Wednesday": "الأربعاء",
  "Thursday": "الخميس"
};

const periodMap = {
  "1-2": "الفترة الأولى",
  "3-4": "الفترة الثانية",
  "5-6": "الفترة الثالثة",
  "7-8": "الفترة الرابعة",
  "1": "الفترة الأولى",
  "2": "الفترة الأولى",
  "3": "الفترة الثانية",
  "4": "الفترة الثانية",
  "5": "الفترة الثالثة",
  "6": "الفترة الثالثة",
  "7": "الفترة الرابعة",
  "8": "الفترة الرابعة",
};

const sections = {};

rawArray.forEach(group => {
  group.schedule.forEach(entry => {
    const day = dayMap[entry.day] || entry.day;
    const sectionName = entry.section; 
    const secAr = sectionName.replace("Section ", "سكشن ");
    
    if (!sections[secAr]) sections[secAr] = {};
    if (!sections[secAr][day]) sections[secAr][day] = [];
    
    const period = periodMap[entry.slots] || entry.slots;
    
    let subject = entry.course_name;
    if (entry.type === "Lecture") {
      if (!subject.startsWith("محاضرة ")) {
        subject = "محاضرة " + subject;
      }
    }
    
    sections[secAr][day].push({
      period: period,
      subject: subject,
      instructor: entry.instructor,
      location: entry.location
    });
  });
});

finalData.cs["1"]["1"] = sections;

fs.writeFileSync('src/lib/schedule-data.json', JSON.stringify(finalData, null, 2));
console.log('Conversion successful!');
