import { useEffect, useMemo, useState } from "react";
import {
  Search, Coffee, LayoutDashboard, BookOpen, FolderOpen, Star, Clock3,
  Settings, Plus, ChevronRight, ArrowRight, Pencil, Trash2, CheckCircle2,
  AlertTriangle, Wrench, ListChecks, X, Save, Play, Pause, RotateCcw,
  Menu, LogOut, Filter, Sparkles
} from "lucide-react";
import seedRecipes from "./data.js";
import "./styles.css";

const sectionIcons = {
  "Hot Bar — البار الساخن": Coffee,
  "Cold Bar — البار البارد": Sparkles,
  "المخبوزات والحلويات — Desserts & Bakery": BookOpen,
  "الصوصات والإضافات — Toppings & Sauces": Wrench
};

const emptyRecipe = {
  id: "", section: "Hot Bar — البار الساخن", title: "", meta: [],
  ingredients: [], equipment: [], steps: [], qc: [], errors: [], notes: []
};

function clone(v){ return JSON.parse(JSON.stringify(v)); }

export default function App() {
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem("barista-recipes-v1");
    return saved ? JSON.parse(saved) : seedRecipes;
  });
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("الكل");
  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("barista-favs") || "[]"));
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem("barista-recent") || "[]"));
  const [sidebar, setSidebar] = useState(false);
  const [editor, setEditor] = useState(null);

  useEffect(() => localStorage.setItem("barista-recipes-v1", JSON.stringify(recipes)), [recipes]);
  useEffect(() => localStorage.setItem("barista-favs", JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem("barista-recent", JSON.stringify(recent)), [recent]);

  const sections = ["الكل", ...sectionHeaders(recipes)];
  const filtered = useMemo(() => recipes.filter(r => {
    const hay = [r.title, r.section, ...r.meta, ...r.ingredients, ...r.equipment, ...r.steps, ...r.notes].join(" ").toLowerCase();
    return (section === "الكل" || r.section === section) && hay.includes(query.toLowerCase());
  }), [recipes, query, section]);

  const openRecipe = (r) => {
    setSelected(r);
    setView("detail");
    setRecent(old => [r.id, ...old.filter(id => id !== r.id)].slice(0, 8));
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const toggleFav = (id) => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);

  const nav = (name) => {
    if(name === "الرئيسية"){ setView("home"); setSection("الكل"); }
    if(name === "كل الوصفات"){ setView("home"); setSection("الكل"); }
    if(name === "المفضلة"){ setView("favorites"); }
    if(name === "آخر ما تم فتحه"){ setView("recent"); }
    setSidebar(false);
  };

  const saveRecipe = (recipe) => {
    if(!recipe.title.trim()) return;
    setRecipes(old => {
      const exists = old.some(r => r.id === recipe.id);
      return exists ? old.map(r => r.id === recipe.id ? recipe : r) : [{...recipe, id:`custom-${Date.now()}`}, ...old];
    });
    if(selected?.id === recipe.id) setSelected(recipe);
    setEditor(null);
  };

  const deleteRecipe = (id) => {
    if(!confirm("حذف هذه الوصفة نهائيًا؟")) return;
    setRecipes(old => old.filter(r => r.id !== id));
    setFavorites(old => old.filter(x => x !== id));
    if(selected?.id === id){ setSelected(null); setView("home"); }
  };

  const pageRecipes = view === "favorites"
    ? recipes.filter(r => favorites.includes(r.id))
    : view === "recent"
      ? recent.map(id => recipes.find(r => r.id === id)).filter(Boolean)
      : filtered;

  return (
    <div className="app" dir="rtl">
      <aside className={`sidebar ${sidebar ? "open" : ""}`}>
        <div className="brand">
          <div className="brandMark"><Coffee size={24}/></div>
          <div><b>BARISTA</b><span>RECIPE BOOK</span></div>
        </div>

        <nav>
          <NavItem icon={LayoutDashboard} label="الرئيسية" active={view==="home" && section==="الكل"} onClick={() => nav("الرئيسية")} />
          <NavItem icon={BookOpen} label="كل الوصفات" active={view==="home" && section==="الكل"} onClick={() => nav("كل الوصفات")} />
          <NavItem icon={FolderOpen} label="الأقسام" onClick={() => {setView("home"); setSection(sectionHeaders(recipes)[0] || "الكل")}} />
          <NavItem icon={Star} label="المفضلة" count={favorites.length} active={view==="favorites"} onClick={() => nav("المفضلة")} />
          <NavItem icon={Clock3} label="آخر ما تم فتحه" active={view==="recent"} onClick={() => nav("آخر ما تم فتحه")} />
        </nav>

        <div className="sidebarBottom">
          <button className="navItem"><Settings size={19}/> الإعدادات</button>
          <div className="admin"><div className="avatar">A</div><div><b>Admin</b><span>مدير النظام</span></div><LogOut size={17}/></div>
        </div>
      </aside>

      {sidebar && <div className="overlay" onClick={()=>setSidebar(false)}/>}
      <main className="main">
        <header className="topbar">
          <button className="mobileMenu" onClick={()=>setSidebar(true)}><Menu/></button>
          <div className="crumb">Barista Book <ChevronRight size={16}/> {view === "detail" ? selected?.title : view==="favorites" ? "المفضلة" : view==="recent" ? "آخر ما تم فتحه" : "الوصفات"}</div>
          <div className="topActions"><button className="iconBtn"><Settings size={19}/></button><button className="avatar topAvatar">A</button></div>
        </header>

        {view === "detail" && selected ? (
          <RecipeDetail
            recipe={recipes.find(r=>r.id===selected.id) || selected}
            favorite={favorites.includes(selected.id)}
            onFav={()=>toggleFav(selected.id)}
            onBack={()=>setView("home")}
            onEdit={()=>setEditor(clone(recipes.find(r=>r.id===selected.id)))}
            onDelete={()=>deleteRecipe(selected.id)}
          />
        ) : (
          <>
            <section className="hero">
              <div><p className="eyebrow">BARISTA KNOWLEDGE SYSTEM</p><h1>{view==="favorites" ? "الوصفات المفضلة" : view==="recent" ? "آخر الوصفات التي فتحتها" : "كل وصفة في مكانها الصحيح"}</h1><p>ابحث عن أي وصفة وراجع المقادير وخطوات التحضير بسهولة أثناء العمل.</p></div>
              <button className="primaryBtn" onClick={()=>setEditor({...clone(emptyRecipe), section:section==="الكل" ? sectionHeaders(recipes)[0] : section})}><Plus size={19}/> إضافة وصفة</button>
            </section>

            <section className="searchBox">
              <Search size={22}/>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن مشروب، مكون، طريقة تحضير..." />
              {(query || section!=="الكل") && <button onClick={()=>{setQuery("");setSection("الكل")}} className="clear"><X size={17}/> مسح</button>}
            </section>

            <section className="sectionTabs">
              {sections.map(s => {
                const Icon = s==="الكل" ? Filter : sectionIcons[s] || FolderOpen;
                return <button key={s} className={section===s && view==="home" ? "tab active" : "tab"} onClick={()=>{setView("home");setSection(s)}}><Icon size={16}/>{s==="الكل" ? "الكل" : s.split("—")[1]?.trim() || s}</button>
              })}
            </section>

            <section className="stats">
              <Stat n={recipes.length} t="وصفة جاهزة"/>
              <Stat n={sectionHeaders(recipes).length} t="أقسام"/>
              <Stat n={favorites.length} t="في المفضلة"/>
              <Stat n={recent.length} t="آخر ما تم فتحه"/>
            </section>

            <section className="recipesArea">
              <div className="sectionTitle"><div><h2>{view==="home" ? (section==="الكل" ? "كل الوصفات" : section.split("—")[1]?.trim()) : view==="favorites" ? "المفضلة" : "تم فتحها مؤخرًا"}</h2><span>{pageRecipes.length} وصفة</span></div></div>
              <div className="recipeGrid">
                {pageRecipes.map(r => <RecipeCard key={r.id} recipe={r} favorite={favorites.includes(r.id)} onFav={()=>toggleFav(r.id)} onOpen={()=>openRecipe(r)} />)}
              </div>
              {!pageRecipes.length && <div className="empty"><Coffee size={36}/><h3>لا توجد نتائج</h3><p>جرّب كلمة بحث مختلفة أو أضف وصفة جديدة.</p></div>}
            </section>
          </>
        )}
      </main>

      {editor && <RecipeEditor recipe={editor} sections={sectionHeaders(recipes)} onClose={()=>setEditor(null)} onSave={saveRecipe}/>}
    </div>
  );
}

