import json
import re

json_data = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "Computer Science",
    "semester": "First Semester 2026/2027",
    "level": "Two (Credit Hours)",
    "group": "B",
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
      "section": "Section 10",
      "Sunday": [
        {"subject": "بحوث عمليات", "instructor": "TA. Ahmed Hazem", "location": "مدرج 2"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr. Mohamed Hussein", "location": "مدرج 5", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "Day Off"}
      ],
      "Tuesday": [
        {"subject": "تنظيم الحاسب", "instructor": "TA. Reham", "location": "معمل 203 Al"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr. Helmy Abdelaziz", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA. Ethar", "location": "معمل 101"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr. Tarek Salah", "location": "مدرج 8", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA. Salma Tarek", "location": "معمل 105"},
        {"subject": "بحوث عمليات", "instructor": "Dr. Mohamed Mostafa", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr. Sameh Sherif", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "Dr. Osama Shafik", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "إحصاء واحتمالات", "instructor": "TA. Alaa Mohamed", "location": "مدرج 1"}
      ]
    },
    {
      "section": "Section 11",
      "Sunday": [
        {"subject": "البرمجة الشيئية", "instructor": "Dr. Mohamed Hussein", "location": "مدرج 5", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "Day Off"}
      ],
      "Tuesday": [
        {"subject": "معالجة الملفات", "instructor": "TA. Salma Tarek", "location": "معمل 103"},
        {"subject": "البرمجة الشيئية", "instructor": "TA. Ethar", "location": "معمل 201 Al"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr. Helmy Abdelaziz", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA. Reham", "location": "معمل 201 Al"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr. Tarek Salah", "location": "مدرج 8", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA. Ahmed Hazem", "location": "مدرج 5"},
        {"subject": "بحوث عمليات", "instructor": "Dr. Mohamed Mostafa", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA. Alaa Mohamed", "location": "مدرج 6"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr. Sameh Sherif", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "Dr. Osama Shafik", "location": "مدرج 1", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 12",
      "Sunday": [
        {"subject": "البرمجة الشيئية", "instructor": "TA. Abrar", "location": "معمل 105"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr. Mohamed Hussein", "location": "مدرج 5", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "TA. Ahmed Hazem", "location": "مدرج 3"}
      ],
      "Monday": [
        {"subject": "Day Off"}
      ],
      "Tuesday": [
        {"subject": "تنظيم الحاسب", "instructor": "TA. Reham", "location": "معمل 004"},
        {"subject": "معالجة الملفات", "instructor": "TA. Asmaa Ghoneim", "location": "معمل 103"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr. Helmy Abdelaziz", "location": "مدرج 1", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr. Tarek Salah", "location": "مدرج 8", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr. Mohamed Mostafa", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA. Alaa Mohamed", "location": "مدرج 6"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr. Sameh Sherif", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "Dr. Osama Shafik", "location": "مدرج 1", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 13",
      "Sunday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA. Alaa Mohamed", "location": "مدرج 2"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr. Mohamed Hussein", "location": "مدرج 5", "type": "Lecture"},
        {"subject": "تنظيم الحاسب", "instructor": "TA. Somaya", "location": "معمل 201 Al"}
      ],
      "Monday": [
        {"subject": "Day Off"}
      ],
      "Tuesday": [
        {"subject": "البرمجة الشيئية", "instructor": "TA. Abrar", "location": "معمل 303"},
        {"subject": "بحوث عمليات", "instructor": "TA. Ahmed Hazem", "location": "مدرج 3"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr. Helmy Abdelaziz", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "TA. Asmaa Ghoneim", "location": "معمل 205"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr. Tarek Salah", "location": "مدرج 8", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr. Mohamed Mostafa", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr. Sameh Sherif", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "Dr. Osama Shafik", "location": "مدرج 1", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 14",
      "Sunday": [
        {"subject": "إحصاء واحتمالات", "instructor": "TA. Alaa Mohamed", "location": "مدرج 2"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr. Mohamed Hussein", "location": "مدرج 5", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "Day Off"}
      ],
      "Tuesday": [
        {"subject": "بحوث عمليات", "instructor": "TA. Ahmed Hazem", "location": "مدرج 3"},
        {"subject": "معالجة الملفات", "instructor": "TA. Salma Tarek", "location": "معمل 203"},
        {"subject": "إحصاء واحتمالات", "instructor": "Dr. Helmy Abdelaziz", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "TA. Abrar", "location": "معمل 002"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr. Tarek Salah", "location": "مدرج 8", "type": "Lecture"},
        {"subject": "بحوث عمليات", "instructor": "Dr. Mohamed Mostafa", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "تنظيم الحاسب", "instructor": "TA. Somaya", "location": "معمل 103"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr. Sameh Sherif", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "معالجة الملفات", "instructor": "Dr. Osama Shafik", "location": "مدرج 1", "type": "Lecture"}
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
    
    for section_idx, item in enumerate(schedule):
        section_id = item["section"].replace("Section ", "")
        out.append(f'      "{section_id}": {{')
        
        for idx, (en_day, ar_day) in enumerate(day_map.items()):
            entries = item.get(en_day, [])
            out.append(f'        "{ar_day}": [')
            
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
        
        # Determine if we need a comma for the section block (add it if not the very last)
        out.append(f'      }}{","}')
    
    return "\n".join(out)

groupB_ts = generate_ts_obj(json_data)

with open('src/lib/schedule-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to insert this right before `}, \n    "2": {}` that closes the `"1"` semester of `"2"`.
# Let's target the exact string where section 9 ends. 
# Section 9 ends with:
#         "الخميس": [
#           {"period": "الفترة الأولى", "subject": "محاضرة معالجة الملفات", "instructor": "Dr.Osama Shafik", "location": "مدرج 1 اعلام"},
#           {"period": "الفترة الثانية", "subject": "تنظيم الحاسب", "instructor": "TA.Malak", "location": "معمل 004"},
#           {"period": "الفترة الثالثة", "subject": "إحصاء واحتمالات", "instructor": "TA.Alaa Mohamed", "location": "مدرج 1"}
#         ]
#       }
#     },
#     "2": {}

target = '      }\n    },\n    "2": {}'
replacement = '      },\n' + groupB_ts + '\n    },\n    "2": {}'

# Only replace the first occurrence (which should be inside `csScheduleData` because that's where Level 2 was added).
# Actually, since it's exactly formatted like that, we should be careful. 
# Better regex: find the end of the `csScheduleData` "2": { "1": { ... } } block.
pattern = r'(?<=      \}\n)    \},\n    \"2\": \{\}\n  \},'

if '      }\n    },\n    "2": {}\n  },' in content:
    new_content = content.replace('      }\n    },\n    "2": {}\n  },', '      },\n' + groupB_ts[:-1] + '\n    },\n    "2": {}\n  },', 1)
else:
    print("Pattern not found. Trying flexible regex...")
    pattern = r'(      \}\n\s*\}\,\n\s*\"2\"\: \{\}\n\s*\}\,\n\s*\"3\"\:)'
    new_content = re.sub(pattern, lambda m: '      },\n' + groupB_ts[:-1] + '\n    },\n    "2": {}\n  },\n  "3":', content, count=1)


with open('src/lib/schedule-data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated CS Level 2 Schedule with Group B.")
