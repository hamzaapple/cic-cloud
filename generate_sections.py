import json

data = {
  "1": {
    "الأحد": [
      {"period": "الفترة الرابعة", "subject": "التفاضل والتكامل", "instructor": "T.A- Alaa mohamed", "location": "مدرج 5"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الثالثة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-salma tarek", "location": "معمل 203"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الرابعة", "subject": "الكترونيات", "instructor": "T.A-Elzahraa", "location": "مدرج 2"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثانية", "subject": "الكترونيات", "instructor": "T.A-Elzahraa", "location": "مدرج 2"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "2": {
    "الأحد": [
      {"period": "الفترة الثالثة", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الرابعة", "subject": "التفاضل والتكامل", "instructor": "T.A- Alaa mohamed", "location": "مدرج 5"}
    ],
    "الإثنين": [
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الثالثة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-salma tarek", "location": "lab-203-Al"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثانية", "subject": "الكترونيات", "instructor": "T.A-Elzahraa", "location": "مدرج 2"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "3": {
    "الأحد": [],
    "الإثنين": [
      {"period": "الفترة الثالثة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-salma tarek", "location": "lab-203 Al"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [],
    "الأربعاء": [
      {"period": "الفترة الثانية", "subject": "التفاضل والتكامل", "instructor": "T.A-Alaa mohammed", "location": "مدرج 1"},
      {"period": "الفترة الثالثة", "subject": "الكترونيات", "instructor": "T.A-Elzahraa", "location": "مدرج 2"},
      {"period": "الفترة الرابعة", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 322"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "4": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "محاضرة الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الثالثة", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"},
      {"period": "الفترة الثانية", "subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "محاضرة التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الثانية", "subject": "التفاضل والتكامل", "instructor": "T.A-Alaa mohammed", "location": "مدرج 1"},
      {"period": "الفترة الرابعة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-salma tarek", "location": "معمل 104"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "5": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "محاضرة الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الثانية", "subject": "التفاضل والتكامل", "instructor": "T.A-Alaa mohamed", "location": "مدرج 1"}
    ],
    "الإثنين": [
      {"period": "الفترة الثانية", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-salma anwar", "location": "lab-201-Al"},
      {"period": "الفترة الرابعة", "subject": "الكترونيات", "instructor": "T.A-Nadeen", "location": "مدرج 2"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"},
      {"period": "الفترة الثانية", "subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الثالثة", "subject": "محاضرة التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "6": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "محاضرة الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الثانية", "subject": "التفاضل والتكامل", "instructor": "T.A-Alaa mohamed", "location": "مدرج 1"},
      {"period": "الفترة الثالثة", "subject": "الكترونيات", "instructor": "T.A-Nadeen", "location": "مدرج 5"}
    ],
    "الإثنين": [
      {"period": "الفترة الثالثة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "معمل 106"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"},
      {"period": "الفترة الثالثة", "subject": "محاضرة التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الثالثة", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 417"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "7": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "محاضرة الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الأولى", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الرابعة", "subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 4"},
      {"period": "الفترة الثانية", "subject": "الكترونيات", "instructor": "T.A-Nadeen", "location": "مدرج 1"}
    ],
    "الإثنين": [
      {"period": "الفترة الثالثة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "معمل 205"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"},
      {"period": "الفترة الثالثة", "subject": "محاضرة التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "8": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "محاضرة الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الثالثة", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "معمل 101"},
      {"period": "الفترة الرابعة", "subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 4"}
    ],
    "الإثنين": [
      {"period": "الفترة الثانية", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"},
      {"period": "الفترة الثالثة", "subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 6"},
      {"period": "الفترة الثالثة", "subject": "محاضرة التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  },
  "9": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "محاضرة الكترونيات", "instructor": "Dr.Hayam", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الأولى", "subject": "مقدمة في علوم الحاسب", "instructor": "T.A-Abrar", "location": "معمل 004"}
    ],
    "الإثنين": [
      {"period": "الفترة الرابعة", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة مقدمة في علوم الحاسب", "instructor": "Dr. mohamed Elzwidy", "location": "مدرج 7"},
      {"period": "الفترة الثالثة", "subject": "فيزياء", "instructor": "T.A", "location": "معمل 416"},
      {"period": "الفترة الثالثة", "subject": "محاضرة التفاضل والتكامل", "instructor": "Dr.Hamdy", "location": "مدرج 5 اعلام"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة فيزياء", "instructor": "Dr.Mahmoud abd elmohsen", "location": "مدرج 5 اعلام"},
      {"period": "الفترة الثالثة", "subject": "الكترونيات", "instructor": "T.A-Hossam", "location": "مدرج 5"},
      {"period": "الفترة الرابعة", "subject": "التفاضل والتكامل", "instructor": "T.A-Adel", "location": "مدرج 3"}
    ],
    "الخميس": [
      {"period": "الفترة الأولى", "subject": "الفكر الابداعي", "instructor": "Dr.Samah", "location": "Online"},
      {"period": "الفترة الثانية", "subject": "لغة انجليزية", "instructor": "Dr.sameh", "location": "Online"}
    ]
  }
}

with open("sections1_9.ts", "w", encoding="utf-8") as f:
    for section_id, days in data.items():
        f.write(f'      "{section_id}": {{\n')
        for day, entries in days.items():
            f.write(f'        "{day}": [\n')
            for idx, entry in enumerate(entries):
                comma = "," if idx < len(entries) - 1 else ""
                f.write(f'          {{"period": "{entry["period"]}", "subject": "{entry["subject"]}", "instructor": "{entry["instructor"]}", "location": "{entry["location"]}"}}{comma}\n')
            f.write(f'        ]{"," if day != list(days.keys())[-1] else ""}\n')
        f.write(f'      }},{" " if section_id != list(data.keys())[-1] else ""}\n')
print("Done")
