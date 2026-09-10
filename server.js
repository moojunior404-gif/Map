// barista-book — سيرفر واحد بسيط
// بيقدم الواجهة (index.html) وبيخزن الوصفات في ملف recipes.json
// شغّله بـ: node server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "recipes.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

// ---------- تخزين بسيط في ملف JSON ----------

const seedRecipes = [
  {
    id: "recipe-espresso-single",
    section: "Hot Bar — البار الساخن",
    title: "إسبريسو مفرد (Espresso Single)",
    meta: ["المقاس القياسي: 25-30 مل"],
    ingredients: ["بن مطحون طازة: 9 جم"],
    equipment: ["ماكينة إسبريسو", "مطحنة", "ميزان دقيق"],
    steps: [
      "اطحن 9 جم بن على درجة ناعمة-متوسطة",
      "وزّع البن وادككه بضغط ثابت",
      "استخلص لمدة 25-30 ثانية لإنتاج 25-30 مل",
    ],
    qc: ["زمن الاستخلاص 25-30 ثانية", "كريمة ذهبية ثابتة", "طعم متوازن"],
    errors: ["طعم حامض: اطحن أنعم أو زوّد الجرعة"],
    notes: ["المياه بين 93 و96°م"],
  },
  {
    id: "recipe-espresso-double",
    section: "Hot Bar — البار الساخن",
    title: "إسبريسو دبل (Espresso Double)",
    meta: ["المقاس القياسي: 50-60 مل"],
    ingredients: ["بن مطحون طازة: 18 جم"],
    equipment: ["ماكينة إسبريسو", "مطحنة", "ميزان دقيق"],
    steps: ["اطحن 18 جم بن", "وزّع البن وادككه بالتساوي", "استخلص 25-30 ثانية لإنتاج 50-60 مل"],
    qc: ["الجرعة 18 جم بالضبط", "زمن استخلاص متسق", "كريمة كثيفة"],
    errors: ["طعم مر: اطحن أخشن أو قلل زمن الاستخلاص"],
    notes: ["المياه بين 93 و96°م"],
  },
  {
    id: "recipe-americano-hot",
    section: "Hot Bar — البار الساخن",
    title: "أمريكانو ساخن (Americano Hot)",
    meta: ["المقاس القياسي: 8-10 oz"],
    ingredients: ["إسبريسو دبل: 50-60 مل", "مياه ساخنة: 150-180 مل"],
    equipment: ["ماكينة إسبريسو", "مصدر مياه ساخنة"],
    steps: ["سخّن المياه إلى 85-90°م", "اسكب المياه في الكوب أولًا", "اسحب الإسبريسو فوق المياه مباشرة"],
    qc: ["نسبة مياه وإسبريسو متزنة", "الكريمة ظاهرة على السطح"],
    errors: ["طعم مخفف: قلل المياه إلى 150 مل"],
    notes: ["يُقدّم عند 85-90°م"],
  },
  {
    id: "recipe-cappuccino",
    section: "Hot Bar — البار الساخن",
    title: "كابتشينو (Cappuccino)",
    meta: ["المقاس القياسي: 5-6 oz"],
    ingredients: ["إسبريسو مفرد: 25-30 مل", "حليب كامل الدسم: 120-150 مل"],
    equipment: ["ماكينة إسبريسو مع Steam Wand", "إبريق ستيمنج"],
    steps: [
      "اسحب الإسبريسو في الكوب",
      "رغّي الحليب حتى 60-65°م بنسبة رغوة متوازنة",
      "حرّك الإبريق لتوحيد القوام",
      "اسكب فوق الإسبريسو بطبقة رغوة 1-1.5 سم",
    ],
    qc: ["رغوة كثيفة لامعة", "الحليب غير محروق", "قوام حريري"],
    errors: ["فقاعات كبيرة: ارفع طرف الوند قليلًا قرب سطح الحليب"],
    notes: ["لا تتخطى 65°م", "رشة كاكاو اختيارية"],
  },
  {
    id: "recipe-latte",
    section: "Hot Bar — البار الساخن",
    title: "لاتيه (Latte)",
    meta: ["المقاس القياسي: 10-12 oz"],
    ingredients: ["إسبريسو دبل: 50-60 مل", "حليب كامل الدسم: 220-250 مل"],
    equipment: ["ماكينة إسبريسو مع Steam Wand", "إبريق ستيمنج"],
    steps: ["اسحب الإسبريسو في الكوب", "رغّي الحليب حتى 60-65°م برغوة خفيفة", "اسكب الحليب من ارتفاع منخفض ويمكن عمل Latte Art"],
    qc: ["رغوة رقيقة ناعمة", "نسبة حليب وإسبريسو متزنة", "طعم حليبي متوازن"],
    errors: ["رغوة ثقيلة: قلل زمن الرغي"],
    notes: ["لا تتخطى 65°م"],
  },
  {
    id: "recipe-flat-white",
    section: "Hot Bar — البار الساخن",
    title: "وايت فلات (Flat White)",
    meta: ["المقاس القياسي: 5-6 oz"],
    ingredients: ["إسبريسو دبل ريستريتو: 40-50 مل", "حليب: 100-120 مل"],
    equipment: ["ماكينة إسبريسو", "إبريق ستيمنج"],
    steps: ["اسحب دبل ريستريتو بتركيز أعلى", "رغّي الحليب برغوة دقيقة وناعمة", "اسكب بحرص طبقة رقيقة جدًا"],
    qc: ["تركيز القهوة أعلى من اللاتيه", "Microfoam ناعم", "قوام حريري"],
    errors: ["القهوة ضعيفة: استخدم ريستريتو وجرعة أعلى"],
    notes: ["الحرارة بين 60 و63°م"],
  },
  {
    id: "recipe-mocha",
    section: "Hot Bar — البار الساخن",
    title: "موكا (Mocha)",
    meta: ["المقاس القياسي: 10-12 oz"],
    ingredients: ["إسبريسو دبل: 50-60 مل", "صوص شوكولاتة: 25-30 جم", "حليب: 200-220 مل"],
    equipment: ["ماكينة إسبريسو", "إبريق ستيمنج"],
    steps: ["ضع صوص الشوكولاتة في الكوب", "اسحب الإسبريسو فوقه وقلّب جيدًا", "رغّي الحليب حتى 60-65°م واسكبه فوق الخليط"],
    qc: ["الشوكولاتة ذائبة بالكامل", "توازن الحلاوة ومرارة القهوة"],
    errors: ["الصوص راسب: قلّب الإسبريسو والصوص قبل إضافة الحليب"],
    notes: ["كريمة مخفوقة ورشة كاكاو اختيارية"],
  },
  {
    id: "recipe-iced-latte",
    section: "Cold Bar — البار البارد",
    title: "آيس لاتيه (Iced Latte)",
    meta: ["المقاس القياسي: 12-16 oz"],
    ingredients: ["إسبريسو دبل", "حليب بارد: 180 مل", "ثلج مكعبات"],
    equipment: ["ماكينة إسبريسو", "كوب تقديم", "ملعقة بار"],
    steps: ["املأ الكوب بالثلج حتى ثلاثة أرباعه", "أضف الحليب البارد", "اسحب الإسبريسو واسكبه فوق الحليب"],
    qc: ["المشروب بارد بالكامل", "طبقات واضحة قبل التقليب", "لا يوجد ذوبان زائد"],
    errors: ["المشروب مخفف: استخدم ثلجًا أكبر واسكب الإسبريسو سريعًا"],
    notes: ["قدّم فورًا"],
  },
  {
    id: "recipe-iced-americano",
    section: "Cold Bar — البار البارد",
    title: "آيس أمريكانو (Iced Americano)",
    meta: ["المقاس القياسي: 12-16 oz"],
    ingredients: ["إسبريسو دبل", "مياه باردة: 180 مل", "ثلج مكعبات"],
    equipment: ["ماكينة إسبريسو", "كوب تقديم"],
    steps: ["املأ الكوب بالثلج", "أضف المياه الباردة", "اسكب الإسبريسو فوق المياه والثلج"],
    qc: ["توازن واضح بين الماء والقهوة", "المشروب بارد"],
    errors: ["مرارة زائدة: راجع زمن الاستخلاص"],
    notes: ["قلب قبل التقديم"],
  },
  {
    id: "recipe-chocolate-cake",
    section: "المخبوزات والحلويات — Desserts & Bakery",
    title: "كيكة شوكولاتة طرية",
    meta: ["العائد: قالب 20 سم"],
    ingredients: ["دقيق: 180 جم", "كاكاو: 40 جم", "سكر: 180 جم", "بيضتان"],
    equipment: ["وعاء خلط", "مضرب", "قالب فرن"],
    steps: ["اخلط المكونات الجافة معًا", "أضف البيض والسوائل واخلط حتى التجانس", "اخبز على 175°م حتى يخرج العود نظيفًا"],
    qc: ["سطح متماسك", "قلب رطب", "طعم شوكولاتة واضح"],
    errors: ["القلب جاف: قلل زمن الخَبز"],
    notes: ["تبرد قبل التقطيع"],
  },
  {
    id: "recipe-vanilla-syrup",
    section: "الصوصات والإضافات — Toppings & Sauces",
    title: "سيرب فانيليا (Vanilla Syrup)",
    meta: ["العائد: حوالي 500 مل"],
    ingredients: ["مياه: 250 مل", "سكر: 250 جم", "فانيليا: 10 مل"],
    equipment: ["قدر صغير", "زجاجة تخزين"],
    steps: ["سخّن المياه والسكر حتى الذوبان دون غليان قوي", "أضف الفانيليا بعد رفع القدر", "اترك السيرب يبرد ثم خزنه في زجاجة نظيفة"],
    qc: ["قوام صافٍ", "لا توجد بلورات سكر", "رائحة فانيليا واضحة"],
    errors: ["تبلور السيرب: لا تتركه يغلي طويلًا"],
    notes: ["يحفظ بالثلاجة حتى أسبوعين"],
  },
].map((r) => ({ isFavorite: false, imageUrl: null, imagePublicId: null, lastOpenedAt: null, ...r }));

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedRecipes, null, 2), "utf8");
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return seedRecipes;
  }
}