function sectionHeaders(recipes){
  return [...new Set(recipes.map(r=>r.section))];
}

function NavItem({icon:Icon,label,active,onClick,count}){
  return <button onClick={onClick} className={`navItem ${active?"active":""}`}><Icon size={19}/><span>{label}</span>{count!==undefined && <em>{count}</em>}</button>
}

function Stat({n,t}){ return <div className="stat"><b>{n}</b><span>{t}</span></div> }

function RecipeCard({recipe,favorite,onFav,onOpen}){
  const stepsCount = recipe.steps?.length || 0;
  return <article className="recipeCard" onClick={onOpen}>
    <div className="cardTop"><span className="categoryPill">{recipe.section.split("—")[1]?.trim() || recipe.section}</span><button className={`favBtn ${favorite?"fav":""}`} onClick={e=>{e.stopPropagation();onFav()}}><Star size={18} fill={favorite?"currentColor":"none"}/></button></div>
    <h3>{recipe.title}</h3>
    <p>{recipe.meta?.[0] || "وصفة احترافية معتمدة"}</p>
    <div className="cardFoot"><span><ListChecks size={15}/>{stepsCount} خطوات</span><span>عرض الوصفة <ArrowRight size={15}/></span></div>
  </article>
}

function RecipeDetail({recipe,favorite,onFav,onBack,onEdit,onDelete}){
  const [workMode,setWorkMode] = useState(false);
  const [step,setStep] = useState(0);
  const [running,setRunning] = useState(false);
  const [seconds,setSeconds] = useState(0);

  useEffect(()=>{
    if(!running) return;
    const t=setInterval(()=>setSeconds(x=>x+1),1000);
    return ()=>clearInterval(t);
  },[running]);

  if(workMode) return <WorkMode recipe={recipe} step={step} setStep={setStep} onClose={()=>setWorkMode(false)} />;

  return <div className="detail">
    <button className="backBtn" onClick={onBack}><ArrowRight size={18}/> رجوع للوصفات</button>
    <div className="detailHero">
      <div>
        <span className="categoryPill">{recipe.section}</span>
        <h1>{recipe.title}</h1>
        {recipe.meta?.map((m,i)=><p key={i}>{m}</p>)}
      </div>
      <div className="detailActions">
        <button className={`iconBtn large ${favorite?"fav":""}`} onClick={onFav}><Star fill={favorite?"currentColor":"none"}/></button>
        <button className="outlineBtn" onClick={onEdit}><Pencil size={17}/> تعديل</button>
        <button className="dangerBtn" onClick={onDelete}><Trash2 size={17}/> حذف</button>
      </div>
    </div>

    <div className="workBanner">
      <div><div className="workIcon"><Play size={20}/></div><div><b>وضع الباريستا</b><span>اعرض خطوات التحضير خطوة بخطوة أثناء العمل</span></div></div>
      <button className="primaryBtn" onClick={()=>setWorkMode(true)}>بدء التحضير <ArrowRight size={18}/></button>
    </div>

    <div className="detailGrid">
      <div className="leftCol">
        <InfoBlock icon={Coffee} title="المكونات" items={recipe.ingredients}/>
        <InfoBlock icon={Wrench} title="المعدات" items={recipe.equipment}/>
        <InfoBlock icon={CheckCircle2} title="مراقبة الجودة QC" items={recipe.qc} green/>
      </div>
      <div className="rightCol">
        <section className="prepCard">
          <div className="blockHead"><div><span className="iconCircle"><ListChecks size={20}/></span><h2>طريقة التحضير</h2></div><span>{recipe.steps?.length || 0} خطوات</span></div>
          <div className="steps">{recipe.steps?.map((s,i)=><div className="step" key={i}><b>{String(i+1).padStart(2,"0")}</b><p>{s.replace(/^\d+\.\s*/,"")}</p></div>)}</div>
        </section>
        {!!recipe.notes?.length && <section className="notes"><h3>ملاحظات مهمة</h3>{recipe.notes.map((x,i)=><p key={i}>{x}</p>)}</section>}
        {!!recipe.errors?.length && <InfoBlock icon={AlertTriangle} title="اكتشاف الأخطاء والحلول" items={recipe.errors} warning/>}
        <section className="timerCard"><div><Clock3 size={21}/><div><b>مؤقت العمل</b><span>استخدمه أثناء التحضير عند الحاجة</span></div></div><strong>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</strong><div className="timerButtons"><button onClick={()=>setRunning(!running)}>{running?<Pause size={17}/>:<Play size={17}/>} {running?"إيقاف":"تشغيل"}</button><button onClick={()=>{setRunning(false);setSeconds(0)}}><RotateCcw size={17}/></button></div></section>
      </div>
    </div>
  </div>
}

