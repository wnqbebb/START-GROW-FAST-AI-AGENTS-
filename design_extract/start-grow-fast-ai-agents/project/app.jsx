/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

// ============ Tweak defaults ============
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1E5EFF",
  "heroVariant": 0,
  "brutalist": false,
  "fontDisplay": "Space Grotesk",
  "theme": "dark"
}/*EDITMODE-END*/;

// ============ Language ============
function detectLang() {
  const saved = localStorage.getItem("sgf_lang");
  if (saved) return saved;
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return nav === "es" ? "es" : "en";
}

function useLang() {
  const [lang, setLang] = useState(detectLang());
  useEffect(() => { localStorage.setItem("sgf_lang", lang); document.documentElement.lang = lang; }, [lang]);
  return [lang, setLang];
}

// ============ Scroll reveal ============
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

// ============ Icons ============
const Arrow = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparkIcon = ({ size = 10 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
  </svg>
);

// ============ Sparkles (decorative background particles) ============
function Sparkles({ count = 40, className = "" }) {
  const sparks = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 4,
    dur: 2 + Math.random() * 4,
  })), [count]);
  return (
    <div className={`sparkles ${className}`} aria-hidden="true">
      {sparks.map(s => (
        <span key={s.id} className="spark" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
        }} />
      ))}
    </div>
  );
}

// ============ Typewriter / Text cycle ============
function TextCycle({ words, interval = 2400 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(n => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);
  return (
    <span className="text-cycle">
      {words.map((w, k) => (
        <span key={k} className={`tc-word ${k === i ? "on" : ""}`}>{w}</span>
      ))}
    </span>
  );
}

// ============ Shiny button ============
function ShinyButton({ children, href, onClick, className = "", variant = "primary" }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag href={href} onClick={onClick} className={`shiny-btn ${variant} ${className}`}>
      <span className="shiny-btn-inner">
        {children}
      </span>
      <span className="shiny-btn-shine" />
    </Tag>
  );
}

