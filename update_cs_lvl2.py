import json
import re

json_data = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "Computer Science",
    "semester": "First Semester 2026/2027",
    "level": "Two (Credit Hours)",
    "group": "A",
    "quality_assurance": "Model (T1) Quality Assurance Center"
  },
  "slot_times": [
    {"slot": 1, "from": "9.15", "to": "10.00"},
    {"slot": 2, "from": "10.00", "to": "10.45"},
    {"slot": 3, "from": "10.55", "to": "11.40"},
    {"slot": 4, "from": "11.40", "to": "12.25"},
    {"slot": "Break", "from": "12.25", "to": "12.45"},
    {"slot": 5, "from": "12.45", "to": "1.30"},
    {"slot": 6, "from": "1.30", "to": "2.10"},
    {"slot": 7, "from": "2.10", "to": "3.00"},
    {"slot": 8, "from": "3.00", "to": "3.45"}
  ],
  "schedule": [
    {
      "section": "Section 1",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 5"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Radwa", "location": "معمل 101"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA.Wafaa", "location": "معمل 203"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 5"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 101"}
      ]
    },
    {
      "section": "Section 2",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 5"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA.Wafaa", "location": "معمل 203 Al"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Radwa", "location": "معمل 218 Al"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 5"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 102"}
      ]
    },
    {
      "section": "Section 3",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 2"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "تنظيم الحاسب", "instructor": "TA.Wafaa", "location": "معمل 002"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Radwa", "location": "معمل 105"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr.Mohamed Mostafa", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 002"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 5"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 218 Al"}
      ]
    },
    {
      "section": "Section 4",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 2"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "البرمجة الشيئية", "instructor": "TA.Layla", "location": "معمل 101"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr.Mohamed Mostafa", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 002"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 5"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA.Farah", "location": "معمل 303"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Layla", "location": "معمل 004"}
      ]
    },
    {
      "section": "Section 5",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 4"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 103"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr.Mohamed Mostafa", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA.Farah", "location": "معمل 218 Al"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 5"}
      ]
    },
    {
      "section": "Section 6",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 4"},
        {"subject": "تنظيم الحاسب", "instructor": "TA.Farah", "location": "معمل 201 Al"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 103"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr.Mohamed Mostafa", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Layla", "location": "معمل 104"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 101"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 5"}
      ]
    },
    {
      "section": "Section 7",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "تنظيم الحاسب", "instructor": "TA.Farah", "location": "معمل 201 Al"},
        {"subject": "بحوث عمليات", "instructor": "TA.Ahmed Hazem", "location": "مدرج 1"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr.Mohamed Mostafa", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 3"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA.Omnia", "location": "معمل 101"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Layla", "location": "معمل 218 Al"}
      ]
    },
    {
      "section": "Section 8",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "معالجة الملفات", "instructor": "TA.Salma Tarek", "location": "معمل 104"},
        {"subject": "بحوث عمليات", "instructor": "TA.Ahmed Hazem", "location": "مدرج 1"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "تنظيم الحاسب", "instructor": "TA.Malak", "location": "معمل 203"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Layla", "location": "معمل 104"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Eman", "location": "مدرج 3"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 9",
      "Sunday": [
        {"subject": "Day Off"}
      ],
      "Monday": [
        {"subject": "معالجة الملفات", "instructor": "TA.Salma Tarek", "location": "معمل 205"},
        {"subject": "البرمجة الشيئية", "instructor": "TA.Ethar", "location": "معمل 222 Al"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr.Tarek Salah", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr.Helmy", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr.Sameh sherif", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA.Ahmed Hazem", "location": "مدرج 5"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr.Mohamed Hussein", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA.Malak", "location": "معمل 004"},
        {"subject": "إحصاء واحتمالات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 1"}
      ]
    }
  ]
}
"""

day_map = {
    "Sunday": "الأحد",
    "Monday": "الإثنين",
    "Tuesday": "الثلاثاء",
    "Wednesday": "الأربعاء",
    "Thursday": "الخميس"
}
periods = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة", "الفترة الخامسة"]

def generate_ts_obj(json_str):
    data = json.loads(json_str)
    schedule = data["schedule"]
    out = []
    out.append('  "2": {')
    out.append('    "1": {')
    
    for item in schedule:
        section_id = item["section"].replace("Section ", "")
        out.append(f'      "{section_id}": {{')
        
        for idx, (en_day, ar_day) in enumerate(day_map.items()):
            entries = item.get(en_day, [])
            out.append(f'        "{ar_day}": [')
            
            for i, entry in enumerate(entries):
                if entry.get("subject") == "Day Off":
                    continue
                period = periods[i] if i < len(periods) else "الفترة الرابعة"
                subject = entry["subject"]
                if entry.get("type") == "Lecture" and "محاضرة" not in subject:
                    subject = "محاضرة " + subject
                
                # Check if it's the last entry (ignoring Day Offs? No, Day Offs are skipped above, so index tracking might be tricky)
                # Better to filter entries first
                
            filtered_entries = [e for e in entries if e.get("subject") != "Day Off"]
            
            for i, entry in enumerate(filtered_entries):
                period = periods[i] if i < len(periods) else "الفترة الرابعة"
                subject = entry["subject"]
                if entry.get("type") == "Lecture" and "محاضرة" not in subject:
                    subject = "محاضرة " + subject
                
                comma = "," if i < len(filtered_entries) - 1 else ""
                instructor = entry.get("instructor", "")
                location = entry.get("location", "")
                out.append(f'          {{"period": "{period}", "subject": "{subject}", "instructor": "{instructor}", "location": "{location}"}}{comma}')
            
            out.append(f'        ]{"," if idx < len(day_map) - 1 else ""}')
        
        out.append(f'      }}{"," if section_id != schedule[-1]["section"].replace("Section ", "") else ""}')
    
    out.append('    },')
    out.append('    "2": {}')
    out.append('  },')
    return "\n".join(out)

level2_ts = generate_ts_obj(json_data)

with open('src/lib/schedule-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace:
#   "2": { "1": {}, "2": {} },
# with the new block.
# Let's find exactly that for CS Dept.
# The structure is:
# export const csScheduleData: DeptSchedule = {
#   "1": { ... },
#   "2": { "1": {}, "2": {} },

pattern = r'(\"2\":\s*\{\s*\"1\":\s*\{\},\s*\"2\":\s*\{\}\s*\},\n\s*\"3\":)'
replacement = level2_ts + '\n  "3":'
new_content = re.sub(pattern, replacement, content, count=1)

with open('src/lib/schedule-data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated CS Level 2 Schedule.")
