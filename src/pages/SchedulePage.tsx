import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { csScheduleData, cyberScheduleData, aiScheduleData, DAYS_ORDER, PERIODS_ORDER, ScheduleEntry, AllSchedules } from "@/lib/schedule-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, CalendarDays, Merge, Sparkles, Pencil, X, Check, Trash2, Monitor, Brain, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import html2canvas from "html2canvas";

interface MergedEntry extends ScheduleEntry {
  sections: string[];
}

interface EditingCell {
  day: string;
  period: string;
  subject: string;
  instructor: string;
  location: string;
}

type ScheduleDept = "cs" | "cyber" | "ai";

const DEPT_SCHEDULES: Record<ScheduleDept, AllSchedules> = {
  cs: csScheduleData,
  cyber: cyberScheduleData,
  ai: aiScheduleData,
};

const SchedulePage = () => {
  const { t, tSubject, lang } = useI18n();
  const deptContext = localStorage.getItem("cic_dept_context"); // "cs" or "ai_cyber"
  const isCSOnly = deptContext === "cs";
  const isAICyber = deptContext === "ai_cyber";

  const getDefaultDept = (): ScheduleDept => {
    if (isCSOnly) return "cs";
    if (isAICyber) return "cyber";
    return "cs";
  };

  const [selectedDept, setSelectedDept] = useState<ScheduleDept>(getDefaultDept);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCommon, setShowCommon] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [customEdits, setCustomEdits] = useState<Record<string, MergedEntry | null>>({});
  const [activeTab, setActiveTab] = useState("sections");
  const [selectedDayCombos, setSelectedDayCombos] = useState<string[] | null>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  
  const scheduleRef = useRef<HTMLDivElement>(null);
  const commonScheduleRef = useRef<HTMLDivElement>(null);
  const optimizedScheduleRef = useRef<HTMLDivElement>(null);
  
  const currentScheduleData = DEPT_SCHEDULES[selectedDept];
  const allSections = Object.keys(currentScheduleData);
  const hasData = allSections.length > 0;

  const handleDeptChange = (dept: ScheduleDept) => {
    setSelectedDept(dept);
    setSelected([]);
    setShowCommon(false);
    setSelectedDayCombos(null);
    setCustomEdits({});
  };

  const toggleSection = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setShowCommon(false);
    setSelectedDayCombos(null);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === allSections.length ? [] : [...allSections]);
    setShowCommon(false);
    setSelectedDayCombos(null);
  };

  // Generate common schedule by merging selected sections
  const commonScheduleData = useMemo(() => {
    if (selected.length < 2) return null;
    
    const merged: Record<string, Record<string, MergedEntry[]>> = {};
    
    DAYS_ORDER.forEach(day => {
      merged[day] = {};
      PERIODS_ORDER.forEach(period => {
        merged[day][period] = [];
      });
    });
    
    selected.forEach(sec => {
      const sectionData = currentScheduleData[sec];
      if (!sectionData) return;
      
      DAYS_ORDER.forEach(day => {
        const dayEntries = sectionData[day] || [];
        dayEntries.forEach(entry => {
          const existing = merged[day][entry.period].find(
            e => e.subject === entry.subject && e.instructor === entry.instructor && e.location === entry.location
          );
          if (existing) {
            if (!existing.sections.includes(sec)) {
              existing.sections.push(sec);
            }
          } else {
            merged[day][entry.period].push({
              ...entry,
              sections: [sec]
            });
          }
        });
      });
    });
    
    return merged;
  }, [selected]);

  // Smart optimizer: find valid day combinations that cover ALL subjects (lectures + sections)
  // Without being tied to a specific section - pick from ANY available section
  const dayComboAnalysis = useMemo(() => {
    // Get base subject name (without محاضرة prefix)
    const getBaseSubject = (subject: string) => {
      if (subject.startsWith("محاضرة ")) {
        return subject.slice("محاضرة ".length).trim();
      }
      return subject.trim();
    };

    // Collect all unique base subjects
    const allSubjects = new Set<string>();
    // For each subject, track which days have lectures and which have sections
    const lectureDays: Record<string, Set<string>> = {};
    const sectionDays: Record<string, Set<string>> = {};

    Object.values(currentScheduleData).forEach(sectionData => {
      DAYS_ORDER.forEach(day => {
        const dayEntries = sectionData[day] || [];
        dayEntries.forEach(entry => {
          const base = getBaseSubject(entry.subject);
          allSubjects.add(base);
          
          if (entry.subject.startsWith("محاضرة ")) {
            if (!lectureDays[base]) lectureDays[base] = new Set();
            lectureDays[base].add(day);
          } else {
            if (!sectionDays[base]) sectionDays[base] = new Set();
            sectionDays[base].add(day);
          }
        });
      });
    });

    // Generate all possible N-day combinations
    const generateCombos = (size: number) => {
      const combos: string[][] = [];
      const recurse = (start: number, current: string[]) => {
        if (current.length === size) {
          combos.push([...current]);
          return;
        }
        for (let i = start; i < DAYS_ORDER.length; i++) {
          current.push(DAYS_ORDER[i]);
          recurse(i + 1, current);
          current.pop();
        }
      };
      recurse(0, []);
      return combos;
    };

    // A combo is valid if for EACH subject:
    // - At least one day in combo has a lecture for that subject
    // - At least one day in combo has a section for that subject
    const isValidCombo = (combo: string[]) => {
      for (const subject of allSubjects) {
        const hasLecture = lectureDays[subject] && combo.some(d => lectureDays[subject].has(d));
        const hasSection = sectionDays[subject] && combo.some(d => sectionDays[subject].has(d));
        
        // If a subject only has lectures (no sections) or only sections (no lectures), just check what exists
        const lectureExists = lectureDays[subject] && lectureDays[subject].size > 0;
        const sectionExists = sectionDays[subject] && sectionDays[subject].size > 0;
        
        if (lectureExists && !hasLecture) return false;
        if (sectionExists && !hasSection) return false;
      }
      return true;
    };

    const valid3Day = generateCombos(3).filter(isValidCombo);
    const valid4Day = generateCombos(4).filter(isValidCombo);

    return { valid3Day, valid4Day, allSubjects: Array.from(allSubjects), lectureDays, sectionDays };
  }, []);

  // Generate ALL optimized schedules - NO CONFLICTS (only ONE class per time slot)
  const allOptimizedSchedules = useMemo(() => {
    if (!selectedDayCombos) return [];

    const getBaseSubject = (subject: string) => {
      if (subject.startsWith("محاضرة ")) {
        return subject.slice("محاضرة ".length).trim();
      }
      return subject.trim();
    };

    // Collect all requirements: each subject needs a lecture + section
    const requirements: Array<{
      base: string;
      type: "lecture" | "section";
      options: Array<{ day: string; period: string; entry: ScheduleEntry; section: string }>;
    }> = [];

    const allSubjects = new Set<string>();
    
    // First pass: identify all subjects
    Object.values(currentScheduleData).forEach(sectionData => {
      selectedDayCombos.forEach(day => {
        const dayEntries = sectionData[day] || [];
        dayEntries.forEach(entry => {
          allSubjects.add(getBaseSubject(entry.subject));
        });
      });
    });

    // Second pass: collect options for each subject/type
    allSubjects.forEach(base => {
      const lectureOptions: Array<{ day: string; period: string; entry: ScheduleEntry; section: string }> = [];
      const sectionOptions: Array<{ day: string; period: string; entry: ScheduleEntry; section: string }> = [];
      
      // Track unique options (same day, period, instructor = same option)
      const seenLectures = new Set<string>();
      const seenSections = new Set<string>();

      Object.entries(currentScheduleData).forEach(([sec, sectionData]) => {
        selectedDayCombos.forEach(day => {
          const dayEntries = sectionData[day] || [];
          dayEntries.forEach(entry => {
            if (getBaseSubject(entry.subject) === base) {
              const opt = { day, period: entry.period, entry, section: sec };
              const uniqueKey = `${day}-${entry.period}-${entry.instructor}`;
              
              if (entry.subject.startsWith("محاضرة ")) {
                if (!seenLectures.has(uniqueKey)) {
                  seenLectures.add(uniqueKey);
                  lectureOptions.push(opt);
                }
              } else {
                if (!seenSections.has(uniqueKey)) {
                  seenSections.add(uniqueKey);
                  sectionOptions.push(opt);
                }
              }
            }
          });
        });
      });

      if (lectureOptions.length > 0) {
        requirements.push({ base, type: "lecture", options: lectureOptions });
      }
      if (sectionOptions.length > 0) {
        requirements.push({ base, type: "section", options: sectionOptions });
      }
    });

    // Backtracking to find ALL valid assignments with no conflicts
    const allResults: Array<Array<{ day: string; period: string; entry: ScheduleEntry; section: string }>> = [];
    const currentAssignment: Array<{ day: string; period: string; entry: ScheduleEntry; section: string }> = [];
    const usedSlots = new Set<string>();

    const backtrackAll = (reqIndex: number): void => {
      if (reqIndex === requirements.length) {
        // Found a valid assignment - save a copy
        allResults.push([...currentAssignment]);
        return;
      }

      const req = requirements[reqIndex];
      for (const opt of req.options) {
        const slotKey = `${opt.day}-${opt.period}`;
        if (!usedSlots.has(slotKey)) {
          // Try this option
          usedSlots.add(slotKey);
          currentAssignment.push(opt);

          backtrackAll(reqIndex + 1);

          // Backtrack
          currentAssignment.pop();
          usedSlots.delete(slotKey);
        }
      }
    };

    backtrackAll(0);

    // Convert each result to a schedule grid
    return allResults.map(assignment => {
      const merged: Record<string, Record<string, MergedEntry[]>> = {};
      selectedDayCombos.forEach(day => {
        merged[day] = {};
        PERIODS_ORDER.forEach(period => {
          merged[day][period] = [];
        });
      });

      assignment.forEach(({ day, period, entry, section }) => {
        merged[day][period].push({
          ...entry,
          sections: [section]
        });
      });

      return merged;
    });
  }, [selectedDayCombos]);

  // Reset index when day combos change
  useEffect(() => {
    setSelectedScheduleIndex(0);
  }, [selectedDayCombos]);

  const optimizedSchedule = allOptimizedSchedules[selectedScheduleIndex] || null;

  const handleDownload = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    try {
      const isMobileDevice = window.innerWidth < 768;
      const canvas = await html2canvas(ref.current, {
        scale: isMobileDevice ? 1 : 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `CIC-${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const periodLabel = (p: string) => {
    if (lang === "en") {
      const map: Record<string, string> = {
        "الفترة الأولى": "1st Period (Slots 1-2)",
        "الفترة الثانية": "2nd Period (Slots 3-4)",
        "الفترة الثالثة": "3rd Period (Slots 5-6)",
        "الفترة الرابعة": "4th Period (Slots 7-8)",
      };
      return map[p] || p;
    }
    return p;
  };

  const dayLabel = (d: string) => {
    if (lang === "en") {
      const map: Record<string, string> = {
        "الأحد": "Sun", "الإثنين": "Mon", "الثلاثاء": "Tue",
        "الأربعاء": "Wed", "الخميس": "Thu",
      };
      return map[d] || d;
    }
    return d;
  };

  const handleCellClick = (day: string, period: string, entry: ScheduleEntry | MergedEntry | null) => {
    if (!editMode || !entry) return;
    setEditingCell({
      day,
      period,
      subject: entry.subject,
      instructor: entry.instructor,
      location: entry.location,
    });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.period}`;
    setCustomEdits(prev => ({
      ...prev,
      [key]: {
        period: editingCell.period,
        subject: editingCell.subject,
        instructor: editingCell.instructor,
        location: editingCell.location,
        sections: [],
      }
    }));
    setEditingCell(null);
  };

  const handleDeleteCell = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.period}`;
    setCustomEdits(prev => ({
      ...prev,
      [key]: null
    }));
    setEditingCell(null);
  };

  const getEditedEntry = (day: string, period: string, original: MergedEntry | null): MergedEntry | null => {
    const key = `${day}-${period}`;
    if (key in customEdits) {
      return customEdits[key];
    }
    return original;
  };

  // Common schedule table renderer
  const renderCommonTable = (data: Record<string, Record<string, MergedEntry[]>>, days: string[], showSection = false) => (
    <table className="w-full text-sm border-collapse min-w-[600px]">
      <thead>
        <tr>
          <th className="p-2 text-start border-b border-border text-muted-foreground font-medium">
            {lang === "ar" ? "اليوم / الفترة" : "Day / Period"}
          </th>
          {PERIODS_ORDER.map(p => (
            <th key={p} className="p-2 text-center border-b border-border text-muted-foreground font-medium text-xs">
              {periodLabel(p)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day} className="border-b border-border/30">
            <td className="p-2 font-semibold text-foreground whitespace-nowrap">{dayLabel(day)}</td>
            {PERIODS_ORDER.map(period => {
              const entries = data[day]?.[period] || [];
              const displayEntry = entries.length > 0 ? getEditedEntry(day, period, entries[0]) : null;
              
              return (
                <td 
                  key={period} 
                  className={`p-1.5 text-center ${editMode ? 'cursor-pointer hover:bg-primary/5' : ''}`}
                  onClick={() => entries.length > 0 && handleCellClick(day, period, entries[0])}
                >
                  {displayEntry ? (
                    <div className="bg-primary/10 rounded-lg p-1.5 text-[11px] leading-tight relative">
                      {editMode && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Pencil className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="font-semibold text-foreground">{tSubject(displayEntry.subject)}</div>
                      <div className="text-muted-foreground">{displayEntry.instructor}</div>
                      <div className="text-primary text-[10px]">{displayEntry.location}</div>
                      {showSection && displayEntry.sections.length > 0 && (
                        <div className="text-xs mt-1 px-1.5 py-0.5 bg-primary/20 rounded text-primary font-medium inline-block">
                          {lang === "ar" ? `سكشن ${displayEntry.sections[0]}` : `Sec ${displayEntry.sections[0]}`}
                        </div>
                      )}
                      {entries.length > 1 && (
                        <div className="mt-1 pt-1 border-t border-border/30">
                          {entries.slice(1).map((e, i) => {
                            const editedE = getEditedEntry(day, `${period}-${i+1}`, e);
                            if (!editedE) return null;
                            return (
                              <div key={i} className="mt-1 pt-1 border-t border-dashed border-border/20">
                                <div className="font-semibold text-foreground">{tSubject(editedE.subject)}</div>
                                <div className="text-muted-foreground">{editedE.instructor}</div>
                                <div className="text-primary text-[10px]">{editedE.location}</div>
                                {showSection && editedE.sections.length > 0 && (
                                  <div className="text-xs mt-1 px-1.5 py-0.5 bg-primary/20 rounded text-primary font-medium inline-block">
                                    {lang === "ar" ? `سكشن ${editedE.sections[0]}` : `Sec ${editedE.sections[0]}`}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Light theme export renderer
  const renderExportTable = (data: Record<string, Record<string, MergedEntry[]>>, days: string[], title: string) => (
    <div ref={commonScheduleRef} style={{ backgroundColor: "#ffffff", padding: "32px", fontFamily: "'Cairo', sans-serif", direction: "rtl", minWidth: "900px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0891b2", margin: 0 }}>CIC</h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>CA Interactive Cloud</p>
      </div>
      
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", textAlign: "start", color: "#334155" }}>
              اليوم / الفترة
            </th>
            {PERIODS_ORDER.map(p => (
              <th key={p} style={{ padding: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", textAlign: "center", color: "#334155", fontSize: "11px" }}>
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td style={{ padding: "8px", border: "1px solid #e2e8f0", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{day}</td>
              {PERIODS_ORDER.map(period => {
                const entries = data[day]?.[period] || [];
                const displayEntry = entries.length > 0 ? getEditedEntry(day, period, entries[0]) : null;
                return (
                  <td key={period} style={{ padding: "6px", border: "1px solid #e2e8f0", textAlign: "center", verticalAlign: "top" }}>
                    {displayEntry ? (
                      <div style={{ backgroundColor: "#f0f9ff", borderRadius: "6px", padding: "6px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "11px" }}>{tSubject(displayEntry.subject)}</div>
                        <div style={{ color: "#64748b", fontSize: "10px" }}>{displayEntry.instructor}</div>
                        <div style={{ color: "#0891b2", fontSize: "10px" }}>{displayEntry.location}</div>
                        {entries.length > 1 && entries.slice(1).map((e, i) => {
                          const editedE = getEditedEntry(day, `${period}-${i+1}`, e);
                          if (!editedE) return null;
                          return (
                            <div key={i} style={{ marginTop: "4px", paddingTop: "4px", borderTop: "1px dashed #e2e8f0" }}>
                              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "11px" }}>{tSubject(editedE.subject)}</div>
                              <div style={{ color: "#64748b", fontSize: "10px" }}>{editedE.instructor}</div>
                              <div style={{ color: "#0891b2", fontSize: "10px" }}>{editedE.location}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#475569" }}>
        {title}
      </div>
      <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
        CIC — CA Interactive Cloud © {new Date().getFullYear()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">{t("schedule.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("schedule.subtitle")}</p>
        </motion.div>

        {/* Department Toggle - Hidden for CS-only context */}
        {!isCSOnly && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card rounded-2xl p-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">{t("schedule.selectDept")}</p>
            <div className="flex gap-2 flex-wrap">
              {!isAICyber && (
                <Button variant={selectedDept === "cs" ? "default" : "outline"} size="sm" onClick={() => handleDeptChange("cs")} className="gap-2">
                  <Monitor className="w-4 h-4" /> {t("schedule.csDept")}
                </Button>
              )}
              <Button variant={selectedDept === "cyber" ? "default" : "outline"} size="sm" onClick={() => handleDeptChange("cyber")} className="gap-2">
                <Shield className="w-4 h-4" /> {t("schedule.cyberDept")}
              </Button>
              <Button variant={selectedDept === "ai" ? "default" : "outline"} size="sm" onClick={() => handleDeptChange("ai")} className="gap-2">
                <Brain className="w-4 h-4" /> {t("schedule.aiDept")}
              </Button>
            </div>
          </motion.div>
        )}

        {!hasData ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 text-primary/30" />
            <p className="text-lg font-display font-semibold text-muted-foreground">{t("schedule.aiScheduleEmpty")}</p>
          </motion.div>
        ) : (

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sections" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              {t("schedule.selectSections")}
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="gap-2">
              <Sparkles className="w-4 h-4" />
              {t("schedule.smartOptimizer")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Checkbox
                    checked={selected.length === allSections.length}
                    onCheckedChange={toggleAll}
                  />
                  {t("schedule.allSections")}
                </label>
                <div className="h-4 w-px bg-border" />
                {allSections.map(s => (
                  <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <Checkbox checked={selected.includes(s)} onCheckedChange={() => toggleSection(s)} />
                    {t("schedule.section")} {s}
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {selected.length > 0 && (
                  <>
                    <Button 
                      variant={editMode ? "default" : "outline"}
                      onClick={() => setEditMode(!editMode)} 
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      {editMode ? t("schedule.editModeOn") : t("schedule.editMode")}
                    </Button>
                    
                    {!editMode && (
                      <Button onClick={() => handleDownload(scheduleRef, `Schedule-${selected.join("-")}`)} className="gap-2">
                        <Download className="w-4 h-4" /> {t("schedule.download")}
                      </Button>
                    )}
                  </>
                )}
                
                {selected.length > 1 && (
                  <Button 
                    variant={showCommon ? "default" : "secondary"} 
                    onClick={() => setShowCommon(!showCommon)} 
                    className="gap-2"
                  >
                    <Merge className="w-4 h-4" /> {t("schedule.commonSchedule")}
                  </Button>
                )}
              </div>
              
              {editMode && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-primary">
                  {t("schedule.clickToEdit")}
                </div>
              )}
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
              {editingCell && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setEditingCell(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-card rounded-2xl p-6 w-full max-w-md"
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold mb-4">{t("schedule.editMode")}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground">{lang === "ar" ? "المادة" : "Subject"}</label>
                        <input
                          type="text"
                          value={editingCell.subject}
                          onChange={e => setEditingCell({ ...editingCell, subject: e.target.value })}
                          className="w-full mt-1 p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">{lang === "ar" ? "المحاضر" : "Instructor"}</label>
                        <input
                          type="text"
                          value={editingCell.instructor}
                          onChange={e => setEditingCell({ ...editingCell, instructor: e.target.value })}
                          className="w-full mt-1 p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">{lang === "ar" ? "المكان" : "Location"}</label>
                        <input
                          type="text"
                          value={editingCell.location}
                          onChange={e => setEditingCell({ ...editingCell, location: e.target.value })}
                          className="w-full mt-1 p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button variant="destructive" onClick={handleDeleteCell} className="gap-2">
                        <Trash2 className="w-4 h-4" /> {t("schedule.deleteCell")}
                      </Button>
                      <div className="flex-1" />
                      <Button variant="outline" onClick={() => setEditingCell(null)}>
                        {t("schedule.cancelEdit")}
                      </Button>
                      <Button onClick={handleSaveEdit} className="gap-2">
                        <Check className="w-4 h-4" /> {t("schedule.saveEdit")}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {selected.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-3">
                <CalendarDays className="w-12 h-12 opacity-30" />
                <p>{t("schedule.noSelection")}</p>
              </div>
            ) : showCommon && commonScheduleData ? (
              <>
                {/* Common Schedule View */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-4 overflow-x-auto mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-lg text-primary">
                      {t("schedule.commonTitle")}: {t("schedule.sectionsLabel")} {selected.sort((a, b) => Number(a) - Number(b)).join(" و ")}
                    </h3>
                    {!editMode && (
                      <Button size="sm" onClick={() => handleDownload(commonScheduleRef, `Common-${selected.join("-")}`)} className="gap-2">
                        <Download className="w-4 h-4" /> {t("schedule.download")}
                      </Button>
                    )}
                  </div>
                  {renderCommonTable(commonScheduleData, DAYS_ORDER)}
                </motion.div>

                {/* Hidden export container */}
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                  {renderExportTable(commonScheduleData, DAYS_ORDER, `جدول مشترك: سكشن ${selected.sort((a, b) => Number(a) - Number(b)).join(" و ")}`)}
                </div>
              </>
            ) : (
              <>
                {/* Individual Section Schedules */}
                <div className="space-y-6 mb-8">
                  {selected.sort((a, b) => Number(a) - Number(b)).map(sec => {
                    const data = currentScheduleData[sec];
                    const mergedData: Record<string, Record<string, MergedEntry[]>> = {};
                    DAYS_ORDER.forEach(day => {
                      mergedData[day] = {};
                      PERIODS_ORDER.forEach(period => {
                        const entries = (data[day] || []).filter(e => e.period === period);
                        mergedData[day][period] = entries.map(e => ({ ...e, sections: [sec] }));
                      });
                    });
                    
                    return (
                      <motion.div key={sec} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-4 overflow-x-auto">
                        <h3 className="font-display font-bold text-lg mb-3 text-primary">
                          {t("schedule.sectionSchedule")} {sec}
                        </h3>
                        {renderCommonTable(mergedData, DAYS_ORDER)}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Hidden white container for image export */}
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                  <div ref={scheduleRef} style={{ backgroundColor: "#ffffff", padding: "32px", fontFamily: "'Cairo', sans-serif", direction: "rtl", minWidth: "900px" }}>
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0891b2", margin: 0 }}>CIC</h1>
                      <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>CA Interactive Cloud</p>
                    </div>

                    {selected.sort((a, b) => Number(a) - Number(b)).map(sec => {
                      const data = currentScheduleData[sec];
                      return (
                        <div key={sec} style={{ marginBottom: "32px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                            <thead>
                              <tr>
                                <th style={{ padding: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", textAlign: "start", color: "#334155" }}>
                                  اليوم / الفترة
                                </th>
                                {PERIODS_ORDER.map(p => (
                                  <th key={p} style={{ padding: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", textAlign: "center", color: "#334155", fontSize: "11px" }}>
                                    {p}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {DAYS_ORDER.map(day => {
                                const dayEntries = data[day] || [];
                                return (
                                  <tr key={day}>
                                    <td style={{ padding: "8px", border: "1px solid #e2e8f0", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{day}</td>
                                    {PERIODS_ORDER.map(period => {
                                      const entry = dayEntries.find(e => e.period === period);
                                      const key = `${day}-${period}`;
                                      const edited = customEdits[key];
                                      const displayEntry = key in customEdits ? edited : entry;
                                      return (
                                        <td key={period} style={{ padding: "6px", border: "1px solid #e2e8f0", textAlign: "center", verticalAlign: "top" }}>
                                          {displayEntry ? (
                                            <div style={{ backgroundColor: "#f0f9ff", borderRadius: "6px", padding: "6px" }}>
                                              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "11px" }}>{tSubject(displayEntry.subject)}</div>
                                              <div style={{ color: "#64748b", fontSize: "10px" }}>{displayEntry.instructor}</div>
                                              <div style={{ color: "#0891b2", fontSize: "10px" }}>{displayEntry.location}</div>
                                            </div>
                                          ) : null}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <div style={{ textAlign: "center", marginTop: "8px", fontSize: "14px", fontWeight: 700, color: "#475569" }}>
                            جدول سكشن {sec}
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "#94a3b8" }}>
                      CIC — CA Interactive Cloud © {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="optimizer">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-display font-bold">{t("schedule.smartOptimizer")}</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                {lang === "ar" 
                  ? "اختر تركيبة أيام لعرض جدول يغطي كل المواد (محاضرات + سكاشن) من أي سكشن متاح"
                  : "Select a day combination to view a schedule covering all subjects (lectures + sections) from any available section"
                }
              </p>

              {/* 3-Day Combinations */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-primary">{t("schedule.threeDays")}</h3>
                {dayComboAnalysis.valid3Day.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dayComboAnalysis.valid3Day.map((combo, i) => (
                      <Button
                        key={i}
                        variant={selectedDayCombos?.join(",") === combo.join(",") ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDayCombos(combo)}
                        className="text-xs"
                      >
                        {combo.map(d => dayLabel(d)).join(" - ")}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("schedule.noCombos")}</p>
                )}
              </div>

              {/* 4-Day Combinations */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-primary">{t("schedule.fourDays")}</h3>
                {dayComboAnalysis.valid4Day.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dayComboAnalysis.valid4Day.map((combo, i) => (
                      <Button
                        key={i}
                        variant={selectedDayCombos?.join(",") === combo.join(",") ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDayCombos(combo)}
                        className="text-xs"
                      >
                        {combo.map(d => dayLabel(d)).join(" - ")}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("schedule.noCombos")}</p>
                )}
              </div>
            </motion.div>

            {/* Optimized Schedule Display */}
            {selectedDayCombos && allOptimizedSchedules.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 mb-8 text-center">
                <div className="text-destructive text-lg font-bold mb-2">
                  {lang === "ar" ? "⚠️ تعذّر إنشاء جدول بدون تعارضات" : "⚠️ Cannot create conflict-free schedule"}
                </div>
                <p className="text-muted-foreground">
                  {lang === "ar" 
                    ? "هذه التركيبة من الأيام لا تسمح بحضور كل المواد بدون تعارض في الفترات. جرّب تركيبة أخرى."
                    : "This day combination doesn't allow attending all subjects without time conflicts. Try another combination."
                  }
                </p>
              </motion.div>
            )}

            {selectedDayCombos && optimizedSchedule && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4 overflow-x-auto mb-8">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-display font-bold text-lg text-primary">
                    {t("schedule.generateOptimized")}: {selectedDayCombos.map(d => dayLabel(d)).join(" - ")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleDownload(optimizedScheduleRef, `Optimized-${selectedDayCombos.join("-")}-${selectedScheduleIndex + 1}`)} className="gap-2">
                      <Download className="w-4 h-4" /> {t("schedule.download")}
                    </Button>
                  </div>
                </div>

                {/* Navigation between schedules */}
                {allOptimizedSchedules.length > 1 && (
                  <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-primary/5 rounded-xl">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedScheduleIndex <= 0}
                      onClick={() => setSelectedScheduleIndex(prev => prev - 1)}
                    >
                      {lang === "ar" ? "← السابق" : "← Previous"}
                    </Button>
                    <span className="text-sm font-semibold text-foreground">
                      {lang === "ar" 
                        ? `الاحتمال ${selectedScheduleIndex + 1} من ${allOptimizedSchedules.length}`
                        : `Option ${selectedScheduleIndex + 1} of ${allOptimizedSchedules.length}`
                      }
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedScheduleIndex >= allOptimizedSchedules.length - 1}
                      onClick={() => setSelectedScheduleIndex(prev => prev + 1)}
                    >
                      {lang === "ar" ? "التالي →" : "Next →"}
                    </Button>
                  </div>
                )}

                {renderCommonTable(optimizedSchedule, selectedDayCombos, true)}
                
                {/* Hidden export container */}
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                  <div ref={optimizedScheduleRef} style={{ backgroundColor: "#ffffff", padding: "32px", fontFamily: "'Cairo', sans-serif", direction: "rtl", minWidth: "900px" }}>
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0891b2", margin: 0 }}>CIC</h1>
                      <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>CA Interactive Cloud</p>
                    </div>
                    
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", textAlign: "start", color: "#334155" }}>
                            اليوم / الفترة
                          </th>
                          {PERIODS_ORDER.map(p => (
                            <th key={p} style={{ padding: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", textAlign: "center", color: "#334155", fontSize: "11px" }}>
                              {p}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDayCombos.map(day => (
                          <tr key={day}>
                            <td style={{ padding: "8px", border: "1px solid #e2e8f0", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{day}</td>
                            {PERIODS_ORDER.map(period => {
                              const entries = optimizedSchedule[day]?.[period] || [];
                              return (
                                <td key={period} style={{ padding: "6px", border: "1px solid #e2e8f0", textAlign: "center", verticalAlign: "top" }}>
                                  {entries.length > 0 ? (
                                    <div style={{ backgroundColor: "#f0f9ff", borderRadius: "6px", padding: "6px" }}>
                                      {entries.map((e, i) => (
                                        <div key={i} style={i > 0 ? { marginTop: "4px", paddingTop: "4px", borderTop: "1px dashed #e2e8f0" } : {}}>
                                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "11px" }}>{tSubject(e.subject)}</div>
                                          <div style={{ color: "#64748b", fontSize: "10px" }}>{e.instructor}</div>
                                          <div style={{ color: "#0891b2", fontSize: "10px" }}>{e.location}</div>
                                          {e.sections.length > 0 && (
                                            <div style={{ fontSize: "9px", marginTop: "4px", padding: "2px 6px", backgroundColor: "#0891b233", borderRadius: "4px", color: "#0891b2", fontWeight: 600, display: "inline-block" }}>
                                              سكشن {e.sections[0]}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#475569" }}>
                      جدول محسن: {selectedDayCombos.join(" - ")} — احتمال {selectedScheduleIndex + 1} من {allOptimizedSchedules.length}
                    </div>
                    <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                      CIC — CA Interactive Cloud © {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
