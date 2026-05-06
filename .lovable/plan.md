## المشكلة الحالية

1. **القاعدة فيها اشتراكين بس** (جهازك Linux + Windows) — الطلاب وموبايلك مش مسجلين أصلًا، عشان كده الإشعار اللي بتبعته من الكمبيوتر بيوصل للكمبيوتر بس، ومن الموبايل للموبايل بس (لما الموبايل يتسجل).
2. **مفيش إشعارات تلقائية** عند رفع مادة/تكليف/إعلان — الدالة `notify_push_on_insert` موجودة بس مش مربوطة بأي جدول.
3. الطلب الحالي للإشعارات بيظهر مرة كل 3 زيارات وبسهولة يتقفل.

## الحل

### 1. تسجيل تلقائي للإشعارات لكل زائر
- تعديل `NotificationPrompt.tsx`: أول ما الزائر يدخل الموقع وحالة الإذن `default`، يطلب الإذن تلقائيًا بعد ثانيتين بدون أي UI تأكيد.
- لو وافق → اشتراك فوري في `pushManager` وحفظ الـsubscription في جدول `push_subscriptions` مع `department='all'` افتراضيًا.
- لو رفض → نسجّل الرفض في `localStorage` ومنزعجوش تاني.
- إزالة الجرس من `NotificationBell` كزر تفعيل أساسي وخليه مؤشّر حالة فقط (مع إمكانية الضغط لإعادة المحاولة لو الإذن مرفوض/غير مفعّل).

### 2. Database Triggers للإشعارات التلقائية
نضيف 3 triggers في القاعدة، كلهم بيستدعوا `send-push` Edge Function عبر `pg_net`:

| الحدث | الجدول | عنوان الإشعار | الجمهور |
|------|------|------|------|
| رفع مادة جديدة | `materials` (is_assignment=false) | "📚 مادة جديدة في {course_name}" | قسم الكورس |
| رفع تكليف | `materials` (is_assignment=true) | "📝 تكليف جديد في {course_name}" | قسم الكورس |
| إعلان جديد | `announcements` | "📢 إعلان جديد" + المحتوى | الكل |

كل trigger بيعمل `JOIN` مع `courses` و`departments` عشان يجيب اسم الكورس واسم القسم، ويبعت `target_audience` المناسب.

### 3. تحسين Edge Function `send-push`
- التأكد إن الفلتر بتاع `target_audience` بيشمل الأجهزة المسجلة بـ`department='all'` كمان (عشان متستبعدش حد).
- إضافة دعم لإرسال `link` و`icon` ديناميكيًا (للروابط المباشرة لو موجودة).

## تفاصيل تقنية

### Trigger مثال (للمواد)
```sql
CREATE OR REPLACE FUNCTION public.notify_on_material_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_course_name text;
  v_dept text;
BEGIN
  SELECT c.name, d.name_en INTO v_course_name, v_dept
  FROM courses c LEFT JOIN departments d ON d.id = c.department_id
  WHERE c.id = NEW.course_id;

  PERFORM net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='supabase_url') || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='service_role_key')
    ),
    body := jsonb_build_object(
      'title', CASE WHEN NEW.is_assignment THEN '📝 تكليف جديد: ' ELSE '📚 مادة جديدة: ' END || v_course_name,
      'message', NEW.title,
      'target_audience', COALESCE(v_dept, 'all')
    )
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER notify_material_insert
AFTER INSERT ON public.materials
FOR EACH ROW EXECUTE FUNCTION notify_on_material_insert();
```

نفس الباترن لـ `announcements`.

### تعديلات Frontend
- `src/components/NotificationPrompt.tsx`: تبسيط إلى auto-request silent (بدون بانر بصري إلا لو الإذن مرفوض).
- `src/components/NotificationBell.tsx`: يبقى مؤشر حالة + زر retry.
- التأكد إن `ensurePushSubscription` بتشتغل دايمًا عند فتح الموقع لو الإذن `granted` ومفيش subscription.

## النتيجة المتوقعة
- أول ما أي طالب يفتح الموقع → بطلب الإذن → بيتسجّل تلقائيًا.
- أول ما ترفع مادة أو تكليف → كل طلاب القسم بيستلموا إشعار فوري.
- أول ما تنشر إعلان → كل المستخدمين بيستلموا إشعار.
- إشعارات اللي بتبعتها يدويًا من لوحة الأدمن هتوصل لكل الأجهزة المسجلة (مش جهازك بس).
