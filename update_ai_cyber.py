import json
import re

json_ai = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "Artificial Intelligence",
    "semester": "First Semester 2026/2027",
    "level": "One (Credit Hours)",
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
        {"subject": "الكترونيات", "instructor": "T.A Nadine Kadry", "location": "مدرج 5"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Salma Anwar", "location": "Lab 222-Al"}
      ],
      "Monday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 2"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Eman", "location": "مدرج 5"}
      ],
      "Tuesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 2",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Salma Anwar", "location": "Lab 203"}
      ],
      "Monday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 2"},
        {"subject": "الكترونيات", "instructor": "T.A-Nadine Kadry", "location": "مدرج 6"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 5"}
      ],
      "Tuesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 3",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Salma Anwar", "location": "Lab 205"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 2"},
        {"subject": "الكترونيات", "instructor": "T.A-Nadine Kadry", "location": "مدرج 2"}
      ],
      "Monday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 5"}
      ],
      "Tuesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 4",
      "Sunday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 2"}
      ],
      "Monday": [
        {"subject": "الكترونيات", "instructor": "T.A-Nadine Kadry", "location": "مدرج 3"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 5"}
      ],
      "Tuesday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Menna Allah Khaled", "location": "Lab 102"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 5",
      "Sunday": [
        {"subject": "الكترونيات", "instructor": "T.A Nadine Kadry", "location": "مدرج 2"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 1"}
      ],
      "Monday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 6"}
      ],
      "Tuesday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Menna Allah Khaled", "location": "Lab 303"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 3", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    }
  ]
}
"""

json_cyber = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "cyber security",
    "semester": "First Semester 2026/2027",
    "level": "One (Credit Hours)",
    "quality_assurance": "Model (T1) Quality Assurance Center"
  },
  "slot_times": [
    {"slot": 1, "from": "9.15", "to": "10.00"}
  ],
  "schedule": [
    {
      "section": "Section 1",
      "Sunday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 3"},
        {"subject": "الكترونيات", "instructor": "T.A Asmaa Ghonaim", "location": "مدرج 6"}
      ],
      "Monday": [],
      "Tuesday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 6", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A- Aya", "location": "Lab 004"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Alaa Mohamed", "location": "مدرج 2"},
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 2",
      "Sunday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 1"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Aya", "location": "Lab 203"},
        {"subject": "الكترونيات", "instructor": "T.A Malak", "location": "مدرج 4"}
      ],
      "Monday": [],
      "Tuesday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Alaa Mohamed", "location": "مدرج 2"},
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 3",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Aya", "location": "Lab 203 Al"}
      ],
      "Monday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 4"}
      ],
      "Tuesday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 4"},
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A Malak", "location": "مدرج 6"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 4",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Aya", "location": "Lab 103"}
      ],
      "Monday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 3"}
      ],
      "Tuesday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 4"},
        {"subject": "الكترونيات", "instructor": "T.A Malak", "location": "مدرج 2"},
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 5",
      "Sunday": [
        {"subject": "الكترونيات", "instructor": "T.A Malak", "location": "مدرج 4"}
      ],
      "Monday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "T.A Doaa", "location": "مدرج 3"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Aya", "location": "Lab 222 Al"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A Eman", "location": "مدرج 6"}
      ],
      "Tuesday": [
        {"subject": "الرياضيات غير المتصلة", "instructor": "Dr Maher Zaid", "location": "مدرج 1", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "Dr Mahmoud Gabr", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "الكترونيات", "instructor": "Dr Shimaa Osman", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr Hayam Reda", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Thursday": [
        {"subject": "فكر ابداعي ومهارات التواصل", "instructor": "Dr Samah Ayaad", "location": "Online", "type": "Lecture"},
        {"subject": "اللغة الانجليزية", "instructor": "Dr Sameh Sherif", "location": "Online", "type": "Lecture"}
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
    out.append('  "1": {')
    out.append('    "1": {')
    
    for item in schedule:
        section_id = item["section"].replace("Section ", "")
        out.append(f'      "{section_id}": {{')
        
        for idx, (en_day, ar_day) in enumerate(day_map.items()):
            entries = item.get(en_day, [])
            out.append(f'        "{ar_day}": [')
            
            for i, entry in enumerate(entries):
                period = periods[i] if i < len(periods) else "الفترة الرابعة"
                subject = entry["subject"]
                if entry.get("type") == "Lecture" and "محاضرة" not in subject:
                    subject = "محاضرة " + subject
                
                comma = "," if i < len(entries) - 1 else ""
                out.append(f'          {{"period": "{period}", "subject": "{subject}", "instructor": "{entry["instructor"]}", "location": "{entry["location"]}"}}{comma}')
            
            out.append(f'        ]{"," if idx < len(day_map) - 1 else ""}')
        
        out.append(f'      }}{"," if section_id != schedule[-1]["section"].replace("Section ", "") else ""}')
    
    out.append('    },')
    out.append('    "2": {}')
    out.append('  },')
    out.append('  "2": { "1": {}, "2": {} },')
    out.append('  "3": { "1": {}, "2": {} },')
    out.append('  "4": { "1": {}, "2": {} }')
    return "\n".join(out)

ai_ts = generate_ts_obj(json_ai)
cyber_ts = generate_ts_obj(json_cyber)

with open('src/lib/schedule-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace cyberScheduleData
cyber_pattern = r'(export const cyberScheduleData: DeptSchedule = \{)[\s\S]*?(?=\n\};\n)'
content = re.sub(cyber_pattern, r'\1\n' + cyber_ts, content)

# Replace aiScheduleData
ai_pattern = r'(export const aiScheduleData: DeptSchedule = \{)[\s\S]*?(?=\n\};\n)'
content = re.sub(ai_pattern, r'\1\n' + ai_ts, content)

with open('src/lib/schedule-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated both AI and Cyber schedules.")
