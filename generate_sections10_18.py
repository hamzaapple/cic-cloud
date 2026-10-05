import json

json_data = """
{
  "academic_info": {
    "institution": "El-Shorouk Academy Higher Institute of Computers and Information Technology",
    "department": "Computer Science",
    "semester": "first semester 2026-2027",
    "level": "One (Credit Hours)",
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
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 416"},
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"}
      ],
      "Tuesday": [
        {"subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 5"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "lab 203_Al"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 3"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 11",
      "Sunday": [
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "معمل 103"}
      ],
      "Tuesday": [
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 416"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 4"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 1"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 12",
      "Sunday": [
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"},
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 416"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 5"}
      ],
      "Tuesday": [],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "lab 222_Al"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 1"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 13",
      "Sunday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 6"},
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A-Asmaa", "location": "مدرج 2"},
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 418"}
      ],
      "Tuesday": [],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم", "instructor": "T.A-Fatma", "location": "lab 201_Al"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 14",
      "Sunday": [
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 6"},
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A-Asmaa", "location": "مدرج 3"}
      ],
      "Tuesday": [
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 416"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Fatma", "location": "معمل 105"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 15",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Fatma", "location": "معمل 103"},
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A-Asmaa", "location": "مدرج 1"}
      ],
      "Tuesday": [],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 3"},
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 416"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 16",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Fatma", "location": "معمل 205"},
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "الكترونيات", "instructor": "T.A-Asmaa", "location": "مدرج 3"}
      ],
      "Tuesday": [],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 3"},
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 417"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 17",
      "Sunday": [
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Salma Anwar", "location": "معمل 104"},
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 4"}
      ],
      "Tuesday": [
        {"subject": "الكترونيات", "instructor": "T.A-Asmaa", "location": "مدرج 3"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 417"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    },
    {
      "section": "Section 18",
      "Sunday": [
        {"subject": "الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "Dr.Mohamed Elzwidy", "location": "مدرج 7", "type": "Lecture"}
      ],
      "Monday": [
        {"subject": "فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 4"}
      ],
      "Tuesday": [
        {"subject": "الكترونيات", "instructor": "T.A-Asmaa", "location": "مدرج 5"}
      ],
      "Wednesday": [
        {"subject": "التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام", "type": "Lecture"},
        {"subject": "فيزياء", "instructor": "T.A-", "location": "معمل 322"},
        {"subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Salma Anwar", "location": "معمل 004"}
      ],
      "Thursday": [
        {"subject": "Creative thinking", "instructor": "Dr.Samah", "location": "Online", "type": "Lecture"},
        {"subject": "English", "instructor": "DR.sameh", "location": "Online", "type": "Lecture"}
      ]
    }
  ]
}
"""

data = json.loads(json_data)
schedule = data["schedule"]

day_map = {
    "Sunday": "الأحد",
    "Monday": "الإثنين",
    "Tuesday": "الثلاثاء",
    "Wednesday": "الأربعاء",
    "Thursday": "الخميس"
}

periods = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة"]

with open("sections10_18.ts", "w", encoding="utf-8") as f:
    for item in schedule:
        section_id = item["section"].replace("Section ", "")
        f.write(f'      "{section_id}": {{\n')
        
        for idx, (en_day, ar_day) in enumerate(day_map.items()):
            entries = item.get(en_day, [])
            f.write(f'        "{ar_day}": [\n')
            
            for i, entry in enumerate(entries):
                period = periods[i] if i < len(periods) else "الفترة الرابعة"
                subject = entry["subject"]
                if entry.get("type") == "Lecture" and "محاضرة" not in subject:
                    subject = "محاضرة " + subject
                
                comma = "," if i < len(entries) - 1 else ""
                f.write(f'          {{"period": "{period}", "subject": "{subject}", "instructor": "{entry["instructor"]}", "location": "{entry["location"]}"}}{comma}\n')
            
            f.write(f'        ]{"," if idx < len(day_map) - 1 else ""}\n')
        f.write(f'      }},{" " if section_id != "18" else ""}\n')

print("Done")