function InfoBlock({icon:Icon,title,items=[],green,warning}){
  if(!items?.length) return null;
  return <section className={`infoBlock ${green?"green":""} ${warning?"warning":""}`}><div className="blockHead"><div><span className="iconCircle"><Icon size={20}/></span><h2>{title}</h2></div></div><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul></section>
}

function WorkMode({recipe,step,setStep,onClose}){
  const steps=recipe.steps||[];
  return <div className="workMode">
    <div className="workTop"><button className="backBtn" onClick={onClose}><X size={18}/> إنهاء وضع التحضير</button><span>{recipe.title}</span></div>
    <div className="progress"><span style={{width:`${steps.length?((step+1)/steps.length)*100:0}%`}}/></div>
    <div className="workContent"><span>الخطوة {step+1} من {steps.length}</span><h1>{steps[step]?.replace(/^\d+\.\s*/,"") || "لا توجد خطوات مسجلة"}</h1><div className="workNav"><button disabled={step===0} onClick={()=>setStep(Math.max(0,step-1))}>السابق</button><button className="primaryBtn" disabled={step>=steps.length-1} onClick={()=>setStep(Math.min(steps.length-1,step+1))}>{step===steps.length-1?"تم التحضير ✓":"الخطوة التالية"} <ArrowRight size={18}/></button></div></div>
  </div>
}

