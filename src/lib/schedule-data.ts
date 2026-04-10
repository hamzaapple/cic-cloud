export interface ScheduleEntry {
  period: string;
  subject: string;
  instructor: string;
  location: string;
}

export type SectionSchedule = Record<string, ScheduleEntry[]>;
export type AllSchedules = Record<string, SectionSchedule>;

export const DAYS_ORDER = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
export const PERIODS_ORDER = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة"];

// CS Department schedule data (14 sections)
export const csScheduleData: AllSchedules = {
  "1": { "الأحد": [{"period": "الفترة الثالثة", "subject": "Intro to IS", "instructor": "T.A Rowyda", "location": "Lab 205"}, {"period": "الفترة الرابعة", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "مدرج 3"}], "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Roaa", "location": "Lab 203 Al"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 2"}, {"period": "الفترة الثالثة", "subject": "Logic Design", "instructor": "T.A Elzahraa", "location": "Lab 305"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "2": { "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثانية", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "مدرج 2"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A Elzahraa", "location": "Lab 304"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الأربعاء": [{"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 6"}, {"period": "الفترة الرابعة", "subject": "Intro to IS", "instructor": "T.A Salma", "location": "Lab 002"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Roaa", "location": "Lab 002"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "3": { "الأحد": [{"period": "الفترة الأولى", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "مدرج 1"}, {"period": "الفترة الرابعة", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 6"}], "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثالثة", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 205"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A Elzahraa", "location": "Lab 305"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 205"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "4": { "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 103"}, {"period": "الفترة الثالثة", "subject": "Intro to IS", "instructor": "T.A Aisha", "location": "Lab 102"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الثالثة", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "مدرج 6"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الأربعاء": [{"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A Ahmed", "location": "Lab 304"}, {"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 6"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "5": { "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثانية", "subject": "Intro to IS", "instructor": "T.A Aisha", "location": "Lab 004"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A Ahmed Gamal", "location": "Lab 304"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الأربعاء": [{"period": "الفترة الثالثة", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 004"}, {"period": "الفترة الرابعة", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 2"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 2"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "6": { "الأحد": [{"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 6"}, {"period": "الفترة الثانية", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "مدرج 5"}], "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A Ahmed Gamal", "location": "Lab 305"}, {"period": "الفترة الثالثة", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 303"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 303"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "7": { "الأحد": [{"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "مدرج 6"}, {"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A Ahmed", "location": "Lab 305"}], "الإثنين": [{"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}, {"period": "الفترة الثانية", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 104"}, {"period": "الفترة الرابعة", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 7"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "مدرج 1"}, {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 104"}, {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 7"}] },
  "8": { "الأحد": [{"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A Ahmed Hasanein", "location": "Lab 305"}, {"period": "الفترة الثالثة", "subject": "Linear Algebra", "instructor": "T.A Eman", "location": "مدرج 6"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 002"}], "الأربعاء": [{"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Roaa", "location": "Lab 103"}, {"period": "الفترة الثالثة", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "مدرج 5"}] },
  "9": { "الإثنين": [{"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Hend", "location": "Lab 203"}, {"period": "الفترة الثالثة", "subject": "Intro to IS", "instructor": "T.A Ahmed Hasanein", "location": "Lab 105"}, {"period": "الفترة الرابعة", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "مدرج 4"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}], "الأربعاء": [{"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "مدرج 1"}] },
  "10": { "الإثنين": [{"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A Wafaa", "location": "Lab 219 Al"}, {"period": "الفترة الرابعة", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "مدرج 2"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الأربعاء": [{"period": "الفترة الأولى", "subject": "Intro to IS", "instructor": "T.A Alaa Magdy", "location": "Lab 101"}, {"period": "الفترة الثانية", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "مدرج 1"}, {"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}] },
  "11": { "الإثنين": [{"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "مدرج 1"}, {"period": "الفترة الثالثة", "subject": "Intro to IS", "instructor": "T.A Alaa Magdy", "location": "Lab 103"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الأربعاء": [{"period": "الفترة الثانية", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "مدرج 1"}, {"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}, {"period": "الفترة الرابعة", "subject": "Computer Programming", "instructor": "T.A Wafaa", "location": "Lab 002"}] },
  "12": { "الإثنين": [{"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}, {"period": "الفترة الرابعة", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "مدرج 2"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "مدرج 4"}], "الأربعاء": [{"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A Hend", "location": "Lab 201 Al"}, {"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "Intro to IS", "instructor": "T.A Alaa Magdy", "location": "Lab 303"}] },
  "13": { "الإثنين": [{"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A Ahmed Hasanein", "location": "Lab 304"}, {"period": "الفترة الثالثة", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "مدرج 4"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "Computer Programming", "instructor": "T.A Hend", "location": "Lab 104"}], "الأربعاء": [{"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "Intro to IS", "instructor": "T.A Ahmed Hasanein", "location": "Lab 303"}, {"period": "الفترة الثالثة", "subject": "Linear Algebra", "instructor": "T.A Eman", "location": "مدرج 6"}] },
  "14": { "الإثنين": [{"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A Wafaa", "location": "Lab 203 Al"}, {"period": "الفترة الثالثة", "subject": "Linear Algebra", "instructor": "T.A Eman", "location": "مدرج 5"}], "الثلاثاء": [{"period": "الفترة الأولى", "subject": "محاضرة Computer Programming", "instructor": "Dr/Negm Shawky", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثانية", "subject": "محاضرة Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "محاضرة Linear Algebra", "instructor": "Dr/Hamdy", "location": "مدرج 5 اعلام"}], "الأربعاء": [{"period": "الفترة الأولى", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "مدرج 4"}, {"period": "الفترة الثالثة", "subject": "محاضرة Report Writing", "instructor": "Dr/Hayam Reda", "location": "مدرج 5 اعلام"}, {"period": "الفترة الرابعة", "subject": "محاضرة Logic Design", "instructor": "Dr/Salah", "location": "مدرج 7"}], "الخميس": [{"period": "الفترة الأولى", "subject": "محاضرة Discrete Math", "instructor": "Dr/Maher", "location": "مدرج 5 اعلام"}, {"period": "الفترة الثالثة", "subject": "Logic Design", "instructor": "T.A Ahmed Hasanein", "location": "Lab 305"}, {"period": "الفترة الرابعة", "subject": "Intro to IS", "instructor": "T.A Ahmed Hasanein", "location": "Lab 004"}] },
};

// Cyber department schedule data (5 sections)
export const cyberScheduleData: AllSchedules = {
  "1": {
    "الأحد": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 6"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 305"},
      {"period": "الفترة الثالثة", "subject": "Computer Programming", "instructor": "T.A - Wafaa", "location": "Lab 203"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 6"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "مدرج 1"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ],
    "الخميس": [
      {"period": "الفترة الرابعة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"}
    ]
  },
  "2": {
    "الأحد": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 6"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A - Wafaa", "location": "Lab 222-Al"},
      {"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A - Adel", "location": "مدرج 3"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 305"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثانية", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "مدرج 1"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ],
    "الخميس": [
      {"period": "الفترة الرابعة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"}
    ]
  },
  "3": {
    "الأحد": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 6"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 304"},
      {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A - Alaa Hassan", "location": "Lab 203"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "مدرج 6"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ],
    "الخميس": [
      {"period": "الفترة الرابعة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"}
    ]
  },
  "4": {
    "الأحد": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 6"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "مدرج 1"},
      {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A - Alaa Hassan", "location": "Lab 222-Al"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 305"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"},
      {"period": "الفترة الرابعة", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 3"}
    ],
    "الخميس": [
      {"period": "الفترة الرابعة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"}
    ]
  },
  "5": {
    "الأحد": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 6"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الثانية", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "مدرج 6"},
      {"period": "الفترة الثالثة", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 304"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"},
      {"period": "الفترة الرابعة", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 205"}
    ],
    "الخميس": [
      {"period": "الفترة الرابعة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"}
    ]
  }
};

// AI department schedule data (5 sections)
export const aiScheduleData: AllSchedules = {
  "1": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 2"},
      {"period": "الفترة الثانية", "subject": "Statistics", "instructor": "T.A - Adel", "location": "مدرج 2"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "Computer Programming", "instructor": "T.A - Asmaa Hassan", "location": "Lab 004"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الثانية", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "Logic Design", "instructor": "T.A - Tasneem", "location": "Lab 304"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ]
  },
  "2": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 2"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 5"},
      {"period": "الفترة الثانية", "subject": "Computer Programming", "instructor": "T.A - Asmaa Hassan", "location": "Lab 103"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الثانية", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"},
      {"period": "الفترة الرابعة", "subject": "Logic Design", "instructor": "T.A - Tasneem", "location": "Lab 305"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "Statistics", "instructor": "T.A - Adel", "location": "مدرج 2"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ]
  },
  "3": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 203"},
      {"period": "الفترة الثانية", "subject": "Statistics", "instructor": "T.A - Adel", "location": "مدرج 2"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 5"},
      {"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 1"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الثانية", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A - Tasneem", "location": "Lab 305"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ]
  },
  "4": {
    "الأحد": [
      {"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 203"},
      {"period": "الفترة الثانية", "subject": "Logic Design", "instructor": "T.A - Aisha", "location": "Lab 304"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "Statistics", "instructor": "T.A - Adel", "location": "مدرج 1"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الثانية", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 3"}
    ],
    "الأربعاء": [
      {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ]
  },
  "5": {
    "الأحد": [
      {"period": "الفترة الثانية", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "مدرج 4"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Business Administration", "instructor": "Dr. Samah Mohmed", "location": "مدرج 1 اعلام"}
    ],
    "الإثنين": [
      {"period": "الفترة الأولى", "subject": "محاضرة Logic Design", "instructor": "Dr. Hayam Reda", "location": "مدرج 5"},
      {"period": "الفترة الثالثة", "subject": "Logic Design", "instructor": "T.A - Ahmed Hazem", "location": "Lab 305"}
    ],
    "الثلاثاء": [
      {"period": "الفترة الأولى", "subject": "محاضرة Statistics", "instructor": "Dr. Helmy", "location": "مدرج 4"},
      {"period": "الفترة الثانية", "subject": "محاضرة Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "مدرج 5"}
    ],
    "الأربعاء": [
      {"period": "الفترة الأولى", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 203"},
      {"period": "الفترة الثانية", "subject": "Statistics", "instructor": "T.A - Adel", "location": "مدرج 2"},
      {"period": "الفترة الثالثة", "subject": "محاضرة Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "مدرج 4"},
      {"period": "الفترة الرابعة", "subject": "محاضرة Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "مدرج 5"}
    ]
  }
};

// Legacy alias for backward compatibility
export const scheduleData = csScheduleData;
