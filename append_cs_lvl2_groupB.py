import json
import re

with open('src/lib/schedule-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

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
    {"slot": 1, "from": "9.15", "to": "10.00"}
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

day_map = {"Sunday": "الأحد", "Monday": "الإثنين", "Tuesday": "الثلاثاء", "Wednesday": "الأربعاء", "Thursday": "الخميس"}
periods = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة", "الفترة الخامسة"]

data = json.loads(json_data)
schedule = data["schedule"]
out = []
for item in schedule:
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
    out.append(f'      }},')

groupB_ts = "\n".join(out)

# Find the exact end of section 9 under "2": { "1": { ... "9": { ... } } }
match = re.search(r'"9": \{[\s\S]*?\]\n\s*\}', content)
if match:
    idx = match.end()
    new_content = content[:idx] + ",\n" + groupB_ts[:-1] + content[idx:]
    with open('src/lib/schedule-data.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced via regex successfully!")
else:
    print("Pattern not found!")