function RecipeEditor({recipe,sections,onClose,onSave}){
  const [form,setForm]=useState(recipe);
  const set=(key,val)=>setForm(f=>({...f,[key]:val}));
  const add=(key)=>set(key,[...(form[key]||[]),""]);
  const change=(key,i,val)=>set(key,form[key].map((x,idx)=>idx===i?val:x));
  const remove=(key,i)=>set(key,form[key].filter((_,idx)=>idx!==i));
  return <div className="modalWrap"><div className="modal">
    <div className="modalHead"><div><h2>{recipe.id?"تعديل الوصفة":"إضافة وصفة جديدة"}</h2><p>يمكنك تعديل كل تفاصيل الوصفة.</p></div><button className="iconBtn" onClick={onClose}><X/></button></div>
    <div className="form">
      <label>اسم الوصفة<input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="مثال: Spanish Latte"/></label>
      <label>القسم<select value={form.section} onChange={e=>set("section",e.target.value)}>{sections.map(s=><option key={s}>{s}</option>)}</select></label>
      <ArrayField title="المعلومات الأساسية" values={form.meta} onAdd={()=>add("meta")} onChange={(i,v)=>change("meta",i,v)} onRemove={i=>remove("meta",i)}/>
      <ArrayField title="المكونات" values={form.ingredients} onAdd={()=>add("ingredients")} onChange={(i,v)=>change("ingredients",i,v)} onRemove={i=>remove("ingredients",i)}/>
      <ArrayField title="المعدات" values={form.equipment} onAdd={()=>add("equipment")} onChange={(i,v)=>change("equipment",i,v)} onRemove={i=>remove("equipment",i)}/>
      <ArrayField title="خطوات التحضير" values={form.steps} onAdd={()=>add("steps")} onChange={(i,v)=>change("steps",i,v)} onRemove={i=>remove("steps",i)} numbered/>
      <ArrayField title="مراقبة الجودة QC" values={form.qc} onAdd={()=>add("qc")} onChange={(i,v)=>change("qc",i,v)} onRemove={i=>remove("qc",i)}/>
      <ArrayField title="الأخطاء والحلول" values={form.errors} onAdd={()=>add("errors")} onChange={(i,v)=>change("errors",i,v)} onRemove={i=>remove("errors",i)}/>
      <ArrayField title="ملاحظات إضافية" values={form.notes} onAdd={()=>add("notes")} onChange={(i,v)=>change("notes",i,v)} onRemove={i=>remove("notes",i)}/>
    </div>
    <div className="modalFoot"><button className="outlineBtn" onClick={onClose}>إلغاء</button><button className="primaryBtn" onClick={()=>onSave(form)}><Save size={17}/> حفظ الوصفة</button></div>
  </div></div>
}

function ArrayField({title,values=[],onAdd,onChange,onRemove,numbered}){
  return <div className="arrayField"><div className="fieldTitle"><h3>{title}</h3><button type="button" onClick={onAdd}><Plus size={16}/> إضافة</button></div>{values.map((v,i)=><div className="arrayRow" key={i}>{numbered&&<b>{i+1}</b>}<input value={v} onChange={e=>onChange(i,e.target.value)}/><button type="button" onClick={()=>onRemove(i)}><Trash2 size={16}/></button></div>)}</div>
}
