import React, { useState, useEffect, useMemo } from "react";
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
  ChevronLeft,
  Zap,
  Maximize2,
  Minimize2,
  Edit3,
  FileText,
  FileDown,
  Eye,
  Undo2,
  Trash2,
  Layers,
  Presentation,
  Search,
} from "lucide-react";
import { FormattedAiText } from "@/components/FormattedAiText";
import { exportToWordDocument, exportToPdfPrint } from "@/lib/export-doc";
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

export type TabType =
  | "full_explain"
  | "summary"
  | "explain"
  | "quiz"
  | "chat"
  | "external";

export const AiLectureExplainerModal: React.FC<Props> = ({
  open,
  onOpenChange,
  material,
  course,
}) => {
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>("full_explain");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // AI Content States
  const [fullExplanation, setFullExplanation] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizText, setQuizText] = useState<string>("");

  // Editing state for Full Explanation, Summary & Key Concepts
  const [isEditingFullExplanation, setIsEditingFullExplanation] = useState<boolean>(false);
  const [editedFullExplanation, setEditedFullExplanation] = useState<string>("");
  const [isEditingSummary, setIsEditingSummary] = useState<boolean>(false);
  const [editedSummary, setEditedSummary] = useState<string>("");
  const [isEditingExplanation, setIsEditingExplanation] = useState<boolean>(false);
  const [editedExplanation, setEditedExplanation] = useState<string>("");

  // Slide navigation state for Full Explanation
  const [slideViewMode, setSlideViewMode] = useState<"slides" | "continuous">("slides");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [slideSearchQuery, setSlideSearchQuery] = useState<string>("");

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

    const cachedFullExplain = getCachedAiContent(material.id, "full_explain", material.pdf_url);
    const cachedSummary = getCachedAiContent(material.id, "summary", material.pdf_url);
    const cachedExplain = getCachedAiContent(material.id, "explain", material.pdf_url);
    const cachedQuiz = getCachedAiContent(material.id, "quiz", material.pdf_url);
    const cachedChat = getCachedAiContent(material.id, "chat", material.pdf_url);

    if (cachedFullExplain) setFullExplanation(cachedFullExplain);
    if (cachedSummary) setSummary(cachedSummary);
    if (cachedExplain) setExplanation(cachedExplain);
    if (cachedQuiz) {
      setQuizText(cachedQuiz);
      const parsed = parseQuizFromMarkdown(cachedQuiz);
      if (parsed.length > 0) setQuizQuestions(parsed);
    }
    if (cachedChat) {
      try {
        const parsed = JSON.parse(cachedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse cached chat:", e);
      }
    }

    // Auto-generate full explanation on open if not already loaded and API key is present
    if (!cachedFullExplain && hasGeminiApiKey()) {
      handleGenerate("full_explain");
    } else if (cachedFullExplain) {
      setIsFromCache(true);
    }
  }, [open, material.id, material.pdf_url]);

  // Slide Parsing from Full Explanation
  const parsedSlides = useMemo(() => {
    const text = isEditingFullExplanation ? editedFullExplanation : fullExplanation;
    if (!text) return [];

    // Match headers like ## 📄 السلايد 1: or ## السلايد 1: or ## Slide 1:
    const slideRegex = /(?=##\s+(?:📄\s*)?(?:السلايد|شريحة|صفحة|Slide)\s*\d+)/i;
    let chunks = text.split(slideRegex).filter((c) => c.trim().length > 0);

    // Fallback: match any ## header if specific slide header wasn't found
    if (chunks.length <= 1) {
      const genericRegex = /(?=##\s+)/;
      const genericChunks = text.split(genericRegex).filter((c) => c.trim().length > 0);
      if (genericChunks.length > 1) {
        chunks = genericChunks;
      }
    }

    return chunks.map((chunk, idx) => {
      const lines = chunk.trim().split("\n");
      const headerLine = lines[0].replace(/^##\s+/, "").trim();
      const numMatch = headerLine.match(/\d+/);
      const slideNum = numMatch ? parseInt(numMatch[0], 10) : idx + 1;
      return {
        id: idx,
        slideNum,
        title: headerLine || (lang === "ar" ? `السلايد ${slideNum}` : `Slide ${slideNum}`),
        content: chunk.trim(),
      };
    });
  }, [fullExplanation, editedFullExplanation, isEditingFullExplanation, lang]);

  const filteredSlides = useMemo(() => {
    if (!slideSearchQuery.trim()) return parsedSlides;
    const q = slideSearchQuery.toLowerCase();
    return parsedSlides.filter(
      (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [parsedSlides, slideSearchQuery]);

  const currentSlide = parsedSlides[currentSlideIndex] || parsedSlides[0];

  const handleAskAboutSlide = (slide: typeof currentSlide) => {
    if (!slide) return;
    playClickSfx();
    setActiveTab("chat");
    setChatInput(
      lang === "ar"
        ? `أريد شرحاً عملياً وتفصيلياً معمقاً للسلايد رقم ${slide.slideNum} بعنوان (${slide.title}) مع أمثلة وتطبيقات إضافية وأسئلة امتحانات.`
        : `Please give me a deeper practical explanation of Slide ${slide.slideNum} (${slide.title}) with extra examples.`
    );
  };

  const handleGenerate = async (type: TabType, forceRefresh = false) => {
    playClickSfx();
    if (!hasGeminiApiKey()) {
      setShowKeyDialog(true);
      return;
    }

    // Check cache first unless forced
    if (!forceRefresh) {
      const cached = getCachedAiContent(material.id, type, material.pdf_url);
      if (cached) {
        if (type === "full_explain") setFullExplanation(cached);
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

      if (type === "full_explain") {
        prompt = `أنت بروفيسور ومحاضر جامعي عبقري ومساعد أكاديمي متعمق ومحترف. مهمتك الأساسية والحتمية هي تفكيك وشرح هذه المحاضرة بعنوان "${material.title}"${courseName} بالكامل من أول سلايد وحتى آخر سلايد دون أي تلخيص مخل ودون إهمال لأي صفحة أو سلايد أو فكرة أو سطر أو حرف!

🚨 تعليمات صارمة يجب الالتزام بها حرفياً:
1. ممنوع الاختصار أو التلخيص المخل: الطلاب يشتكون بشدة من التلخيص السطحي والمختصر؛ المطلوب تفكيك وشرح كل حرف وكل فكرة ومعلومة وردت في السلايدات/الصفحات تفصيلياً وبأعلى درجات الإتقان.
2. سر بالترتيب الدقيق للمحاضرة: قسّم الشرح بدقة إلى أقسام واضحة، كل قسم يمثل سلايد/صفحة معنوناً كالتالي:
   ## 📄 السلايد [الرقم]: [عنوان السلايد أو فكرتها الأساسية]

3. لكل سلايد أو صفحة، يجب كتابة هذا الهيكل التفصيلي الإلزامي:
   - 📌 **النص والمحتوى الأصلي للسلايد**: تفريغ كامل ودقيق لجميع النقاط والمصطلحات والبيانات والرسومات المذكورة في هذه السلايد دون إسقاط أي معلومة.
   - 🧠 **الشرح المفصل والعميق لكل حرف**: شرح وتبسيط المفهوم بأسلوب علمي راقٍ وممتع؛ فكك المصطلحات الصعبة، وضّح الفلسفة العلمية، ولماذا تم وضع هذه النقطة في المنهج وكيف تعمل.
   - 🛠️ **شرح عملي وتطبيقي (مش نظري بس!)**:
     * إذا كانت المادة برمجية أو حاسوبية: اكتب كوداً عملياً كاملاً مشروحاً سطراً بسطر مع ناتج التنفيذ (Output) وتوضيح كيفية عمل الخوارزمية عملياً في الواقع.
     * إذا كانت المادة رياضية أو علمية أو إحصائية أو مالية: اكتب القوانين والمعادلات بصيغة LaTeX ($$...$$ أو $...$) واشرح طريقة حل المسائل وخطوات التعويض الرياضي خطوة بخطوة بالتفصيل.
     * إذا كانت المادة نظرية أو إدارية أو عامة: اضرب أمثلة عملية وسيناريوهات واقعية من كبرى الشركات أو الحياة اليومية مع جداول مقارنة (|---|) ومخططات لترسيخ الفهم.
   - 🎯 **فخاخ الامتحانات وأسئلة الدكاترة (Exam Tricks)**: كيف يسأل أستاذ المادة في الامتحان عن محتوى هذه السلايد بالتحديد؟ ما هي الأسئلة الخداعية والـ MCQs المتوقعة وما هي الإجابة النموذجية مع التعليل؟

4. استخدم التنسيق الأكاديمي المتقن:
   - جداول مقارنة (|...|...|)
   - أكواد برمجية كاملة داخل بلوكات كود (\`\`\`...)
   - معادلات رياضية بصيغة LaTeX ($$...$$)
   - عناوين واضحة ونقاط مرتبة
ابدأ الشرح الآن من أول سلايد وحتى نهاية المحاضرة بالتفصيل الكامل دون توقف!`;
      } else if (type === "summary") {
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
        maxOutputTokens: 8192,
      });

      setCachedAiContent(material.id, type, result, material.pdf_url);

      if (type === "full_explain") setFullExplanation(result);
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
        toast.error(lang === "ar" ? "مفتاح Gemini API غير صالح، يرجى التحقق منه" : "Invalid Gemini API key");
        setShowKeyDialog(true);
      } else if (err?.message?.includes("fetch") || err?.message?.includes("NetworkError")) {
        toast.error(
          lang === "ar"
            ? "تعذر الاتصال بالذكاء الاصطناعي بسبب الشبكة. يمكنك استخدام تبويب 'النماذج الخارجية' مجاناً!"
            : "Network issue connecting to AI. Try the External Models tab!"
        );
      } else {
        toast.error(err?.message || (lang === "ar" ? "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" : "AI generation failed"));
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
    setCachedAiContent(material.id, "chat", JSON.stringify(newHistory), material.pdf_url);
    setIsChatLoading(true);

    try {
      const historyFormatted = chatMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const contextSummary = fullExplanation || summary || explanation || "";
      const contextSnippet = contextSummary ? `\nسياق شرح ومحتوى المحاضرة:\n${contextSummary.slice(0, 5000)}` : "";

      const prompt = `سؤال الطالب حول المحاضرة "${material.title}"${course?.name ? ` في مقرر ${course.name}` : ""}:${contextSnippet}
سؤال الطالب المباشر:
"${question}"
أجب بدقة متناهية وسرعة ووضوح باللغة العربية مع القوانين والأمثلة العملية والأكواد الموضحة. في حال وجود أي معادلات أو رموز رياضية أو إحصائية، استخدم دائماً صيغة LaTeX القياسية ($$...$$ و $...$)، وإذا كان كوداً برمجياً ضعه داخل بلوك (\`\`\`...) لتنسيقه بشكل أنيق.`;

      const reply = await callGeminiApi({
        prompt,
        pdfUrl: material.pdf_url,
        listContent: material.list_content || (contextSummary ? contextSummary.slice(0, 4000) : null),
        history: historyFormatted,
        maxOutputTokens: 4096,
      });

      const updatedHistory = [...newHistory, { role: "model" as const, text: reply }];
      setChatMessages(updatedHistory);
      setCachedAiContent(material.id, "chat", JSON.stringify(updatedHistory), material.pdf_url);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorHistory = [
        ...newHistory,
        {
          role: "model" as const,
          text: lang === "ar"
            ? "عذراً، حدث بطء في الاتصال أثناء الإجابة. يمكنك إعادة إرسال السؤال أو استخدام تبويب 'النماذج الخارجية' لسؤال ChatGPT أو NotebookLM مجاناً بنقرة واحدة."
            : "Could not get an answer due to network timeout. Please retry or try External Models.",
        },
      ];
      setChatMessages(errorHistory);
      setCachedAiContent(material.id, "chat", JSON.stringify(errorHistory), material.pdf_url);
      toast.error(lang === "ar" ? "تعذر الرد، يرجى إعادة المحاولة" : "Failed to get AI answer");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    playClickSfx();
    setChatMessages([]);
    setCachedAiContent(material.id, "chat", "[]", material.pdf_url);
    toast.success(lang === "ar" ? "تم مسح المحادثة وبدء جلسة جديدة ✨" : "Chat cleared ✨");
  };

  const handleCopy = (text: string) => {
    playClickSfx();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(lang === "ar" ? "تم نسخ المحتوى بنجاح 📋" : "Content copied 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  // Edit Handlers for Full Explanation
  const handleStartEditFullExplanation = () => {
    playClickSfx();
    setEditedFullExplanation(fullExplanation);
    setIsEditingFullExplanation(true);
  };

  const handleSaveFullExplanation = () => {
    playClickSfx();
    setFullExplanation(editedFullExplanation);
    setCachedAiContent(material.id, "full_explain", editedFullExplanation, material.pdf_url);
    setIsEditingFullExplanation(false);
    toast.success(lang === "ar" ? "تم حفظ التعديلات بنجاح ✨" : "Edits saved ✨");
  };

  const handleCancelEditFullExplanation = () => {
    playClickSfx();
    setIsEditingFullExplanation(false);
  };

  // Edit Handlers for Summary
  const handleStartEditSummary = () => {
    playClickSfx();
    setEditedSummary(summary);
    setIsEditingSummary(true);
  };

  const handleSaveSummary = () => {
    playClickSfx();
    setSummary(editedSummary);
    setCachedAiContent(material.id, "summary", editedSummary, material.pdf_url);
    setIsEditingSummary(false);
    toast.success(lang === "ar" ? "تم حفظ التعديلات بنجاح ✨" : "Edits saved ✨");
  };

  const handleCancelEditSummary = () => {
    playClickSfx();
    setIsEditingSummary(false);
  };

  // Edit Handlers for Concepts
  const handleStartEditExplanation = () => {
    playClickSfx();
    setEditedExplanation(explanation);
    setIsEditingExplanation(true);
  };

  const handleSaveExplanation = () => {
    playClickSfx();
    setExplanation(editedExplanation);
    setCachedAiContent(material.id, "explain", editedExplanation, material.pdf_url);
    setIsEditingExplanation(false);
    toast.success(lang === "ar" ? "تم حفظ التعديلات بنجاح ✨" : "Edits saved ✨");
  };

  const handleCancelEditExplanation = () => {
    playClickSfx();
    setIsEditingExplanation(false);
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
        <DialogContent
          className={
            isFullscreen
              ? "!fixed !top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !w-screen !h-[100dvh] !max-w-none !max-h-none !rounded-none flex flex-col p-0 overflow-hidden bg-background text-foreground border-none shadow-none z-[70] transition-all duration-200"
              : "max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background text-foreground border-border/60 shadow-2xl rounded-2xl z-[70] transition-all duration-200"
          }
        >
          {/* Header */}
          <DialogHeader className="p-5 pb-3 border-b border-border/40 bg-secondary/30 ltr:pr-12 rtl:pl-12">
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

              {/* API Key settings, Fullscreen & status */}
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playClickSfx();
                    setIsFullscreen((prev) => !prev);
                  }}
                  className="h-8 text-xs gap-1.5 bg-background/50 border-border/50 hover:bg-secondary"
                  title={
                    isFullscreen
                      ? lang === "ar"
                        ? "تصغير النافذة (خروج من ملء الشاشة)"
                        : "Exit Fullscreen"
                      : lang === "ar"
                      ? "تكبير النافذة لملء الشاشة"
                      : "Fullscreen"
                  }
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline">{lang === "ar" ? "تصغير" : "Minimize"}</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline">{lang === "ar" ? "شاشة كاملة" : "Fullscreen"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 scrollbar-hide">
              {[
                {
                  id: "full_explain",
                  label: lang === "ar" ? "شرح المحاضرة بالكامل (سلايد بسلايد)" : "Full Lecture (Slide-by-Slide)",
                  icon: Layers,
                  badge: lang === "ar" ? "شامل وتطبيقي 🔥" : "Complete",
                },
                { id: "summary", label: lang === "ar" ? "ملخص سريع" : "Quick Summary", icon: BookOpen },
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
                        (tab.id === "full_explain" && !fullExplanation) ||
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
                    {tab.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
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

            {/* TAB 0: FULL SLIDE-BY-SLIDE EXPLANATION */}
            {activeTab === "full_explain" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-sm sm:text-base flex items-center gap-2 text-foreground">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>{lang === "ar" ? "شرح المحاضرة بالكامل (سلايد بسلايد)" : "Full Lecture (Slide-by-Slide)"}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                        {lang === "ar" ? "شامل وعملي 🔥" : "Complete & Practical"}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar"
                        ? "شرح مفصل لكل حرف وسلايد وأمثلة عملية وأكواد ومسائل وفخاخ الامتحانات دون أي تلخيص مخل"
                        : "Exhaustive slide-by-slide practical explanation with code, math, and exam traps"}
                    </p>
                  </div>

                  {fullExplanation && !loading && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* View Mode Toggle: Slides vs Continuous */}
                      <div className="flex items-center p-0.5 rounded-lg bg-secondary/80 border border-border/50 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSfx();
                            setSlideViewMode("slides");
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                            slideViewMode === "slides"
                              ? "bg-background text-foreground shadow-xs font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "سلايد بسلايد" : "Slides"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSfx();
                            setSlideViewMode("continuous");
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                            slideViewMode === "continuous"
                              ? "bg-background text-foreground shadow-xs font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "عرض متتابع" : "Continuous"}</span>
                        </button>
                      </div>

                      {/* Edit Toggle */}
                      {isEditingFullExplanation ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleSaveFullExplanation}
                            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "حفظ التعديلات" : "Save"}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditFullExplanation}
                            className="h-7 text-xs gap-1"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إلغاء" : "Cancel"}</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleStartEditFullExplanation}
                          className="h-7 text-xs gap-1.5 bg-background border-border/60 hover:bg-secondary font-medium"
                          title={lang === "ar" ? "تعديل نص الشرح وإضافة ملاحظاتك" : "Edit Explanation"}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>{lang === "ar" ? "تعديل" : "Edit"}</span>
                        </Button>
                      )}

                      {/* Download Word */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          exportToWordDocument({
                            title: material.title,
                            courseName: course?.name,
                            content: isEditingFullExplanation ? editedFullExplanation : fullExplanation,
                            typeLabel: lang === "ar" ? "الشرح الكامل للمحاضرة (سلايد بسلايد)" : "Full Lecture Explanation",
                          });
                          toast.success(lang === "ar" ? "جاري تنزيل ملف Word (.doc) للشرح الكامل 📄" : "Downloading Word (.doc) 📄");
                        }}
                        className="h-7 text-xs gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل الشرح الكامل بصيغة Microsoft Word" : "Download as Word (.doc)"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Word</span>
                      </Button>

                      {/* Download PDF */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          exportToPdfPrint({
                            title: material.title,
                            courseName: course?.name,
                            content: isEditingFullExplanation ? editedFullExplanation : fullExplanation,
                            typeLabel: lang === "ar" ? "الشرح الكامل للمحاضرة (سلايد بسلايد)" : "Full Lecture Explanation",
                          });
                          toast.success(lang === "ar" ? "فتح نافذة تصدير وحفظ PDF 🖨️" : "Opening PDF export 🖨️");
                        }}
                        className="h-7 text-xs gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل كملف PDF عالي الجودة أو طباعة" : "Download / Print as PDF"}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </Button>

                      {/* Copy */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(isEditingFullExplanation ? editedFullExplanation : fullExplanation)}
                        className="h-7 text-xs gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{lang === "ar" ? "نسخ الكل" : "Copy All"}</span>
                      </Button>

                      {/* Regenerate */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerate("full_explain", true)}
                        disabled={loading}
                        className="h-7 text-xs gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>{lang === "ar" ? "إعادة الشرح" : "Regenerate"}</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Loading state */}
                {loading ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center animate-pulse">
                        <Layers className="w-8 h-8 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs animate-spin">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <p className="text-sm font-bold text-foreground">
                        {lang === "ar" ? "جاري تفكيك وشرح المحاضرة بالكامل سلايد بسلايد..." : "Deconstructing lecture slide by slide..."}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {lang === "ar"
                          ? "نقوم باستخراج كل سلايد وصفحة، وكتابة شروحات تفصيلية لكل حرف، وأمثلة عملية وأكواد ومسائل وفخاخ الامتحانات دون أي اختصار مخل ✨"
                          : "Extracting each slide, creating in-depth breakdowns, practical code, and exam tricks..."}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground border border-border/50">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === "ar" ? "قد يستغرق الشرح المفصل من 15 إلى 30 ثانية لدقته الفائقة" : "Takes ~15-30s for exhaustive depth"}</span>
                    </div>
                  </div>
                ) : fullExplanation ? (
                  isEditingFullExplanation ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span>{lang === "ar" ? "✏️ وضع التعديل المباشر للشرح الشامل: يمكنك تعديل وحفظ ما تراه مناسباً:" : "Direct Edit Mode:"}</span>
                        <span className="font-mono text-[11px]">{editedFullExplanation.length} حرف</span>
                      </div>
                      <Textarea
                        value={editedFullExplanation}
                        onChange={(e) => setEditedFullExplanation(e.target.value)}
                        className="w-full min-h-[420px] p-4 text-sm leading-relaxed font-sans bg-background border-border/80 focus:border-primary rounded-xl"
                        dir="rtl"
                        placeholder={lang === "ar" ? "اكتب أو عدّل هنا..." : "Type edits here..."}
                      />
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>{lang === "ar" ? "معاينة التنسيق والأكواد والمسائل مباشرة:" : "Live Formatted Preview:"}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-sm">
                          <FormattedAiText content={editedFullExplanation} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar & Quick Jump */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-secondary/30 border border-border/40">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                          <Input
                            placeholder={lang === "ar" ? "🔍 ابحث عن كلمة، مفهوم، قانون، أو رقم سلايد..." : "Search slides..."}
                            value={slideSearchQuery}
                            onChange={(e) => setSlideSearchQuery(e.target.value)}
                            className="h-8 text-xs pr-8 bg-background/70 border-border/50"
                          />
                          {slideSearchQuery && (
                            <button
                              onClick={() => setSlideSearchQuery("")}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Quick Jump Slide Pill Selector */}
                        {parsedSlides.length > 0 && (
                          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5 max-w-full sm:max-w-md">
                            <span className="text-[11px] text-muted-foreground shrink-0 font-medium px-1">
                              {lang === "ar" ? "انتقال سريع:" : "Jump:"}
                            </span>
                            {parsedSlides.map((slide, idx) => {
                              const isSelected = slideViewMode === "slides" && currentSlideIndex === idx;
                              return (
                                <button
                                  key={slide.id}
                                  onClick={() => {
                                    playClickSfx();
                                    setCurrentSlideIndex(idx);
                                    if (slideViewMode !== "slides") setSlideViewMode("slides");
                                  }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 transition-all ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground shadow-xs scale-105"
                                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/40"
                                  }`}
                                  title={slide.title}
                                >
                                  {slide.slideNum}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* SLIDES VIEW MODE */}
                      {slideViewMode === "slides" && parsedSlides.length > 0 ? (
                        <div className="space-y-4">
                          {/* Slide Navigation Header */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-xs">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                playClickSfx();
                                setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
                              }}
                              disabled={currentSlideIndex === 0}
                              className="h-8 text-xs gap-1"
                            >
                              <ChevronRight className="w-4 h-4" />
                              <span>{lang === "ar" ? "السلايد السابقة" : "Previous"}</span>
                            </Button>

                            <div className="flex items-center gap-2 text-center">
                              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                                {currentSlide.slideNum}
                              </span>
                              <div className="text-right">
                                <p className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
                                  {currentSlide.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {lang === "ar"
                                    ? `السلايد ${currentSlideIndex + 1} من إجمالي ${parsedSlides.length}`
                                    : `Slide ${currentSlideIndex + 1} of ${parsedSlides.length}`}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                playClickSfx();
                                setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1));
                              }}
                              disabled={currentSlideIndex === parsedSlides.length - 1}
                              className="h-8 text-xs gap-1"
                            >
                              <span>{lang === "ar" ? "السلايد التالية" : "Next"}</span>
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Slide Content Card */}
                          <motion.div
                            key={currentSlide.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className="p-5 sm:p-6 rounded-2xl bg-secondary/25 border border-border/50 shadow-sm space-y-4"
                          >
                            <FormattedAiText content={currentSlide.content} />

                            {/* Slide Specific Actions Footer */}
                            <div className="pt-4 mt-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAskAboutSlide(currentSlide)}
                                  className="h-7 text-xs gap-1.5 bg-primary/10 text-primary border-primary/25 hover:bg-primary/20 font-semibold"
                                  title={lang === "ar" ? "طرح سؤال متعمق حول هذه السلايد في الشات" : "Ask about this slide"}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{lang === "ar" ? "اسأل الذكاء عن هذه السلايد" : "Ask About Slide"}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(currentSlide.content)}
                                  className="h-7 text-xs gap-1 text-muted-foreground"
                                >
                                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  <span>{lang === "ar" ? "نسخ السلايد" : "Copy Slide"}</span>
                                </Button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    playClickSfx();
                                    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
                                  }}
                                  disabled={currentSlideIndex === 0}
                                  className="h-7 text-xs"
                                >
                                  ❮
                                </Button>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  {currentSlideIndex + 1} / {parsedSlides.length}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    playClickSfx();
                                    setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1));
                                  }}
                                  disabled={currentSlideIndex === parsedSlides.length - 1}
                                  className="h-7 text-xs"
                                >
                                  ❯
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        /* CONTINUOUS READING VIEW */
                        <div className="p-5 sm:p-6 rounded-2xl bg-secondary/25 border border-border/50 shadow-sm leading-relaxed text-sm">
                          {slideSearchQuery && filteredSlides.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground space-y-2">
                              <Search className="w-8 h-8 mx-auto text-muted-foreground/60" />
                              <p className="text-sm font-medium">{lang === "ar" ? "لم يتم العثور على نتائج للبحث" : "No results found"}</p>
                              <Button size="sm" variant="outline" onClick={() => setSlideSearchQuery("")}>
                                {lang === "ar" ? "إلغاء البحث" : "Clear Search"}
                              </Button>
                            </div>
                          ) : (
                            <FormattedAiText
                              content={
                                slideSearchQuery && filteredSlides.length > 0
                                  ? filteredSlides.map((s) => s.content).join("\n\n---\n\n")
                                  : fullExplanation
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="py-16 text-center text-muted-foreground space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 shadow-sm">
                      <Layers className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="text-base font-bold text-foreground">
                        {lang === "ar" ? "شرح المحاضرة بالكامل (سلايد بسلايد)" : "Full Lecture Explanation"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {lang === "ar"
                          ? "تفكيك وشرح شامل لكل سلايد وصفحة بأكواد برمجية ومسائل وقوانين وفخاخ الامتحانات دون أي اختصار مخل"
                          : "Exhaustive practical slide-by-slide explanation without shortcuts"}
                      </p>
                    </div>
                    <Button onClick={() => handleGenerate("full_explain")} className="gap-2 font-bold px-6 shadow-md">
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === "ar" ? "توليد الشرح الشامل الآن ✨" : "Generate Full Explanation ✨"}</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{lang === "ar" ? "الملخص الأكاديمي السريع" : "Quick Academic Summary"}</span>
                  </h3>

                  {summary && !loading && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Edit Toggle */}
                      {isEditingSummary ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleSaveSummary}
                            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "حفظ التعديلات" : "Save"}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditSummary}
                            className="h-7 text-xs gap-1"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إلغاء" : "Cancel"}</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleStartEditSummary}
                          className="h-7 text-xs gap-1.5 bg-background border-border/60 hover:bg-secondary font-medium"
                          title={lang === "ar" ? "تعديل نص الملخص وإضافة ملاحظاتك" : "Edit Summary"}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>{lang === "ar" ? "تعديل" : "Edit"}</span>
                        </Button>
                      )}

                      {/* Download Word */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          exportToWordDocument({
                            title: material.title,
                            courseName: course?.name,
                            content: isEditingSummary ? editedSummary : summary,
                            typeLabel: lang === "ar" ? "ملخص المحاضرة" : "Lecture Summary",
                          });
                          toast.success(lang === "ar" ? "جاري تنزيل ملف Word (.doc) 📄" : "Downloading Word (.doc) 📄");
                        }}
                        className="h-7 text-xs gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل بصيغة Microsoft Word قابلة للتعديل" : "Download as Word (.doc)"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Word</span>
                      </Button>

                      {/* Download PDF */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          exportToPdfPrint({
                            title: material.title,
                            courseName: course?.name,
                            content: isEditingSummary ? editedSummary : summary,
                            typeLabel: lang === "ar" ? "ملخص المحاضرة" : "Lecture Summary",
                          });
                          toast.success(lang === "ar" ? "فتح نافذة تصدير وحفظ PDF 🖨️" : "Opening PDF export 🖨️");
                        }}
                        className="h-7 text-xs gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل كملف PDF عالي الجودة أو طباعة" : "Download / Print as PDF"}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </Button>

                      {/* Copy */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(isEditingSummary ? editedSummary : summary)}
                        className="h-7 text-xs gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{lang === "ar" ? "نسخ" : "Copy"}</span>
                      </Button>

                      {/* Regenerate */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerate("summary", true)}
                        disabled={loading}
                        className="h-7 text-xs gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>{lang === "ar" ? "إعادة التوليد" : "Regenerate"}</span>
                      </Button>
                    </div>
                  )}
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
                  isEditingSummary ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span>{lang === "ar" ? "✏️ وضع التعديل المباشر: يمكنك تعديل وحذف وإضافة ما تراه مناسباً:" : "Direct Edit Mode: Add or modify notes:"}</span>
                        <span className="font-mono text-[11px]">{editedSummary.length} حرف</span>
                      </div>
                      <Textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        className="w-full min-h-[360px] p-4 text-sm leading-relaxed font-sans bg-background border-border/80 focus:border-primary rounded-xl"
                        dir="rtl"
                        placeholder={lang === "ar" ? "اكتب أو عدّل هنا..." : "Type edits here..."}
                      />
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>{lang === "ar" ? "معاينة التنسيق الرياضي والمحتوى مباشرة:" : "Live Formatted Preview:"}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-sm">
                          <FormattedAiText content={editedSummary} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border/40 leading-relaxed text-sm">
                      <FormattedAiText content={summary} />
                    </div>
                  )
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{lang === "ar" ? "تبسيط المفاهيم الصعبة وأمثلة واقعية" : "Simplified Explanations & Examples"}</span>
                  </h3>

                  {explanation && !loading && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Edit Toggle */}
                      {isEditingExplanation ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleSaveExplanation}
                            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "حفظ التعديلات" : "Save"}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditExplanation}
                            className="h-7 text-xs gap-1"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إلغاء" : "Cancel"}</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleStartEditExplanation}
                          className="h-7 text-xs gap-1.5 bg-background border-border/60 hover:bg-secondary font-medium"
                          title={lang === "ar" ? "تعديل نص الشرح وإضافة ملاحظاتك" : "Edit Explanation"}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>{lang === "ar" ? "تعديل" : "Edit"}</span>
                        </Button>
                      )}

                      {/* Download Word */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          exportToWordDocument({
                            title: material.title,
                            courseName: course?.name,
                            content: isEditingExplanation ? editedExplanation : explanation,
                            typeLabel: lang === "ar" ? "تبسيط المفاهيم والشرح" : "Key Concepts & Explanation",
                          });
                          toast.success(lang === "ar" ? "جاري تنزيل ملف Word (.doc) 📄" : "Downloading Word (.doc) 📄");
                        }}
                        className="h-7 text-xs gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل بصيغة Microsoft Word قابلة للتعديل" : "Download as Word (.doc)"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Word</span>
                      </Button>

                      {/* Download PDF */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          exportToPdfPrint({
                            title: material.title,
                            courseName: course?.name,
                            content: isEditingExplanation ? editedExplanation : explanation,
                            typeLabel: lang === "ar" ? "تبسيط المفاهيم والشرح" : "Key Concepts & Explanation",
                          });
                          toast.success(lang === "ar" ? "فتح نافذة تصدير وحفظ PDF 🖨️" : "Opening PDF export 🖨️");
                        }}
                        className="h-7 text-xs gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل كملف PDF عالي الجودة أو طباعة" : "Download / Print as PDF"}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </Button>

                      {/* Copy */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(isEditingExplanation ? editedExplanation : explanation)}
                        className="h-7 text-xs gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{lang === "ar" ? "نسخ" : "Copy"}</span>
                      </Button>

                      {/* Regenerate */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerate("explain", true)}
                        disabled={loading}
                        className="h-7 text-xs gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>{lang === "ar" ? "إعادة الشرح" : "Regenerate"}</span>
                      </Button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{lang === "ar" ? "جاري تبسيط مفاهيم المحاضرة وابتكار أمثلة عملية..." : "Simplifying core lecture concepts..."}</p>
                  </div>
                ) : explanation ? (
                  isEditingExplanation ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span>{lang === "ar" ? "✏️ وضع التعديل المباشر: يمكنك تعديل وحذف وإضافة ما تراه مناسباً:" : "Direct Edit Mode: Add or modify notes:"}</span>
                        <span className="font-mono text-[11px]">{editedExplanation.length} حرف</span>
                      </div>
                      <Textarea
                        value={editedExplanation}
                        onChange={(e) => setEditedExplanation(e.target.value)}
                        className="w-full min-h-[360px] p-4 text-sm leading-relaxed font-sans bg-background border-border/80 focus:border-primary rounded-xl"
                        dir="rtl"
                        placeholder={lang === "ar" ? "اكتب أو عدّل هنا..." : "Type edits here..."}
                      />
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>{lang === "ar" ? "معاينة التنسيق الرياضي والمحتوى مباشرة:" : "Live Formatted Preview:"}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-sm">
                          <FormattedAiText content={editedExplanation} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border/40 leading-relaxed text-sm">
                      <FormattedAiText content={explanation} />
                    </div>
                  )
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
                  <div className="flex items-center gap-1.5">
                    {quizQuestions.length > 0 && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            playClickSfx();
                            const quizFormatted = quizQuestions
                              .map(
                                (q, i) =>
                                  `### السؤال ${i + 1}: ${q.question}\n` +
                                  q.options.map((opt, oi) => `* ${oi === q.correctIndex ? `[✓ الإجابة الصحيحة] ` : ""}${opt}`).join("\n") +
                                  (q.explanation ? `\n💡 التعليل: ${q.explanation}` : "")
                              )
                              .join("\n\n---\n\n");

                            exportToWordDocument({
                              title: material.title,
                              courseName: course?.name,
                              content: quizFormatted,
                              typeLabel: lang === "ar" ? "بنك الأسئلة التدريبي" : "Practice Quiz",
                            });
                            toast.success(lang === "ar" ? "جاري تنزيل الأسئلة Word (.doc) 📄" : "Downloading Quiz Word (.doc) 📄");
                          }}
                          className="h-8 text-xs gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/30 font-semibold"
                          title={lang === "ar" ? "تنزيل بنك الأسئلة كملف Word" : "Download Quiz as Word (.doc)"}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Word</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            playClickSfx();
                            const quizFormatted = quizQuestions
                              .map(
                                (q, i) =>
                                  `### السؤال ${i + 1}: ${q.question}\n` +
                                  q.options.map((opt, oi) => `* ${oi === q.correctIndex ? `[✓ الإجابة الصحيحة] ` : ""}${opt}`).join("\n") +
                                  (q.explanation ? `\n💡 التعليل: ${q.explanation}` : "")
                              )
                              .join("\n\n---\n\n");

                            exportToPdfPrint({
                              title: material.title,
                              courseName: course?.name,
                              content: quizFormatted,
                              typeLabel: lang === "ar" ? "بنك الأسئلة التدريبي" : "Practice Quiz",
                            });
                            toast.success(lang === "ar" ? "فتح نافذة تصدير الأسئلة PDF 🖨️" : "Opening Quiz PDF export 🖨️");
                          }}
                          className="h-8 text-xs gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 font-semibold"
                          title={lang === "ar" ? "تنزيل بنك الأسئلة كملف PDF" : "Download Quiz as PDF"}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate("quiz", true)}
                      disabled={loading}
                      className="h-8 text-xs gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      <span>{lang === "ar" ? "أسئلة جديدة" : "New Questions"}</span>
                    </Button>
                  </div>
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
                      const selectedAnswer = userAnswers[qIndex];
                      const isAnswered = typeof selectedAnswer === "number";
                      const isCorrect = selectedAnswer === q.correctIndex;
                      const showExp = showExplanations[qIndex];

                      return (
                        <div
                          key={qIndex}
                          className="p-5 rounded-2xl bg-secondary/30 border border-border/50 space-y-3 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-sm leading-relaxed text-foreground">
                              <span className="inline-block w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold text-center leading-6 ltr:mr-2 rtl:ml-2">
                                {qIndex + 1}
                              </span>
                              {q.question}
                            </h4>
                            {isAnswered && (
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                }`}
                              >
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{lang === "ar" ? "إجابة صحيحة!" : "Correct"}</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>{lang === "ar" ? "إجابة خاطئة" : "Incorrect"}</span>
                                  </>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Options */}
                          <div className="space-y-2 pt-1">
                            {q.options.map((option, optIndex) => {
                              const isSelected = selectedAnswer === optIndex;
                              const isCorrectOption = optIndex === q.correctIndex;

                              let btnClasses =
                                "w-full text-right p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ";

                              if (!isAnswered) {
                                btnClasses +=
                                  "bg-background/80 hover:bg-secondary border-border/60 hover:border-primary/40 text-foreground";
                              } else {
                                if (isCorrectOption) {
                                  btnClasses +=
                                    "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-semibold";
                                } else if (isSelected && !isCorrectOption) {
                                  btnClasses +=
                                    "bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-400 font-semibold";
                                } else {
                                  btnClasses += "bg-background/40 border-border/30 text-muted-foreground opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={optIndex}
                                  onClick={() => {
                                    if (isAnswered) return;
                                    playClickSfx();
                                    setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                                    setShowExplanations((prev) => ({ ...prev, [qIndex]: true }));
                                  }}
                                  disabled={isAnswered}
                                  className={btnClasses}
                                >
                                  <span>{option}</span>
                                  {isAnswered && isCorrectOption && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  )}
                                  {isAnswered && isSelected && !isCorrectOption && (
                                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {isAnswered && (
                            <div className="pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setShowExplanations((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }))
                                }
                                className="h-6 text-[11px] text-muted-foreground hover:text-foreground p-0 gap-1"
                              >
                                <span>{showExp ? (lang === "ar" ? "إخفاء التوضيح" : "Hide") : (lang === "ar" ? "عرض التوضيح والتعليل" : "Show explanation")}</span>
                                <ChevronRight className={`w-3 h-3 transition-transform ${showExp ? "rotate-90" : ""}`} />
                              </Button>

                              {showExp && q.explanation && (
                                <div className="mt-2 p-3 rounded-xl bg-background/80 border border-border/40 text-xs leading-relaxed text-muted-foreground">
                                  <span className="font-semibold text-foreground ltr:mr-1 rtl:ml-1">💡 التعليل:</span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground space-y-3">
                    <p className="text-sm">{lang === "ar" ? "لم يتم إنشاء أسئلة تدريبية بعد" : "No quiz generated yet"}</p>
                    <Button onClick={() => handleGenerate("quiz")}>{lang === "ar" ? "إنشاء اختبار تجريبي الآن ✨" : "Generate Quiz Now ✨"}</Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CHAT WITH LECTURE */}
            {activeTab === "chat" && (
              <div className="space-y-3 h-[520px] flex flex-col">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <div>
                    <h3 className="font-display font-bold text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      {lang === "ar" ? "المساعد التفاعلي للمحاضرة" : "Chat with Lecture Tutor"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? "اسأل عن أي نقطة أو قانون أو كود أو فكرة وسيجيبك بدقة" : "Ask questions directly about this lecture"}
                    </p>
                  </div>

                  {chatMessages.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {/* Download Word */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          const formattedChat = chatMessages
                            .map((m) => `### ${m.role === "user" ? "سؤال الطالب" : "إجابة المساعد الذكي"}:\n\n${m.text}`)
                            .join("\n\n---\n\n");
                          exportToWordDocument({
                            title: material.title,
                            courseName: course?.name,
                            content: formattedChat,
                            typeLabel: lang === "ar" ? "سجل الأسئلة والمحادثة" : "Chat Discussion",
                          });
                          toast.success(lang === "ar" ? "جاري تنزيل المحادثة Word (.doc) 📄" : "Downloading Chat Word (.doc) 📄");
                        }}
                        className="h-7 text-xs gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل سجل المحادثة كملف Word" : "Download Chat as Word"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Word</span>
                      </Button>

                      {/* Download PDF */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          playClickSfx();
                          const formattedChat = chatMessages
                            .map((m) => `### ${m.role === "user" ? "سؤال الطالب" : "إجابة المساعد الذكي"}:\n\n${m.text}`)
                            .join("\n\n---\n\n");
                          exportToPdfPrint({
                            title: material.title,
                            courseName: course?.name,
                            content: formattedChat,
                            typeLabel: lang === "ar" ? "سجل الأسئلة والمحادثة" : "Chat Discussion",
                          });
                          toast.success(lang === "ar" ? "فتح نافذة تصدير المحادثة PDF 🖨️" : "Opening Chat PDF export 🖨️");
                        }}
                        className="h-7 text-xs gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 font-semibold"
                        title={lang === "ar" ? "تنزيل سجل المحادثة كملف PDF" : "Download Chat as PDF"}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </Button>

                      {/* Clear Chat */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearChat}
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title={lang === "ar" ? "مسح المحادثة وبدء جلسة جديدة" : "Clear Chat"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "مسح" : "Clear"}</span>
                      </Button>
                    </div>
                  )}
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
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-card border border-border/50 text-foreground rounded-bl-none shadow-sm"
                          }`}
                        >
                          <FormattedAiText
                            content={msg.text}
                            className={msg.role === "user" ? "!text-primary-foreground" : ""}
                          />
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
        <DialogContent className="max-w-md bg-background text-foreground border-border/60 z-[80]">
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
