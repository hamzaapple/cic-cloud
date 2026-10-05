export interface ScheduleEntry {
  period: string;
  subject: string;
  instructor: string;
  location: string;
}

export type SectionSchedule = Record<string, ScheduleEntry[]>;
export type AllSchedules = Record<string, SectionSchedule>;

export const DAYS_ORDER = ["╪د┘╪ث╪ص╪»", "╪د┘╪ح╪س┘┘è┘", "╪د┘╪س┘╪د╪س╪د╪ة", "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة", "╪د┘╪«┘à┘è╪│"];
export const PERIODS_ORDER = ["╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر"];

// CS Department schedule data (14 sections)
export const csScheduleData: AllSchedules = {
  "1": { "╪د┘╪ث╪ص╪»": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Intro to IS", "instructor": "T.A Rowyda", "location": "Lab 205"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "┘à╪»╪▒╪ش 3"}], "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Roaa", "location": "Lab 203 Al"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 2"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Logic Design", "instructor": "T.A Elzahraa", "location": "Lab 305"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "2": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "┘à╪»╪▒╪ش 2"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A Elzahraa", "location": "Lab 304"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 6"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Intro to IS", "instructor": "T.A Salma", "location": "Lab 002"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Roaa", "location": "Lab 002"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "3": { "╪د┘╪ث╪ص╪»": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "┘à╪»╪▒╪ش 1"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 6"}], "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 205"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A Elzahraa", "location": "Lab 305"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 205"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "4": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 103"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Intro to IS", "instructor": "T.A Aisha", "location": "Lab 102"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 6"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A Ahmed", "location": "Lab 304"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 6"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "5": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Intro to IS", "instructor": "T.A Aisha", "location": "Lab 004"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A Ahmed Gamal", "location": "Lab 304"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 004"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 2"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 2"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "6": { "╪د┘╪ث╪ص╪»": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 6"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 5"}], "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A Ahmed Gamal", "location": "Lab 305"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 303"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 303"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "7": { "╪د┘╪ث╪ص╪»": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 6"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A Ahmed", "location": "Lab 305"}], "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 104"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 1"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Rehab", "location": "Lab 104"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 7"}] },
  "8": { "╪د┘╪ث╪ص╪»": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A Ahmed Hasanein", "location": "Lab 305"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Linear Algebra", "instructor": "T.A Eman", "location": "┘à╪»╪▒╪ش 6"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Intro to IS", "instructor": "T.A Salma Tarek", "location": "Lab 002"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Roaa", "location": "Lab 103"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Discrete Math", "instructor": "T.A Alaa Mohamed", "location": "┘à╪»╪▒╪ش 5"}] },
  "9": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Hend", "location": "Lab 203"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Intro to IS", "instructor": "T.A Ahmed Hasanein", "location": "Lab 105"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "┘à╪»╪▒╪ش 4"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "┘à╪»╪▒╪ش 1"}] },
  "10": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A Wafaa", "location": "Lab 219 Al"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "┘à╪»╪▒╪ش 2"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Intro to IS", "instructor": "T.A Alaa Magdy", "location": "Lab 101"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "┘à╪»╪▒╪ش 1"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}] },
  "11": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "┘à╪»╪▒╪ش 1"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Intro to IS", "instructor": "T.A Alaa Magdy", "location": "Lab 103"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "┘à╪»╪▒╪ش 1"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Computer Programming", "instructor": "T.A Wafaa", "location": "Lab 002"}] },
  "12": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A Hossam", "location": "Lab 304"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Linear Algebra", "instructor": "T.A Adel", "location": "┘à╪»╪▒╪ش 2"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "┘à╪»╪▒╪ش 4"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A Hend", "location": "Lab 201 Al"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Intro to IS", "instructor": "T.A Alaa Magdy", "location": "Lab 303"}] },
  "13": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A Ahmed Hasanein", "location": "Lab 304"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Discrete Math", "instructor": "T.A Ahmed Hazem", "location": "┘à╪»╪▒╪ش 4"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Computer Programming", "instructor": "T.A Hend", "location": "Lab 104"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Intro to IS", "instructor": "T.A Ahmed Hasanein", "location": "Lab 303"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Linear Algebra", "instructor": "T.A Eman", "location": "┘à╪»╪▒╪ش 6"}] },
  "14": { "╪د┘╪ح╪س┘┘è┘": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A Wafaa", "location": "Lab 203 Al"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Linear Algebra", "instructor": "T.A Eman", "location": "┘à╪»╪▒╪ش 5"}], "╪د┘╪س┘╪د╪س╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr/Negm Shawky", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Intro to IS", "instructor": "Dr/Sameh Sherif", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr/Hamdy", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}], "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Discrete Math", "instructor": "T.A Doaa", "location": "┘à╪»╪▒╪ش 4"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Report Writing", "instructor": "Dr/Hayam Reda", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr/Salah", "location": "┘à╪»╪▒╪ش 7"}], "╪د┘╪«┘à┘è╪│": [{"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Discrete Math", "instructor": "Dr/Maher", "location": "┘à╪»╪▒╪ش 5 ╪د╪╣┘╪د┘à"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Logic Design", "instructor": "T.A Ahmed Hasanein", "location": "Lab 305"}, {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Intro to IS", "instructor": "T.A Ahmed Hasanein", "location": "Lab 004"}] },
};

