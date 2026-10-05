import json
import re

json_cyber = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "cyber security",
    "semester": "First Semester 2026/2027",
    "level": "Two (Credit Hours)",
    "quality_assurance": "Model (T1) Quality Assurance Center"
  },
  "slot_times": [
    {"slot": 1, "from": "9.15", "to": "10.00"}
  ],
  "schedule": [
    {
      "section": "Section 1",
      "Sunday": [
        {"subject": "البرمجة الشيئية", "instructor": "T.A Ethar", "location": "Lab 303"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Esraa Safwat", "location": "Lab 303"},
        {"subject": "تنظيم الحاسب", "instructor": "T.A Somia", "location": "Lab 205"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr Helmy Abdel Aziz", "location": "مدرج 2", "type": "Lecture"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "تراسل البيانات", "instructor": "Dr Mohamed Mokhtar", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "احصاء واحتمالات", "instructor": "T.A Ahmed Hazem", "location": "مدرج 4"}
      ],
      "Wednesday": [
        {"subject": "تراسل البيانات", "instructor": "T.A Farah", "location": "Lab 002"}
      ],
      "Thursday": [
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 2",
      "Sunday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Esraa", "location": "Lab 002"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "إحصاء واحتمالات", "instructor": "T.A Adel", "location": "مدرج 1"},
        {"subject": "تنظيم الحاسب", "instructor": "T.A Somia", "location": "Lab 203"},
        {"subject": "البرمجة الشيئية", "instructor": "T.A Ethar", "location": "Lab 102"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr Helmy Abdel Aziz", "location": "مدرج 2", "type": "Lecture"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "تراسل البيانات", "instructor": "Dr Mohamed Mokhtar", "location": "مدرج 4", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "تراسل البيانات", "instructor": "T.A Farah", "location": "Lab 105"}
      ],
      "Thursday": [
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 3",
      "Sunday": [
        {"subject": "تنظيم الحاسب", "instructor": "T.A Somia", "location": "Lab 222 Al"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Esraa Safwat", "location": "Lab 203 A"},
        {"subject": "احصاء واحتمالات", "instructor": "T.A Ahmed Hazem", "location": "مدرج 6"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr Helmy Abdel Aziz", "location": "مدرج 2", "type": "Lecture"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "تراسل البيانات", "instructor": "Dr Mohamed Mokhtar", "location": "مدرج 4", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "البرمجة الشيئية", "instructor": "T.A Rania", "location": "Lab 102"}
      ],
      "Thursday": [
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"},
        {"subject": "تراسل البيانات", "instructor": "T.A Fatma", "location": "Lab 201 Al"}
      ]
    },
    {
      "section": "Section 4",
      "Sunday": [
        {"subject": "تراسل البيانات", "instructor": "T.A Fatma", "location": "Lab 105"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "احصاء واحتمالات", "instructor": "T.A Ahmed Hazem", "location": "مدرج 6"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr Helmy Abdel Aziz", "location": "مدرج 2", "type": "Lecture"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "تراسل البيانات", "instructor": "Dr Mohamed Mokhtar", "location": "مدرج 4", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "البرمجة الشيئية", "instructor": "T.A Rania", "location": "Lab 201 Al"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Roaa", "location": "Lab 102"},
        {"subject": "تنظيم الحاسب", "instructor": "T.A Somia", "location": "Lab 219 Al"}
      ],
      "Thursday": [
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 5",
      "Sunday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Roaa", "location": "Lab 102"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "إحصاء واحتمالات", "instructor": "T.A Adel", "location": "مدرج 1"},
        {"subject": "تنظيم الحاسب", "instructor": "T.A Fatma", "location": "Lab 103"},
        {"subject": "تراسل البيانات", "instructor": "T.A Somia", "location": "Lab 203"}
      ],
      "Tuesday": [
        {"subject": "إحصاء واحتمالات", "instructor": "Dr Helmy Abdel Aziz", "location": "مدرج 2", "type": "Lecture"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "تراسل البيانات", "instructor": "Dr Mohamed Mokhtar", "location": "مدرج 4", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "البرمجة الشيئية", "instructor": "T.A Rania", "location": "Lab 303"}
      ],
      "Thursday": [
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 4", "type": "Lecture"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    }
  ]
}
"""

json_ai = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "Artificial Intelligence",
    "semester": "First Semester 2026/2027",
    "level": "Two (Credit Hours)",
    "quality_assurance": "Model (T1) Quality Assurance Center"
  },
  "slot_times": [
    {"slot": 1, "from": "9.15", "to": "10.00"}
  ],
  "schedule": [
    {
      "section": "Section 1",
      "Sunday": [
        {"subject": "البرمجة الشيئية", "instructor": "T.A Wafaa", "location": "Lab 103"},
        {"subject": "احصاء واحتمالات", "instructor": "T.A Ahmed Hazem", "location": "مدرج 6"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Asmaa Hassan", "location": "Lab 303"},
        {"subject": "التحليل العددي", "instructor": "Dr Hamdy", "location": "مدرج 6", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "احصاء واحتمالات", "instructor": "Dr Helmy", "location": "مدرج 2", "type": "Lecture"}
      ],
      "Wednesday": [],
      "Thursday": [
        {"subject": "تنظيم الحاسب", "instructor": "T.A Menna Allah Khaled", "location": "Lab 101"},
        {"subject": "التحليل العددي", "instructor": "T.A Adel", "location": "مدرج 3"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 2",
      "Sunday": [
        {"subject": "احصاء واحتمالات", "instructor": "T.A Ahmed Hazem", "location": "مدرج 6"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "التحليل العددي", "instructor": "Dr Hamdy", "location": "مدرج 6", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Asmaa Hassan", "location": "Lab 203"},
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "احصاء واحتمالات", "instructor": "Dr Helmy", "location": "مدرج 2", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب", "instructor": "T.A Menna Allah Khaled", "location": "Lab 103"},
        {"subject": "البرمجة الشيئية", "instructor": "T.A Wafaa", "location": "Lab 101"}
      ],
      "Thursday": [
        {"subject": "التحليل العددي", "instructor": "T.A Adel", "location": "مدرج 3"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 3",
      "Sunday": [
        {"subject": "البرمجة الشيئية", "instructor": "T.A Wafaa", "location": "Lab 201 Al"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Asmaa Hassan", "location": "Lab 222 Al"},
        {"subject": "التحليل العددي", "instructor": "Dr Hamdy", "location": "مدرج 6", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "احصاء واحتمالات", "instructor": "Dr Helmy", "location": "مدرج 2", "type": "Lecture"}
      ],
      "Wednesday": [
        {"subject": "تنظيم الحاسب", "instructor": "T.A Menna Allah Khaled", "location": "Lab 218 Al"}
      ],
      "Thursday": [
        {"subject": "التحليل العددي", "instructor": "T.A Adel", "location": "مدرج 3"},
        {"subject": "احصاء واحتمالات", "instructor": "T.A Adel", "location": "مدرج 3"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 4",
      "Sunday": [
        {"subject": "تنظيم الحاسب", "instructor": "T.A Menna Allah Khaled", "location": "Lab 218 Al"},
        {"subject": "تنظيم الحاسب ولغة التجميع", "instructor": "Dr Tarek Salah", "location": "مدرج 1 اعلام", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "T.A Asmaa Hassan", "location": "Lab 105"},
        {"subject": "التحليل العددي", "instructor": "Dr Hamdy", "location": "مدرج 6", "type": "Lecture"},
        {"subject": "البرمجة الشيئية", "instructor": "Dr Osama Shafik", "location": "مدرج 6", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "أخلاقيات العمل", "instructor": "Dr Sameh Sherif", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "احصاء واحتمالات", "instructor": "Dr Helmy", "location": "مدرج 2", "type": "Lecture"}
      ],
      "Wednesday": [],
      "Thursday": [
        {"subject": "التحليل العددي", "instructor": "T.A Adel", "location": "مدرج 3"},
        {"subject": "البرمجة الشيئية", "instructor": "TA-Layla", "location": "Lab 222-Al"},
        {"subject": "احصاء واحتمالات", "instructor": "T.A Adel", "location": "مدرج 3"},
        {"subject": "مقدمة في نظم قواعد البيانات", "instructor": "Dr Hayam Reda", "location": "مدرج 1 اعلام", "type": "Lecture"}
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

cyber_level2_ts = generate_ts_obj(json_cyber)
ai_level2_ts = generate_ts_obj(json_ai)

with open('src/lib/schedule-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace cyberScheduleData Level 2
cyber_pattern = r'(export const cyberScheduleData: DeptSchedule = \{[\s\S]*?\n\s*\}\,\n\s*\"2\":\s*\{\s*\"1\":\s*\{\}\,\s*\"2\":\s*\{\}\s*\},\n\s*\"3\":)'
# Wait, the structure inside cyber is:
# export const cyberScheduleData: DeptSchedule = {
#   "1": { ... },
#   "2": { "1": {}, "2": {} },
#   "3": ...
# I will use a more robust regex.

# We know cyber ends at:
#   "2": { "1": {}, "2": {} },
#   "3": { "1": {}, "2": {} },
#   "4": { "1": {}, "2": {} }
# };

# And AI has the same:
#   "2": { "1": {}, "2": {} },
#   "3": { "1": {}, "2": {} },
#   ...

# So let's isolate cyberScheduleData block and replace inside it.
cyber_block_match = re.search(r'(export const cyberScheduleData: DeptSchedule = \{[\s\S]*?)(?=\nexport const aiScheduleData)', content)
if cyber_block_match:
    cyber_block = cyber_block_match.group(1)
    cyber_block_replaced = re.sub(r'\"2\":\s*\{\s*\"1\":\s*\{\},\s*\"2\":\s*\{\}\s*\},', cyber_level2_ts[:-1] + ',', cyber_block)
    content = content.replace(cyber_block, cyber_block_replaced)

ai_block_match = re.search(r'(export const aiScheduleData: DeptSchedule = \{[\s\S]*?)(?=\nexport const scheduleData)', content)
if ai_block_match:
    ai_block = ai_block_match.group(1)
    ai_block_replaced = re.sub(r'\"2\":\s*\{\s*\"1\":\s*\{\},\s*\"2\":\s*\{\}\s*\},', ai_level2_ts[:-1] + ',', ai_block)
    content = content.replace(ai_block, ai_block_replaced)

with open('src/lib/schedule-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Cyber and AI Level 2 Schedules.")