function saveData(recipes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(recipes, null, 2), "utf8");
}

function cleanList(values) {
  return (Array.isArray(values) ? values : []).map((v) => String(v).trim()).filter(Boolean);
}

// ---------- API ----------

app.get("/api/recipes", (req, res) => {
  let rows = loadData();
  const { search = "", section, view = "all" } = req.query;

  if (section) rows = rows.filter((r) => r.section === section);

  const q = String(search).trim().toLocaleLowerCase("ar");
  if (q) {
    rows = rows.filter((r) =>
      [r.title, r.section, ...r.meta, ...r.ingredients, ...r.equipment, ...r.steps, ...r.notes]
        .join(" ")
        .toLocaleLowerCase("ar")
        .includes(q)
    );
  }

  if (view === "favorites") rows = rows.filter((r) => r.isFavorite);
  if (view === "recent") {
    rows = rows.filter((r) => r.lastOpenedAt).sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt));
  } else {
    rows.sort((a, b) => a.title.localeCompare(b.title, "ar"));
  }

  res.json(rows);
});

app.post("/api/recipes", (req, res) => {
  const rows = loadData();
  const input = req.body || {};
  if (!input.title || !input.title.trim()) {
    return res.status(400).json({ error: "اسم الوصفة مطلوب" });
  }
  const recipe = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section: (input.section || "").trim(),
    title: input.title.trim(),
    meta: cleanList(input.meta),
    ingredients: cleanList(input.ingredients),
    equipment: cleanList(input.equipment),
    steps: cleanList(input.steps),
    qc: cleanList(input.qc),
    errors: cleanList(input.errors),
    notes: cleanList(input.notes),
    imageUrl: input.imageUrl || null,
    imagePublicId: input.imagePublicId || null,
    isFavorite: false,
    lastOpenedAt: null,
  };
  rows.push(recipe);
  saveData(rows);
  res.status(201).json(recipe);
});

