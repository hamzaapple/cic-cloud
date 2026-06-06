import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translateSubject, translateCourseName } from "@/lib/subject-translations";

export type Lang = "ar" | "en";

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tSubject: (subject: string) => string;
  tCourse: (courseName: string) => string;
  dir: "rtl" | "ltr";
}

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.courses": { ar: "المقررات", en: "Courses" },
  "nav.calendar": { ar: "التقويم", en: "Calendar" },
  "nav.links": { ar: "روابط مهمة", en: "Important Links" },
  "nav.schedule": { ar: "إنشاء جدولي", en: "My Schedule" },
  
  // Departments
  "dept.selectDepartment": { ar: "اختر القسم", en: "Select Department" },
  "dept.viewCourses": { ar: "عرض المقررات", en: "View Courses" },
  "dept.backToDepts": { ar: "العودة للأقسام", en: "Back to Departments" },
  "dept.coursesIn": { ar: "مقررات القسم", en: "Department Courses" },

  // Course tabs (dynamic now, but keep for fallback)
  "tab.lecture": { ar: "المحاضرات", en: "Lectures" },
  "tab.section": { ar: "السكاشن", en: "Sections" },
  "tab.resource": { ar: "مصادر خارجية", en: "External Resources" },
  "tab.assignment": { ar: "التكليفات", en: "Assignments" },

  // Index
  "index.openCourse": { ar: "فتح المقرر", en: "Open Course" },
  "index.noCourses": { ar: "لا توجد مقررات", en: "No courses yet" },

  // Course page
  "course.notFound": { ar: "المقرر غير موجود", en: "Course not found" },
  "course.back": { ar: "العودة للمقررات", en: "Back to courses" },
  "course.noMaterials": { ar: "لا توجد مواد بعد.", en: "No materials yet." },
  "course.noLectures": { ar: "لا توجد محاضرات بعد.", en: "No lectures yet." },
  "course.noSections": { ar: "لا توجد سكاشن بعد.", en: "No sections yet." },
  "course.noResources": { ar: "لا توجد مصادر بعد.", en: "No resources yet." },
  "course.noAssignments": { ar: "لا توجد تكليفات بعد.", en: "No assignments yet." },

  // Admin
  "admin.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "admin.owner": { ar: "المالك — صلاحيات كاملة", en: "Owner — Full Access" },
  "admin.moderator": { ar: "مشرف", en: "Moderator" },
  "admin.permissions": { ar: "صلاحيات", en: "permissions" },
  "admin.materials": { ar: "المواد", en: "Materials" },
  "admin.courses": { ar: "المقررات", en: "Courses" },
  "admin.links": { ar: "الروابط", en: "Links" },
  "admin.notifications": { ar: "الإشعارات", en: "Notifications" },
  "admin.moderators": { ar: "إدارة المشرفين", en: "Manage Moderators" },
  "admin.categories": { ar: "الأقسام الداخلية", en: "Categories" },
  "admin.uploadMaterial": { ar: "رفع مادة", en: "Upload Material" },
  "admin.title": { ar: "العنوان", en: "Title" },
  "admin.selectCourse": { ar: "اختر المقرر", en: "Select Course" },
  "admin.selectCategory": { ar: "اختر القسم", en: "Select Category" },
  "admin.selectDept": { ar: "اختر القسم", en: "Select Department" },
  "admin.filterDept": { ar: "فلتر حسب القسم", en: "Filter by Department" },
  "admin.allDepts": { ar: "جميع الأقسام", en: "All Departments" },
  "admin.lecture": { ar: "محاضرة", en: "Lecture" },
  "admin.sectionType": { ar: "سكشن", en: "Section" },
  "admin.externalResource": { ar: "مصدر خارجي", en: "External Resource" },
  "admin.assignmentType": { ar: "تكليف", en: "Assignment" },
  "admin.pdfFile": { ar: "ملف PDF", en: "PDF File" },
  "admin.uploadFile": { ar: "رفع ملف", en: "Upload File" },
  "admin.directLink": { ar: "رابط مباشر", en: "Direct Link" },
  "admin.pdfDirectLink": { ar: "رابط PDF المباشر", en: "Direct PDF URL" },
  "admin.pdfDisplayName": { ar: "اسم العرض للـ PDF (مثال: محاضرة 1)", en: "PDF Display Name (e.g. Lecture 1)" },
  "admin.externalLinkOpt": { ar: "رابط خارجي (اختياري)", en: "External Link (optional)" },
  "admin.deadline": { ar: "الموعد النهائي", en: "Deadline" },
  "admin.isAssignment": { ar: "هذا تكليف", en: "This is an assignment" },
  "admin.uploading": { ar: "جاري الرفع...", en: "Uploading..." },
  "admin.upload": { ar: "رفع المادة", en: "Upload Material" },
  "admin.allMaterials": { ar: "جميع المواد", en: "All Materials" },
  "admin.showActive": { ar: "عرض النشطة", en: "Show Active" },
  "admin.showArchived": { ar: "عرض المؤرشفة", en: "Show Archived" },
  "admin.noMaterials": { ar: "لا توجد مواد", en: "No materials" },
  "admin.addLink": { ar: "إضافة رابط", en: "Add Link" },
  "admin.titleEn": { ar: "العنوان (إنجليزي)", en: "Title (English)" },
  "admin.titleAr": { ar: "العنوان (عربي، اختياري)", en: "Title (Arabic, optional)" },
  "admin.link": { ar: "الرابط", en: "URL" },
  "admin.addLinkBtn": { ar: "إضافة الرابط", en: "Add Link" },
  "admin.allLinks": { ar: "جميع الروابط", en: "All Links" },
  "admin.logout": { ar: "خروج", en: "Logout" },
  "admin.titleAndCourseReq": { ar: "العنوان والمقرر مطلوبان", en: "Title and course are required" },
  "admin.uploadSuccess": { ar: "تم رفع المادة بنجاح!", en: "Material uploaded!" },
  "admin.uploadFail": { ar: "فشل رفع المادة", en: "Upload failed" },
  "admin.linkTitleUrlReq": { ar: "العنوان والرابط مطلوبان", en: "Title and URL are required" },
  "admin.linkAdded": { ar: "تمت إضافة الرابط!", en: "Link added!" },
  "admin.materialArchived": { ar: "تم أرشفة المادة", en: "Material archived" },
  "admin.materialDeleted": { ar: "تم حذف المادة", en: "Material deleted" },
  "admin.linkDeleted": { ar: "تم حذف الرابط", en: "Link deleted" },
  "admin.loggedOut": { ar: "تم تسجيل الخروج", en: "Logged out" },
  "admin.deadlineRequired": { ar: "الموعد النهائي مطلوب للتكليفات", en: "Deadline is required for assignments" },
  "admin.bulkFolderUpload": { ar: "رفع مجلد كامل", en: "Upload Whole Folder" },
  "admin.bulkUploadProgress": { ar: "جاري الرفع", en: "Uploading" },
  "admin.bulkUploadOf": { ar: "من", en: "of" },
  "admin.bulkUploadFiles": { ar: "ملفات", en: "files" },
  "admin.bulkUploadDone": { ar: "تم رفع جميع الملفات بنجاح!", en: "All files uploaded successfully!" },
  "admin.bulkUploadPartial": { ar: "تم رفع بعض الملفات مع أخطاء", en: "Some files uploaded with errors" },
  "admin.bulkNoPdfs": { ar: "لم يتم العثور على ملفات PDF في المجلد", en: "No PDF files found in the folder" },
  "admin.bulkSelectCourseCategory": { ar: "اختر المقرر والقسم أولاً قبل رفع المجلد", en: "Select course and category before uploading a folder" },

  // Login
  "login.title": { ar: "تسجيل الدخول", en: "Login" },
  "login.subtitle": { ar: "أدخل بيانات الدخول", en: "Enter your credentials" },
  "login.username": { ar: "اسم المستخدم", en: "Username" },
  "login.password": { ar: "كلمة المرور", en: "Password" },
  "login.submit": { ar: "تسجيل الدخول", en: "Login" },
  "login.loading": { ar: "جاري التحقق...", en: "Verifying..." },
  "login.welcome": { ar: "مرحباً بك!", en: "Welcome!" },
  "login.error": { ar: "خطأ في تسجيل الدخول", en: "Login error" },

  // Calendar
  "calendar.title": { ar: "التقويم", en: "Calendar" },
  "calendar.subtitle": { ar: "تابع مواعيد التسليم والاختبارات", en: "Track deadlines and exams" },
  "calendar.upcoming": { ar: "المواعيد القادمة", en: "Upcoming Deadlines" },

  // Links page
  "links.title": { ar: "روابط مهمة", en: "Important Links" },
  "links.subtitle": { ar: "مصادر وأدوات الجامعة الأساسية", en: "Essential university resources and tools" },

  // Not found
  "notfound.message": { ar: "الصفحة غير موجودة", en: "Page not found" },
  "notfound.back": { ar: "العودة للرئيسية", en: "Back to Home" },

  // Material card
  "material.assignment": { ar: "تكليف", en: "Assignment" },
  "material.expired": { ar: "انتهى", en: "Expired" },
  "material.downloadPdf": { ar: "تحميل PDF", en: "Download PDF" },
  "material.externalLink": { ar: "رابط خارجي", en: "External Link" },
  "material.share": { ar: "مشاركة", en: "Share" },
  "material.linkCopied": { ar: "تم نسخ رابط المشاركة! 📋", en: "Share link copied! 📋" },
  "material.shareFail": { ar: "فشل نسخ الرابط", en: "Failed to copy link" },
  "material.directDownload": { ar: "تحميل مباشر", en: "Download" },
  "material.downloadAll": { ar: "تحميل الكل ZIP", en: "Download All ZIP" },
  "material.downloading": { ar: "جاري التحميل...", en: "Downloading..." },
  "material.downloadSuccess": { ar: "تم التحميل بنجاح! 📥", en: "Downloaded successfully! 📥" },
  "material.downloadFail": { ar: "فشل التحميل", en: "Download failed" },
  "material.noFiles": { ar: "لا توجد ملفات للتحميل", en: "No files to download" },

  // PDF Viewer
  "pdfViewer.viewPdf": { ar: "عرض PDF", en: "View PDF" },
  "pdfViewer.viewingDocument": { ar: "عرض المستند", en: "Viewing document" },
  "pdfViewer.download": { ar: "تحميل", en: "Download" },
  "pdfViewer.loading": { ar: "جاري تحميل المستند...", en: "Loading document..." },
  "pdfViewer.fallbackTitle": { ar: "المتصفح لا يدعم عرض PDF المضمّن", en: "Your browser doesn't support embedded PDFs" },
  "pdfViewer.fallbackMessage": { ar: "يمكنك تحميل الملف مباشرة على جهازك.", en: "You can download the file directly to your device." },

  // PDF Annotator tools
  "pdfAnnotator.pen": { ar: "قلم", en: "Pen" },
  "pdfAnnotator.highlighter": { ar: "تظليل", en: "Highlighter" },
  "pdfAnnotator.eraser": { ar: "ممحاة", en: "Eraser" },
  "pdfAnnotator.shapes": { ar: "أشكال", en: "Shapes" },
  "pdfAnnotator.checkmark": { ar: "علامة صح", en: "Checkmark" },
  "pdfAnnotator.circle": { ar: "دائرة", en: "Circle" },
  "pdfAnnotator.pointer": { ar: "مؤشر", en: "Pointer" },
  "pdfAnnotator.rotateCW": { ar: "تدوير ←", en: "Rotate CW" },
  "pdfAnnotator.rotateCCW": { ar: "تدوير →", en: "Rotate CCW" },
  "pdfAnnotator.undo": { ar: "تراجع", en: "Undo" },
  "pdfAnnotator.redo": { ar: "إعادة", en: "Redo" },
  "pdfAnnotator.clearPage": { ar: "مسح الصفحة", en: "Clear Page" },
  "pdfAnnotator.zoomIn": { ar: "تكبير", en: "Zoom In" },
  "pdfAnnotator.zoomOut": { ar: "تصغير", en: "Zoom Out" },
  "pdfAnnotator.downloading": { ar: "جاري تجهيز PDF...", en: "Preparing PDF..." },
  "pdfAnnotator.downloadDone": { ar: "تم تحميل PDF مع التعديلات!", en: "Annotated PDF downloaded!" },

  // External Link Modal
  "externalLink.openInNewTab": { ar: "فتح في تبويب جديد", en: "Open in new tab" },
  "externalLink.blockedHint": { ar: "ملاحظة: بعض المواقع تمنع العرض المضمن. إذا ظهرت لك صفحة فارغة، استخدم زر الفتح في تبويب جديد بالأعلى.", en: "Note: Some sites block embedding. If you see a blank page, use the Open in new tab button above." },
  "externalLink.sharepointTitle": { ar: "محتوى محمي (SharePoint)", en: "Protected Content (SharePoint)" },
  "externalLink.sharepointMessage": { ar: "روابط منصة SharePoint ومايكروسوفت تمنع العرض المضمن للحفاظ على أمان حسابك الجامعي. يرجى فتح الرابط في تبويب جديد للاستمرار.", en: "SharePoint and Microsoft links block embedded viewing to protect your university account. Please open the link in a new tab." },

  // Moderators
  "mod.addModerator": { ar: "إضافة مشرف", en: "Add Moderator" },
  "mod.displayName": { ar: "الاسم المعروض", en: "Display Name" },
  "mod.username": { ar: "اسم المستخدم", en: "Username" },
  "mod.password": { ar: "كلمة المرور", en: "Password" },
  "mod.permissions": { ar: "الصلاحيات", en: "Permissions" },
  "mod.allPermissions": { ar: "جميع الصلاحيات", en: "All Permissions" },
  "mod.addBtn": { ar: "إضافة المشرف", en: "Add Moderator" },
  "mod.moderators": { ar: "المشرفون", en: "Moderators" },
  "mod.noModerators": { ar: "لا يوجد مشرفون بعد", en: "No moderators yet" },
  "mod.deleteMod": { ar: "حذف المشرف", en: "Delete Moderator" },
  "mod.deleteConfirm": { ar: "هل أنت متأكد من حذف", en: "Are you sure you want to delete" },
  "mod.cancel": { ar: "إلغاء", en: "Cancel" },
  "mod.delete": { ar: "حذف", en: "Delete" },
  "mod.allFieldsRequired": { ar: "جميع الحقول مطلوبة", en: "All fields are required" },
  "mod.selectOnePerm": { ar: "اختر صلاحية واحدة على الأقل", en: "Select at least one permission" },
  "mod.selectDeptRequired": { ar: "يجب اختيار القسم", en: "Department is required" },
  "mod.selectDept": { ar: "اختر القسم", en: "Select Department" },
  "mod.department": { ar: "القسم", en: "Department" },
  "mod.usernameExists": { ar: "اسم المستخدم مستخدم بالفعل", en: "Username already exists" },
  "mod.addedSuccess": { ar: "تم إضافة المشرف بنجاح", en: "Moderator added" },
  "mod.deletedSuccess": { ar: "تم حذف المشرف", en: "Moderator deleted" },
  "mod.editModerator": { ar: "تعديل المشرف", en: "Edit Moderator" },
  "mod.editedSuccess": { ar: "تم تعديل المشرف بنجاح", en: "Moderator updated" },
  "mod.editFail": { ar: "فشل تعديل المشرف", en: "Failed to update moderator" },

  // Categories
  "cat.addCategory": { ar: "إضافة قسم داخلي", en: "Add Category" },
  "cat.nameAr": { ar: "الاسم بالعربي", en: "Name (Arabic)" },
  "cat.nameEn": { ar: "الاسم بالإنجليزي", en: "Name (English)" },
  "cat.add": { ar: "إضافة", en: "Add" },
  "cat.allCategories": { ar: "الأقسام الداخلية", en: "Material Categories" },
  "cat.noCategories": { ar: "لا توجد أقسام بعد", en: "No categories yet" },
  "cat.fieldsRequired": { ar: "الاسم بالعربي والإنجليزي مطلوبان", en: "Both names are required" },
  "cat.added": { ar: "تمت الإضافة!", en: "Category added!" },
  "cat.updated": { ar: "تم التحديث", en: "Category updated" },
  "cat.deleted": { ar: "تم الحذف", en: "Category deleted" },
  "cat.deleteCategory": { ar: "حذف القسم", en: "Delete Category" },
  "cat.deleteConfirm": { ar: "هل أنت متأكد من حذف", en: "Are you sure you want to delete" },

  // Notifications
  "notif.sendNotification": { ar: "إرسال إشعار", en: "Send Notification" },
  "notif.title": { ar: "عنوان الإشعار", en: "Notification Title" },
  "notif.message": { ar: "نص الرسالة", en: "Message" },
  "notif.targetAudience": { ar: "الجمهور المستهدف", en: "Target Audience" },
  "notif.all": { ar: "جميع الطلاب", en: "All Students" },
  "notif.cs": { ar: "طلاب علوم الحاسب", en: "CS Students" },
  "notif.math": { ar: "طلاب الرياضيات", en: "Math Students" },
  "notif.eng": { ar: "طلاب اللغة الإنجليزية", en: "English Students" },
  "notif.optionalLink": { ar: "رابط اختياري", en: "Optional Link" },
  "notif.sending": { ar: "جاري الإرسال...", en: "Sending..." },
  "notif.send": { ar: "إرسال الإشعار", en: "Send Notification" },
  "notif.history": { ar: "سجل الإشعارات", en: "Notification History" },
  "notif.noNotifications": { ar: "لا توجد إشعارات بعد", en: "No notifications yet" },
  "notif.everyone": { ar: "الجميع", en: "Everyone" },
  "notif.titleMessageReq": { ar: "العنوان والرسالة مطلوبان", en: "Title and message are required" },
  "notif.sentSuccess": { ar: "تم إرسال الإشعار بنجاح!", en: "Notification sent!" },
  "notif.sentFail": { ar: "فشل إرسال الإشعار", en: "Failed to send notification" },

  // Permissions labels
  "perm.edit_content": { ar: "التعديل", en: "Edit Content" },
  "perm.add_courses": { ar: "إضافة مواد", en: "Add Courses" },
  "perm.strict_add_only": { ar: "إضافة وعدم حذف أو تعديل", en: "Strict Add-Only" },
  "perm.add_pdf_existing": { ar: "إضافة PDF في مقرر موجود", en: "Add PDF to Existing Courses" },
  "perm.announcements": { ar: "إعلان وإشعار", en: "Announcements & Notifications" },
  "perm.add_external_resources": { ar: "إضافة مصادر خارجية", en: "Add External Resources" },
  "perm.manage_categories": { ar: "إدارة الأقسام الداخلية", en: "Manage Categories" },

  // Schedule department
  "schedule.selectDept": { ar: "اختر القسم", en: "Select Department" },
  "schedule.csDept": { ar: "علوم الحاسب", en: "CS" },
  "schedule.cyberOrAi": { ar: "سايبر ولا Ai ؟", en: "Cyber or Ai?" },
  "schedule.cyberDept": { ar: "سايبر", en: "Cyber" },
  "schedule.aiDept": { ar: "ذكاء اصطناعي", en: "AI" },
  "schedule.aiScheduleEmpty": { ar: "جاري إضافة جداول قسم الذكاء الاصطناعي والأمن السيبراني...", en: "Schedules for AI & Cyber are being added..." },

  // Cross-dept access
  "mod.externalCourseAccess": { ar: "الوصول للمقررات الخارجية", en: "External Course Access" },
  "mod.addCourseAccess": { ar: "إضافة مقرر", en: "Add Course" },
  "mod.sharedCourses": { ar: "مقررات مشتركة", en: "Shared Courses" },
  "mod.changePassword": { ar: "تغيير كلمة المرور", en: "Change Password" },
  "mod.newPassword": { ar: "كلمة المرور الجديدة", en: "New Password" },
  "mod.confirmPassword": { ar: "تأكيد كلمة المرور", en: "Confirm Password" },
  "mod.passwordMismatch": { ar: "كلمات المرور غير متطابقة", en: "Passwords do not match" },
  "mod.passwordTooShort": { ar: "كلمة المرور قصيرة جداً (4 أحرف على الأقل)", en: "Password is too short (min 4 characters)" },
  "mod.passwordChanged": { ar: "تم تغيير كلمة المرور بنجاح ✅", en: "Password changed successfully ✅" },
  "mod.passwordChangeFail": { ar: "فشل تغيير كلمة المرور", en: "Failed to change password" },
  "mod.passwordHidden": { ar: "كلمة المرور مشفّرة ولا يمكن عرضها", en: "Password is encrypted and cannot be viewed" },
  "mod.save": { ar: "حفظ", en: "Save" },
  "mod.saving": { ar: "جاري الحفظ...", en: "Saving..." },

  // Schedule page
  "schedule.title": { ar: "إنشاء جدولي", en: "Create My Schedule" },
  "schedule.subtitle": { ar: "اختر السكاشن لعرض الجدول وتحميله كصورة", en: "Select sections to view and download as image" },
  "schedule.selectSections": { ar: "اختر السكاشن", en: "Select Sections" },
  "schedule.allSections": { ar: "جميع السكاشن", en: "All Sections" },
  "schedule.section": { ar: "سكشن", en: "Section" },
  "schedule.download": { ar: "تحميل كصورة", en: "Download as Image" },
  "schedule.noSelection": { ar: "اختر سكشن واحد على الأقل لعرض الجدول", en: "Select at least one section to view the schedule" },
  "schedule.sectionSchedule": { ar: "جدول سكشن", en: "Section Schedule" },
  "schedule.commonSchedule": { ar: "إنشاء جدول مشترك", en: "Generate Common Schedule" },
  "schedule.commonTitle": { ar: "جدول مشترك", en: "Common Schedule" },
  "schedule.smartOptimizer": { ar: "تخصيص جدول ذكي", en: "Smart Schedule Optimizer" },
  "schedule.editMode": { ar: "وضع التعديل", en: "Edit Mode" },
  "schedule.editModeOn": { ar: "التعديل مفعّل", en: "Edit Mode On" },
  "schedule.clickToEdit": { ar: "اضغط على أي خلية للتعديل أو الحذف", en: "Click any cell to edit or delete" },
  "schedule.threeDays": { ar: "المتاح لـ 3 أيام", en: "Available 3-day combos" },
  "schedule.fourDays": { ar: "المتاح لـ 4 أيام", en: "Available 4-day combos" },
  "schedule.noCombos": { ar: "لا توجد تركيبات متاحة", en: "No combinations available" },
  "schedule.generateOptimized": { ar: "إنشاء جدول محسن", en: "Generate Optimized Schedule" },
  "schedule.sectionsLabel": { ar: "سكاشن", en: "Sections" },
  "schedule.deleteCell": { ar: "حذف", en: "Delete" },
  "schedule.saveEdit": { ar: "حفظ", en: "Save" },
  "schedule.cancelEdit": { ar: "إلغاء", en: "Cancel" },

  // Days
  "day.sunday": { ar: "الأحد", en: "Sunday" },
  "day.monday": { ar: "الإثنين", en: "Monday" },
  "day.tuesday": { ar: "الثلاثاء", en: "Tuesday" },
  "day.wednesday": { ar: "الأربعاء", en: "Wednesday" },
  "day.thursday": { ar: "الخميس", en: "Thursday" },

  // Periods
  "period.first": { ar: "الفترة الأولى", en: "1st Period" },
  "period.second": { ar: "الفترة الثانية", en: "2nd Period" },
  "period.third": { ar: "الفترة الثالثة", en: "3rd Period" },
  "period.fourth": { ar: "الفترة الرابعة", en: "4th Period" },

  // Course manager
  "courseMgr.addCourse": { ar: "إضافة مقرر", en: "Add Course" },
  "courseMgr.courseName": { ar: "اسم المقرر", en: "Course Name" },
  "courseMgr.courseCode": { ar: "رمز المقرر", en: "Course Code" },
  "courseMgr.courseDesc": { ar: "وصف المقرر", en: "Description" },
  "courseMgr.add": { ar: "إضافة", en: "Add" },
  "courseMgr.allCourses": { ar: "جميع المقررات", en: "All Courses" },
  "courseMgr.noCourses": { ar: "لا توجد مقررات بعد", en: "No courses yet" },
  "courseMgr.deleteCourse": { ar: "حذف المقرر", en: "Delete Course" },
  "courseMgr.deleteConfirm": { ar: "هل أنت متأكد من حذف", en: "Are you sure you want to delete" },

  // Push notifications
  "push.enableTitle": { ar: "تفعيل الإشعارات", en: "Enable Notifications" },
  "push.enableMessage": { ar: "قم بتفعيل الإشعارات لتصلك تنبيهات فورية عند رفع محاضرات جديدة أو اقتراب مواعيد تسليم التكليفات.", en: "Enable notifications to get instant alerts for new materials and deadlines." },
  "push.installPWA": { ar: "لتلقي الإشعارات على الموبايل، اضغط على \"إضافة إلى الشاشة الرئيسية\" من قائمة المتصفح أولاً، ثم افتح التطبيق وفعّل الإشعارات.", en: "To receive notifications on mobile, tap \"Add to Home Screen\" from your browser menu first, then open the app and enable notifications." },
  "push.enable": { ar: "تفعيل الإشعارات", en: "Enable Notifications" },
  "push.installBtn": { ar: "تثبيت التطبيق", en: "Install App" },
  "push.cancel": { ar: "إلغاء", en: "Cancel" },
  "push.granted": { ar: "تم تفعيل الإشعارات بنجاح!", en: "Notifications enabled!" },
  "push.denied": { ar: "تم رفض الإشعارات", en: "Notifications denied" },

  // Install PWA
  "install.title": { ar: "تثبيت التطبيق", en: "Install App" },
  "install.message": { ar: "أضف CIC إلى شاشتك الرئيسية للوصول السريع وتجربة أفضل بدون متصفح!", en: "Add CIC to your home screen for quick access and a better experience without a browser!" },
  "install.iosMessage": { ar: "لتثبيت التطبيق: اضغط على زر المشاركة ⬆️ ثم اختر \"إضافة إلى الشاشة الرئيسية\"", en: "To install: tap the Share button ⬆️ then choose \"Add to Home Screen\"" },
  "install.btn": { ar: "تثبيت الآن", en: "Install Now" },
  "install.later": { ar: "لاحقاً", en: "Later" },
  "install.success": { ar: "تم تثبيت التطبيق بنجاح!", en: "App installed successfully!" },
  "install.gotIt": { ar: "فهمت!", en: "Got it!" },
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("cic_lang") as Lang) || "ar";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("cic_lang", l);
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  const tSubject = (subject: string): string => translateSubject(subject, lang);
  const tCourse = (courseName: string): string => translateCourseName(courseName, lang);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tSubject, tCourse, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
