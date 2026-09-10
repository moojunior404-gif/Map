# بارستا بوك — النسخة المبسطة (3 ملفات)

بدل عشرات ملفات الـ React/TypeScript، المشروع دلوقتي 3 ملفات بس:

- **`server.js`** — سيرفر Node واحد، بيقدم الواجهة وبيخزن الوصفات
- **`index.html`** — الواجهة بالكامل (React عن طريق CDN، من غير build step)
- **`package.json`** — قائمة المكتبات (اتنين بس: express و cors)

أول تشغيل هيُنشئ تلقائيًا ملف رابع اسمه `recipes.json` وفيه كل الوصفات — ده قاعدة بياناتك.

## إزاي تشغّله على Replit

1. افتح الـ Repl بتاعك واحذف كل الملفات والمجلدات القديمة (`artifacts/`, `lib/`, `scripts/`, `tsconfig*.json`, `pnpm-*.yaml`)
2. ارفع الثلاث ملفات دول مكانهم
3. من الـ Shell بتاع Replit اكتب: `npm install`
4. في إعدادات الـ Run، خليه يشغل: `node server.js`
5. دوس **Run**

## الصور (Cloudinary)

النظام دلوقتي بيستخدم **unsigned upload** — يعني مش محتاج API Key ولا API Secret خالص، بس اتنين Secrets في Replit:

- `CLOUDINARY_CLOUD_NAME` — اسم الحساب (زي ما جبته قبل كده)
- `CLOUDINARY_UPLOAD_PRESET` — اسم "upload preset" لازم تعمله بنفسك:
  1. من Cloudinary Dashboard، روح Settings → Upload
  2. تحت "Upload presets" دوس "Add upload preset"
  3. خليه **Unsigned**
  4. احفظ واسم الـ preset اللي طلع، وده اللي تحطه في الـ Secret

بعد كده الرفع هيشتغل من صفحة الإعدادات في التطبيق مباشرة.

## التعديل من الموبايل

عايز تغيّر لون، نص، أو تضيف حقل جديد؟ كل حاجة في `index.html` — افتحه من أي محرر ملفات على الموبايل (زي محرر ملفات Replit نفسه) ودور بالبحث عن الكلمة اللي عايز تغيّرها.