app.get("/api/recipes/:id", (req, res) => {
  const rows = loadData();
  const idx = rows.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "الوصفة غير موجودة" });
  rows[idx].lastOpenedAt = new Date().toISOString();
  saveData(rows);
  res.json(rows[idx]);
});

app.patch("/api/recipes/:id", (req, res) => {
  const rows = loadData();
  const idx = rows.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "الوصفة غير موجودة" });
  const input = req.body || {};
  const current = rows[idx];
  const updated = {
    ...current,
    ...(input.section !== undefined ? { section: input.section } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.meta !== undefined ? { meta: cleanList(input.meta) } : {}),
    ...(input.ingredients !== undefined ? { ingredients: cleanList(input.ingredients) } : {}),
    ...(input.equipment !== undefined ? { equipment: cleanList(input.equipment) } : {}),
    ...(input.steps !== undefined ? { steps: cleanList(input.steps) } : {}),
    ...(input.qc !== undefined ? { qc: cleanList(input.qc) } : {}),
    ...(input.errors !== undefined ? { errors: cleanList(input.errors) } : {}),
    ...(input.notes !== undefined ? { notes: cleanList(input.notes) } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    ...(input.imagePublicId !== undefined ? { imagePublicId: input.imagePublicId } : {}),
    ...(input.isFavorite !== undefined ? { isFavorite: input.isFavorite } : {}),
  };
  rows[idx] = updated;
  saveData(rows);
  res.json(updated);
});

app.delete("/api/recipes/:id", (req, res) => {
  const rows = loadData();
  const idx = rows.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "الوصفة غير موجودة" });
  rows.splice(idx, 1);
  saveData(rows);
  res.status(204).send();
});

app.post("/api/recipes/:id/favorite", (req, res) => {
  const rows = loadData();
  const idx = rows.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "الوصفة غير موجودة" });
  rows[idx].isFavorite = !rows[idx].isFavorite;
  saveData(rows);
  res.json(rows[idx]);
});

app.get("/api/dashboard-summary", (req, res) => {
  const rows = loadData();
  const sections = [...new Set(rows.map((r) => r.section))];
  res.json({
    recipeCount: rows.length,
    sectionCount: sections.length,
    favoriteCount: rows.filter((r) => r.isFavorite).length,
    recentCount: rows.filter((r) => r.lastOpenedAt).length,
    sections,
  });
});

// إعدادات Cloudinary العامة (اسم الحساب + اسم الـ upload preset غير الموقّع)
// آمنة تمامًا في الواجهة، مفيش سيريت هنا خالص
app.get("/api/cloudinary-config", (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "";
  if (!cloudName || !uploadPreset) {
    return res.status(503).json({ error: "Cloudinary غير مهيأ بعد." });
  }
  res.json({ cloudName, uploadPreset, folder: "barista-book/recipes" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Barista Book running on port ${PORT}`);
});
