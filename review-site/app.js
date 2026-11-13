(function () {
  "use strict";

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const LS_KEY = "creview.v1";
  const CHAPTER_MAP = Object.fromEntries(CHAPTERS.map(c => [c.id, c]));
  const Q_MAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
  const CODE_MAP = Object.fromEntries(CODING.map(c => [c.id, c]));

  const DEFAULT_STATE = {
    view: "today",
    examDate: "",
    minutes: 90,
    mastered: [],
    answers: {},
    code: {},
    codePassed: [],
    lastChapter: "io",
    lastProblem: "c1",
    plan: null
  };

  let state = load();
  let practice = { type: "all", chapter: "all", index: 0 };
  let codeRun = { running: false, result: null, tests: [], lastProblem: null };

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        const s = Object.assign({}, DEFAULT_STATE, { mastered: [], answers: {}, code: {}, codePassed: [] });
        s.examDate = addDays(todayISO(), 7);
        return s;
      }
      const parsed = JSON.parse(raw);
      const merged = Object.assign({}, DEFAULT_STATE, parsed, {
        mastered: parsed.mastered || [],
        answers: parsed.answers || {},
        code: parsed.code || {},
        codePassed: parsed.codePassed || []
      });
      if (!merged.examDate) merged.examDate = addDays(todayISO(), 7);
      return merged;
    } catch (e) {
      const s = Object.assign({}, DEFAULT_STATE, { mastered: [], answers: {}, code: {}, codePassed: [] });
      s.examDate = addDays(todayISO(), 7);
      return s;
    }
  }

  let saveTimer = null;
  function save(now) {
    if (now) {
      clearTimeout(saveTimer);
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      return;
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => localStorage.setItem(LS_KEY, JSON.stringify(state)), 200);
  }

  /* ---------- date ---------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function todayISO() {
    const d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function parseISO(s) {
    const p = String(s).split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function fmtISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fmtCN(s) {
    const d = parseISO(s);
    const w = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 · 周" + w;
  }
  function daysUntil(s) {
    if (!s) return NaN;
    const a = parseISO(todayISO());
    const b = parseISO(s);
    if (isNaN(b.getTime())) return NaN;
    return Math.round((b - a) / 86400000);
  }
  function addDays(iso, n) {
    const d = parseISO(iso);
    d.setDate(d.getDate() + n);
    return fmtISO(d);
  }

  /* ---------- text utils ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function normText(s) {
    return String(s == null ? "" : s).replace(/\r/g, "").split("\n")
      .map(l => l.trim().replace(/[ \t]+/g, " ")).join("\n").trim();
  }
  function normCode(s) { return String(s == null ? "" : s).replace(/\s+/g, ""); }
  function normOut(s) {
    return String(s == null ? "" : s).replace(/\r/g, "").split("\n")
      .map(l => l.replace(/[ \t]+$/g, "")).join("\n").replace(/^\n+|\n+$/g, "");
  }

  /* ---------- plan ---------- */
  function generatePlan() {
    const exam = parseISO(state.examDate);
    const today = parseISO(todayISO());
    let nDays = Math.round((exam - today) / 86400000);
    if (!isFinite(nDays) || nDays < 0) { state.plan = null; save(true); return; }
    if (nDays === 0) nDays = 1;
    if (nDays > 21) nDays = 21;

    const chapters = CHAPTERS.filter(c => c.term === "mid");
    const perDay = Math.max(1, Math.ceil(chapters.length / nDays));
    const perPractice = Math.max(4, Math.ceil(QUESTIONS.length / nDays));
    const days = [];
    let ci = 0;
    for (let d = 0; d < nDays; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const tasks = [];
      for (let k = 0; k < perDay && ci < chapters.length; k++, ci++) {
        tasks.push({
          id: "read-" + d + "-" + chapters[ci].id,
          type: "read", ref: chapters[ci].id,
          label: "读《" + chapters[ci].title + "》",
          done: false
        });
      }
      tasks.push({ id: "prac-" + d, type: "practice", ref: "", label: "做 " + perPractice + " 道练习", done: false });
      tasks.push({ id: "code-" + d, type: "code", ref: "", label: "写 1 道编程题", done: false });
      days.push({ date: fmtISO(date), tasks });
    }
    state.plan = { examDate: state.examDate, minutes: state.minutes, createdAt: new Date().toISOString(), days };
    save(true);
  }

  function ensurePlan() {
    if (daysUntil(state.examDate) < 0) { state.plan = null; return; }
    if (!state.plan || state.plan.examDate !== state.examDate || state.plan.minutes !== state.minutes) {
      generatePlan();
    }
  }

  function todayPlan() {
    if (!state.plan) return null;
    const t = todayISO();
    const i = state.plan.days.findIndex(d => d.date === t);
    return i >= 0 ? { day: state.plan.days[i], index: i } : null;
  }

  /* ---------- progress ---------- */
  function progress() {
    const total = CHAPTERS.length + QUESTIONS.length + CODING.length;
    const done = state.mastered.length + Object.keys(state.answers).length + state.codePassed.length;
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  /* ---------- highlight ---------- */
  const KEYWORDS = new Set(["auto","break","case","const","continue","default","do","else","enum","extern","for","goto","if","register","restrict","return","signed","sizeof","static","struct","switch","typedef","union","unsigned","volatile","while","inline","_Bool"]);
  const TYPES = new Set(["char","int","short","long","float","double","void","size_t","FILE","bool"]);
  function highlightC(src) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(#\s*[a-zA-Z]+)|\b([A-Za-z_]\w*)\b|\b(\d+(?:\.\d+)?[fFuUlL]*)\b/g;
    let out = "", last = 0, m;
    while ((m = re.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += '<span class="tok-c">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-s">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-p">' + esc(m[3]) + "</span>";
      else if (m[4]) {
        const w = m[4];
        if (TYPES.has(w)) out += '<span class="tok-t">' + w + "</span>";
        else if (KEYWORDS.has(w)) out += '<span class="tok-k">' + w + "</span>";
        else out += esc(w);
      } else if (m[5]) out += '<span class="tok-n">' + esc(m[5]) + "</span>";
      last = re.lastIndex;
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    out += esc(src.slice(last));
    return out;
  }

  /* ---------- toast / stamp ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function stamp() {
    const el = $("#stamp");
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1900);
  }

  /* ---------- shell ---------- */
  function updateTopbar() {
    const d = daysUntil(state.examDate);
    const cd = $("#exam-countdown");
    if (!isFinite(d)) cd.textContent = "设置期中日期";
    else if (d > 0) cd.textContent = "距期中 " + d + " 天";
    else if (d === 0) cd.textContent = "今天期中";
    else cd.textContent = "期中已过 " + (-d) + " 天";
    const p = progress();
    $("#progress-text").textContent = p.done + " / " + p.total;
    $$(".tab").forEach(t => {
      const on = t.dataset.view === state.view;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function render() {
    updateTopbar();
    renderRail();
    if (state.view === "today") renderToday();
    else if (state.view === "learn") renderLearn();
    else if (state.view === "practice") renderPractice();
    else renderCode();
  }

  function hashFor(view) {
    if (view === "learn") return "#learn/" + state.lastChapter;
    if (view === "code") return "#code/" + state.lastProblem;
    return "#" + view;
  }
  function applyHash() {
    const h = String(location.hash || "").replace(/^#\/?/, "");
    if (!h) return;
    const parts = h.split("/");
    const v = parts[0], id = parts[1];
    if (["today", "learn", "practice", "code"].indexOf(v) < 0) return;
    state.view = v;
    if (v === "learn" && CHAPTER_MAP[id]) state.lastChapter = id;
    if (v === "code" && CODE_MAP[id]) state.lastProblem = id;
  }
  function goto(view, opts) {
    state.view = view;
    if (opts && opts.chapter) state.lastChapter = opts.chapter;
    if (opts && opts.problem) state.lastProblem = opts.problem;
    save(true);
    history.replaceState(null, "", hashFor(view));
    render();
    window.scrollTo(0, 0);
    $("#view").focus({ preventScroll: true });
  }

  /* ---------- rail ---------- */
  function renderRail() {
    const rail = $("#rail");
    if (state.view === "learn") {
      rail.innerHTML =
        '<div class="rail-group"><p class="rail-title">章节</p>' +
        CHAPTERS.map((c, i) =>
          '<button class="rail-item' + (c.id === state.lastChapter ? " is-active" : "") + '" data-nav="chapter" data-chapter="' + c.id + '">' +
          '<span class="idx">' + pad(i + 1) + "</span>" +
          '<span class="label">' + esc(c.title) + "</span>" +
          (c.term === "mid" ? "" : '<span class="badge badge--final">期末</span>') +
          '<span class="dot ' + (state.mastered.includes(c.id) ? "" : "dot--empty") + '"></span>' +
          "</button>").join("") +
        "</div>";
      return;
    }
    if (state.view === "practice") {
      rail.innerHTML =
        '<div class="rail-group"><p class="rail-title">章节</p>' +
        '<button class="rail-item' + (practice.chapter === "all" ? " is-active" : "") + '" data-nav="qchapter" data-chapter="all"><span class="label">全部章节</span><span class="rail-count">' + QUESTIONS.length + "</span></button>" +
        CHAPTERS.filter(c => QUESTIONS.some(q => q.chapter === c.id)).map(c => {
          const qs = QUESTIONS.filter(q => q.chapter === c.id);
          const done = qs.filter(q => state.answers[q.id]).length;
          return '<button class="rail-item' + (practice.chapter === c.id ? " is-active" : "") + '" data-nav="qchapter" data-chapter="' + c.id + '">' +
            '<span class="label">' + esc(c.title) + "</span>" +
            '<span class="rail-count tabular">' + done + "/" + qs.length + "</span></button>";
        }).join("") +
        "</div>";
      return;
    }
    if (state.view === "code") {
      rail.innerHTML =
        '<div class="rail-group"><p class="rail-title">编程题</p>' +
        CODING.map((c, i) =>
          '<button class="rail-item' + (c.id === state.lastProblem ? " is-active" : "") + '" data-nav="problem" data-problem="' + c.id + '">' +
          '<span class="idx">' + pad(i + 1) + "</span>" +
          '<span class="label">' + esc(c.title) + "</span>" +
          '<span class="dot ' + (state.codePassed.includes(c.id) ? "" : "dot--empty") + '"></span>' +
          "</button>").join("") +
        "</div>";
      return;
    }
    const p = progress();
    rail.innerHTML =
      '<div class="rail-group"><p class="rail-title">进度</p>' +
      '<div class="rail-item"><span class="label">知识点</span><span class="rail-count tabular">' + state.mastered.length + "/" + CHAPTERS.length + "</span></div>" +
      '<div class="rail-item"><span class="label">练习</span><span class="rail-count tabular">' + Object.keys(state.answers).length + "/" + QUESTIONS.length + "</span></div>" +
      '<div class="rail-item"><span class="label">编程</span><span class="rail-count tabular">' + state.codePassed.length + "/" + CODING.length + "</span></div>" +
      '<div class="rail-item"><span class="label">总进度</span><span class="rail-count tabular">' + p.pct + "%</span></div>" +
      "</div>" +
      '<div class="rail-group"><p class="rail-title">快捷入口</p>' +
      '<button class="rail-item" data-nav="view" data-view="learn"><span class="label">继续读知识点</span></button>' +
      '<button class="rail-item" data-nav="view" data-view="practice"><span class="label">继续做题</span></button>' +
      '<button class="rail-item" data-nav="view" data-view="code"><span class="label">继续写代码</span></button>' +
      "</div>";
  }

  /* ---------- today ---------- */
  function renderToday() {
    ensurePlan();
    const d = daysUntil(state.examDate);
    const p = progress();
    const tp = todayPlan();
    const head =
      '<div class="today-head"><div>' +
      '<p class="date-line">' + fmtCN(todayISO()) + "</p>" +
      "<h1>" + (!isFinite(d) ? "先设置期中日期" : d > 0 ? '距期中还有 <span class="countdown">' + d + "</span> 天" : d === 0 ? "今天就是期中" : "期中已经结束") + "</h1>" +
      '<p class="today-sub">' + (!isFinite(d) ? "设置日期和每天可用时间，下面会自动排出一份到考前的计划。" : d > 0 ? "按 " + state.minutes + " 分钟/天推进。先把会做的做对，再补不会的。" : "把这份记录留着，期末还能用；也可以改日期重新排计划。") + "</p>" +
      "</div>" +
      '<div class="btn-row"><button class="btn btn--primary" data-nav="view" data-view="practice">开始做题</button>' +
      '<button class="btn" data-nav="view" data-view="learn">读知识点</button></div></div>';

    const stats =
      '<div class="stats">' +
      '<div class="stat"><div class="n tabular">' + state.mastered.length + "/" + CHAPTERS.length + '</div><div class="l">知识点已掌握</div></div>' +
      '<div class="stat"><div class="n tabular">' + Object.keys(state.answers).length + "/" + QUESTIONS.length + '</div><div class="l">练习题已作答</div></div>' +
      '<div class="stat"><div class="n tabular">' + state.codePassed.length + "/" + CODING.length + '</div><div class="l">编程题已通过</div></div>' +
      "</div>" +
      '<div class="bar" role="progressbar" aria-valuenow="' + p.pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + p.pct + '%"></i></div>';

    let todos;
    if (!tp) {
      todos = '<div class="empty"><strong>今天没有计划任务</strong>期中日期可能已经过去，或者计划还没生成。调整下方日期后重新生成即可。</div>';
    } else {
      todos = '<ul class="todo">' + tp.day.tasks.map((t, ti) => {
        const nav = t.type === "read" ? "data-nav=\"chapter\" data-chapter=\"" + t.ref + "\""
          : t.type === "practice" ? 'data-nav="view" data-view="practice"'
          : 'data-nav="view" data-view="code"';
        return '<li><input type="checkbox" ' + (t.done ? "checked" : "") + ' data-plan-day="' + tp.index + '" data-plan-task="' + ti + '" aria-label="' + esc(t.label) + '">' +
          '<span class="t ' + (t.done ? "done" : "") + '"><button class="btn--ghost btn--sm" ' + nav + ' style="padding:0;border:0;text-align:left">' + esc(t.label) + "</button>" +
          "<small>" + (t.type === "read" ? "约 " + (CHAPTER_MAP[t.ref] ? CHAPTER_MAP[t.ref].minutes : 25) + " 分钟" : t.type === "practice" ? "选择题、手算、填空混合" : "在页面里编译运行") + "</small></span></li>";
      }).join("") + "</ul>";
    }

    const planForm =
      '<div class="section-head"><h2>学习计划</h2><span class="small muted">按剩余天数自动分配章节</span></div>' +
      '<form class="form-row" id="plan-form">' +
      '<div class="field"><label for="exam-date">期中日期</label><input type="date" id="exam-date" value="' + state.examDate + '"></div>' +
      '<div class="field"><label for="daily-minutes">每天可用时间</label><select id="daily-minutes">' +
      [45, 60, 90, 120, 150].map(m => '<option value="' + m + '"' + (state.minutes === m ? " selected" : "") + ">" + m + " 分钟</option>").join("") +
      "</select></div>" +
      '<button class="btn btn--primary" type="submit">重新生成计划</button>' +
      "</form>";

    let planList = "";
    if (state.plan && state.plan.days.length) {
      const today = todayISO();
      planList = '<div class="plan">' + state.plan.days.map((day, di) => {
        const dd = parseISO(day.date);
        const isToday = day.date === today;
        return '<div class="plan-day"><div class="d"><strong>' + (isToday ? "今天" : "周" + ["日","一","二","三","四","五","六"][dd.getDay()]) + "</strong>" +
          (dd.getMonth() + 1) + "/" + dd.getDate() + "</div><ul class=\"plan-tasks\">" +
          day.tasks.map((t, ti) =>
            "<li><input type=\"checkbox\" " + (t.done ? "checked" : "") + ' data-plan-day="' + di + '" data-plan-task="' + ti + '" aria-label="' + esc(t.label) + '">' +
            '<span class="' + (t.done ? "done" : "") + '">' + esc(t.label) + "</span></li>").join("") +
          "</ul></div>";
      }).join("") + "</div>";
    } else {
      planList = '<div class="empty"><strong>还没有计划</strong>设置日期和每日时间，点「重新生成计划」。</div>';
    }

    $("#view").className = "main main--narrow";
    $("#view").innerHTML = head + stats +
      '<div class="section-head"><h2>今天的任务</h2><span class="small muted">' + (tp ? "完成一项勾一项" : "") + "</span></div>" + todos +
      planForm + planList;
  }

  /* ---------- learn ---------- */
  function renderLearn() {
    let c = CHAPTER_MAP[state.lastChapter];
    if (!c) { c = CHAPTERS[0]; state.lastChapter = c.id; }
    const idx = CHAPTERS.findIndex(x => x.id === c.id);
    const prev = CHAPTERS[idx - 1], next = CHAPTERS[idx + 1];
    const mastered = state.mastered.includes(c.id);

    const body = c.sections.map(s =>
      "<h3>" + esc(s.h) + "</h3>" + s.html + (s.code ? '<pre><code>' + highlightC(s.code) + "</code></pre>" : "")
    ).join("");

    $("#view").className = "main main--narrow";
    $("#view").innerHTML =
      '<article class="article">' +
      '<header class="article-head">' +
      '<div class="article-meta"><span class="badge">' + (c.term === "mid" ? "期中范围" : "期末范围") + "</span><span>约 " + c.minutes + " 分钟</span><span>第 " + (idx + 1) + " / " + CHAPTERS.length + " 章</span></div>" +
      "<h1>" + esc(c.title) + "</h1>" +
      '<div class="goals"><h4>读完你应该能</h4><ul>' + c.goals.map(g => "<li>" + esc(g) + "</li>").join("") + "</ul></div>" +
      "</header>" +
      '<div class="article-body">' + body + "</div>" +
      '<div class="traps"><h3>易错点</h3><ol>' + c.traps.map(t => "<li>" + esc(t) + "</li>").join("") + "</ol></div>" +
      '<div class="article-foot">' +
      '<div class="btn-row"><button class="btn ' + (mastered ? "" : "btn--primary") + '" data-action="toggle-mastered" data-chapter="' + c.id + '">' + (mastered ? "已掌握 ✓" : "标记已掌握") + "</button>" +
      '<button class="btn" data-action="practice-chapter" data-chapter="' + c.id + '">做这一章的题</button></div>' +
      '<div class="btn-row">' + (prev ? '<button class="btn btn--ghost" data-nav="chapter" data-chapter="' + prev.id + '">← ' + esc(prev.title) + "</button>" : "") +
      (next ? '<button class="btn btn--ghost" data-nav="chapter" data-chapter="' + next.id + '">' + esc(next.title) + " →</button>" : "") + "</div>" +
      "</div></article>";
  }

  /* ---------- practice ---------- */
  function filteredQuestions() {
    return QUESTIONS.filter(q =>
      (practice.type === "all" || q.type === practice.type) &&
      (practice.chapter === "all" || q.chapter === practice.chapter));
  }

  function answerState(q) { return state.answers[q.id]; }

  function renderPractice() {
    const list = filteredQuestions();
    if (practice.index >= list.length) practice.index = Math.max(0, list.length - 1);
    const q = list[practice.index];

    const typeChips = [["all", "全部"], ["choice", "选择题"], ["output", "手算输出"], ["fill", "代码填空"]];
    const head = '<div class="practice-head"><div><h1>练习</h1><p class="lead" style="margin:8px 0 0">答完立刻看解析。做错的题会自动记进进度。</p></div>' +
      '<div class="filters">' + typeChips.map(t => '<button class="chip' + (practice.type === t[0] ? " is-on" : "") + '" data-nav="qtype" data-qtype="' + t[0] + '">' + t[1] + "</button>").join("") + "</div></div>";

    if (!q) {
      $("#view").className = "main main--narrow";
      $("#view").innerHTML = head + '<div class="empty"><strong>这个筛选下没有题</strong>换一个题型或章节。</div>';
      return;
    }

    const done = answerState(q);
    let inputs = "";
    if (q.type === "choice") {
      inputs = '<div class="options" role="radiogroup" aria-label="选项">' + q.options.map((o, i) => {
        let cls = "option";
        if (done) {
          if (i === q.answer) cls += " is-correct";
          else if (done.value === i) cls += " is-wrong";
        }
        return '<button class="' + cls + '" role="radio" aria-checked="' + (done && done.value === i) + '" ' + (done ? "disabled" : "") +
          ' data-action="pick" data-index="' + i + '"><span class="letter">' + "ABCD"[i] + "</span><span>" + esc(o) + "</span></button>";
      }).join("") + "</div>";
    } else if (q.type === "output") {
      inputs = '<div class="answer-area"><label class="small muted" for="ans-input">写出程序输出（多行直接换行）</label>' +
        '<textarea id="ans-input" spellcheck="false" ' + (done ? "disabled" : "") + ' placeholder="在这里输入">' + (done ? esc(done.value) : "") + "</textarea></div>" +
        (done ? "" : '<div class="btn-row" style="margin-top:12px"><button class="btn btn--primary" data-action="submit-output">提交答案</button></div>');
    } else {
      inputs = q.blanks.map((b, i) =>
        '<div class="blank-row"><label for="blank-' + i + '">' + esc(b.label) + "</label>" +
        '<input id="blank-' + i + '" spellcheck="false" ' + (done ? "disabled" : "") + ' value="' + (done ? esc(done.value[i] || "") : "") + '" placeholder="输入代码片段">' +
        "</div>").join("") +
        (done ? "" : '<div class="btn-row" style="margin-top:8px"><button class="btn btn--primary" data-action="submit-fill">提交答案</button></div>');
    }

    let feedback = "";
    if (done) {
      let expected = "";
      if (q.type === "choice") expected = "ABCD"[q.answer];
      else if (q.type === "output") expected = q.answer;
      else expected = q.blanks.map((b, i) => "(" + (i + 1) + ") " + b.answer).join("　");
      feedback = '<div class="feedback ' + (done.correct ? "ok" : "no") + '">' +
        '<div class="head">' + (done.correct ? "✓ 正确" : "✗ 不对") + "</div>" +
        (done.correct ? "" : '<p class="small" style="margin:0 0 8px"><strong>正确答案：</strong><span class="mono">' + esc(expected) + "</span></p>") +
        '<div class="exp">' + q.explain + "</div></div>";
    }

    $("#view").className = "main main--narrow";
    $("#view").innerHTML = head +
      '<div class="q-wrap"><div class="q-meta"><span class="badge">' + TYPE_LABEL[q.type] + "</span><span>" + esc(CHAPTER_MAP[q.chapter].title) + '</span><span class="q-index">' + (practice.index + 1) + " / " + list.length + "</span></div>" +
      '<div class="q-prompt">' + q.prompt + "</div>" + inputs + feedback +
      '<div class="q-foot"><button class="btn" data-action="prev-q" ' + (practice.index === 0 ? "disabled" : "") + ">上一题</button>" +
      '<span class="q-index">已答 ' + Object.keys(state.answers).length + " / " + QUESTIONS.length + "</span>" +
      '<button class="btn btn--primary" data-action="next-q" ' + (practice.index >= list.length - 1 ? "disabled" : "") + ">下一题</button></div></div>";
  }

  function recordAnswer(q, correct, value) {
    state.answers[q.id] = { correct: correct, value: value, at: Date.now() };
    save(true);
    renderPractice();
    updateTopbar();
    renderRail();
  }

  function checkOutput(q, value) {
    const v = normText(value);
    if (v === normText(q.answer)) return true;
    if (q.accept && q.accept.some(a => normText(a) === v)) return true;
    return false;
  }

  /* ---------- code ---------- */
  function renderCode() {
    const p = CODE_MAP[state.lastProblem] || CODING[0];
    state.lastProblem = p.id;
    if (codeRun.lastProblem !== p.id) {
      codeRun = { running: false, result: null, tests: [], lastProblem: p.id };
    }
    const passed = state.codePassed.includes(p.id);
    const saved = state.code[p.id] != null ? state.code[p.id] : p.starter;

    $("#view").className = "main main--wide";
    $("#view").innerHTML =
      '<div class="code-head"><div><div class="code-meta"><span class="badge">' + esc(p.level) + "</span><span>" + esc(CHAPTER_MAP[p.chapter].title) + "</span>" +
      '<span class="status-pill"><span class="dot ' + (passed ? "" : "dot--empty") + '"></span>' + (passed ? "已通过" : "未通过") + "</span></div>" +
      "<h1>" + esc(p.title) + "</h1>" +
      '<p class="statement">' + esc(p.statement) + "</p>" +
      '<div class="io-grid"><div class="box"><h4>输入格式</h4><p>' + esc(p.inputFormat) + '</p></div><div class="box"><h4>输出格式</h4><p>' + esc(p.outputFormat) + "</p></div></div>" +
      '<div class="sample"><div><h4 class="small muted">样例输入</h4><pre>' + esc(p.sampleInput) + '</pre></div><div><h4 class="small muted">样例输出</h4><pre>' + esc(p.sampleOutput) + "</pre></div></div>" +
      '<details class="hints"><summary>思路提示（先自己想 5 分钟）</summary><ol>' + p.hints.map(h => "<li>" + esc(h) + "</li>").join("") + "</ol></details>" +
      "</div></div>" +
      '<div class="workspace">' +
      '<div class="workspace-toolbar"><div class="btn-row"><span class="small muted">main.c</span><span class="small muted" id="run-status"></span></div>' +
      '<div class="btn-row"><button class="btn btn--primary" data-action="run">运行 <span class="small" style="opacity:.7">Ctrl+↵</span></button>' +
      '<button class="btn" data-action="test-all">运行全部测试</button>' +
      '<button class="btn btn--ghost" data-action="reset" id="reset-btn">重置代码</button></div></div>' +
      '<div class="editor"><div class="editor-gutter" id="code-gutter" aria-hidden="true"></div>' +
      '<div class="editor-area"><pre id="code-highlight" aria-hidden="true"></pre><textarea id="code-input" spellcheck="false" aria-label="C 代码编辑器"></textarea></div></div>' +
      '<div class="io-panel"><div class="field"><label for="stdin">标准输入（stdin）</label><textarea id="stdin" spellcheck="false" placeholder="运行用的输入">' + esc(p.sampleInput) + "</textarea></div>" +
      '<div class="field"><label>快捷操作</label><div class="btn-row"><button class="btn btn--sm" data-action="fill-sample">填入样例输入</button><button class="btn btn--sm" data-action="clear-stdin">清空输入</button></div>' +
      '<p class="small muted" style="margin:10px 0 0">输出对比会忽略行尾空格和首尾空行。</p></div></div>' +
      '<div class="output"><div class="output-head"><h4>运行结果</h4><span class="small muted" id="run-time"></span></div><div class="out" id="run-out" aria-live="polite"><span class="dim">还没有运行。</span></div></div>' +
      '<div class="tests" id="test-list"></div>' +
      '<div class="diff" id="diff-box"></div>' +
      '<details class="solution"><summary>标准思路与答案</summary><p class="note">先自己写完再看。对照时重点看「边界怎么处理」和「循环边界」。只抄代码不解决问题。</p><pre><code>' + highlightC(p.solution) + "</code></pre></details>" +
      "</div>";

    mountEditor(p.id, saved);
    if (codeRun.result) paintRun(codeRun.result);
    if (codeRun.tests.length) paintTests(codeRun.tests, p);
  }

  function mountEditor(pid, value) {
    const ta = $("#code-input"), pre = $("#code-highlight"), gutter = $("#code-gutter");
    if (!ta) return;
    ta.value = value;
    const sync = () => {
      pre.innerHTML = highlightC(ta.value) + "\n";
      const n = ta.value.split("\n").length;
      let g = "";
      for (let i = 1; i <= n; i++) g += i + "\n";
      gutter.textContent = g;
      state.code[pid] = ta.value;
      save();
    };
    sync();
    ta.addEventListener("input", sync);
    ta.addEventListener("scroll", () => {
      pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft;
      gutter.scrollTop = ta.scrollTop;
    });
    ta.addEventListener("keydown", e => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
        sync();
      }
      if (e.key === "Escape") { ta.blur(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCurrent();
      }
    });
  }

  async function apiRun(code, stdin) {
    let r;
    try {
      r = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, stdin: stdin })
      });
    } catch (e) {
      throw new Error("本地编译服务没有启动。请双击 review-site 里的「启动复习网页.bat」，或在终端运行 python server.py，再用 http://127.0.0.1:8765 打开页面。");
    }
    if (!r.ok) throw new Error("编译服务返回 " + r.status);
    return await r.json();
  }

  function paintRun(res) {
    const out = $("#run-out"), time = $("#run-time"), status = $("#run-status");
    if (!out) return;
    let html = "";
    if (res.stage === "compile") {
      html = '<span class="err">编译失败</span>\n' + esc(res.compile || "");
    } else if (res.stage === "run") {
      if (res.compile && res.compile.trim()) html += '<span class="warn">编译警告</span>\n' + esc(res.compile) + "\n";
      if (res.stdout) html += esc(res.stdout);
      if (res.stderr) html += '<span class="err">' + esc(res.stderr) + "</span>";
      if (res.timeout) html += '<span class="err">运行超时（3 秒）。检查循环是否能结束，或是否在等待输入。</span>';
      if (!html.trim()) html = '<span class="dim">（无输出）</span>';
    } else {
      html = '<span class="err">' + esc(res.error || "运行失败") + "</span>";
    }
    out.innerHTML = html;
    if (time) time.textContent = res.ms != null ? res.ms + " ms" : "";
    if (status) status.textContent = res.stage === "compile" ? "编译失败" : res.timeout ? "超时" : "运行结束";
  }

  function paintTests(results, p) {
    const box = $("#test-list");
    if (!box) return;
    if (!results.length) { box.innerHTML = ""; return; }
    box.innerHTML = '<p class="small muted" style="margin:0 0 4px">测试点</p><ul class="tests">' +
      results.map(r =>
        '<li><span class="mark ' + (r.ok ? "pass" : "fail") + '">' + (r.ok ? "✓" : "✗") + "</span>" +
        '<span class="name">' + esc(r.name) + "</span><span class=\"time\">" + (r.ms != null ? r.ms + " ms" : "") + "</span></li>"
      ).join("") + "</ul>";
  }

  function hasMain(code) {
    const stripped = String(code).replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return /\bmain\s*\(/.test(stripped);
  }

  async function runCurrent() {
    const p = CODE_MAP[state.lastProblem];
    const code = $("#code-input") ? $("#code-input").value : (state.code[p.id] || p.starter);
    const stdin = $("#stdin") ? $("#stdin").value : "";
    if (!hasMain(code)) {
      const res = { stage: "error", error: "没有找到 main 函数。编程题需要自己写 int main(void) { ... }。" };
      codeRun.result = res; paintRun(res); return;
    }
    codeRun.running = true;
    const btn = $('[data-action="run"]');
    if (btn) { btn.disabled = true; btn.textContent = "编译中…"; }
    if ($("#run-out")) $("#run-out").innerHTML = '<span class="dim">正在调用 gcc…</span>';
    try {
      const res = await apiRun(code, stdin);
      codeRun.result = res;
      paintRun(res);
      const expected = normOut(p.sampleOutput), actual = normOut(res.stdout || "");
      const ok = res.stage === "run" && expected === actual;
      paintDiff(expected, actual, ok);
    } catch (e) {
      codeRun.result = { stage: "error", error: e.message };
      paintRun(codeRun.result);
    } finally {
      codeRun.running = false;
      if (btn) { btn.disabled = false; btn.textContent = "运行 Ctrl+↵"; }
    }
  }

  function paintDiff(expected, actual, ok) {
    const box = $("#diff-box");
    if (!box) return;
    const e = expected.split("\n"), a = actual.split("\n");
    const n = Math.max(e.length, a.length);
    let left = "", right = "";
    for (let i = 0; i < n; i++) {
      const same = e[i] === a[i];
      left += '<div class="diff-line ' + (same ? "good" : "bad") + '"><span class="ln">' + (i + 1) + "</span><span>" + esc(e[i] == null ? "" : e[i]) + "</span></div>";
      right += '<div class="diff-line ' + (same ? "good" : "bad") + '"><span class="ln">' + (i + 1) + "</span><span>" + esc(a[i] == null ? "" : a[i]) + "</span></div>";
    }
    box.innerHTML = '<div class="output-head"><h4>与样例输出逐行对比</h4><span class="small ' + (ok ? "muted" : "") + '" style="' + (ok ? "color:var(--success)" : "color:var(--accent)") + '">' + (ok ? "✓ 与样例一致" : "✗ 与样例不一致") + "</span></div>" +
      '<div class="diff-grid"><div class="diff-col"><h4>期望输出</h4>' + left + '</div><div class="diff-col"><h4>你的输出</h4>' + right + "</div></div>";
  }

  async function runAllTests() {
    const p = CODE_MAP[state.lastProblem];
    const code = $("#code-input") ? $("#code-input").value : (state.code[p.id] || p.starter);
    if (!hasMain(code)) {
      toast("没有找到 main 函数，先补上再测试");
      paintRun({ stage: "error", error: "没有找到 main 函数。编程题需要自己写 int main(void) { ... }。" });
      return;
    }
    const btn = $('[data-action="test-all"]');
    if (btn) { btn.disabled = true; btn.textContent = "运行中…"; }
    codeRun.tests = [];
    const results = [];
    for (const t of p.tests) {
      const res = await apiRun(code, t.input);
      const ok = res.stage === "run" && normOut(res.stdout || "") === normOut(t.expected);
      results.push({ name: t.name, ok: ok, ms: res.ms, expected: t.expected, actual: res.stdout || "" });
      codeRun.tests = results.slice();
      paintTests(results, p);
      updateTopbar();
    }
    if (btn) { btn.disabled = false; btn.textContent = "运行全部测试"; }
    const all = results.length > 0 && results.every(r => r.ok);
    if (all) {
      if (!state.codePassed.includes(p.id)) state.codePassed.push(p.id);
      save(true);
      stamp();
      toast("全部测试通过，已记入进度");
      renderRail();
      updateTopbar();
      const status = $(".status-pill");
      if (status) status.innerHTML = '<span class="dot"></span>已通过';
    } else {
      const first = results.find(r => !r.ok);
      if (first) paintDiff(normOut(first.expected), normOut(first.actual), false);
      toast("还有测试点没通过，看看下方的对比");
    }
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      const kind = nav.dataset.nav;
      if (kind === "view") goto(nav.dataset.view);
      else if (kind === "chapter") goto("learn", { chapter: nav.dataset.chapter });
      else if (kind === "problem") { state.lastProblem = nav.dataset.problem; save(true); render(); window.scrollTo(0, 0); }
      else if (kind === "qtype") { practice.type = nav.dataset.qtype; practice.index = 0; render(); }
      else if (kind === "qchapter") { practice.chapter = nav.dataset.chapter; practice.index = 0; render(); }
      return;
    }

    const act = e.target.closest("[data-action]");
    if (!act) return;
    const a = act.dataset.action;
    const p = CODE_MAP[state.lastProblem];

    if (a === "toggle-mastered") {
      const id = act.dataset.chapter;
      const i = state.mastered.indexOf(id);
      if (i >= 0) state.mastered.splice(i, 1); else state.mastered.push(id);
      save(true); render(); toast(i >= 0 ? "已取消掌握" : "已标记掌握");
    }
    else if (a === "practice-chapter") {
      practice.chapter = act.dataset.chapter; practice.type = "all"; practice.index = 0;
      goto("practice");
    }
    else if (a === "pick") {
      const q = filteredQuestions()[practice.index];
      if (answerState(q)) return;
      const idx = Number(act.dataset.index);
      recordAnswer(q, idx === q.answer, idx);
    }
    else if (a === "submit-output") {
      const q = filteredQuestions()[practice.index];
      const v = $("#ans-input") ? $("#ans-input").value : "";
      recordAnswer(q, checkOutput(q, v), v);
    }
    else if (a === "submit-fill") {
      const q = filteredQuestions()[practice.index];
      const vals = q.blanks.map((b, i) => {
        const el = $("#blank-" + i);
        return el ? el.value : "";
      });
      const ok = q.blanks.every((b, i) => {
        const v = normCode(vals[i]);
        if (v === normCode(b.answer)) return true;
        return (b.accept || []).some(x => normCode(x) === v);
      });
      recordAnswer(q, ok, vals);
    }
    else if (a === "prev-q") { practice.index = Math.max(0, practice.index - 1); renderPractice(); }
    else if (a === "next-q") { practice.index = Math.min(filteredQuestions().length - 1, practice.index + 1); renderPractice(); }
    else if (a === "run") { runCurrent(); }
    else if (a === "test-all") { runAllTests(); }
    else if (a === "fill-sample") { const s = $("#stdin"); if (s) s.value = p.sampleInput; }
    else if (a === "clear-stdin") { const s = $("#stdin"); if (s) s.value = ""; }
    else if (a === "reset") {
      if (act.dataset.confirm === "1") {
        state.code[p.id] = p.starter; save(true);
        mountEditor(p.id, p.starter);
        act.dataset.confirm = ""; act.textContent = "重置代码";
        toast("已恢复初始代码");
      } else {
        act.dataset.confirm = "1"; act.textContent = "再点一次确认";
        setTimeout(() => { if (act.dataset.confirm === "1") { act.dataset.confirm = ""; act.textContent = "重置代码"; } }, 3000);
      }
    }
  });

  document.addEventListener("change", e => {
    const cb = e.target.closest("[data-plan-day]");
    if (cb) {
      const di = Number(cb.dataset.planDay), ti = Number(cb.dataset.planTask);
      if (state.plan && state.plan.days[di] && state.plan.days[di].tasks[ti]) {
        state.plan.days[di].tasks[ti].done = cb.checked;
        save(true);
        if (state.view === "today") renderToday();
        renderRail();
      }
    }
  });

  document.addEventListener("submit", e => {
    if (e.target.id !== "plan-form") return;
    e.preventDefault();
    const date = $("#exam-date").value;
    const mins = Number($("#daily-minutes").value);
    if (!date) { toast("先选一个日期"); return; }
    state.examDate = date; state.minutes = mins;
    generatePlan(); render(); toast("计划已重新生成");
  });

  $$(".tab").forEach(t => t.addEventListener("click", () => goto(t.dataset.view)));
  const brand = $(".brand");
  if (brand) brand.addEventListener("click", e => { e.preventDefault(); goto("today"); });

  window.addEventListener("hashchange", function () { applyHash(); render(); });
  applyHash();
  ensurePlan();
  render();
})();