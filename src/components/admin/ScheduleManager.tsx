import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useYear } from '@/hooks/use-year';
import { scheduleData, DAYS_ORDER, PERIODS_ORDER, ScheduleEntry } from '@/lib/schedule-data';

export const ScheduleManager = () => {
  const { year: currentYear } = useYear();
  const [selectedDept, setSelectedDept] = useState("1"); // 1: CS, 2: Cyber, 3: AI
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [selectedSection, setSelectedSection] = useState("1");
  
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);

  // In a real app, this would fetch from Supabase. 
  // For now we use the local structure.
  
  const handleLoadSchedule = () => {
    toast.info("جاري تحميل الجدول...");
    // Mock load
    setEntries([{ period: "الفترة الأولى", subject: "", instructor: "", location: "" }]);
  };

  const handleSave = () => {
    toast.success("تم حفظ الجدول بنجاح!");
  };

  const addEntry = () => {
    setEntries([...entries, { period: "الفترة الأولى", subject: "", instructor: "", location: "" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof ScheduleEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>إدارة جداول السكاشن (فرقة {selectedLevel})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>القسم</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">علوم حاسب (CS)</SelectItem>
                  <SelectItem value="2">أمن سيبراني (Cyber)</SelectItem>
                  <SelectItem value="3">ذكاء اصطناعي (AI)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>الفرقة</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">الفرقة الأولى</SelectItem>
                  <SelectItem value="2">الفرقة الثانية</SelectItem>
                  <SelectItem value="3">الفرقة الثالثة</SelectItem>
                  <SelectItem value="4">الفرقة الرابعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>السكشن</Label>
              <Input 
                type="number" 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                min="1"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleLoadSchedule} className="w-full">
                تحميل الجدول
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">المحاضرات / السكاشن</h3>
              <Button onClick={addEntry} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                إضافة مادة
              </Button>
            </div>

            {entries.map((entry, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border p-3 rounded-md bg-secondary/10">
                <div className="space-y-1">
                  <Label>الفترة</Label>
                  <Select value={entry.period} onValueChange={(val) => updateEntry(index, 'period', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PERIODS_ORDER.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>المادة</Label>
                  <Input value={entry.subject} onChange={(e) => updateEntry(index, 'subject', e.target.value)} placeholder="اسم المادة" />
                </div>
                <div className="space-y-1">
                  <Label>الدكتور / المعيد</Label>
                  <Input value={entry.instructor} onChange={(e) => updateEntry(index, 'instructor', e.target.value)} placeholder="الاسم" />
                </div>
                <div className="space-y-1">
                  <Label>المكان</Label>
                  <Input value={entry.location} onChange={(e) => updateEntry(index, 'location', e.target.value)} placeholder="مدرج / معمل" />
                </div>
                <Button variant="destructive" size="icon" onClick={() => removeEntry(index)} className="mb-0.5">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {entries.length > 0 && (
              <Button onClick={handleSave} className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                حفظ الجدول
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