// Cyber department schedule data (5 sections)
export const cyberScheduleData: AllSchedules = {
  "1": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 305"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Computer Programming", "instructor": "T.A - Wafaa", "location": "Lab 203"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "┘à╪»╪▒╪ش 1"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪«┘à┘è╪│": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"}
    ]
  },
  "2": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A - Wafaa", "location": "Lab 222-Al"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A - Adel", "location": "┘à╪»╪▒╪ش 3"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 305"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "┘à╪»╪▒╪ش 1"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪«┘à┘è╪│": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"}
    ]
  },
  "3": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 304"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A - Alaa Hassan", "location": "Lab 203"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪«┘à┘è╪│": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"}
    ]
  },
  "4": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "┘à╪»╪▒╪ش 1"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A - Alaa Hassan", "location": "Lab 222-Al"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 305"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 3"}
    ],
    "╪د┘╪«┘à┘è╪│": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"}
    ]
  },
  "5": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Statistics", "instructor": "T.A - Ahmed Hazem", "location": "┘à╪»╪▒╪ش 6"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Logic Design", "instructor": "T.A - Hadeer", "location": "Lab 304"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 205"}
    ],
    "╪د┘╪«┘à┘è╪│": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"}
    ]
  }
};

// AI department schedule data (5 sections)
export const aiScheduleData: AllSchedules = {
  "1": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 2"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Statistics", "instructor": "T.A - Adel", "location": "┘à╪»╪▒╪ش 2"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Computer Programming", "instructor": "T.A - Asmaa Hassan", "location": "Lab 004"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Logic Design", "instructor": "T.A - Tasneem", "location": "Lab 304"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ]
  },
  "2": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 2"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Computer Programming", "instructor": "T.A - Asmaa Hassan", "location": "Lab 103"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "Logic Design", "instructor": "T.A - Tasneem", "location": "Lab 305"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Statistics", "instructor": "T.A - Adel", "location": "┘à╪»╪▒╪ش 2"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ]
  },
  "3": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 203"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Statistics", "instructor": "T.A - Adel", "location": "┘à╪»╪▒╪ش 2"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 1"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A - Tasneem", "location": "Lab 305"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ]
  },
  "4": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 203"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Logic Design", "instructor": "T.A - Aisha", "location": "Lab 304"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Statistics", "instructor": "T.A - Adel", "location": "┘à╪»╪▒╪ش 1"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 3"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ]
  },
  "5": {
    "╪د┘╪ث╪ص╪»": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Linear Algebra", "instructor": "T.A - Eman", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Business Administration", "instructor": "Dr. Samah Mohmed", "location": "┘à╪»╪▒╪ش 1 ╪د╪╣┘╪د┘à"}
    ],
    "╪د┘╪ح╪س┘┘è┘": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Logic Design", "instructor": "Dr. Hayam Reda", "location": "┘à╪»╪▒╪ش 5"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "Logic Design", "instructor": "T.A - Ahmed Hazem", "location": "Lab 305"}
    ],
    "╪د┘╪س┘╪د╪س╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "┘à╪ص╪د╪╢╪▒╪ر Statistics", "instructor": "Dr. Helmy", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Linear Algebra", "instructor": "Dr. Mahmoud Gabr", "location": "┘à╪»╪▒╪ش 5"}
    ],
    "╪د┘╪ث╪▒╪ذ╪╣╪د╪ة": [
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪ث┘ê┘┘ë", "subject": "Computer Programming", "instructor": "T.A - Roaa", "location": "Lab 203"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘┘è╪ر", "subject": "Statistics", "instructor": "T.A - Adel", "location": "┘à╪»╪▒╪ش 2"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪س╪د┘╪س╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Computer Programming", "instructor": "Dr. Mohamed Hussien", "location": "┘à╪»╪▒╪ش 4"},
      {"period": "╪د┘┘╪ز╪▒╪ر ╪د┘╪▒╪د╪ذ╪╣╪ر", "subject": "┘à╪ص╪د╪╢╪▒╪ر Technical Report Writing", "instructor": "Dr. Sameh Sherif", "location": "┘à╪»╪▒╪ش 5"}
    ]
  }
};

// Legacy alias for backward compatibility
export const scheduleData = csScheduleData;
