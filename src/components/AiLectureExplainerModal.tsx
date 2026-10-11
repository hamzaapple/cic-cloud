import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Key,
  Download,
  CheckCircle2,
  XCircle,
  Share2,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  callGeminiApi,
  getCachedAiContent,
  setCachedAiContent,
  clearAiCacheForMaterial,
  hasGeminiApiKey,
  getGeminiApiKey,
  setGeminiApiKey,
  parseQuizFromMarkdown,
  getExternalModelUrls,
  type QuizQuestion,
} from "@/lib/gemini";
import type { Material, Course } from "@/lib/store";
import { playClickSfx } from "@/hooks/use-sfx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  course?: Course | null;
}

type TabType = "summary" | "explain" | "quiz" | "chat" | "external";

export const AiLectureExplainerModal: React.FC<Props> = ({
  open,
  onOpenChange,
  material,
  course,
}) => {
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // AI Content States
  const [summary, setSummary] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizText, setQuizText] = useState<string>("");

  // Quiz interactive state: questionIndex -> selectedOptionIndex
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  // Chat state
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Loading & Cache States
  const [loading, setLoading] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // API Key Settings Modal
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [inputKey, setInputKey] = useState(getGeminiApiKey());

  // Load cached content on open
  useEffect(() => {
    if (!open) return;

    const cachedSummary = getCachedAiContent(material.id, "summary");
    const cachedExplain = getCachedAiContent(material.id, "explain");
    const cachedQuiz = getCachedAiContent(material.id, "quiz");

    if (cachedSummary) setSummary(cachedSummary);
    if (cachedExplain) setExplanation(cachedExplain);
    if (cachedQuiz) {
      setQuizText(cachedQuiz);
      const parsed = parseQuizFromMarkdown(cachedQuiz);
      if (parsed.length > 0) setQuizQuestions(parsed);
    }

    // Auto-generate summary on open if not already loaded and API key is present
    if (!cachedSummary && hasGeminiApiKey()) {
      handleGenerate("summary");
    } else if (cachedSummary) {
      setIsFromCache(true);
    }
  }, [open, material.id]);

  const handleGenerate = async (type: TabType, forceRefresh = false) => {
    playClickSfx();
    if (!hasGeminiApiKey()) {
      setShowKeyDialog(true);
      return;
    }

    // Check cache first unless forced
    if (!forceRefresh) {
      const cached = getCachedAiContent(material.id, type);
      if (cached) {
        if (type === "summary") setSummary(cached);
        if (type === "explain") setExplanation(cached);
        if (type === "quiz") {
          setQuizText(cached);
          const parsed = parseQuizFromMarkdown(cached);
          if (parsed.length > 0) setQuizQuestions(parsed);
        }
        setIsFromCache(true);
        return;
      }
    }

    setLoading(true);
    setIsFromCache(false);

    try {
      let prompt = "";
      const courseName = course?.name ? ` في مقرر ${course.name}` : "";

      if (type === "summary") {
        prompt = `أنت أستاذ ومحاضر جامعي متميز. قم بعمل ملخص أكاديمي منظم ومتقن لهذه المحاضرة بعنوان "${material.title}"${courseName} باللغة العربية:
المطلوب:
1. 📌 نظرة عامة وفكرة المحاضرة الرئيسية في فقرة موجزة.
2. 🎯 أهم النقاط والمحاور الرئيسية (في نقاط واضحة ومنظمة بعناية).
3. 🔑 المصطلحات والمفاهيم الجوهرية مع تعريف مبسط لكل منها.
4. 💡 الخلاصة والنصيحة الدراسية للطالب.
اجعل الأسلوب مشجعاً وممتعاً واستخدم الرموز التعبيرية والتنسيق المنظم.`;
      } else if (type === "explain") {
        prompt = `بصفتك معلماً بارعاً يشرح للطلاب، قم بشرح محتوى هذه المحاضرة بعنوان "${material.title}"${courseName} بأسلوب مبسط وسلس للغاية باللغة العربية:
1. اشرح المفاهيم الصعبة كما لو كنت تشرحها لطالب في بداية دراسته.
2. اضرب أمثلة عملية واقعية وتشابيه توضيحية لتقريب الفكرة.
3. وضّح كيفية ترابط المواضيع ببعضها وكيف يفكر الأستاذ عند وضع الأسئلة حول هذه النقاط.`;
      } else if (type === "quiz") {
        prompt = `قم بإنشاء بنك أسئلة تدريبي تفاعلي مكوّن من 5 إلى 7 أسئلة اختيار من متعدد (MCQ) للمحاضرة "${material.title}"${courseName}.
يجب أن ترجع النتيجة حصراً بصيغة JSON داخل وسم كود \`\`\`json كالتالي:
[
  {
    "question": "نص السؤال هنا؟",
    "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
    "correctIndex": 0,
    "explanation": "شرح سبب صحة الإجابة ولماذا الخيارات الأخرى غير صحيحة"
  }
]
تأكد من أن الأسئلة تقيس الفهم العميق للمحاضرة وتغطي أهم أفكارها.`;
      }

      const result = await callGeminiApi({
        prompt,
        pdfUrl: material.pdf_url,
        listContent: material.list_content,
      });

      setCachedAiContent(material.id, type, result);

      if (type === "summary") setSummary(result);
      if (type === "explain") setExplanation(result);
      if (type === "quiz") {
        setQuizText(result);
        const parsed = parseQuizFromMarkdown(result);
        if (parsed.length > 0) {
          setQuizQuestions(parsed);
          setUserAnswers({});
          setShowExplanations({});
        }
      }

      toast.success(lang === "ar" ? "تم التحليل والتوليد بنجاح ✨" : "Generated successfully ✨");
    } catch (err: any) {
      console.error("AI Generation error:", err);
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        toast.error(
          lang === "ar"
            ? "تم الوصول للحد الأقصى لطلبات اليوم في الـ API. يمكنك استخدام تبويب 'النماذج الخارجية' مجاناً!"
            : "Rate limit reached. Try the External Models tab!"
        );
        setActiveTab("external");
      } else if (err.message === "INVALID_API_KEY" || err.message === "NO_API_KEY") {
        toast.error(lang === "ar" ? "يرجى التحقق من مفتاح Gemini API" : "Invalid Gemini API key");
        setShowKeyDialog(true);
      } else {
        toast.error(lang === "ar" ? "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" : "AI generation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Chat Submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    if (!hasGeminiApiKey()) {
      setShowKeyDialog(true);
      return;
    }

    const question = chatInput.trim();
    setChatInput("");
    const newHistory = [...chatMessages, { role: "user" as const, text: question }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const historyFormatted = chatMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const prompt = `سؤال الطالب حول المحاضرة "${material.title}":\n"${question}"\nأجب بدقة ووضوح باللغة العربية بناءً على محتوى المحاضرة.`;

      const reply = await callGeminiApi({
        prompt,
        pdfUrl: material.pdf_url,
        listContent: material.list_content,
        history: historyFormatted,
      });

      setChatMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err: any) {
      toast.error(lang === "ar" ? "فشل إرسال السؤال للذكاء الاصطناعي" : "Failed to get AI answer");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    playClickSfx();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(lang === "ar" ? "تم نسخ المحتوى بنجاح 📋" : "Content copied 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveApiKey = () => {
    if (inputKey.trim()) {
      setGeminiApiKey(inputKey.trim());
      setShowKeyDialog(false);
      toast.success(lang === "ar" ? "تم حفظ مفتاح Gemini بنجاح ✅" : "API key saved ✅");
      handleGenerate(activeTab);
    } else {
      setGeminiApiKey("");
      setShowKeyDialog(false);
      toast.info(lang === "ar" ? "تمت إزالة المفتاح" : "API key removed");
    }
  };

  const externalModels = getExternalModelUrls({
    title: material.title,
    courseName: course?.name,
    pdfUrl: material.pdf_url,
  });

  const handleLaunchExternal = (model: (typeof externalModels)[0]) => {
    playClickSfx();
    navigator.clipboard.writeText(model.prompt);
    toast.success(
      lang === "ar"
        ? `تم نسخ البرومبت ورابط المحاضرة! جاري فتح ${model.name}...`
        : `Prompt copied! Opening ${model.name}...`
    );
    window.open(model.url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/60 shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-5 pb-3 border-b border-border/40 bg-secondary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <DialogTitle className="font-display font-bold text-lg md:text-xl text-foreground">
                    {lang === "ar" ? "شرح وتلخيص المحاضرة بالذكاء الاصطناعي" : "AI Lecture Study & Explainer"}
                  </DialogTitle>
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-xl">
                  {course?.name ? `${course.name} — ` : ""}
                  <span className="font-medium text-foreground">{material.title}</span>
                </p>
              </div>

              {/* API Key settings & status */}
              <div className="flex items-center gap-2 shrink-0">
                {isFromCache && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Zap className="w-3 h-3" />
                    {lang === "ar" ? "محفوظ مسبقاً (0ms)" : "Cached (0ms)"}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyDialog(true)}
                  className="h-8 text-xs gap-1.5 bg-background/50 border-border/50"
                  title={lang === "ar" ? "إعدادات مفتاح Gemini API" : "Gemini API Settings"}
                >
                  <Key className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">
                    {hasGeminiApiKey() ? (lang === "ar" ? "مفتاح API مفعل" : "API Active") : (lang === "ar" ? "إدخال API" : "Set API Key")}
                  </span>
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 scrollbar-hide">
              {[
                { id: "summary", label: lang === "ar" ? "ملخص المحاضرة" : "Summary", icon: BookOpen },
                { id: "explain", label: lang === "ar" ? "تبسيط المفاهيم" : "Key Concepts", icon: Sparkles },
                { id: "quiz", label: lang === "ar" ? "اختبار وتدريب" : "Quiz & Practice", icon: HelpCircle },
                { id: "chat", label: lang === "ar" ? "اسأل المحاضرة" : "Chat with PDF", icon: MessageSquare },
                { id: "external", label: lang === "ar" ? "النماذج الخارجية" : "External AI Models", icon: ExternalLink },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playClickSfx();
                      setActiveTab(tab.id as TabType);
                      if (
                        (tab.id === "summary" && !summary) ||
                        (tab.id === "explain" && !explanation) ||
                        (tab.id === "quiz" && quizQuestions.length === 0)
                      ) {
                        handleGenerate(tab.id as TabType);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Banner if no API key and on internal tabs */}
            {!hasGeminiApiKey() && activeTab !== "external" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-500">
                    {lang === "ar" ? "💡 يمكنك تفعيل الشرح الفوري الداخلي أو استخدام النماذج الخارجية مباشرة!" : "💡 Enable in-app AI or use external models directly!"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {lang === "ar"
                      ? "لشرح المحاضرة هنا مباشرة، أدخل مفتاح Gemini API المجاني (بدون أي تكلفة من جوجل). أو انتقل لتبويب 'النماذج الخارجية' لفتح ChatGPT أو NotebookLM مجاناً بنقرة واحدة."
                      : "Enter your free Gemini API key to generate summaries here, or switch to External Models to use ChatGPT or NotebookLM for free."}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="default" onClick={() => setShowKeyDialog(true)} className="h-7 text-xs">
                    {lang === "ar" ? "إدخال المفتاح" : "Set Key"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("external")} className="h-7 text-xs">
                    {lang === "ar" ? "النماذج الخارجية" : "External"}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 1: SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {lang === "ar" ? "الملخص الأكاديمي الشامل" : "Comprehensive Summary"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {summary && (
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(summary)} className="h-8 text-xs gap-1">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {lang === "ar" ? "نسخ" : "Copy"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate("summary", true)}
                      disabled={loading}
                      className="h-8 text-xs gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      {lang === "ar" ? "إعادة التوليد" : "Regenerate"}
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{lang === "ar" ? "جاري قراءة وتلخيص المحاضرة بالذكاء الاصطناعي..." : "AI is analyzing and summarizing the lecture..."}</p>
                    <p className="text-xs text-muted-foreground">{lang === "ar" ? "يتم تلخيص النقاط الأساسية وتوضيح المفاهيم" : "Synthesizing key topics and core concepts"}</p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none p-5 rounded-2xl bg-secondary/30 border border-border/40 whitespace-pre-line leading-relaxed text-sm">
                    {summary}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground space-y-3">
                    <p className="text-sm">{lang === "ar" ? "اضغط على الزر أدناه لبدء تلخيص المحاضرة" : "Click below to generate lecture summary"}</p>
                    <Button onClick={() => handleGenerate("summary")}>{lang === "ar" ? "توليد الملخص الآن ✨" : "Generate Summary Now ✨"}</Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EXPLAIN KEY CONCEPTS */}
            {activeTab === "explain" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {lang === "ar" ? "تبسيط المفاهيم الصعبة وأمثلة واقعية" : "Simplified Explanations & Examples"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {explanation && (
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(explanation)} className="h-8 text-xs gap-1">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {lang === "ar" ? "نسخ" : "Copy"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate("explain", true)}
                      disabled={loading}
                      className="h-8 text-xs gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      {lang === "ar" ? "إعادة الشرح" : "Regenerate"}
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{lang === "ar" ? "جاري تبسيط مفاهيم المحاضرة وابتكار أمثلة عملية..." : "Simplifying core lecture concepts..."}</p>
                  </div>
                ) : explanation ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none p-5 rounded-2xl bg-secondary/30 border border-border/40 whitespace-pre-line leading-relaxed text-sm">
                    {explanation}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground space-y-3">
                    <p className="text-sm">{lang === "ar" ? "لم يتم توليد الشرح المبسط بعد" : "No simplified explanation yet"}</p>
                    <Button onClick={() => handleGenerate("explain")}>{lang === "ar" ? "شرح وتبسيط المحاضرة ✨" : "Explain Concepts Now ✨"}</Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: QUIZ & PRACTICE */}
            {activeTab === "quiz" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      {lang === "ar" ? "بنك الأسئلة والاختبار التدريبي (MCQ)" : "Practice Quiz & MCQs"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? "اختبر فهمك بعد قراءة المحاضرة واكتشف الإجابة والتعليل فوراً" : "Test your comprehension with instant feedback"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate("quiz", true)}
                    disabled={loading}
                    className="h-8 text-xs gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    {lang === "ar" ? "أسئلة جديدة" : "New Questions"}
                  </Button>
                </div>

                {loading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{lang === "ar" ? "جاري صياغة أسئلة تدريبية واختيار من متعدد..." : "Formulating quiz questions from lecture..."}</p>
                  </div>
                ) : quizQuestions.length > 0 ? (
                  <div className="space-y-5">
                    {quizQuestions.map((q, qIndex) => {
                      const selected = userAnswers[qIndex];
                      const isAnswered = typeof selected === "number";
                      const isCorrect = isAnswered && selected === q.correctIndex;
                      const showReason = showExplanations[qIndex];

                      return (
                        <div key={qIndex} className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-3">
                          <p className="font-bold text-sm flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {qIndex + 1}
                            </span>
                            <span>{q.question}</span>
                          </p>

                          <div className="grid gap-2 sm:grid-cols-2 pt-1">
                            {q.options.map((opt, optIndex) => {
                              const isChoiceSelected = selected === optIndex;
                              const isChoiceCorrect = optIndex === q.correctIndex;

                              let btnStyle = "bg-background/60 hover:bg-secondary/80 border-border/50 text-foreground";
                              if (isAnswered) {
                                if (isChoiceCorrect) {
                                  btnStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-500 font-semibold";
                                } else if (isChoiceSelected && !isCorrect) {
                                  btnStyle = "bg-destructive/15 border-destructive/40 text-destructive";
                                }
                              }

                              return (
                                <button
                                  key={optIndex}
                                  type="button"
                                  onClick={() => {
                                    playClickSfx();
                                    setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                                    setShowExplanations((prev) => ({ ...prev, [qIndex]: true }));
                                  }}
                                  className={`p-3 rounded-lg border text-xs text-right transition-all flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {isAnswered && isChoiceCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                                  {isAnswered && isChoiceSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>

                          {showReason && q.explanation && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 rounded-lg bg-secondary/60 text-xs text-muted-foreground leading-relaxed border border-border/30">
                              <span className="font-bold text-foreground">💡 التعليل: </span>
                              {q.explanation}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : quizText ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none p-5 rounded-2xl bg-secondary/30 border border-border/40 whitespace-pre-line text-sm">
                    {quizText}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground space-y-3">
                    <p className="text-sm">{lang === "ar" ? "اضغط لبدء إنشاء اختبار تدريبي لهذه المحاضرة" : "Generate practice quiz for this lecture"}</p>
                    <Button onClick={() => handleGenerate("quiz")}>{lang === "ar" ? "توليد الأسئلة التدريبية 🎯" : "Generate Quiz 🎯"}</Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CHAT WITH LECTURE */}
            {activeTab === "chat" && (
              <div className="space-y-4 flex flex-col h-[500px]">
                <div className="pb-2 border-b border-border/40">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    {lang === "ar" ? "اسأل الذكاء الاصطناعي عن أي جزء في المحاضرة" : "Interactive Chat with Lecture"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? "اطرح أي سؤال أو اطلب توضيح مسألة وسيقوم المساعد بالإجابة فوراً" : "Ask questions and get immediate answers"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6 space-y-2">
                      <Sparkles className="w-8 h-8 text-primary/60 animate-pulse" />
                      <p className="text-sm font-medium">{lang === "ar" ? "المساعد جاهز للإجابة عن أسئلتك!" : "AI Tutor ready for your questions!"}</p>
                      <p className="text-xs max-w-sm">
                        {lang === "ar" ? "اكتب سؤالك بالأسفل مثل: 'ما هو الفرق بين X و Y في المحاضرة؟' أو 'اشرح لي القانون الأول'." : "Ask anything about this lecture."}
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-card border border-border/50 text-foreground rounded-bl-none shadow-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
                      <span>{lang === "ar" ? "جاري التفكير وصياغة الإجابة..." : "Thinking..."}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <Input
                    placeholder={lang === "ar" ? "اكتب سؤالك عن المحاضرة هنا..." : "Type your question..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-secondary/50 text-sm"
                    disabled={isChatLoading}
                  />
                  <Button type="submit" disabled={isChatLoading || !chatInput.trim()} className="gap-1.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "إرسال" : "Send"}</span>
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 5: EXTERNAL MODELS LAUNCHER */}
            {activeTab === "external" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    {lang === "ar" ? "فتح المحاضرة في نماذج الذكاء الاصطناعي المفضلة" : "Open in External AI Models"}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "ar"
                      ? "اختر النموذج الذي ترتاح له! سيقوم الموقع بنسخ رابط المحاضرة مع برومبت دراسي ذكي ومفصل لتقوم بلصقه وتلقي الشرح فوراً مجاناً دون أي حدود استهلاك."
                      : "Choose your favorite model. The system copies the lecture link and study prompt for instant pasting."}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {externalModels.map((model) => (
                    <motion.div
                      key={model.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border border-border/50 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/60 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                            <span>{model.name}</span>
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {lang === "ar" ? "مجاني 100%" : "Free"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{model.description}</p>
                      </div>

                      <div className="pt-4 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLaunchExternal(model)}
                          className="w-full text-xs font-semibold gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? `نسخ وفتح ${model.name}` : `Copy & Open`}</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {material.pdf_url && (
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 flex items-center justify-between text-xs gap-3">
                    <span className="text-muted-foreground truncate">
                      {lang === "ar" ? "رابط ملف المحاضرة المباشر جاهز للمشاركة والنسخ" : "Direct lecture URL ready"}
                    </span>
                    <a
                      href={material.pdf_url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background text-foreground border border-border/60 hover:bg-secondary transition-colors shrink-0 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === "ar" ? "تنزيل المحاضرة للجهاز" : "Download PDF"}</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Gemini API Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-base">
              <Key className="w-4 h-4 text-primary" />
              {lang === "ar" ? "ضبط مفتاح Google Gemini API" : "Gemini API Key Settings"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "ar"
                ? "لتشغيل التلخيص والشات الداخلي فائق السرعة، يمكنك استخدام مفتاح API مجاني تماماً من Google AI Studio."
                : "To enable instant in-app AI summaries, use a 100% free API key from Google AI Studio."}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">{lang === "ar" ? "مفتاح Gemini API:" : "API Key:"}</label>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="bg-secondary/50 font-mono text-xs"
              />
            </div>

            <div className="p-3 rounded-lg bg-secondary/40 text-[11px] text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">{lang === "ar" ? "كيف تحصل على مفتاح مجاني في 30 ثانية؟" : "How to get a free key?"}</p>
              <p>1. ادخل على رابط Google AI Studio الرسمي أدناه بحساب جوجل الخاص بك.</p>
              <p>2. اضغط على «Create API key» ثم انسخه والصقه هنا.</p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold mt-1"
              >
                <span>Google AI Studio API Keys ↗</span>
              </a>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveApiKey} className="flex-1 text-xs">
                {lang === "ar" ? "حفظ وتفعيل المفتاح" : "Save & Activate"}
              </Button>
              <Button variant="outline" onClick={() => setShowKeyDialog(false)} className="text-xs">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiLectureExplainerModal;