// ============ Preloader ============
function Preloader() {
  const [out, setOut] = useState(false);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const seen = sessionStorage.getItem("sgf_loaded");
    if (seen) { setHide(true); return; }
    const t1 = setTimeout(() => setOut(true), 1100);
    const t2 = setTimeout(() => { setHide(true); sessionStorage.setItem("sgf_loaded", "1"); }, 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (hide) return null;
  return (
    <div className={`preloader ${out ? "out" : ""}`}>
      <div className="preloader-mark">
        <div className="preloader-row mono">START</div>
        <div className="preloader-row mono">GROW</div>
        <div className="preloader-row mono">FAST</div>
      </div>
      <div className="preloader-bar"><span /></div>
    </div>
  );
}

// ============ Nav ============
function Nav({ t, lang, setLang, onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#top" className="nav-logo">
          <img src="assets/logo.png" alt="SGF" />
          <span>START GROW FAST</span>
        </a>
        <div className="nav-links">
          <a href="#services">{t.nav.services}</a>
          <a href="#how">{t.nav.how}</a>
          <a href="#niches">{t.nav.niches}</a>
          <a href="#cases">{t.nav.work}</a>
          <a href="#blog">{t.nav.blog}</a>
          <a href="#contact">{t.nav.contact}</a>
        </div>
        <div className="nav-right">
          <button className="lang-toggle" onClick={() => setLang(lang === "es" ? "en" : "es")} aria-label="Language">
            <span className={lang === "es" ? "active" : ""}>ES</span>
            <span className={lang === "en" ? "active" : ""}>EN</span>
          </button>
          <button className="nav-cta" onClick={onCta}>
            {t.nav.cta} <Arrow />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ============ Hero (premium, Godly-inspired) ============
function Hero({ t, variant }) {
  const v = t.hero.variants[variant] || t.hero.variants[0];
  const mainWords = v.main.split(" ");
  const mid = Math.ceil(mainWords.length / 2);
  return (
    <section className="hero" id="top">
      <div className="hero-aurora" />
      <div className="hero-grain" />
      <div className="hero-grid-new" />
      <Sparkles count={50} className="hero-sparks" />

      <div className="container hero-content">
        <div className="hero-eyebrow reveal">
          <span className="status-dot"></span>
          <span className="eyebrow-text">{t.hero.eyebrow}</span>
          <span className="eyebrow-sep">·</span>
          <span className="eyebrow-aux mono">v2026.1</span>
        </div>

        <h1 className="hero-headline-new reveal d1">
          <span className="pre">{v.pre}</span>
          <span className="main">
            <span className="gradient-text">{mainWords.slice(0, mid).join(" ")}</span>{" "}
            <span className="accent italic">{mainWords.slice(mid).join(" ")}</span>
          </span>
        </h1>

        <p className="hero-sub-new reveal d2">{v.sub}</p>

        <div className="hero-cycle reveal d2">
          <span className="cycle-label mono">{t.hero.eyebrow.includes("MOTOR") ? "Producimos" : "We ship"}</span>
          <TextCycle words={t.hero.cycle} />
        </div>

        <div className="hero-ctas reveal d3">
          <a href="#contact" className="btn-primary shiny-wrap">
            <span>{t.hero.ctaPrimary}</span>
            <Arrow />
            <span className="shine" />
          </a>
          <a href="#how" className="btn-secondary">
            {t.hero.ctaSecondary}
          </a>
        </div>

        <div className="hero-metrics-new reveal d3">
          {t.hero.metrics.map((m, i) => (
            <div key={i} className="m">
              <div className="n">{m.n}</div>
              <div className="l">{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-bottom-bar mono">
        <span>↓ {t.hero.eyebrow.includes("MOTOR") ? "DESLIZA" : "SCROLL"}</span>
        <span className="hero-bottom-bar-center">START · GROW · FAST · AI AGENTS · START · GROW · FAST · AI AGENTS</span>
        <span>EST. 2026</span>
      </div>
    </section>
  );
}

// ============ Marquee ============
function Marquee({ items }) {
  const content = (
    <span>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it}
          <span className="dot"></span>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee">
      <div className="marquee-track">
        {content}{content}
      </div>
    </div>
  );
}

// ============ Logo grid ============
function LogoBand({ title, sub, items, id }) {
  return (
    <section className="logos-band" id={id}>
      <div className="container">
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{title}</span>
          </div>
          <p>{sub}</p>
        </div>
        <div className="logo-grid reveal">
          {items.map((x, i) => (
            <div key={i} className="logo-cell">{x}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Services ladder (no prices) ============
function Services({ t }) {
  return (
    <section className="services section-invert" id="services">
      <div className="container">
        <div className="section-index">
          <span>§ 01 · {t.services.eyebrow}</span>
          <span>04 — {t.services.eyebrow === "HOW WE WORK" ? "formats" : "formatos"}</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.services.eyebrow}</span>
          </div>
          <div>
            <h2>{t.services.title}</h2>
            <p>{t.services.sub}</p>
          </div>
        </div>
        <div className="ladder">
          {t.services.items.map((s, i) => (
            <div key={i} className="ladder-row reveal">
              <div className="tag">{s.tag}</div>
              <div className="head">
                <h3 className="name">{s.name}</h3>
                <p className="promise">{s.promise}</p>
              </div>
              <ul>
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
              <div className="cycle-block">
                <div className="cycle-label">{s.cycle}</div>
                <a href="#contact" className="cycle-cta">
                  {t.services.eyebrow === "HOW WE WORK" ? "Scope it" : "Dimensionar"} <Arrow size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="ladder-footnote reveal">{t.services.footnote}</p>
      </div>
    </section>
  );
}

// ============ How it works (orbital timeline) ============
function How({ t }) {
  const [active, setActive] = useState(0);
  const steps = t.how.steps;
  return (
    <section className="how" id="how">
      <div className="container">
        <div className="section-index">
          <span>§ 02 · {t.how.eyebrow}</span>
          <span>06 — {t.how.eyebrow === "THE SYSTEM" ? "steps" : "pasos"}</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.how.eyebrow}</span>
          </div>
          <div>
            <h2>{t.how.title}</h2>
            <p>{t.how.sub}</p>
          </div>
        </div>

        <div className="orbital">
          <div className="orbital-rail">
            {steps.map((s, i) => (
              <button
                key={i}
                className={`orbital-node ${i === active ? "on" : ""}`}
                onClick={() => setActive(i)}
                aria-label={s.t}
              >
                <span className="orbital-node-n">{s.n}</span>
                <span className="orbital-node-t">{s.t}</span>
              </button>
            ))}
            <div className="orbital-line" style={{ "--prog": `${(active / (steps.length - 1)) * 100}%` }} />
          </div>
          <div className="orbital-panel">
            <div className="orbital-num">{steps[active].n}</div>
            <h3>{steps[active].t}</h3>
            <p>{steps[active].d}</p>
          </div>
        </div>

        {/* Fallback static grid for context */}
        <div className="steps-grid steps-grid-alt">
          {steps.map((s, i) => (
            <div key={i} className="step-card reveal">
              <div className="n">{s.n}</div>
              <h3 className="t">{s.t}</h3>
              <p className="d">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Niches ============
function Niches({ t }) {
  return (
    <section className="niches section-invert" id="niches">
      <div className="container">
        <div className="section-index">
          <span>§ 03 · {t.niches.eyebrow}</span>
          <span>06 — {t.niches.eyebrow.includes("SHINE") ? "verticals" : "verticales"}</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.niches.eyebrow}</span>
          </div>
          <div>
            <h2>{t.niches.title}</h2>
            <p>{t.niches.sub}</p>
          </div>
        </div>
        <div className="niches-grid">
          {t.niches.items.map((n, i) => (
            <div key={i} className="niche-card reveal">
              <div className="num">0{i + 1} / 0{t.niches.items.length}</div>
              <div>
                <h3 className="t">{n.t}</h3>
                <p className="d">{n.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Cases ============
function Cases({ t }) {
  return (
    <section className="cases" id="cases">
      <div className="container">
        <div className="section-index">
          <span>§ 04 · {t.cases.eyebrow}</span>
          <span>{t.cases.eyebrow.includes("CASES") ? "results" : "resultados"}</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.cases.eyebrow}</span>
          </div>
          <div>
            <h2>{t.cases.title}</h2>
            <p>{t.cases.sub}</p>
          </div>
        </div>
        <div className="cases-grid">
          {t.cases.items.map((c, i) => (
            <div key={i} className="case-card reveal">
              <div className="k">{c.k}</div>
              <div className="r">{c.r}</div>
              <div className="l">{c.l}</div>
              <p className="d">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Testimonial carousel ============
function Testimonials({ t }) {
  const quotes = t.cases.testimonials || [];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(n => (n + 1) % quotes.length), 6500);
    return () => clearInterval(id);
  }, [quotes.length]);
  if (!quotes.length) return null;
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonial-stage reveal">
          <div className="t-quote">"</div>
          <div className="t-track" style={{ transform: `translateX(-${i * 100}%)` }}>
            {quotes.map((q, k) => (
              <div key={k} className="t-slide">
                <blockquote>{q.q}</blockquote>
                <div className="t-meta">
                  <span className="who">{q.who}</span>
                  <span className="dot">·</span>
                  <span className="where">{q.where}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="t-dots">
            {quotes.map((_, k) => (
              <button
                key={k}
                className={`t-dot ${k === i ? "on" : ""}`}
                onClick={() => setI(k)}
                aria-label={`Testimonial ${k + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Manifesto ============
function Manifesto({ t }) {
  const ref = useRef(null);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height * 0.6)));
      setActive(Math.floor(progress * (t.manifesto.lines.length + 1)) - 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [t]);
  return (
    <section className="manifesto" id="manifesto" ref={ref}>
      <div className="container">
        <div className="section-index">
          <span>§ 05 · {t.manifesto.eyebrow}</span>
          <span>belief system</span>
        </div>
        <div className="manifesto-lines">
          {t.manifesto.lines.map((l, i) => (
            <span key={i} className={`manifesto-line ${i <= active ? "on" : ""} ${i === t.manifesto.lines.length - 1 && i <= active ? "accent" : ""}`}>
              {l}
            </span>
          ))}
        </div>
        <p className="manifesto-sub reveal">{t.manifesto.sub}</p>
      </div>
    </section>
  );
}

// ============ Showcase ============
function Showcase({ t }) {
  const items = window.SGF_DATA.showcase;
  return (
    <section className="showcase section-invert" id="showcase">
      <div className="container">
        <div className="section-index">
          <span>§ 06 · {t.showcase.eyebrow}</span>
          <span>work-in-progress</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.showcase.eyebrow}</span>
          </div>
          <div>
            <h2>{t.showcase.title}</h2>
            <p>{t.showcase.sub}</p>
          </div>
        </div>
        <div className="showcase-grid">
          {items.map((x, i) => (
            <div key={i} className="show-card reveal" data-r={x.ratio}>
              <div className="meta">
                <div className="t">{x.t}</div>
                <div className="f">{x.f}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ FAQ ============
function FAQ({ t }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-index">
          <span>§ 07 · {t.faq.eyebrow}</span>
          <span>{t.faq.items.length} — {t.faq.eyebrow === "FAQ" ? "questions" : "preguntas"}</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.faq.eyebrow}</span>
          </div>
          <div>
            <h2>{t.faq.title}</h2>
          </div>
        </div>
        <div className="faq-list">
          {t.faq.items.map((item, i) => (
            <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{item.q}</span>
                <span className="plus"></span>
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Blog ============
function Blog({ t, lang }) {
  return (
    <section className="blog section-invert" id="blog">
      <div className="container">
        <div className="section-index">
          <span>§ 08 · {t.blog.eyebrow}</span>
          <span>03 — {lang === "es" ? "artículos" : "articles"}</span>
        </div>
        <div className="section-header reveal">
          <div className="side">
            <span className="eyebrow">{t.blog.eyebrow}</span>
          </div>
          <div>
            <h2>{t.blog.title}</h2>
            <p>{t.blog.sub}</p>
          </div>
        </div>
        <div className="blog-grid">
          {t.blog.posts.map((p, i) => (
            <a key={i} href={`blog/${p.slug}.html`} className="blog-card reveal">
              <div className="img">
                <span className="tag">{p.tag}</span>
              </div>
              <div className="body">
                <h3>{p.t}</h3>
                <p className="d">{p.d}</p>
                <div className="foot">
                  <span>{p.time} · {p.date}</span>
                  <span>{lang === "es" ? "Leer" : "Read"} →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Big CTA ============
function BigCTA({ t, lang }) {
  const [main, tail] = lang === "es"
    ? ["Menos fricción,", "más volumen."]
    : ["Less friction,", "more volume."];
  return (
    <section className="big-cta">
      <div className="container big-cta-inner reveal">
        <h2>{main} <em>{tail}</em></h2>
        <p>{lang === "es"
          ? "Hablemos 20 minutos. Si no te ahorramos tiempo, te decimos exactamente quién sí puede."
          : "Let's talk 20 minutes. If we can't save you time, we'll tell you exactly who can."}</p>
        <a href="#contact" className="btn-primary">{t.nav.cta} <Arrow /></a>
      </div>
    </section>
  );
}

// ============ Contact ============
function Contact({ t }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-index">
          <span>§ 09 · {t.contact.eyebrow}</span>
          <span>&lt; 24h</span>
        </div>
        <div className="contact-wrap">
          <div className="contact-left reveal">
            <span className="eyebrow">{t.contact.eyebrow}</span>
            <h2>{t.contact.title}</h2>
            <p className="sub">{t.contact.sub}</p>
            <div className="contact-channels">
              {t.contact.channels.map((c, i) => (
                <div key={i} className="row">
                  <span className="k">{c.k}</span>
                  <span>{c.v}</span>
                </div>
              ))}
            </div>
            <a href="https://cal.com/startgrowfastaiagents" className="contact-cal">
              {t.contact.form.calendar} <Arrow />
            </a>
          </div>
          <form className="form reveal d1" onSubmit={onSubmit}>
            <div className="row2">
              <div className="field">
                <label>{t.contact.form.name}</label>
                <input type="text" required />
              </div>
              <div className="field">
                <label>{t.contact.form.company}</label>
                <input type="text" />
              </div>
            </div>
            <div className="field">
              <label>{t.contact.form.email}</label>
              <input type="email" required />
            </div>
            <div className="field">
              <label>{t.contact.form.role}</label>
              <input type="text" placeholder={t.contact.form.rolePlaceholder} />
            </div>
            <div className="field">
              <label>{t.contact.form.message}</label>
              <textarea required></textarea>
            </div>
            <button type="submit" className="form-submit">
              {sent ? "✓ Sent" : t.contact.form.send} <Arrow />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ============ Footer ============
function Footer({ t, lang }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-logo">
            <img src="assets/logo.png" alt="SGF" />
            <p>{t.footer.tag}</p>
          </div>
          <div className="footer-col">
            <h4>{t.nav.services}</h4>
            <a href="#services">Creative Sprint</a>
            <a href="#services">Testing Retainer</a>
            <a href="#services">Performance OS</a>
            <a href="#services">AI Campaigns</a>
          </div>
          <div className="footer-col">
            <h4>{lang === "es" ? "Sitio" : "Site"}</h4>
            <a href="#how">{t.nav.how}</a>
            <a href="#niches">{t.nav.niches}</a>
            <a href="#cases">{t.nav.work}</a>
            <a href="#blog">{t.nav.blog}</a>
          </div>
          <div className="footer-col">
            <h4>{t.nav.contact}</h4>
            <a href="mailto:team@startgrowfastaiagents.com">team@startgrowfastaiagents.com</a>
            <a href="https://cal.com/startgrowfastaiagents">cal.com/startgrowfastaiagents</a>
            <a href="#">LinkedIn</a>
            <a href="#">X / Twitter</a>
          </div>
          <div className="footer-col">
            <h4>{t.footer.legal}</h4>
            <a href="legal/privacy.html">{t.footer.privacy}</a>
            <a href="legal/terms.html">{t.footer.terms}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 START GROW FAST AI AGENTS · {t.footer.rights}</span>
          <span>{t.footer.built}</span>
        </div>
      </div>
    </footer>
  );
}

// ============ Spin ring (floating CTA) ============
function SpinRing({ t }) {
  return (
    <a href="#contact" className="spin-ring" aria-label="Contact">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="circle-path" d="M 100,100 m -75,0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
        </defs>
        <text fill="currentColor" fontSize="14" fontFamily="ui-monospace,monospace" letterSpacing="3">
          <textPath href="#circle-path">
            · {t.nav.cta.toUpperCase()} · LET&apos;S TALK · HABLEMOS · LET&apos;S TALK · HABLEMOS
          </textPath>
        </text>
      </svg>
      <span className="core"><Arrow size={18} /></span>
    </a>
  );
}

// ============ App ============
function App() {
  const [lang, setLang] = useLang();
  const tweaks = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const [state, setTweak] = tweaks;
  const t = window.I18N[lang];

  useReveal();

  // Apply tweak CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", state.accent);
    root.style.setProperty("--display", `"${state.fontDisplay}", "Space Grotesk", Helvetica, sans-serif`);
    root.setAttribute("data-theme", state.theme === "editorial" ? "editorial" : "dark");
    if (state.brutalist) root.setAttribute("data-brutalist", "1");
    else root.removeAttribute("data-brutalist");
  }, [state]);

  const onCta = () => {
    window.location.hash = "#contact";
  };

  return (
    <>
      <Preloader />
      <Nav t={t} lang={lang} setLang={setLang} onCta={onCta} />
      <Hero t={t} variant={state.heroVariant} />
      <Marquee items={[
        lang === "es" ? "MÁS ADS" : "MORE ADS",
        lang === "es" ? "MÁS UGC" : "MORE UGC",
        lang === "es" ? "MÁS ÁNGULOS" : "MORE ANGLES",
        lang === "es" ? "MÁS VELOCIDAD" : "MORE SPEED",
        lang === "es" ? "MENOS FRICCIÓN" : "LESS FRICTION",
        lang === "es" ? "MENOS COSTE" : "LESS COST",
      ]} />
      <LogoBand id="communities" title={t.communities.title} sub={t.communities.sub} items={window.SGF_DATA.communities} />
      <Services t={t} />
      <How t={t} />
      <LogoBand id="tools" title={t.tools.title} sub={t.tools.sub} items={window.SGF_DATA.tools} />
      <Niches t={t} />
      <Cases t={t} />
      <Testimonials t={t} />
      <Manifesto t={t} />
      <Showcase t={t} />
      <FAQ t={t} />
      <Blog t={t} lang={lang} />
      <BigCTA t={t} lang={lang} />
      <Contact t={t} />
      <Footer t={t} lang={lang} />
      <SpinRing t={t} />

      {/* Tweaks */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Color" />
          <window.TweakColor label="Accent" value={state.accent} onChange={v => setTweak("accent", v)} />
          <window.TweakSection label="Hero" />
          <window.TweakRadio
            label="Headline"
            value={String(state.heroVariant)}
            options={["0", "1", "2"]}
            onChange={v => setTweak("heroVariant", Number(v))}
          />
          <window.TweakSection label="Typography" />
          <window.TweakSelect
            label="Display font"
            value={state.fontDisplay}
            options={["Space Grotesk", "Inter Tight", "Instrument Serif", "JetBrains Mono"]}
            onChange={v => setTweak("fontDisplay", v)}
          />
          <window.TweakSection label="Mode" />
          <window.TweakRadio
            label="Theme"
            value={state.theme}
            options={["dark", "editorial"]}
            onChange={v => setTweak("theme", v)}
          />
          <window.TweakToggle label="Brutalist" value={state.brutalist} onChange={v => setTweak("brutalist", v)} />
        </window.TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
