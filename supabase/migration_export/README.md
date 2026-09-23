# نقل قاعدة البيانات إلى مشروع Supabase الخاص بك

## 1) الجداول والدوال والصلاحيات
افتح مشروعك في Supabase ← SQL Editor ← الصق محتوى `schema.sql` كاملًا ← Run.
(الملف يحتوي على: الجداول، المفاتيح، الفهارس، الدوال، التريجرز، سياسات الحماية، الصلاحيات، ومساحة تخزين `materials`.)

## 2) البيانات والملفات
بعد نجاح الخطوة 1، قولّي وأنا أنقل كل الصفوف وكل ملفات الـPDF أوتوماتيك.

## 3) المفاتيح المطلوبة في مشروعك
أضِف هذه القيم في Edge Functions Secrets بمشروعك:
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `OWNER_USERNAME`, `OWNER_PASSWORD`
- `TELEGRAM_WEBHOOK_SECRET` (لو بتستخدم بوت تيليجرام)

وفي Vault (Database ← Vault) أضِف:
- `supabase_url` = رابط مشروعك
- `service_role_key` = مفتاح service role بتاعك

(التريجرز بتقرأ منهم عشان ترسل الإشعارات التلقائية.)

## 4) الدوال (Edge Functions)
انشر المجلدات الموجودة في `supabase/functions` على مشروعك:
`admin-login`, `send-push`, `assignment-reminders`, `create-moderator-auth`, `telegram-webhook`.

## 5) تذكيرات التكليفات
شغّل في SQL Editor:
```sql
select cron.schedule('assignment-reminders','*/30 * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='supabase_url') || '/functions/v1/assignment-reminders',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='service_role_key'))
  );
$$);
```

## 6) الموقع نفسه
في النسخة المنشورة من GitHub (Vercel مثلًا) غيّر متغيرات البيئة:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` لقيم مشروعك.

## 7) الملفات الكبيرة (٧ فيديوهات)
اتنقلت ٣٤٦ ملف من ٣٥٣. الباقي ٧ فيديوهات أكبر من ٥٠ ميجا، والحد الأقصى للرفع في مشروعك حاليًا ٥٠ ميجا
(ده حد على مستوى المشروع كله في الخطة المجانية، مش حد الـbucket). بعد الترقية لخطة Pro:
Storage ← Settings ← ارفع حد حجم الملف، وبعدها يتم نقلهم.
