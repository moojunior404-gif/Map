Barista Book - Fixed

ضع index.html على GitHub Pages كما هو.

تم إصلاح مشكلة الصفحة البيضاء عبر:
- إزالة الاعتماد على Babel وقت التشغيل وتحويل JSX مسبقًا إلى JavaScript.
- إضافة حماية لبدء Firebase.
- إضافة fallback تلقائي إلى localStorage إذا تعذر تشغيل Firebase/CDN.
- إضافة رسالة واضحة بدل الصفحة البيضاء عند حدوث خطأ JavaScript.

ملاحظة: عند توفر Firebase سيستمر التطبيق باستخدام Firestore. عند تعذره سيعمل التخزين محليًا على الجهاز/المتصفح.
