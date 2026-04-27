/* global React, ReactDOM, Lenis, gsap, ScrollTrigger, barba */
const { useState, useEffect, useRef, useMemo } = React;


const { motion, AnimatePresence } = window.Motion || { motion: React.Fragment, AnimatePresence: React.Fragment };
const twMerge = (window.tailwindMerge && window.tailwindMerge.twMerge) || (window.TailwindMerge && window.TailwindMerge.twMerge) || ((x) => x);
const clsx = window.clsx || ((...args) => args.filter(Boolean).join(" "));
window.cn = (...inputs) => twMerge(clsx(...inputs));

const debounce = (window._ && window._.debounce) || ((fn) => {
  const f = (...args) => fn(...args);
  f.cancel = () => {};
  return f;
});
const { Engine, Render, Runner, MouseConstraint, Mouse, World, Bodies, Events, Query, Common } = window.Matter || {};
const SVGPathCommander = window.SVGPathCommander;

function ShinyButton({ children, onClick, className = "" }) {
  React.useEffect(() => {
    if (!document.getElementById("shiny-button-style")) {
      const style = document.createElement("style");
      style.id = "shiny-button-style";
      style.innerHTML = `
        @property --gradient-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @property --gradient-angle-offset { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @property --gradient-percent { syntax: "<percentage>"; initial-value: 5%; inherits: false; }
        @property --gradient-shine { syntax: "<color>"; initial-value: white; inherits: false; }
        .shiny-cta {
          --shiny-cta-bg: #000000; --shiny-cta-bg-subtle: #1a1818; --shiny-cta-fg: #ffffff; --shiny-cta-highlight: #3b82f6; --shiny-cta-highlight-subtle: #60a5fa; --animation: gradient-angle linear infinite; --duration: 3s; --shadow-size: 2px; --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
          isolation: isolate; position: relative; overflow: hidden; cursor: pointer; outline-offset: 4px; padding: 1.25rem 2.5rem; font-family: "Inter", sans-serif; font-size: 1.125rem; line-height: 1.2; font-weight: 500; border: 1px solid transparent; border-radius: 360px; color: var(--shiny-cta-fg);
          background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box, conic-gradient(from calc(var(--gradient-angle) - var(--gradient-angle-offset)), transparent, var(--shiny-cta-highlight) var(--gradient-percent), var(--gradient-shine) calc(var(--gradient-percent) * 2), var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3), transparent calc(var(--gradient-percent) * 4)) border-box;
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle); transition: var(--transition); transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine;
        }
        .shiny-cta::before, .shiny-cta::after, .shiny-cta span::before { content: ""; pointer-events: none; position: absolute; inset-inline-start: 50%; inset-block-start: 50%; translate: -50% -50%; z-index: -1; }
        .shiny-cta:active { translate: 0 1px; }
        .shiny-cta::before { --size: calc(100% - var(--shadow-size) * 3); --position: 2px; --space: calc(var(--position) * 2); width: var(--size); height: var(--size); background: radial-gradient(circle at var(--position) var(--position), white calc(var(--position) / 4), transparent 0) padding-box; background-size: var(--space) var(--space); background-repeat: space; mask-image: conic-gradient(from calc(var(--gradient-angle) + 45deg), black, transparent 10% 90%, black); border-radius: inherit; opacity: 0.4; z-index: -1; }
        .shiny-cta::after { --animation: shimmer linear infinite; width: 100%; aspect-ratio: 1; background: linear-gradient(-50deg, transparent, var(--shiny-cta-highlight), transparent); mask-image: radial-gradient(circle at bottom, transparent 40%, black); opacity: 0.6; }
        .shiny-cta span { z-index: 1; }
        .shiny-cta span::before { --size: calc(100% + 1rem); width: var(--size); height: var(--size); box-shadow: inset 0 -1ex 2rem 4px var(--shiny-cta-highlight); opacity: 0; transition: opacity var(--transition); animation: calc(var(--duration) * 1.5) breathe linear infinite; }
        .shiny-cta, .shiny-cta::before, .shiny-cta::after { animation: var(--animation) var(--duration), var(--animation) calc(var(--duration) / 0.4) reverse paused; animation-composition: add; }
        .shiny-cta:is(:hover, :focus-visible) { --gradient-percent: 20%; --gradient-angle-offset: 95deg; --gradient-shine: var(--shiny-cta-highlight-subtle); }
        .shiny-cta:is(:hover, :focus-visible), .shiny-cta:is(:hover, :focus-visible)::before, .shiny-cta:is(:hover, :focus-visible)::after { animation-play-state: running; }
        .shiny-cta:is(:hover, :focus-visible) span::before { opacity: 1; }
        @keyframes gradient-angle { to { --gradient-angle: 360deg; } }
        @keyframes shimmer { to { rotate: 360deg; } }
        @keyframes breathe { from, to { scale: 1; } 50% { scale: 1.2; } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <button className={cn("shiny-cta", className)} onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

function GlowCard({ children, className = '', glowColor = 'blue', size = 'md', width, height, customSize = false }) {
  const cardRef = React.useRef(null);
  const innerRef = React.useRef(null);

  React.useEffect(() => {
    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.blue;
  const getSizeClasses = () => customSize ? '' : sizeMap[size];

  const getInlineStyles = () => {
    const baseStyles = {
      '--base': base,
      '--spread': spread,
      '--radius': '14',
      '--border': '3',
      '--backdrop': 'hsl(0 0% 60% / 0.12)',
      '--backup-border': 'var(--backdrop)',
      '--size': '200',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: 'radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent)',
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'none',
    };
    if (width !== undefined) baseStyles.width = typeof width === 'number' ? width + 'px' : width;
    if (height !== undefined) baseStyles.height = typeof height === 'number' ? height + 'px' : height;
    return baseStyles;
  };

  const beforeAfterStyles = `
[data-glow]::before, [data-glow]::after {
      pointer-events: none; content: ""; position: absolute; inset: calc(var(--border-size) * -1); border: var(--border-size) solid transparent; border-radius: calc(var(--radius) * 1px); background-attachment: fixed; background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size))); background-repeat: no-repeat; background-position: 50% 50%; mask: linear-gradient(transparent, transparent), linear-gradient(white, white); mask-clip: padding-box, border-box; mask-composite: intersect;
    }
    [data-glow]::before {
      background-image: radial-gradient(calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%); filter: brightness(2);
    }
    [data-glow]::after {
      background-image: radial-gradient(calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%);
    }
    [data-glow] [data-glow] {
      position: absolute; inset: 0; will-change: filter; opacity: var(--outer, 1); border-radius: calc(var(--radius) * 1px); border-width: calc(var(--border-size) * 20); filter: blur(calc(var(--border-size) * 10)); background: none; pointer-events: none; border: none;
    }
    [data-glow] > [data-glow]::before { inset: -10px; border-width: 10px; }
  `;

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div ref={cardRef} data-glow style={getInlineStyles()} className={cn(getSizeClasses(), !customSize ? 'aspect-[3/4]' : '', 'rounded-2xl relative grid grid-rows-[1fr_auto] p-4 gap-4 backdrop-blur-[5px]', className)}>
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </React.Fragment>
  );
}

function GooeyText({ texts, morphTime = 1, cooldownTime = 0.25, className, textClassName }) {
  const text1Ref = React.useRef(null);
  const text2Ref = React.useRef(null);

  React.useEffect(() => {
    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    const setMorph = (fraction) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = 'blur(' + Math.min(8 / fraction - 8, 100) + 'px)';
        text2Ref.current.style.opacity = Math.pow(fraction, 0.4) * 100 + '%';
        fraction = 1 - fraction;
        text1Ref.current.style.filter = 'blur(' + Math.min(8 / fraction - 8, 100) + 'px)';
        text1Ref.current.style.opacity = Math.pow(fraction, 0.4) * 100 + '%';
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      setMorph(fraction);
    };

    let reqId;
    function animate() {
      reqId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      cooldown -= dt;
      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex % texts.length];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }
    animate();
    return () => cancelAnimationFrame(reqId);
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
      <div className="flex items-center justify-center w-full h-full" style={{ filter: "url(#threshold)" }}>
        <span ref={text1Ref} className={cn("absolute inline-block select-none text-center", textClassName)} />
        <span ref={text2Ref} className={cn("absolute inline-block select-none text-center", textClassName)} />
      </div>
    </div>
  );
}

function parsePathToVertices(path, sampleLength = 15) {
  if(!window.SVGPathCommander) return [];
  const commander = new SVGPathCommander(path);
  const points = [];
  let lastPoint = null;
  const totalLength = commander.getTotalLength();
  let length = 0;
  while (length < totalLength) {
    const point = commander.getPointAtLength(length);
    if (!lastPoint || point.x !== lastPoint.x || point.y !== lastPoint.y) {
      points.push({ x: point.x, y: point.y });
      lastPoint = point;
    }
    length += sampleLength;
  }
  const finalPoint = commander.getPointAtLength(totalLength);
  if (lastPoint && (finalPoint.x !== lastPoint.x || finalPoint.y !== lastPoint.y)) {
    points.push({ x: finalPoint.x, y: finalPoint.y });
  }
  return points;
}

function calculatePosition(value, containerSize, elementSize) {
  if (typeof value === "string" && value.endsWith("%")) {
    return containerSize * (parseFloat(value) / 100);
  }
  return typeof value === "number" ? value : elementSize - containerSize + elementSize / 2;
}

const GravityContext = React.createContext(null);

const MatterBody = ({ children, className, matterBodyOptions = { friction: 0.1, restitution: 0.1, density: 0.001, isStatic: false }, bodyType = "rectangle", isDraggable = true, sampleLength = 15, x = 0, y = 0, angle = 0, ...props }) => {
  const elementRef = React.useRef(null);
  const idRef = React.useRef(Math.random().toString(36).substring(7));
  const context = React.useContext(GravityContext);

  React.useEffect(() => {
    if (!elementRef.current || !context) return;
    context.registerElement(idRef.current, elementRef.current, { children, matterBodyOptions, bodyType, sampleLength, isDraggable, x, y, angle, ...props });
    return () => context.unregisterElement(idRef.current);
  }, [props, children, matterBodyOptions, isDraggable]);

  return (
    <div ref={elementRef} className={cn("absolute", className, isDraggable && "pointer-events-none")}>
      {children}
    </div>
  );
};

const Gravity = React.forwardRef(({ children, debug = false, gravity = { x: 0, y: 1 }, grabCursor = true, resetOnResize = true, addTopWall = true, autoStart = true, className, ...props }, ref) => {
  const canvas = React.useRef(null);
  const engine = React.useRef(Engine.create());
  const render = React.useRef();
  const runner = React.useRef();
  const bodiesMap = React.useRef(new Map());
  const frameId = React.useRef();
  const mouseConstraint = React.useRef();
  const mouseDown = React.useRef(false);
  const [canvasSize, setCanvasSize] = React.useState({ width: 0, height: 0 });
  const isRunning = React.useRef(false);

  const registerElement = React.useCallback((id, element, props) => {
    if (!canvas.current) return;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const canvasRect = canvas.current.getBoundingClientRect();
    const angle = (props.angle || 0) * (Math.PI / 180);
    const x = calculatePosition(props.x, canvasRect.width, width);
    const y = calculatePosition(props.y, canvasRect.height, height);

    let body;
    if (props.bodyType === "circle") {
      const radius = Math.max(width, height) / 2;
      body = Bodies.circle(x, y, radius, { ...props.matterBodyOptions, angle: angle, render: { fillStyle: debug ? "#888888" : "#00000000", strokeStyle: debug ? "#333333" : "#00000000", lineWidth: debug ? 3 : 0 } });
    } else if (props.bodyType === "svg") {
      const paths = element.querySelectorAll("path");
      const vertexSets = [];
      paths.forEach((path) => {
        const d = path.getAttribute("d");
        const p = parsePathToVertices(d, props.sampleLength);
        vertexSets.push(p);
      });
      body = Bodies.fromVertices(x, y, vertexSets, { ...props.matterBodyOptions, angle: angle, render: { fillStyle: debug ? "#888888" : "#00000000", strokeStyle: debug ? "#333333" : "#00000000", lineWidth: debug ? 3 : 0 } });
    } else {
      body = Bodies.rectangle(x, y, width, height, { ...props.matterBodyOptions, angle: angle, render: { fillStyle: debug ? "#888888" : "#00000000", strokeStyle: debug ? "#333333" : "#00000000", lineWidth: debug ? 3 : 0 } });
    }

    if (body) {
      World.add(engine.current.world, [body]);
      bodiesMap.current.set(id, { element, body, props });
    }
  }, [debug]);

  const unregisterElement = React.useCallback((id) => {
    const body = bodiesMap.current.get(id);
    if (body) {
      World.remove(engine.current.world, body.body);
      bodiesMap.current.delete(id);
    }
  }, []);

  const updateElements = React.useCallback(() => {
    bodiesMap.current.forEach(({ element, body }) => {
      const { x, y } = body.position;
      const rotation = body.angle * (180 / Math.PI);
      element.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rotation + 'deg)';
    });
    frameId.current = requestAnimationFrame(updateElements);
  }, []);

  const initializeRenderer = React.useCallback(() => {
    if (!canvas.current) return;
    const height = canvas.current.offsetHeight;
    const width = canvas.current.offsetWidth;
    if(window.decomp) Common.setDecomp(window.decomp);
    engine.current.gravity.x = gravity.x;
    engine.current.gravity.y = gravity.y;

    render.current = Render.create({ element: canvas.current, engine: engine.current, options: { width, height, wireframes: false, background: "#00000000" } });
    const mouse = Mouse.create(render.current.canvas);
    mouseConstraint.current = MouseConstraint.create(engine.current, { mouse: mouse, constraint: { stiffness: 0.2, render: { visible: debug } } });

    const walls = [
      Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, friction: 1, render: { visible: debug } }),
      Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, friction: 1, render: { visible: debug } }),
      Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, friction: 1, render: { visible: debug } }),
    ];
    if (addTopWall) walls.push(Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true, friction: 1, render: { visible: debug } }));

    const touchingMouse = () => mouseConstraint.current && Query.point(engine.current.world.bodies, mouseConstraint.current.mouse.position || { x: 0, y: 0 }).length > 0;

    if (grabCursor) {
      Events.on(engine.current, "beforeUpdate", () => {
        if (canvas.current) {
          if (!mouseDown.current && !touchingMouse()) canvas.current.style.cursor = "default";
          else if (touchingMouse()) canvas.current.style.cursor = mouseDown.current ? "grabbing" : "grab";
        }
      });
      canvas.current.addEventListener("mousedown", () => { mouseDown.current = true; if (canvas.current) canvas.current.style.cursor = touchingMouse() ? "grabbing" : "default"; });
      canvas.current.addEventListener("mouseup", () => { mouseDown.current = false; if (canvas.current) canvas.current.style.cursor = touchingMouse() ? "grab" : "default"; });
    }

    World.add(engine.current.world, [mouseConstraint.current, ...walls]);
    render.current.mouse = mouse;
    runner.current = Runner.create();
    Render.run(render.current);
    updateElements();
    runner.current.enabled = false;
    if (autoStart) {
      runner.current.enabled = true;
      Runner.run(runner.current, engine.current);
      isRunning.current = true;
    }
  }, [updateElements, debug, autoStart]);

  const clearRenderer = React.useCallback(() => {
    if (frameId.current) cancelAnimationFrame(frameId.current);
    if (mouseConstraint.current) World.remove(engine.current.world, mouseConstraint.current);
    if (render.current) {
      Mouse.clearSourceEvents(render.current.mouse);
      Render.stop(render.current);
      render.current.canvas.remove();
    }
    if (runner.current) Runner.stop(runner.current);
    if (engine.current) World.clear(engine.current.world, false);
    bodiesMap.current.clear();
  }, []);

  const handleResize = React.useCallback(() => {
    if (!canvas.current || !resetOnResize) return;
    const newWidth = canvas.current.offsetWidth;
    const newHeight = canvas.current.offsetHeight;
    setCanvasSize({ width: newWidth, height: newHeight });
    clearRenderer();
    initializeRenderer();
  }, [clearRenderer, initializeRenderer, resetOnResize]);

  React.useEffect(() => {
    const debouncedResize = debounce(handleResize, 500);
    window.addEventListener("resize", debouncedResize);
    return () => { window.removeEventListener("resize", debouncedResize); if (debouncedResize && typeof debouncedResize.cancel === "function") { debouncedResize.cancel(); } };
  }, [handleResize]);

  React.useEffect(() => {
    initializeRenderer();
    return clearRenderer;
  }, [initializeRenderer, clearRenderer]);

  React.useImperativeHandle(ref, () => ({
    start: () => { if (!isRunning.current && runner.current) { runner.current.enabled = true; Runner.run(runner.current, engine.current); isRunning.current = true; } },
    stop: () => { if (isRunning.current && runner.current) { runner.current.enabled = false; Runner.stop(runner.current); isRunning.current = false; } },
    reset: () => { clearRenderer(); initializeRenderer(); }
  }));

  return (
    <GravityContext.Provider value={{ registerElement, unregisterElement }}>
      <div ref={canvas} className={cn(className, "absolute top-0 left-0 w-full h-full")} {...props}>
        {children}
      </div>
    </GravityContext.Provider>
  );
});

// Window exposure
window.ShinyButton = ShinyButton;
window.GlowCard = GlowCard;
window.GooeyText = GooeyText;
window.Gravity = Gravity;
window.MatterBody = MatterBody;

// ============ Simple AwardBadge (legacy) ============
const AwardBadge = ({ label = "MOTOR CREATIVO IA", value = "SGF" }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#0891B2]/30 bg-[#0891B2]/10 text-[#22D3EE] text-xs font-bold hover:scale-105 transition-transform cursor-pointer">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      {[0,60,120,180,240,300].map((d,i) => {
        const r=d*Math.PI/180, x1=12+Math.cos(r)*5, y1=12+Math.sin(r)*5, x2=12+Math.cos(r)*9, y2=12+Math.sin(r)*9;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5"/>;
      })}
    </svg>
    <div className="flex flex-col leading-none">
      <span className="text-[8px] uppercase opacity-80">{label}</span>
      <span>{value}</span>
    </div>
  </div>
);
window.AwardBadge = AwardBadge;

// ============ AwardBadgeFancy (3D holographic tilt badge) ============
const _identityMx = "1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1";
const _mxMax = 0.25, _mxMin = -0.25, _scMax = 1, _scMin = 0.97;

const _sgfBadgeTitles = {
  "ai-engine":   "AI Creative Engine",
  "white-label": "White-Label DFY",
  "performance": "Performance Creative",
  "volume":      "Creative at Volume",
};

function AwardBadgeFancy({ type = "ai-engine", place, link = "#contact" }) {
  const ref = React.useRef(null);
  const [fop, setFop] = React.useState(0);
  const [mx, setMx] = React.useState(_identityMx);
  const [curMx, setCurMx] = React.useState(_identityMx);
  const [disableInOut, setDisableInOut] = React.useState(true);
  const [disableAnim, setDisableAnim] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const entT = React.useRef(null), leT1 = React.useRef(null), leT2 = React.useRef(null), leT3 = React.useRef(null);

  const getDims = () => {
    const el = ref.current;
    if (!el) return { left:0, right:260, top:0, bottom:54 };
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  };

  const calcMx = (cx, cy) => {
    const { left, right, top, bottom } = getDims();
    const xc = (left + right) / 2, yc = (top + bottom) / 2;
    const dw = xc - left || 1, dh = yc - top || 1;
    const sc = [
      _scMax - (_scMax - _scMin) * Math.abs(xc - cx) / dw,
      _scMax - (_scMax - _scMin) * Math.abs(yc - cy) / dh,
      _scMax - (_scMax - _scMin) * (Math.abs(xc - cx) + Math.abs(yc - cy)) / (dw + dh),
    ];
    const r = {
      x1: 0.25 * ((yc-cy)/yc - (xc-cx)/xc),
      x2: _mxMax - (_mxMax-_mxMin) * Math.abs(right-cx) / (right-left || 1),
      y2: _mxMax - (_mxMax-_mxMin) * (top-cy) / (top-bottom || -1),
      z0: -(_mxMax - (_mxMax-_mxMin) * Math.abs(right-cx) / (right-left || 1)),
      z1: (0.2 - (0.8) * (top-cy) / (top-bottom || -1)),
    };
    return `${sc[0]}, 0, ${r.z0}, 0, ${r.x1}, ${sc[1]}, ${r.z1}, 0, ${r.x2}, ${r.y2}, ${sc[2]}, 0, 0, 0, 0, 1`;
  };

  const oppMx = (_m, cy, enter) => {
    const { top, bottom } = getDims();
    const oppY = bottom - cy + top;
    const w = enter ? 0.7 : 4, mul = enter ? -1 : 1;
    return _m.split(", ").map((v, i) => {
      if (i===2||i===4||i===8) return -parseFloat(v)*mul/w;
      if (i===0||i===5||i===10) return "1";
      if (i===6) return mul*(_mxMax-(_mxMax-_mxMin)*(top-oppY)/(top-bottom||(-1)))/w;
      if (i===9) return (_mxMax-(_mxMax-_mxMin)*(top-oppY)/(top-bottom||(-1)))/w;
      return v;
    }).join(", ");
  };

  const onMouseEnter = (e) => {
    [leT1,leT2,leT3].forEach(r => r.current && clearTimeout(r.current));
    setDisableAnim(true);
    const { left, right, top, bottom } = getDims();
    const xc=(left+right)/2, yc=(top+bottom)/2;
    setDisableInOut(false);
    entT.current = setTimeout(() => setDisableInOut(true), 350);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      setFop((Math.abs(xc-e.clientX)+Math.abs(yc-e.clientY))/1.5)
    ));
    const m = calcMx(e.clientX, e.clientY);
    setMx(oppMx(m, e.clientY, true));
    setReady(false);
    setTimeout(() => setReady(true), 200);
  };

  const onMouseMove = (e) => {
    const { left, right, top, bottom } = getDims();
    const xc=(left+right)/2, yc=(top+bottom)/2;
    setTimeout(() => setFop((Math.abs(xc-e.clientX)+Math.abs(yc-e.clientY))/1.5), 150);
    if (ready) setCurMx(calcMx(e.clientX, e.clientY));
  };

  const onMouseLeave = (e) => {
    if (entT.current) clearTimeout(entT.current);
    const opp = oppMx(mx, e.clientY);
    setCurMx(opp);
    setTimeout(() => setCurMx(_identityMx), 200);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setDisableInOut(false);
      leT1.current = setTimeout(() => setFop(v => -v/4), 150);
      leT2.current = setTimeout(() => setFop(0), 300);
      leT3.current = setTimeout(() => { setDisableAnim(false); setDisableInOut(true); }, 500);
    }));
  };

  React.useEffect(() => { if (ready) setMx(curMx); }, [curMx, ready]);

  const overlayKFs = Array.from({length:10},(_,i) =>
    `@keyframes sgfOvl${i+1}{0%{transform:rotate(${i*10}deg)}50%{transform:rotate(${(i+1)*10}deg)}100%{transform:rotate(${i*10}deg)}}`
  ).join(" ");

  const title = _sgfBadgeTitles[type] || _sgfBadgeTitles["ai-engine"];
  const bgFill = type==="ai-engine"?"#060e1a":type==="white-label"?"#0a0620":"#041410";

  return (
    <a ref={ref} href={link}
       className="block w-[180px] sm:w-[260px] h-auto cursor-pointer no-underline"
       onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
      <style dangerouslySetInnerHTML={{__html: overlayKFs}} />
      <div style={{transform:`perspective(700px) matrix3d(${mx})`,transformOrigin:"center center",transition:"transform 200ms ease-out"}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 54" style={{width:"100%",height:"auto"}}>
          <defs>
            <filter id="sgfBlur"><feGaussianBlur in="SourceGraphic" stdDeviation="3"/></filter>
            <mask id="sgfMask"><rect width="260" height="54" fill="white" rx="10"/></mask>
          </defs>
          <rect width="260" height="54" rx="10" fill={bgFill}/>
          <rect x="4" y="4" width="252" height="46" rx="8" fill="transparent" stroke="#0891B2" strokeWidth="1" opacity="0.6"/>
          <text fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fontWeight="bold" fill="#0891B2" x="53" y="20">START GROW FAST</text>
          <text fontFamily="Helvetica-Bold,Helvetica" fontSize="15" fontWeight="bold" fill="#f5f5f7" x="52" y="40">
            {title}{place ? ` #${place}` : ""}
          </text>
          <g transform="translate(10,9)">
            <circle cx="17" cy="18" r="8" fill="none" stroke="#0891B2" strokeWidth="1.5" opacity="0.7">
              <animate attributeName="r" values="8;9;8" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="17" cy="18" r="3.5" fill="#0891B2" opacity="0.9">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            {[0,60,120,180,240,300].map((d,i) => {
              const rad=d*Math.PI/180;
              return <line key={i} x1={17+Math.cos(rad)*10} y1={18+Math.sin(rad)*10} x2={17+Math.cos(rad)*14} y2={18+Math.sin(rad)*14} stroke="#22D3EE" strokeWidth="1.2" opacity="0.7"/>;
            })}
          </g>
          <g style={{mixBlendMode:"overlay"}} mask="url(#sgfMask)">
            {[
              {off:0, c:"hsl(195,100%,50%)"},
              {off:10,c:"hsl(220,85%,60%)"},
              {off:20,c:"hsl(180,100%,50%)"},
              {off:30,c:"hsl(260,80%,65%)"},
              {off:40,c:"hsl(195,100%,70%)"},
              {off:50,c:"white"},
            ].map(({off,c},i) => (
              <g key={i} style={{
                transform:`rotate(${fop+off}deg)`,
                transformOrigin:"center center",
                transition:!disableInOut?"transform 200ms ease-out":"none",
                animation:disableAnim?"none":`sgfOvl${i+1} 5s infinite`,
                willChange:"transform",
              }}>
                <polygon points="0,0 260,54 260,0 0,54" fill={c} filter="url(#sgfBlur)" opacity="0.5"/>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </a>
  );
}
window.AwardBadgeFancy = AwardBadgeFancy;

// ============ GlassFilter (injected once globally) ============
function ensureGlassFilter() {
  if (document.getElementById("sgf-glass-filter-svg")) return;
  const wrap = document.createElement("div");
  wrap.id = "sgf-glass-filter-svg";
  wrap.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";
  wrap.innerHTML = `<svg aria-hidden="true"><defs>
    <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence"/>
      <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise"/>
      <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur"/>
      <feComposite in="finalBlur" in2="finalBlur" operator="over"/>
    </filter>
  </defs></svg>`;
  document.body.appendChild(wrap);
}

// ============ LiquidButton ============
function LiquidButton({ className, size = "xl", children, ...props }) {
  React.useEffect(() => { ensureGlassFilter(); }, []);
  const sizeMap = {
    sm:  "h-8 px-4 text-xs",
    default: "h-9 px-4 py-2",
    lg:  "h-10 px-6",
    xl:  "h-12 px-8",
    xxl: "h-14 px-10",
    icon: "h-9 w-9",
  };
  return (
    <button
      data-slot="button"
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 outline-none text-white",
        sizeMap[size] || sizeMap.xl,
        className
      )}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-full transition-all"
        style={{boxShadow:"0 0 8px rgba(0,0,0,0.03),0 2px 6px rgba(0,0,0,0.08),inset 3px 3px 0.5px -3.5px rgba(255,255,255,0.09),inset -3px -3px 0.5px -3.5px rgba(255,255,255,0.85),inset 1px 1px 1px -0.5px rgba(255,255,255,0.6),inset -1px -1px 1px -0.5px rgba(255,255,255,0.6),inset 0 0 6px 6px rgba(255,255,255,0.12),inset 0 0 2px 2px rgba(255,255,255,0.06),0 0 12px rgba(0,0,0,0.15)"}}
      />
      <div
        className="absolute inset-0 -z-10 overflow-hidden rounded-full"
        style={{backdropFilter:'url("#container-glass")',WebkitBackdropFilter:'url("#container-glass")'}}
      />
      <span className="relative z-10 pointer-events-none">{children}</span>
    </button>
  );
}
window.LiquidButton = LiquidButton;

// ============ MetalButton ============
const _metalColors = {
  primary: {
    outer: "linear-gradient(to bottom,#001a22,#0891B2)",
    inner: "linear-gradient(to bottom,#0891B2,#022b36,#22D3EE44)",
    btn:   "linear-gradient(to bottom,#0a4d5e,#0891B2)",
    text:  "#e0f7ff",
    shadow:"0 -1px 0 rgba(8,60,80,0.9)",
  },
  dark: {
    outer: "linear-gradient(to bottom,#000,#2a2a2a)",
    inner: "linear-gradient(to bottom,#333,#111,#2a2a2a)",
    btn:   "linear-gradient(to bottom,#222,#111)",
    text:  "#f5f5f7",
    shadow:"0 -1px 0 rgba(0,0,0,0.9)",
  },
  success: {
    outer: "linear-gradient(to bottom,#005A43,#7CCB9B)",
    inner: "linear-gradient(to bottom,#E5F8F0,#00352F,#D1F0E6)",
    btn:   "linear-gradient(to bottom,#9ADBC8,#3E8F7C)",
    text:  "#FFF7F0",
    shadow:"0 -1px 0 rgb(6 78 59)",
  },
};

const MetalButton = React.forwardRef(({ children, className, variant = "primary", ...props }, ref) => {
  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => { setTouch("ontouchstart" in window || navigator.maxTouchPoints > 0); }, []);
  const c = _metalColors[variant] || _metalColors.primary;
  const tr = "all 250ms cubic-bezier(0.1,0.4,0.2,1)";
  return (
    <div style={{
      background:c.outer, borderRadius:"8px", padding:"1.25px", display:"inline-flex", position:"relative",
      transform:pressed?"translateY(2.5px) scale(0.99)":"translateY(0) scale(1)",
      boxShadow:pressed?"0 1px 2px rgba(0,0,0,0.2)":hovered&&!touch?"0 4px 16px rgba(8,145,178,0.25)":"0 3px 8px rgba(0,0,0,0.12)",
      transition:tr, transformOrigin:"center",
    }}>
      <div style={{
        position:"absolute", inset:"1px", background:c.inner, borderRadius:"6px", transition:tr,
        filter:hovered&&!pressed&&!touch?"brightness(1.06)":"none",
      }}/>
      <button
        ref={ref}
        className={cn("relative z-10 m-[1px] rounded-md inline-flex h-11 cursor-pointer items-center justify-center px-6 py-2 text-sm font-semibold leading-none outline-none overflow-hidden", className)}
        style={{
          background:c.btn, color:c.text, textShadow:c.shadow,
          transform:pressed?"scale(0.97)":"scale(1)", transition:tr,
          filter:hovered&&!pressed&&!touch?"brightness(1.04)":"none",
        }}
        {...props}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => { setPressed(false); setHovered(false); }}
        onMouseEnter={() => { if (!touch) setHovered(true); }}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        onTouchCancel={() => setPressed(false)}
      >
        {pressed && (
          <div style={{position:"absolute",inset:0,borderRadius:"6px",opacity:0.18,background:"linear-gradient(to right,transparent,#fff,transparent)",pointerEvents:"none",zIndex:20}}/>
        )}
        {hovered && !pressed && !touch && (
          <div style={{position:"absolute",inset:0,borderRadius:"6px",background:"linear-gradient(to top,transparent,rgba(255,255,255,0.06))",pointerEvents:"none"}}/>
        )}
        {children}
      </button>
    </div>
  );
});
MetalButton.displayName = "MetalButton";
window.MetalButton = MetalButton;

// ============ LampContainer ============
function LampContainer({ children, className }) {
  const { motion } = window.Motion;
  return (
    <div className={cn("relative w-full overflow-hidden flex flex-col items-center justify-start", className)}>
      {/* Lamp glow top */}
      <div className="absolute top-0 left-0 right-0 h-[320px] pointer-events-none" aria-hidden="true">
        <div className="relative flex w-full h-full scale-y-125 items-start justify-center overflow-hidden">
          {/* Left cone */}
          <motion.div
            initial={{ opacity:0.4, width:"12rem" }}
            whileInView={{ opacity:1, width:"28rem" }}
            transition={{ delay:0.3, duration:0.8, ease:"easeInOut" }}
            style={{ backgroundImage:"conic-gradient(from 70deg at center top,#0891B2,transparent,transparent)", position:"absolute", right:"50%", height:"14rem", overflow:"visible" }}
          >
            <div style={{ position:"absolute", width:"100%", left:0, height:"10rem", bottom:0, zIndex:2, background:"linear-gradient(to top,var(--bg,#0a0a0b),transparent)" }}/>
            <div style={{ position:"absolute", width:"8rem", height:"100%", left:0, bottom:0, zIndex:2, background:"linear-gradient(to right,var(--bg,#0a0a0b),transparent)" }}/>
          </motion.div>
          {/* Right cone */}
          <motion.div
            initial={{ opacity:0.4, width:"12rem" }}
            whileInView={{ opacity:1, width:"28rem" }}
            transition={{ delay:0.3, duration:0.8, ease:"easeInOut" }}
            style={{ backgroundImage:"conic-gradient(from 290deg at center top,transparent,transparent,#0891B2)", position:"absolute", left:"50%", height:"14rem" }}
          >
            <div style={{ position:"absolute", width:"8rem", height:"100%", right:0, bottom:0, zIndex:2, background:"linear-gradient(to left,var(--bg,#0a0a0b),transparent)" }}/>
            <div style={{ position:"absolute", width:"100%", right:0, height:"10rem", bottom:0, zIndex:2, background:"linear-gradient(to top,var(--bg,#0a0a0b),transparent)" }}/>
          </motion.div>
          {/* Center glow */}
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"24rem", height:"9rem", borderRadius:"9999px", background:"#0891B2", opacity:0.35, filter:"blur(48px)", zIndex:5 }}/>
          <motion.div
            initial={{ width:"5rem" }} whileInView={{ width:"14rem" }}
            transition={{ delay:0.3, duration:0.8, ease:"easeInOut" }}
            style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-100%)", height:"8rem", borderRadius:"9999px", background:"#22D3EE", filter:"blur(28px)", opacity:0.75, zIndex:4 }}
          />
          {/* Beam line */}
          <motion.div
            initial={{ width:"10rem" }} whileInView={{ width:"28rem" }}
            transition={{ delay:0.3, duration:0.8, ease:"easeInOut" }}
            style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", height:"2px", background:"#22D3EE", zIndex:6, opacity:0.9 }}
          />
          {/* Bottom fade */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"8rem", background:"linear-gradient(to top,var(--bg,#0a0a0b),transparent)", zIndex:8 }}/>
        </div>
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-5 pt-48 pb-20 w-full">
        {children}
      </div>
    </div>
  );
}
window.LampContainer = LampContainer;

// ============ EditableChip ============
function EditableChip({ defaultLabel = "AI Creative Studio", onChange, className }) {
  const { motion, AnimatePresence } = window.Motion;
  const [isEditing, setIsEditing] = React.useState(false);
  const [label, setLabel] = React.useState(defaultLabel);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.select(); });
    }
  }, [isEditing]);

  const handleSave = (e) => {
    e.stopPropagation();
    const val = label.trim() || defaultLabel;
    setLabel(val);
    setIsEditing(false);
    onChange?.(val);
  };

  const PencilSVG = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/>
    </svg>
  );

  const CheckSVG = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  return (
    <motion.div layout className={cn("inline-block", className)}>
      <div className={cn(
        "relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-white/15 py-1 pr-1 transition-all duration-300 ease-in-out select-none bg-white/5 backdrop-blur-sm",
        isEditing && "gap-6 ring-2 ring-[#0891B2]/70"
      )}>
        <motion.input
          layout="position"
          ref={inputRef}
          type="text"
          value={label}
          readOnly={!isEditing}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave(e)}
          onClick={e => e.stopPropagation()}
          className="ml-4 w-44 border-none bg-transparent text-sm font-medium text-white/80 outline-none"
          style={{ caretColor:"#0891B2" }}
        />
        <AnimatePresence mode="popLayout">
          {isEditing ? (
            <motion.button
              key="done"
              initial={{ opacity:0, filter:"blur(4px)", scale:0 }}
              animate={{ opacity:1, filter:"blur(0px)", scale:1 }}
              exit={{ opacity:0, filter:"blur(4px)", scale:0 }}
              layout="position"
              onClick={handleSave}
              transition={{ type:"spring", bounce:0, duration:0.4 }}
              className="rounded-full bg-[#0891B2] p-1.5 text-white flex items-center"
            >
              <CheckSVG/>
            </motion.button>
          ) : (
            <motion.button
              key="edit"
              initial={{ opacity:0, filter:"blur(4px)", scale:0 }}
              animate={{ opacity:1, filter:"blur(0px)", scale:1 }}
              exit={{ opacity:0, filter:"blur(4px)", scale:0 }}
              layout="position"
              onClick={() => setIsEditing(true)}
              transition={{ type:"spring", bounce:0, duration:0.4 }}
              className="rounded-full bg-white/10 p-1.5 text-white/50 hover:bg-white/20 transition-colors flex items-center"
            >
              <PencilSVG/>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
window.EditableChip = EditableChip;


// ============ Lenis smooth scroll ============
function useLenis() {
  useEffect(() => {
    if (typeof Lenis === "undefined") return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    return () => { lenis.destroy(); };
  }, []);
}

// ============ GSAP scroll animations ============
function useGSAP() {
  useEffect(() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Parallax hero aurora
    gsap.to(".hero-aurora", {
      yPercent: -20,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.5 },
    });

    // Manifesto lines stagger on scroll
    gsap.utils.toArray(".manifesto-line").forEach((line, i) => {
      gsap.fromTo(line,
        { opacity: 0.15, x: -20 },
        {
          opacity: 1, x: 0,
          scrollTrigger: { trigger: line, start: "top 80%", end: "top 40%", scrub: 0.8 },
        }
      );
    });

    // Counter animation for hero metrics
    document.querySelectorAll(".metric-counter").forEach((el) => {
      const target = el.dataset.target;
      const isSymbol = isNaN(parseFloat(target));
      if (isSymbol) return;
      const num = parseFloat(target);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: num,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(obj.val) + (target.includes("+") ? "+" : ""); },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });

    // Section index line reveal
    gsap.utils.toArray(".section-index").forEach((el) => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true } }
      );
    });
  }, []);
}

// ============ Tweak defaults ============
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0891B2",
  "heroVariant": 0,
  "brutalist": false,
  "fontDisplay": "Syne",
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

// ============ Brutalist animated circuit SVG — Enhanced ============
function CircuitSVG() {
  return (
    <svg className="circuit-svg" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:1}}>
      <defs>
        <path id="cp1" d="M -50,200 H 180 V 60 H 360 V 180 H 540 V 40 H 720 V 160 H 900 V 280 H 1080 V 120 H 1250" />
        <path id="cp2" d="M -50,380 H 150 V 460 H 330 V 300 H 510 V 440 H 690 V 220 H 870 V 380 H 1050 V 500 H 1250" />
        <path id="cp3" d="M -50,520 H 200 V 400 H 400 V 520 H 600 V 360 H 800 V 480 H 1000 V 340 H 1250" />
        <path id="cp4" d="M -50,100 H 100 V 240 H 280 V 100 H 460 V 300 H 640 V 80 H 820 V 220 H 1000 V 100 H 1250" />
        <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-soft">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background grid squares */}
      {Array.from({length:12}).map((_,i) => (
        <rect key={i} x={80+i*90} y={20} width={40} height={40} stroke="rgba(8,145,178,0.08)" strokeWidth="1" fill="none" rx="2"
          style={{animation:`circuitFade ${2.5+i*0.3}s ease-in-out infinite alternate`, animationDelay:`${i*0.2}s`}} />
      ))}
      {Array.from({length:10}).map((_,i) => (
        <rect key={i} x={120+i*100} y={520} width={32} height={32} stroke="rgba(8,145,178,0.07)" strokeWidth="1" fill="none" rx="2"
          style={{animation:`circuitFade ${2+i*0.35}s ease-in-out infinite alternate`, animationDelay:`${i*0.25}s`}} />
      ))}

      {/* Main circuit paths — higher opacity */}
      <path d="M -50,200 H 180 V 60 H 360 V 180 H 540 V 40 H 720 V 160 H 900 V 280 H 1080 V 120 H 1250"
            stroke="rgba(8,145,178,0.32)" strokeWidth="1.5" strokeDasharray="14 6" />
      <path d="M -50,380 H 150 V 460 H 330 V 300 H 510 V 440 H 690 V 220 H 870 V 380 H 1050 V 500 H 1250"
            stroke="rgba(8,145,178,0.22)" strokeWidth="1.2" strokeDasharray="10 8" />
      <path d="M -50,520 H 200 V 400 H 400 V 520 H 600 V 360 H 800 V 480 H 1000 V 340 H 1250"
            stroke="rgba(34,211,238,0.14)" strokeWidth="1" strokeDasharray="6 10" />
      <path d="M -50,100 H 100 V 240 H 280 V 100 H 460 V 300 H 640 V 80 H 820 V 220 H 1000 V 100 H 1250"
            stroke="rgba(8,145,178,0.15)" strokeWidth="1" strokeDasharray="8 12" />

      {/* Diagonal accent lines */}
      <line x1="0" y1="600" x2="400" y2="0" stroke="rgba(8,145,178,0.04)" strokeWidth="1"/>
      <line x1="800" y1="600" x2="1200" y2="0" stroke="rgba(8,145,178,0.04)" strokeWidth="1"/>
      <line x1="400" y1="600" x2="900" y2="0" stroke="rgba(34,211,238,0.03)" strokeWidth="1"/>

      {/* Circuit nodes — path 1 */}
      {[[180,200],[180,60],[360,60],[360,180],[540,180],[540,40],[720,40],[720,160],[900,160],[900,280],[1080,280],[1080,120]].map(([x,y],i) => (
        <g key={i} filter="url(#glow-teal)">
          <circle cx={x} cy={y} r="5" fill="rgba(8,145,178,0.95)" className="cnode" style={{animationDelay:`${i*0.22}s`}} />
          <circle cx={x} cy={y} r="12" fill="none" stroke="rgba(8,145,178,0.35)" strokeWidth="1.5" className="cpulse" style={{animationDelay:`${i*0.22}s`}} />
        </g>
      ))}
      {/* Nodes path 2 — smaller */}
      {[[150,380],[330,460],[330,300],[510,300],[690,440],[870,380],[1050,380]].map(([x,y],i) => (
        <g key={i} filter="url(#glow-soft)">
          <circle cx={x} cy={y} r="3" fill="rgba(34,211,238,0.8)" className="cnode" style={{animationDelay:`${i*0.35}s`}} />
          <circle cx={x} cy={y} r="8" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="cpulse" style={{animationDelay:`${i*0.35}s`}} />
        </g>
      ))}

      {/* Data packets — multiple speeds */}
      <circle r="4" fill="#0891B2" filter="url(#glow-teal)" opacity="1">
        <animateMotion dur="4.5s" repeatCount="indefinite"><mpath href="#cp1"/></animateMotion>
      </circle>
      <circle r="3" fill="#22D3EE" filter="url(#glow-teal)" opacity="0.85">
        <animateMotion dur="6.5s" repeatCount="indefinite" begin="1.5s"><mpath href="#cp2"/></animateMotion>
      </circle>
      <circle r="2.5" fill="white" opacity="0.7">
        <animateMotion dur="3.8s" repeatCount="indefinite" begin="0.8s"><mpath href="#cp1"/></animateMotion>
      </circle>
      <circle r="3.5" fill="#0891B2" filter="url(#glow-soft)" opacity="0.6">
        <animateMotion dur="8s" repeatCount="indefinite" begin="3s"><mpath href="#cp3"/></animateMotion>
      </circle>
      <circle r="2" fill="#22D3EE" opacity="0.9">
        <animateMotion dur="5.2s" repeatCount="indefinite" begin="0.4s"><mpath href="#cp4"/></animateMotion>
      </circle>
      <circle r="4.5" fill="rgba(8,145,178,0.5)" filter="url(#glow-teal)">
        <animateMotion dur="7s" repeatCount="indefinite" begin="2.2s"><mpath href="#cp2"/></animateMotion>
      </circle>
    </svg>
  );
}

// ============ Brutalist corner decoration ============
function CornerMark({ pos = "tl", accent = "#0891B2" }) {
  const isLeft = pos.includes("l");
  const isTop = pos.includes("t");
  return (
    <svg className={`corner-mark corner-mark-${pos}`} width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <line x1={isLeft ? 0 : 48} y1={isTop ? 0 : 48} x2={isLeft ? 24 : 24} y2={isTop ? 0 : 48} stroke={accent} strokeWidth="2" className="corner-line" />
      <line x1={isLeft ? 0 : 48} y1={isTop ? 0 : 48} x2={isLeft ? 0 : 48} y2={isTop ? 24 : 24} stroke={accent} strokeWidth="2" className="corner-line" />
      <circle cx={isLeft ? 0 : 48} cy={isTop ? 0 : 48} r="3.5" fill={accent} className="corner-dot" />
    </svg>
  );
}

// ============ Brutalist animated SVG — machine icon ============
function MachineSVG() {
  return (
    <svg className="machine-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="machine-glow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Outer ring */}
      <circle cx="100" cy="100" r="88" stroke="rgba(8,145,178,0.2)" strokeWidth="1" strokeDasharray="6 4">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="30s" repeatCount="indefinite" />
      </circle>
      {/* Middle ring (reverse) */}
      <circle cx="100" cy="100" r="66" stroke="rgba(8,145,178,0.15)" strokeWidth="1" strokeDasharray="4 8">
        <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="20s" repeatCount="indefinite" />
      </circle>
      {/* Inner core */}
      <circle cx="100" cy="100" r="32" fill="rgba(8,145,178,0.08)" stroke="rgba(8,145,178,0.4)" strokeWidth="1.5" filter="url(#machine-glow)">
        <animate attributeName="r" values="32;36;32" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Center dot */}
      <circle cx="100" cy="100" r="6" fill="#0891B2" filter="url(#machine-glow)">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Radial ticks */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 100 + Math.cos(rad) * 72;
        const y1 = 100 + Math.sin(rad) * 72;
        const x2 = 100 + Math.cos(rad) * 82;
        const y2 = 100 + Math.sin(rad) * 82;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(8,145,178,0.5)" strokeWidth="2" />;
      })}
    </svg>
  );
}

// ============ Community card — Hall of Fame style ============
function CommunityCard({ item }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
       className="community-card" style={{ "--accent": item.color || "#0891B2" }}>
      <div className="community-card-img">
        {item.img
          ? <img src={item.img} alt={item.name} loading="lazy" />
          : <div style={{ background: item.bg || "#0a0a0b", width: "100%", height: "100%" }} />
        }
        <div className="community-card-img-fade" />
      </div>
      <div className="community-card-body">
        <div className="community-card-sub mono">{item.sub || "Community"}</div>
        <div className="community-card-name">{item.name}</div>
        {item.focus && <div className="community-card-focus">{item.focus}</div>}
        {item.mastered && item.mastered.length > 0 && (
          <div className="community-card-tags">
            {item.mastered.map((tag, i) => <span key={i} className="community-tag">{tag}</span>)}
          </div>
        )}
      </div>
      <div className="community-card-glow-line" />
    </a>
  );
}

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



// ============ Globe Canvas ============
function GlobeCanvas({ size = 200 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size * 0.4;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(8,12,16,0.97)";
      ctx.fillRect(0, 0, size, size);

      const rot = frame * 0.006;

      // latitude lines
      for (let lat = -75; lat <= 75; lat += 25) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy - r * Math.sin(latRad);
        const lR = r * Math.cos(latRad);
        if (lR <= 0) continue;
        ctx.beginPath();
        ctx.ellipse(cx, y, lR, lR * 0.28, 0, 0, Math.PI * 2);
        ctx.strokeStyle = lat === 0 ? "rgba(8,145,178,0.35)" : "rgba(8,145,178,0.18)";
        ctx.lineWidth = lat === 0 ? 1.2 : 0.7;
        ctx.stroke();
      }

      // longitude lines (rotating)
      for (let lon = 0; lon < 180; lon += 30) {
        const a = (lon * Math.PI) / 180 + rot;
        const sq = Math.abs(Math.cos(a));
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * sq, r, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(8,145,178,${0.07 + 0.22 * sq})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // animated highlight dot (simulates moving continent mass)
      const hx = cx + r * 0.4 * Math.cos(rot * 2);
      const hy = cy - r * 0.2 + r * 0.15 * Math.sin(rot * 1.3);
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.45);
      hg.addColorStop(0, "rgba(34,211,238,0.1)");
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();

      // outline
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(8,145,178,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // specular highlight
      const sg = ctx.createRadialGradient(cx - r*0.32, cy - r*0.32, 0, cx, cy, r);
      sg.addColorStop(0, "rgba(34,211,238,0.14)");
      sg.addColorStop(0.5, "rgba(8,145,178,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      // throttle to 30fps
      frame++;
      animRef.current = setTimeout(() => { animRef.current = requestAnimationFrame(draw); }, 33);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { clearTimeout(animRef.current); cancelAnimationFrame(animRef.current); };
  }, [size]);
  return <canvas ref={canvasRef} className="globe-canvas" aria-hidden="true" />;
}

// ============ Preloader keyword cycler (self-contained, no window deps) ============
function PreloaderKeywords() {
  const words = ["AI AGENTS", "PERFORMANCE", "CREATIVIDAD", "VOLUMEN", "WHITE-LABEL", "DFY", "START GROW FAST"];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const fade = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(n => (n + 1) % words.length); setVisible(true); }, 250);
    }, 1000);
    return () => clearInterval(fade);
  }, []);
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.18em",
      textTransform: "uppercase", color: "#0891B2",
      transition: "opacity 0.25s ease", opacity: visible ? 1 : 0,
      display: "block", textAlign: "center",
    }}>
      {words[idx]}
    </span>
  );
}

// ============ Globe Preloader (always shows, longer duration) ============
function Preloader() {
  const [phase, setPhase] = useState("in"); // in → hold → out → hidden
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const isReturn = sessionStorage.getItem("sgf_loaded");
    // First visit: 4s full experience. Return: 2.2s shorter but still visible.
    const holdMs = isReturn ? 1400 : 2800;
    const totalMs = isReturn ? 2200 : 4000;

    // Animate progress bar
    const start = Date.now();
    const progInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / totalMs) * 100));
      if (elapsed >= totalMs) clearInterval(progInterval);
    }, 40);

    const t1 = setTimeout(() => setPhase("out"), totalMs - 700);
    const t2 = setTimeout(() => {
      setPhase("hidden");
      sessionStorage.setItem("sgf_loaded", "1");
    }, totalMs);

    return () => { clearInterval(progInterval); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "hidden") return null;

  const dots = Array.from({ length: 12 });

  return (
    <div className={`preloader globe-preloader ${phase === "out" ? "out" : ""}`}>
      <div className="globe-scene">
        <div className="globe-whirl-ring" />
        <div className="globe-whirl-ring globe-whirl-ring-2" />
        <div className="globe-whirl-ring globe-whirl-ring-3" />
        <div className="globe-whirl-dots" aria-hidden="true">
          {dots.map((_, i) => <span key={i} className="globe-wdot" style={{"--i": i, "--n": dots.length}} />)}
        </div>
        <GlobeCanvas size={200} />
        <div className="globe-label mono">START GROW FAST · AI AGENTS</div>
      </div>

      <div className="globe-progress-area">
        <div className="globe-progress-bar">
          <div className="globe-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="globe-status" style={{ height: "32px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <PreloaderKeywords />
        </div>
      </div>
    </div>
  );
}

// ============ Problems section (35 problems → collapse → solution) ============
const PROBLEMS_DATA = {
  es: [
    { text: "No tienen suficientes creativos nuevos por semana.", p: 1 },
    { text: "Dependen de diseñadores, editores o creativos internos saturados.", p: 1 },
    { text: "La producción creativa es lenta.", p: 1 },
    { text: "Los shootings, modelos, locaciones y UGC real hacen que producir sea costoso.", p: 1 },
    { text: "El coste por pieza creativa es demasiado alto.", p: 1 },
    { text: "No tienen suficientes variaciones por anuncio.", p: 1 },
    { text: "No pueden producir múltiples versiones de un mismo concepto.", p: 1 },
    { text: "No tienen suficiente volumen para testear diferentes hooks.", p: 1 },
    { text: "No pueden testear múltiples ángulos creativos al mismo tiempo.", p: 1 },
    { text: "Los creativos se repiten demasiado.", p: 1 },
    { text: "Las campañas se quedan sin material fresco rápidamente.", p: 1 },
    { text: "No tienen backlog creativo preparado.", p: 1 },
    { text: "No pueden reaccionar rápido a tendencias, promos o cambios de mercado.", p: 1 },
    { text: "No escalan volumen creativo cuando una campaña empieza a crecer.", p: 1 },
    { text: "Tienen dificultad para producir UGC de forma constante.", p: 1 },
    { text: "Dependen demasiado de creadores externos o influencers.", p: 1 },
    { text: "Cada nueva campaña exige empezar producción casi desde cero.", p: 1 },
    { text: "No tienen suficiente B-roll, imágenes, hooks y assets auxiliares.", p: 1 },
    { text: "Les cuesta producir contenido visual para diferentes formatos y plataformas.", p: 1 },
    { text: "No pueden crear campañas visuales grandes sin gastar demasiado en producción tradicional.", p: 1 },
    { text: "No testean suficientes hipótesis creativas.", p: 2 },
    { text: "No saben qué ángulos funcionan mejor.", p: 2 },
    { text: "No tienen suficientes variantes para encontrar anuncios ganadores.", p: 2 },
    { text: "Los creativos se queman rápido por fatiga creativa.", p: 2 },
    { text: "No refrescan campañas a tiempo.", p: 2 },
    { text: "Toman decisiones creativas basadas en intuición, no en aprendizaje estructurado.", p: 2 },
    { text: "No tienen un sistema claro para aprender de cada lote creativo.", p: 2 },
    { text: "No documentan qué hooks funcionaron y cuáles fallaron.", p: 2 },
    { text: "No tienen memoria creativa por cliente o por marca.", p: 2 },
    { text: "No conectan los resultados de performance con las siguientes piezas creativas.", p: 2 },
    { text: "No tienen datos creativos organizados por ángulo, formato, hook, oferta o audiencia.", p: 2 },
    { text: "No saben qué mensajes deben repetir, mejorar o descartar.", p: 2 },
    { text: "No pueden iterar rápido después de ver métricas como CTR, CPC, CPA, ROAS o retención.", p: 2 },
    { text: "No tienen suficiente velocidad entre idea, producción, test y siguiente iteración.", p: 2 },
    { text: "No tienen una librería de ángulos ganadores reutilizable.", p: 2 },
    { text: "No saben diferenciar entre un problema de media buying, oferta, landing o creatividad.", p: 2 },
    { text: "No tienen sistema para priorizar qué creativos producir primero.", p: 2 },
    { text: "No pueden probar suficientes formatos: estáticos, UGC, B-roll, lifestyle, product shots, comparativas, demos, etc.", p: 2 },
    { text: "No tienen un proceso para combatir la fatiga creativa antes de que la campaña muera.", p: 2 },
    { text: "Les cuesta optimizar el rendimiento desde la creatividad, no solo desde la configuración de anuncios.", p: 2 },
    { text: "No quieren contratar más diseñadores, editores, creadores UGC o productores.", p: 3 },
    { text: "Gestionar freelancers les consume demasiado tiempo.", p: 3 },
    { text: "La calidad cambia demasiado según quién produzca la pieza.", p: 3 },
    { text: "No tienen procesos creativos claros ni repetibles.", p: 3 },
    { text: "Hay problemas de coordinación entre media buyers, creativos, editores y cliente final.", p: 3 },
    { text: "El equipo creativo interno está sobrecargado.", p: 3 },
    { text: "Hay retrasos constantes en entregas.", p: 3 },
    { text: "No tienen un sistema fuerte de control de calidad.", p: 3 },
    { text: "Se rompe la consistencia de marca cuando intentan producir más rápido.", p: 3 },
    { text: "No tienen un workflow replicable para producir, revisar y entregar creativos.", p: 3 },
    { text: "Los costes de producción son impredecibles.", p: 3 },
    { text: "Cada nuevo cliente o campaña aumenta el caos operativo.", p: 3 },
    { text: "No tienen una estructura clara de briefing, revisión, aprobación y entrega.", p: 3 },
    { text: "Pierden tiempo corrigiendo errores que deberían evitarse desde el sistema.", p: 3 },
    { text: "No tienen nomenclatura, organización ni librería clara de assets.", p: 3 },
    { text: "La comunicación con freelancers o proveedores genera demasiada fricción.", p: 3 },
    { text: "No tienen una capa externa confiable que se haga responsable del output creativo.", p: 3 },
    { text: "No pueden escalar producción sin perder control.", p: 3 },
    { text: "No tienen SOPs creativos que permitan repetir calidad.", p: 3 },
    { text: "No tienen un sistema que acumule aprendizaje y mejore con el tiempo.", p: 3 },
  ],
  en: [
    { text: "Not enough new creatives per week.", p: 1 },
    { text: "Dependent on overloaded internal designers or editors.", p: 1 },
    { text: "Creative production is slow.", p: 1 },
    { text: "Shoots, models, locations, and real UGC make production expensive.", p: 1 },
    { text: "Cost per creative piece is too high.", p: 1 },
    { text: "Not enough variations per ad.", p: 1 },
    { text: "Cannot produce multiple versions of the same concept.", p: 1 },
    { text: "Not enough volume to test different hooks.", p: 1 },
    { text: "Cannot test multiple creative angles at once.", p: 1 },
    { text: "Creatives repeat too much.", p: 1 },
    { text: "Campaigns run out of fresh material quickly.", p: 1 },
    { text: "No prepared creative backlog.", p: 1 },
    { text: "Cannot react quickly to trends, promos, or market changes.", p: 1 },
    { text: "Don't scale creative volume when a campaign starts growing.", p: 1 },
    { text: "Difficulty producing UGC consistently.", p: 1 },
    { text: "Rely too heavily on external creators or influencers.", p: 1 },
    { text: "Every new campaign requires starting production almost from scratch.", p: 1 },
    { text: "Not enough B-roll, images, hooks, and auxiliary assets.", p: 1 },
    { text: "Struggle to produce visual content for different formats and platforms.", p: 1 },
    { text: "Cannot create large visual campaigns without spending too much on traditional production.", p: 1 },
    { text: "Don't test enough creative hypotheses.", p: 2 },
    { text: "Don't know which angles work best.", p: 2 },
    { text: "Not enough variants to find winning ads.", p: 2 },
    { text: "Creatives burn out quickly due to ad fatigue.", p: 2 },
    { text: "Campaigns aren't refreshed on time.", p: 2 },
    { text: "Creative decisions are based on intuition, not structured learning.", p: 2 },
    { text: "No clear system to learn from each creative batch.", p: 2 },
    { text: "Don't document which hooks worked and which failed.", p: 2 },
    { text: "No creative memory per client or brand.", p: 2 },
    { text: "Performance results aren't connected to the next creative pieces.", p: 2 },
    { text: "No creative data organized by angle, format, hook, offer, or audience.", p: 2 },
    { text: "Don't know which messages to repeat, improve, or discard.", p: 2 },
    { text: "Cannot iterate quickly after seeing metrics like CTR, CPC, CPA, ROAS, or retention.", p: 2 },
    { text: "Not enough speed between idea, production, test, and next iteration.", p: 2 },
    { text: "No reusable library of winning angles.", p: 2 },
    { text: "Don't know how to differentiate between a media buying, offer, landing page, or creative problem.", p: 2 },
    { text: "No system to prioritize which creatives to produce first.", p: 2 },
    { text: "Cannot test enough formats: static, UGC, B-roll, lifestyle, product shots, comparisons, demos, etc.", p: 2 },
    { text: "No process to combat creative fatigue before the campaign dies.", p: 2 },
    { text: "Struggle to optimize performance through creatives, not just ad setup.", p: 2 },
    { text: "Don't want to hire more designers, editors, UGC creators, or producers.", p: 3 },
    { text: "Managing freelancers consumes too much time.", p: 3 },
    { text: "Quality varies too much depending on who produces the piece.", p: 3 },
    { text: "No clear or replicable creative processes.", p: 3 },
    { text: "Coordination issues between media buyers, creatives, editors, and the final client.", p: 3 },
    { text: "Internal creative team is overloaded.", p: 3 },
    { text: "Constant delays in deliveries.", p: 3 },
    { text: "No strong quality control system.", p: 3 },
    { text: "Brand consistency breaks when trying to produce faster.", p: 3 },
    { text: "No replicable workflow to produce, review, and deliver creatives.", p: 3 },
    { text: "Production costs are unpredictable.", p: 3 },
    { text: "Every new client or campaign increases operational chaos.", p: 3 },
    { text: "No clear structure for briefing, review, approval, and delivery.", p: 3 },
    { text: "Wasting time fixing errors that should be avoided by the system.", p: 3 },
    { text: "No clear naming convention, organization, or asset library.", p: 3 },
    { text: "Communication with freelancers or suppliers generates too much friction.", p: 3 },
    { text: "No reliable external layer to take responsibility for creative output.", p: 3 },
    { text: "Cannot scale production without losing control.", p: 3 },
    { text: "No creative SOPs to ensure repeatable quality.", p: 3 },
    { text: "No system that accumulates learning and improves over time.", p: 3 },
  ],
};

function ProblemsSection({ lang }) {
  const es = lang === "es";
  const problems = PROBLEMS_DATA[lang] || PROBLEMS_DATA.es;

  // Pillar labels
  const pillarLabels = es
    ? ["Capacidad Creativa", "Performance y Testing", "Operación y Escalabilidad"]
    : ["Creative Capacity", "Performance & Testing", "Operations & Scalability"];

  return (
    <section className="problems-section" id="problems">
      <div className="container">
        <div className="section-index">
          <span>§ — {es ? "DIAGNÓSTICO" : "DIAGNOSTIC"}</span>
          <span className="mono">60 {es ? "issues detectados" : "issues detected"}</span>
        </div>
        <div className="problems-header">
          <div className="problems-badge-row reveal">
            <span className="problems-scan-badge mono">
              <span className="problems-scan-dot" />
              {es ? "ESCANEANDO · 3 PILARES CRÍTICOS" : "SCANNING · 3 CRITICAL PILLARS"}
            </span>
            <span className="problems-total-badge mono">60</span>
          </div>
          <h2 className="problems-title reveal d1">
            {es
              ? <><span>Los has escuchado </span><em>todos.</em><br /><span>Nosotros también.</span></>
              : <><span>You've heard them </span><em>all.</em><br /><span>So have we.</span></>}
          </h2>
          <p className="problems-sub reveal d2">
            {es
              ? "60 variaciones del mismo dolor. El cuello de botella creativo es el problema más caro y menos resuelto de las agencias de performance."
              : "60 variations of the same pain. The creative bottleneck is the most expensive and least solved problem in performance agencies."}
          </p>

          {/* Pillar legend — large alt-bg blocks */}
          <div className="problems-pillars reveal d2">
            {pillarLabels.map((label, i) => (
              <div key={i} className={`pblock pblock-${i}`}>
                <span className="pblock-n">{i + 1}</span>
                <span className="pblock-label">{label}</span>
                <span className="pblock-count mono">20</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dense wall — all 60 problems visible, brain-explosion layout */}
      <div className="problems-wall-wrap">
        <div className="problems-wall-bg60" aria-hidden="true">60</div>
        <div className="problems-wall">
          {problems.map((p, i) => {
            const cfg = p.p === 1
              ? { border: "rgba(239,68,68,0.28)", bg: "rgba(239,68,68,0.06)", color: "rgba(252,165,165,0.9)", dot: "#ef4444" }
              : p.p === 2
              ? { border: "rgba(245,158,11,0.28)", bg: "rgba(245,158,11,0.06)", color: "rgba(253,224,71,0.88)", dot: "#f59e0b" }
              : { border: "rgba(34,197,94,0.28)", bg: "rgba(34,197,94,0.06)", color: "rgba(134,239,172,0.9)", dot: "#22c55e" };
            return (
              <div key={i} className="pwill-pill"
                style={{ border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
                  animationDelay: `${i * 0.025}s` }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0, display: "inline-block", opacity: 0.8 }} />
                <span>{p.text}</span>
              </div>
            );
          })}
        </div>
        <div className="problems-wall-fade-bottom" />
      </div>

      <div className="problems-solution on">
        <div className="container">
          <div className="psol-divider" />
          <div className="psol-inner">
            <div className="psol-left">
              <div className="psol-badge mono">{es ? "— LA RESPUESTA" : "— THE ANSWER"}</div>
              <h2 className="psol-headline">
                {es
                  ? <><em>Somos el equipo creativo</em><br />que nunca se cansa,<br />nunca se queda sin ideas<br />y mejora cada semana.</>
                  : <><em>We're the creative team</em><br />that never gets tired,<br />never runs out of ideas<br />and improves every week.</>}
              </h2>
            </div>
            <div className="psol-right">
              <div className="psol-mantras">
                {(es
                  ? [
                      ["No vendemos simples creativos", "Velocidad de testeo y escala"],
                      ["No vendemos herramientas de IA", "Capacidad creativa ilimitada"],
                      ["No vendemos horas de diseño", "Adiós a tus límites operativos"],
                    ]
                  : [
                      ["We don't sell simple creatives", "Testing speed and scale"],
                      ["We don't sell AI tools", "Unlimited creative capacity"],
                      ["We don't sell design hours", "Zero operational bottlenecks"],
                    ]
                ).map(([from, to], i) => (
                  <div key={i} className="psol-mantra psol-mantra-big">
                    <span className="psol-from">{from}</span>
                    <span className="psol-arrow">→</span>
                    <span className="psol-to">{to}</span>
                  </div>
                ))}
              </div>
              <a href="#contact" className="btn-primary" style={{ marginTop: "28px", display: "inline-flex" }}>
                {es ? "Instalar el sistema" : "Install the system"} <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Interactive Shader section ============
function ShaderSection({ lang }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const ripplesRef = useRef([]);
  const animRef = useRef(null);
  const es = lang === "es";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, time = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      mouseRef.current = { x: (src.clientX - rect.left) / W, y: (src.clientY - rect.top) / H };
    };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      ripplesRef.current.push({ x: (e.clientX - rect.left) / W, y: (e.clientY - rect.top) / H, r: 0, a: 0.9 });
    };

    canvas.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("click", onClick);

    const draw = () => {
      if (!W || !H) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;

      // base dark fill
      ctx.fillStyle = "rgba(9,10,14,1)";
      ctx.fillRect(0, 0, W, H);

      // animated wave lines (shader-like)
      const waves = 12;
      for (let i = 0; i < waves; i++) {
        const t = i / waves;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 6) {
          const nx = x / W;
          const influence = (mx / W - nx);
          const y = H * (0.2 + t * 0.6)
            + Math.sin(nx * 5 + time + i * 0.6) * (H * 0.04 + (mouseRef.current.y * H * 0.04))
            + Math.sin(nx * 9 - time * 0.8 + i) * H * 0.02
            + influence * H * 0.06;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const alpha = 0.025 + i * 0.006;
        ctx.strokeStyle = `rgba(8,145,178,${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // mouse radial glow
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(W, H) * 0.22);
      mg.addColorStop(0, "rgba(8,145,178,0.1)");
      mg.addColorStop(0.5, "rgba(8,145,178,0.03)");
      mg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);

      // corner glows (static teal ambiance)
      [[0,0],[W,0],[0,H],[W,H]].forEach(([x,y]) => {
        const cg = ctx.createRadialGradient(x, y, 0, x, y, Math.min(W,H) * 0.45);
        cg.addColorStop(0, "rgba(8,145,178,0.05)");
        cg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, W, H);
      });

      // click ripples
      ripplesRef.current = ripplesRef.current.filter(rip => rip.a > 0.01);
      ripplesRef.current.forEach(rip => {
        ctx.beginPath();
        ctx.arc(rip.x * W, rip.y * H, rip.r * Math.min(W, H), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,211,238,${rip.a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // second ring
        if (rip.r > 0.05) {
          ctx.beginPath();
          ctx.arc(rip.x * W, rip.y * H, (rip.r - 0.04) * Math.min(W, H), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(8,145,178,${rip.a * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        rip.r += 0.007;
        rip.a *= 0.96;
      });

      time += 0.018;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <section className="shader-section" id="engine">
      <canvas ref={canvasRef} className="shader-canvas" />
      <div className="container shader-content">
        <CornerMark pos="tl" />
        <CornerMark pos="tr" />
        <div className="shader-body">
          <div className="shader-text reveal">
            <span className="eyebrow">{es ? "EL MOTOR EN ACCIÓN" : "THE ENGINE IN ACTION"}</span>
            <h2 className="shader-headline">{es ? "Un sistema que\nnunca se detiene." : "A system that\nnever stops."}</h2>
            <p className="shader-sub">{es
              ? "Así de vivo opera el motor creativo que instalamos en tu agencia — produciendo, iterando, aprendiendo, sin parar."
              : "This is how alive the creative engine we install in your agency operates — producing, iterating, learning, non-stop."
            }</p>
            <a href="#contact" className="btn-ghost-shader reveal d2">
              {es ? "Instalar el motor" : "Install the engine"} <Arrow />
            </a>
          </div>
          <div className="shader-metrics reveal d1">
            {(es ? [
              { n: "120+", l: "creativos por mes", accent: false },
              { n: "7 días", l: "primer lote entregado", accent: false },
              { n: "DFY", l: "nosotros hacemos todo", accent: true },
              { n: "0", l: "shootings necesarios", accent: false },
              { n: "∞", l: "variaciones por ángulo", accent: false },
              { n: "WL", l: "white-label listo", accent: false },
            ] : [
              { n: "120+", l: "creatives per month", accent: false },
              { n: "7 days", l: "first batch delivered", accent: false },
              { n: "DFY", l: "we do all the work", accent: true },
              { n: "0", l: "physical shoots needed", accent: false },
              { n: "∞", l: "variations per angle", accent: false },
              { n: "WL", l: "white-label ready", accent: false },
            ]).map((m, i) => (
              <div key={i} className={`shader-metric-card${m.accent ? " accent" : ""}`}>
                <div className="smc-n">{m.n}</div>
                <div className="smc-l">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Hormozi / QUALUME section ============
function HormoziSection({ lang }) {
  const es = lang === "es";
  const ref = useRef(null);
  useEffect(() => {
    const items = ref.current?.querySelectorAll(".hz-stat");
    if (!items) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        items.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 140));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="hz-section" id="why-now" ref={ref}>
      <div className="hz-bg-svg" aria-hidden="true">
        <svg viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none">
          <path d="M0 200 Q360 80 720 200 Q1080 320 1440 200" stroke="rgba(8,145,178,0.12)" strokeWidth="1.5" fill="none" />
          <path d="M0 260 Q360 140 720 260 Q1080 380 1440 260" stroke="rgba(8,145,178,0.07)" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <div className="container">
        <div className="section-index">
          <span>§ — {es ? "POR QUÉ AHORA" : "WHY NOW"}</span>
          <span>Alex Hormozi · Mozi Minute</span>
        </div>
        <div className="hz-wrap">
          {/* Hormozi photo — left col */}
          <div className="hz-photo-col reveal">
            <img src="assets/founder-1.jpg" alt="Alex Hormozi" className="hz-photo" />
            <div className="hz-photo-fade" />
            <div className="hz-guinness reveal d1">
              <div className="hz-guinness-icon">🏆</div>
              <div>
                <div className="hz-guinness-title mono">{es ? "RÉCORD GUINNESS WORLD" : "GUINNESS WORLD RECORD"}</div>
                <div className="hz-guinness-desc">
                  {es
                    ? "Libro de no ficción más vendido en 24h · 2.97M copias · $100M+ en ventas en un fin de semana"
                    : "Best-selling non-fiction book in 24h · 2.97M copies · $100M+ in sales in one weekend"}
                </div>
              </div>
            </div>
          </div>

          <div className="hz-quote-col reveal d1">
            <div className="hz-openquote">"</div>
            <blockquote className="hz-quote">
              {es
                ? "La creatividad se ha convertido en la segmentación. Estamos entrando en una era de QUALUME — cantidad de calidad. Las empresas que generen mayor volumen de contenido para diferentes segmentos son las que van a triunfar."
                : "Creativity has become the targeting. We're entering an era of QUALUME — quality at volume. Companies that generate the most content volume for different segments are the ones that will win."}
            </blockquote>
            <div className="hz-attribution">
              <div>
                <div className="hz-name">Alex Hormozi</div>
                <div className="hz-role mono">Founder, Acquisition.com · $200M+ portfolio</div>
              </div>
            </div>
          </div>

          <div className="hz-right-col reveal d2">
            <div className="hz-label mono">{es ? "LO QUE ESTO SIGNIFICA PARA TU AGENCIA" : "WHAT THIS MEANS FOR YOUR AGENCY"}</div>
            <div className="hz-stats">
              {[
                { n: "3×", l: es ? "segmentos por producto → 3× más anuncios" : "segments per product → 3× more ads" },
                { n: "10×", l: es ? "más rápido se quema un creativo genérico" : "faster a generic creative burns out" },
                { n: "∞", l: es ? "variaciones que un sistema IA produce por ángulo" : "variations an AI system produces per angle" },
              ].map((s, i) => (
                <div key={i} className="hz-stat">
                  <div className="hz-stat-n">{s.n}</div>
                  <div className="hz-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="hz-bridge">
              <div className="hz-bridge-eyebrow mono">{es ? "NUESTRA RESPUESTA" : "OUR ANSWER"}</div>
              <p className="hz-bridge-text">
                {es
                  ? "La creatividad ya no es ornamental — es el sistema de targeting. START GROW FAST AI AGENTS instala el motor que produce el volumen segmentado que Hormozi describe. No uno para todos. Uno para cada perfil."
                  : "Creative is no longer decorative — it is the targeting system. START GROW FAST AI AGENTS installs the engine that produces the segmented volume Hormozi describes. Not one for everyone. One for every profile."}
              </p>
              <a href="#contact" className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
                {es ? "Instalar el sistema" : "Install the system"} <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Nav ============
function Nav({ t, lang, setLang, onCta }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className={`nav nav-white ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#top" className="nav-logo" onClick={closeMenu}>
            <img src="assets/logo.png" alt="SGF" style={{ height: "54px", width: "auto", objectFit: "contain" }} />
            <span style={{ color: "#0a0a0b", fontWeight: 700 }}>START GROW FAST</span>
          </a>
          <div className="nav-links">
            <a href="#services" style={{ color: "#0a0a0b" }}>{t.nav.services}</a>
            <a href="#how" style={{ color: "#0a0a0b" }}>{t.nav.how}</a>
            <a href="#niches" style={{ color: "#0a0a0b" }}>{t.nav.niches}</a>
            <a href="#cases" style={{ color: "#0a0a0b" }}>{t.nav.work}</a>
            <a href="/blog/index.html" style={{ color: "#0a0a0b" }}>{t.nav.blog}</a>
            <a href="#contact" style={{ color: "#0a0a0b" }}>{t.nav.contact}</a>
          </div>
          <div className="nav-right">
            <div className="lang-switcher" role="group" aria-label="Language">
              <button className={`lang-btn ${lang === "es" ? "active" : ""}`} onClick={() => setLang("es")} title="Español">
                <img src="assets/flag_es.png" alt="ES" style={{ width: "16px", height: "auto", objectFit: "contain", borderRadius: "2px" }} />
                <span className="lang-code">ES</span>
              </button>
              <span className="lang-sep" aria-hidden="true" />
              <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")} title="English">
                <img src="assets/flag_en.png" alt="EN" style={{ width: "16px", height: "auto", objectFit: "contain", borderRadius: "2px" }} />
                <span className="lang-code">EN</span>
              </button>
            </div>
            <button className="nav-cta-new" onClick={onCta}>
              {t.nav.cta} <Arrow />
            </button>
          </div>
          
          <button 
            className={`nav-hamburger ${isOpen ? 'open' : ''}`} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      <div className={`nav-mobile-overlay ${isOpen ? 'open' : ''}`}>
        <div className="nav-mobile-menu">
          <div className="nav-mobile-links">
            <a href="#services" onClick={closeMenu}>{t.nav.services}</a>
            <a href="#how" onClick={closeMenu}>{t.nav.how}</a>
            <a href="#niches" onClick={closeMenu}>{t.nav.niches}</a>
            <a href="#cases" onClick={closeMenu}>{t.nav.work}</a>
            <a href="/blog/index.html" onClick={closeMenu}>{t.nav.blog}</a>
            <a href="#contact" onClick={closeMenu}>{t.nav.contact}</a>
          </div>
          <div className="nav-mobile-bottom">
            <div className="lang-switcher-mobile">
              <button className={`lang-btn ${lang === "es" ? "active" : ""}`} onClick={() => { setLang("es"); closeMenu(); }}>
                <img src="assets/flag_es.png" alt="ES" style={{ width: "20px", height: "auto" }} />
                <span>ES</span>
              </button>
              <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => { setLang("en"); closeMenu(); }}>
                <img src="assets/flag_en.png" alt="EN" style={{ width: "20px", height: "auto" }} />
                <span>EN</span>
              </button>
            </div>
            <button className="nav-mobile-cta" onClick={() => { onCta(); closeMenu(); }}>
              {t.nav.cta} <Arrow size={18} />
            </button>
          </div>
        </div>
      </div>
  );
}

// ============ Hero (premium, Godly-inspired) ============
function Hero({ t, variant }) {
  const v = t.hero.variants[variant] || t.hero.variants[0];
  const es = t.hero.eyebrow.includes("MOTOR");
  return (
    <section className="hero" id="top">
      <div className="hero-aurora" />
      <div className="hero-grain" />
      <div className="hero-grid-new" />
      <Sparkles count={70} className="hero-sparks" />
      <CircuitSVG />
      <CornerMark pos="tl" /><CornerMark pos="tr" />
      <CornerMark pos="bl" /><CornerMark pos="br" />

      <div className="container hero-content">

        {/* ── Eyebrow badge ── */}
        <div className="hero-eyebrow-v2 reveal">
          <span className="hev2-badge">
            <span className="hev2-dot" />
            <span className="hev2-brand mono">START GROW FAST</span>
            <span className="hev2-sep" />
            <span className="hev2-label">{es ? "Motor Creativo IA" : "AI Creative Engine"}</span>
          </span>
        </div>

        {/* ── Headline ── */}
        <h1 className="hero-headline-new reveal d1">
          <span className="main">
            <span className="gradient-text">{v.pre} {v.main}</span>
          </span>
        </h1>

        <p className="hero-sub-new reveal d2">{v.sub}</p>

        {/* ── Cycle row — FIXED alignment ── */}
        <div className="hero-cycle-v2 reveal d2">
          <span className="hcv2-label">{es ? "Producimos" : "We ship"}</span>
          <div className="hcv2-gooey">
            <GooeyText
              texts={t.hero.cycle}
              morphTime={1}
              cooldownTime={2}
              className="w-[280px] md:w-[320px] h-12"
              textClassName="text-2xl md:text-3xl font-display font-bold text-[#0891B2] text-center"
            />
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="hero-ctas reveal d3">
          <ShinyButton onClick={() => { window.location.href = "#contact"; }}>
            {t.hero.ctaPrimary}
          </ShinyButton>
          <a href="#how" className="btn-secondary">{t.hero.ctaSecondary}</a>
        </div>

        {/* ── Metrics WOW ── */}
        <div className="hero-metrics-wow reveal d3">
          {t.hero.metrics.map((m, i) => (
            <div key={i} className="hmw-item">
              <div className="hmw-n metric-counter" data-target={m.n}>{m.n}</div>
              <div className="hmw-l">{m.l}</div>
            </div>
          ))}
        </div>
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

// ============ Logo grid / Community band ============
function LogoBand({ title, sub, hofTitle, items, id, variant = "default" }) {
  const isCommunity = variant === "community" || (items[0] && typeof items[0] === "object" && items[0].bg);
  
  const row1Items = React.useMemo(() => [...items].sort(() => 0.5 - Math.random()), [items]);
  const row2Items = React.useMemo(() => [...items].sort(() => 0.2 - Math.random()), [items]);
  const row3Items = React.useMemo(() => [...items].sort(() => 0.8 - Math.random()), [items]);

  return (
    <section className={`logos-band ${isCommunity ? "logos-band-community" : ""}`} id={id}>
      <div className="container">
        {isCommunity ? (
          <div className="hof-header reveal">
            <div className="hof-header-left">
              <span className="hof-eyebrow mono">▸ {title}</span>
              <h2 className="hof-title" dangerouslySetInnerHTML={{ __html: hofTitle || "Lo que dominé,<br/>adonde lo aprendí." }} />
            </div>
            <p className="hof-sub">{sub}</p>
          </div>
        ) : (
          <div className="section-header reveal">
            <div className="side">
              <span className="eyebrow">{title}</span>
            </div>
            <p>{sub}</p>
          </div>
        )}
        {isCommunity ? (
          <div className="community-grid reveal">
            {items.map((x, i) => (
              <CommunityCard key={i} item={typeof x === "string" ? { name: x, url: "#", bg: "", color: "#0891B2", sub: "" } : x} />
            ))}
          </div>
        ) : (
          <div className="perspective-marquee-wrapper reveal" style={{
            position: "relative",
            width: "100%",
            height: "600px",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            perspective: "1200px"
          }}>
            <div style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotateX(12deg) rotateY(-32deg)",
              transformStyle: "preserve-3d",
            }}>
              {/* ROW 1 — Left to Right */}
              <div className="tools-carousel-track" style={{
                display: "flex",
                whiteSpace: "nowrap",
                gap: "24px",
                animation: "logoScroll 45s linear infinite"
              }}>
                {[...row1Items, ...row1Items, ...row1Items].map((x, i) => {
                  const label = typeof x === "string" ? x : x.name;
                  const img = typeof x === "object" && x.img ? x.img : null;
                  return (
                    <div key={`r1-${i}`} className="perspective-tool-card" style={{
                      background: "#ffffff",
                      padding: "14px 28px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      transformStyle: "preserve-3d",
                      flexShrink: 0
                    }}>
                      {img && <img src={img} alt={label} style={{ height: "28px", width: "auto", objectFit: "contain" }} />}
                      <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* ROW 2 — Right to Left (Reverse) */}
              <div className="tools-carousel-track" style={{
                display: "flex",
                whiteSpace: "nowrap",
                gap: "24px",
                animation: "logoScrollReverse 38s linear infinite"
              }}>
                {[...row2Items, ...row2Items, ...row2Items].map((x, i) => {
                  const label = typeof x === "string" ? x : x.name;
                  const img = typeof x === "object" && x.img ? x.img : null;
                  return (
                    <div key={`r2-${i}`} className="perspective-tool-card" style={{
                      background: "#ffffff",
                      padding: "14px 28px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      transformStyle: "preserve-3d",
                      flexShrink: 0
                    }}>
                      {img && <img src={img} alt={label} style={{ height: "28px", width: "auto", objectFit: "contain" }} />}
                      <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* ROW 3 — Left to Right (Faster) */}
              <div className="tools-carousel-track" style={{
                display: "flex",
                whiteSpace: "nowrap",
                gap: "24px",
                animation: "logoScroll 52s linear infinite"
              }}>
                {[...row3Items, ...row3Items, ...row3Items].map((x, i) => {
                  const label = typeof x === "string" ? x : x.name;
                  const img = typeof x === "object" && x.img ? x.img : null;
                  return (
                    <div key={`r3-${i}`} className="perspective-tool-card" style={{
                      background: "#ffffff",
                      padding: "14px 28px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      transformStyle: "preserve-3d",
                      flexShrink: 0
                    }}>
                      {img && <img src={img} alt={label} style={{ height: "28px", width: "auto", objectFit: "contain" }} />}
                      <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edge fades */}
            <div style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "linear-gradient(90deg, var(--bg-2) 0%, transparent 20%, transparent 80%, var(--bg-2) 100%)"
            }} />
          </div>
        )}
      </div>
    </section>
  );
}

// ============ Service animated icons ============
const SRV_COLORS = ["#22c55e","#0891B2","#8b5cf6","#f59e0b","#ef4444"];
const SRV_SVGS = [
  // 01 Sprint — rocket launch
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 40 L24 16 M20 34 L24 40 L28 34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
    </path>
    <circle cx="24" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <line x1="8" y1="43" x2="40" y2="43" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    {[12,18,24,30,36].map((x,i)=>(
      <line key={i} x1={x} y1="43" x2={x} y2={43-(i===2?10:i===1||i===3?7:4)} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0">
        <animate attributeName="opacity" values="0;0.7;0" dur="2s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
      </line>
    ))}
  </svg>,
  // 02 Retainer — circular loop
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="88" strokeDashoffset="22">
      <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="5s" repeatCount="indefinite"/>
    </circle>
    <polygon points="24,10 28,16 20,16" fill="currentColor" opacity="0.85">
      <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="5s" repeatCount="indefinite"/>
    </polygon>
    <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.2" fill="none">
      <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.4;1" dur="3s" repeatCount="indefinite"/>
    </circle>
  </svg>,
  // 03 Performance OS — circuit
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="16" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <rect x="20" y="20" width="8" height="8" rx="1" fill="currentColor" opacity="0.2">
      <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" repeatCount="indefinite"/>
    </rect>
    {[[24,8],[24,40],[8,24],[40,24]].map(([x,y],i)=>(
      <line key={i} x1={x<16?16:x>32?32:x} y1={y<16?16:y>32?32:y} x2={x} y2={y} stroke="currentColor" strokeWidth="1.2" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
      </line>
    ))}
    {[[24,8],[40,24],[24,40],[8,24]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" opacity="0.7">
        <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
      </circle>
    ))}
  </svg>,
  // 04 Campaign — sparkle / star
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="24,8 27,20 40,20 29,28 33,40 24,32 15,40 19,28 8,20 21,20" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
    </polygon>
    <polygon points="24,8 27,20 40,20 29,28 33,40 24,32 15,40 19,28 8,20 21,20" fill="currentColor" opacity="0">
      <animate attributeName="opacity" values="0;0.15;0" dur="2.5s" repeatCount="indefinite"/>
    </polygon>
    {[[10,10],[38,10],[38,38],[10,38]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="2" fill="currentColor" opacity="0">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin={`${i*0.5}s`} repeatCount="indefinite"/>
      </circle>
    ))}
  </svg>,
  // 05 White-Label — building blocks
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="26" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="17" y="26" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.9">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
    </rect>
    <line x1="15" y1="22" x2="24" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    <line x1="33" y1="22" x2="24" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    <circle cx="24" cy="26" r="2" fill="currentColor" opacity="0.8"/>
  </svg>,
];

// ============ Services ladder (no prices) ============
function Services({ t }) {
  return (
    <section className="services section-invert" id="services">
      <div className="container">
        <div className="section-index">
          <span>§ 01 · {t.services.eyebrow}</span>
          <span>05 — {t.services.eyebrow === "HOW WE WORK" ? "formats" : "formatos"}</span>
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
            <div key={i} className="ladder-row reveal" style={{ "--srv-color": SRV_COLORS[i] }}>
              <div className="srv-icon-col" aria-hidden="true" style={{ color: SRV_COLORS[i] }}>
                {SRV_SVGS[i]}
              </div>
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

// ============ Lo que NO hacemos ============
function NotUsSection({ lang }) {
  const es = lang === "es";
  // Paired comparisons: [NOT, YES]
  const pairs = es ? [
    ["Una agencia genérica de IA", "Un motor creativo DFY + white-label"],
    ["Vendemos IA, prompts o herramientas", "Vendemos eliminación de fricción"],
    ["Editores o diseñadores por pieza", "Sistema de producción recurrente"],
    ["Creadores de contenido bonito", "Performance-first desde el hook 1"],
    ["Productora tradicional con shootings", "Producción sin casting ni locación"],
    ["Agencia de social media general", "Especialistas en paid media ecommerce"],
    ["Herramienta self-service que aprendes", "Done For You — nosotros hacemos el trabajo"],
    ["Agencia que hace de todo para todos", "Especialización brutal en visual commerce"],
  ] : [
    ["A generic AI agency", "A DFY + white-label creative engine"],
    ["We sell AI, prompts or tools", "We sell friction removal"],
    ["Per-piece editors or designers", "A recurring production system"],
    ["Pretty content creators", "Performance-first from hook 1"],
    ["Traditional production with shoots", "Production without casting or location"],
    ["General social media agency", "Paid media ecommerce specialists"],
    ["A self-service tool you learn", "Done For You — we do the work"],
    ["An agency that does everything for everyone", "Brutal specialization in visual commerce"],
  ];

  return (
    <section className="notus-section" id="notus">
      <div className="container">
        <div className="notus-header reveal">
          <span className="notus-eyebrow mono">{es ? "§ POSICIONAMIENTO" : "§ POSITIONING"}</span>
          <h2 className="notus-title">
            {es ? <><em>Sabemos exactamente</em>{" "}<span>lo que no somos.</span></> : <><em>We know exactly</em>{" "}<span>what we're not.</span></>}
          </h2>
          <p className="notus-sub">
            {es
              ? "Filtrar es proteger al cliente correcto. Antes de hablar, esto es lo que diferencia."
              : "Filtering protects the right client. Before we talk, this is what differentiates."}
          </p>
        </div>

        <div className="notus-table reveal">
          <div className="notus-table-header">
            <span className="mono notus-th-no">✕ {es ? "NO SOMOS" : "WE'RE NOT"}</span>
            <span className="mono notus-th-yes">→ {es ? "SÍ SOMOS" : "WE ARE"}</span>
          </div>
          {pairs.map(([no, yes], i) => (
            <div key={i} className="notus-row">
              <span className="notus-cell-no">{no}</span>
              <span className="notus-arrow-mid" aria-hidden="true">→</span>
              <span className="notus-cell-yes">{yes}</span>
            </div>
          ))}
        </div>

        <div className="notus-bottom reveal d1">
          <div className="notus-bottom-label mono">{es ? "LO QUE VENDEMOS" : "WHAT WE SELL"}</div>
          <p className="notus-bottom-text">
            {es
              ? "Eliminación del cuello de botella creativo para equipos que viven de campañas."
              : "Elimination of the creative bottleneck for teams that live on campaigns."}
          </p>
        </div>
      </div>
    </section>
  );
}


// ============ Step animated SVGs (SMIL inline) ============
function StepAnimSVG({ idx }) {
  const svgs = [
    // 0 — Intake & Brand Memory
    <svg key={0} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="8" width="32" height="46" rx="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
      <line x1="23" y1="22" x2="41" y2="22" stroke="currentColor" strokeWidth="0.9" opacity="0.4"/>
      <line x1="23" y1="29" x2="41" y2="29" stroke="currentColor" strokeWidth="0.9" opacity="0.4"/>
      <line x1="23" y1="36" x2="35" y2="36" stroke="currentColor" strokeWidth="0.9" opacity="0.4"/>
      <line x1="16" y1="22" x2="48" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.9">
        <animate attributeName="y1" values="14;50;14" dur="3s" repeatCount="indefinite" calcMode="ease-in-out"/>
        <animate attributeName="y2" values="14;50;14" dur="3s" repeatCount="indefinite" calcMode="ease-in-out"/>
        <animate attributeName="opacity" values="1;0.4;1" dur="3s" repeatCount="indefinite"/>
      </line>
      <circle cx="16" cy="22" r="3" fill="currentColor">
        <animate attributeName="cy" values="14;50;14" dur="3s" repeatCount="indefinite" calcMode="ease-in-out"/>
      </circle>
    </svg>,
    // 1 — Creative Direction & Hooks
    <svg key={1} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.7">
        <animate attributeName="r" values="6;8.5;6" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      {[0,60,120,180,240,300].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return <line key={i} x1={32+Math.cos(r)*10} y1={32+Math.sin(r)*10} x2={32+Math.cos(r)*23} y2={32+Math.sin(r)*23} stroke="currentColor" strokeWidth="1" opacity="0.35">
          <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${1.4+i*0.18}s`} repeatCount="indefinite"/>
        </line>;
      })}
      {[0,90,180,270].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return <circle key={i} cx={32+Math.cos(r)*23} cy={32+Math.sin(r)*23} r="2.2" fill="currentColor" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" from={`${deg} 32 32`} to={`${deg+360} 32 32`} dur="7s" repeatCount="indefinite"/>
        </circle>;
      })}
    </svg>,
    // 2 — AI Production
    <svg key={2} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,10 50,21 50,43 32,54 14,43 14,21" stroke="currentColor" strokeWidth="1.2" opacity="0.35">
        <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="22s" repeatCount="indefinite"/>
      </polygon>
      <circle cx="32" cy="32" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.6">
        <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      {[[24,20],[40,20],[48,32],[40,44],[24,44],[16,32]].map(([cx,cy], i) => (
        <rect key={i} x={cx-2.5} y={cy-2.5} width="5" height="5" rx="1" fill="currentColor" opacity="0">
          <animate attributeName="opacity" values="0;0.85;0" dur="2.4s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
        </rect>
      ))}
    </svg>,
    // 3 — QA & Brand Consistency
    <svg key={3} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L50 17 L50 36 C50 48 40 55 32 58 C24 55 14 48 14 36 L14 17 Z" stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
      <path d="M32 8 L50 17 L50 36 C50 48 40 55 32 58 C24 55 14 48 14 36 L14 17 Z" stroke="currentColor" strokeWidth="1.5" opacity="0">
        <animate attributeName="opacity" values="0;0.5;0" dur="2.8s" repeatCount="indefinite"/>
      </path>
      <path d="M21 32 L29 40 L43 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="32" strokeDashoffset="32">
        <animate attributeName="strokeDashoffset" values="32;0;0;32" keyTimes="0;0.45;0.85;1" dur="3.5s" repeatCount="indefinite"/>
      </path>
    </svg>,
    // 4 — Structured Delivery & Testing
    <svg key={4} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="54" x2="52" y2="54" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
      {[18,26,34,42].map((x, i) => {
        const top = 54-(i+1)*7;
        const vals = `54;${top};${top};54`;
        return (
          <line key={i} x1={x} y1="54" x2={x} y2={top} stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.4;0.9;1" dur="3s" begin={`${i*0.25}s`} repeatCount="indefinite"/>
            <animate attributeName="y2" values={vals} keyTimes="0;0.4;0.9;1" dur="3s" begin={`${i*0.25}s`} repeatCount="indefinite"/>
          </line>
        );
      })}
      <path d="M8 24 L32 10 L56 24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="32" cy="10" r="3" fill="currentColor" opacity="0.9">
        <animate attributeName="cy" values="10;6;10" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>,
    // 5 — Compound Feedback Loop
    <svg key={5} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="12s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="32" r="11" stroke="currentColor" strokeWidth="1.5" strokeDasharray="60" strokeDashoffset="20">
        <animateTransform attributeName="transform" type="rotate" from="360 32 32" to="0 32 32" dur="4.5s" repeatCount="indefinite"/>
      </circle>
      <polygon points="32,14 37,22 27,22" fill="currentColor" opacity="0.75">
        <animateTransform attributeName="transform" type="rotate" from="360 32 32" to="0 32 32" dur="4.5s" repeatCount="indefinite"/>
      </polygon>
      <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8">
        <animate attributeName="r" values="3;6;3" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.9"/>
    </svg>,
  ];
  return svgs[idx] || null;
}

// ============ How it works ============
function How({ t }) {
  const steps = t.how.steps;
  return (
    <section className="how" id="how">
      <div className="container">
        <div className="section-index">
          <span>§ 02 · {t.how.eyebrow}</span>
          <span>06 — {t.how.eyebrow === "THE SYSTEM" ? "steps" : "pasos"}</span>
        </div>
        <div className="how-header reveal">
          <span className="eyebrow">{t.how.eyebrow}</span>
          <h2 className="how-title">{t.how.title}</h2>
          <p className="how-sub">{t.how.sub}</p>
        </div>

        <div className="steps-grid reveal">
          {steps.map((s, i) => (
            <div key={i} className="step-card-v2">
              <div className="scv2-svg-wrap">
                <StepAnimSVG idx={i} />
              </div>
              <div className="scv2-body">
                <div className="scv2-n mono">{s.n}</div>
                <h3 className="scv2-t">{s.t}</h3>
                <p className="scv2-d">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Niche SVG icons ============
const NICHE_ICONS = {
  fashion: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 6L10 14h4v20h12V14h4L26 6a6 6 0 01-12 0z"/>
      <line x1="14" y1="22" x2="26" y2="22" strokeOpacity=".4"/>
    </svg>
  ),
  beauty: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="20" cy="22" r="10"/>
      <path d="M20 6v4M14 10l2 2M26 10l-2 2"/>
      <circle cx="20" cy="22" r="3" fill="currentColor" opacity=".3" stroke="none"/>
    </svg>
  ),
  supplements: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="14" y="8" width="12" height="24" rx="6"/>
      <line x1="14" y1="20" x2="26" y2="20"/>
      <circle cx="20" cy="14" r="1.5" fill="currentColor" stroke="none" opacity=".5"/>
    </svg>
  ),
  pets: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="20" cy="28" rx="9" ry="7"/>
      <circle cx="13" cy="16" r="3"/>
      <circle cx="27" cy="16" r="3"/>
      <circle cx="10" cy="22" r="2.5"/>
      <circle cx="30" cy="22" r="2.5"/>
    </svg>
  ),
  gadgets: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="10" width="26" height="17" rx="2"/>
      <path d="M16 27v5M24 27v5M13 32h14"/>
      <rect x="11" y="14" width="7" height="5" rx="1" strokeOpacity=".5"/>
      <line x1="22" y1="15" x2="28" y2="15" strokeOpacity=".5"/>
      <line x1="22" y1="18" x2="26" y2="18" strokeOpacity=".5"/>
    </svg>
  ),
  sku: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="13" height="13" rx="1.5"/>
      <rect x="22" y="5" width="13" height="13" rx="1.5"/>
      <rect x="5" y="22" width="13" height="13" rx="1.5"/>
      <rect x="22" y="22" width="13" height="13" rx="1.5"/>
    </svg>
  ),
};

const NICHE_IMG_KEYS = ["fashion","beauty","supplements","pets","gadgets","sku"];

// ============ Niches ============
function Niches({ t }) {
  return (
    <section className="niches section-invert" id="niches">
      <div className="container">
        <div className="section-index">
          <span>§ 03 · {t.niches.eyebrow}</span>
          <span>06 — {t.niches.eyebrow.includes("VERTICALS") || t.niches.eyebrow.includes("WE OPERATE") ? "verticals" : "verticales"}</span>
        </div>
        <div className="section-header-centered reveal" style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px", color: "rgba(10,10,11,0.6)" }}>{t.niches.eyebrow}</span>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(32px, 4.6vw, 72px)", fontWeight: 700, letterSpacing: "-0.035em", color: "#0a0a0b", marginBottom: "16px", textWrap: "balance" }}>{t.niches.title}</h2>
          <p style={{ color: "rgba(10,10,11,0.7)", fontSize: "clamp(15px, 1.3vw, 18px)", lineHeight: "1.45", maxWidth: "600px", margin: "0 auto" }}>{t.niches.sub}</p>
        </div>
        <div className="niches-grid">
          {t.niches.items.map((n, i) => {
            const imgKey = NICHE_IMG_KEYS[i] || "";
            const imgs = (window.SGF_DATA.nicheImages || {})[imgKey] || [];
            return (
              <div key={i} className="niche-card reveal">
                {/* Image strip */}
                {imgs.length > 0 && (
                  <div className="niche-imgs">
                    {imgs.slice(0, 4).map((src, k) => (
                      <div key={k} className="niche-img-cell">
                        <img src={src} alt={n.t} loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="niche-card-inner">
                  <div className="niche-card-top">
                    <div className="num">0{i + 1}</div>
                    {n.icon && NICHE_ICONS[n.icon] && (
                      <div className="niche-card-icon">{NICHE_ICONS[n.icon]}</div>
                    )}
                  </div>
                  <div>
                    <h3 className="t">{n.t}</h3>
                    <p className="d">{n.d}</p>
                  </div>
                  {n.tags && n.tags.length > 0 && (
                    <div className="niche-card-tags">
                      {n.tags.map((tag, j) => <span key={j} className="niche-tag">{tag}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CaseAnimSVG({ idx }) {
  const svgs = [
    <svg key={0} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 16 L24 28 L40 28 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      <path d="M20 28 L44 28 L48 48 L16 48 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      <line x1="16" y1="54" x2="48" y2="54" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <path d="M12 44 L22 34 L32 40 L44 26 L52 34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="strokeDasharray" values="100;0;100" dur="4s" repeatCount="indefinite"/>
      </path>
    </svg>,
    <svg key={1} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 12 C32 12 20 26 20 36 C20 42.6 25.4 48 32 48 C38.6 48 44 42.6 44 36 C44 26 32 12 32 12 Z" stroke="currentColor" strokeWidth="1.5" fill="none">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite"/>
      </path>
      <circle cx="32" cy="36" r="4" fill="currentColor" opacity="0.6">
        <animate attributeName="r" values="2;6;2" dur="3s" repeatCount="indefinite"/>
      </circle>
      {[16, 24, 32].map((r, i) => (
        <circle key={i} cx="32" cy="36" r={r} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.2">
          <animateTransform attributeName="transform" type="rotate" from="0 32 36" to="360 32 36" dur={`${6+i*2}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>,
    <svg key={2} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      {[[22,24], [32,18], [42,24]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="currentColor" opacity="0.4">
          <animate attributeName="cy" values={`${cy};${cy-4};${cy}`} dur={`${2+i*0.5}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      <polygon points="32,24 34,30 40,30 35,34 37,40 32,36 27,40 29,34 24,30 30,30" fill="currentColor" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/>
      </polygon>
    </svg>,
    <svg key={3} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="16" width="20" height="32" rx="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="22" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M24 32 Q29 28 32 32 T40 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        <animate attributeName="d" values="M24 32 Q29 28 32 32 T40 32; M24 32 Q29 36 32 32 T40 32; M24 32 Q29 28 32 32 T40 32" dur="2s" repeatCount="indefinite"/>
      </path>
      {[[16,20], [48,24], [18,44], [46,40]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
          <animate attributeName="cy" values={`${cy};${cy-8};${cy}`} dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>,
    <svg key={4} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 42 L24 24 L42 28 L50 36 L50 42 L14 42 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6"/>
      <path d="M14 42 L18 46 L46 46 L50 42" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="24" y1="34" x2="36" y2="34" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
      <line x1="10" y1="50" x2="54" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
      <circle cx="28" cy="30" r="1.5" fill="currentColor">
        <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>,
    <svg key={5} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <rect x="24" y="24" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
      </rect>
      {[[16, 32], [48, 32], [32, 16], [32, 48]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor">
          <animate attributeName="r" values="2;4;2" dur="2s" begin={`${i*0.5}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>,
  ];
  return (
    <div className="case-svg-wrap" aria-hidden="true" style={{ width: "64px", height: "64px", color: "var(--accent)", marginBottom: "16px" }}>
      {svgs[idx] || null}
    </div>
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
              <CaseAnimSVG idx={i} />
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
          {t.manifesto.lines.map((l, i) => {
            const isOn = i <= active;
            // Color escalates: lines 0-1 white, 2-3 teal-dim, 4-5 teal-bright/accent
            const colorClass = i <= 1 ? "mc-white" : i <= 3 ? "mc-teal" : "mc-accent";
            const isLast = i === t.manifesto.lines.length - 1;
            return (
              <span key={i} className={`manifesto-line ${isOn ? "on" : ""} ${colorClass} ${isLast && isOn ? "ml-last" : ""}`}>
                {isOn && <span className="ml-marker" aria-hidden="true">—</span>}
                {l}
              </span>
            );
          })}
        </div>
        <p className="manifesto-sub reveal">{t.manifesto.sub}</p>
      </div>
    </section>
  );
}

// ============ Showcase — real media gallery ============
function Showcase({ t, lang }) {
  const items = window.SGF_DATA.showcase;
  const es = lang === "es";
  // layout pattern: v=vertical video (9:16), h=horizontal video (16:9), i=image (4:5)
  // maps index to span class
  const spanClass = (x, idx) => {
    if (x.ratio === "16/9") return "show-wide";
    if (x.ratio === "9/16") return "show-tall";
    return "show-square";
  };
  return (
    <section className="showcase section-invert" id="showcase">
      <div className="container">
        <div className="section-index">
          <span>§ 06 · {t.showcase.eyebrow}</span>
          <span>{items.length} — {es ? "piezas" : "pieces"}</span>
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
        <div className="showcase-masonry reveal">
          {items.map((x, i) => (
            <div key={i} className={`show-item ${spanClass(x, i)}`}>
              {x.type === "video" ? (
                <video
                  src={x.src}
                  autoPlay muted loop playsInline
                  className="show-media"
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <img
                  src={x.src}
                  alt={x.t}
                  className="show-media"
                  loading="lazy"
                  onError={e => { e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.04)"; }}
                />
              )}
              <div className="show-overlay">
                <div className="show-label">{x.t}</div>
                <div className="show-format mono">{x.f}</div>
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
          {t.blog.posts.slice(0, 3).map((p, i) => (
            <a key={i} href={`blog/${p.slug}.html`} className="blog-card reveal">
              <div className="img" style={p.thumb ? { backgroundImage: `url(${p.thumb})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
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
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="blog/index.html" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "12px 28px", borderRadius: "100px",
            border: "1px solid var(--line)", color: "var(--fg-dim)",
            fontSize: "13px", fontWeight: 500, textDecoration: "none",
            transition: "border-color .2s, color .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(8,145,178,0.5)"; e.currentTarget.style.color="var(--fg)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color="var(--fg-dim)"; }}
          >
            {lang === "es" ? "Ver los 10 artículos" : "View all 10 articles"} →
          </a>
        </div>
      </div>
    </section>
  );
}

// ============ Founder / About ============
function Founder({ lang }) {
  const es = lang === "es";
  return (
    <section className="founder" id="founder">
      <div className="container">
        <div className="founder-wrap reveal">
          <div className="founder-text">
            <span className="eyebrow">{es ? "QUIÉN ESTÁ DETRÁS" : "WHO'S BEHIND THIS"}</span>
            <h2 className="founder-name">Santiago González</h2>
            <p className="founder-role mono">{es ? "Fundador · START GROW FAST AI AGENTS" : "Founder · START GROW FAST AI AGENTS"}</p>
            <p className="founder-bio">
              {es
                ? "Operador de sistemas creativos con IA. Formado en las mejores comunidades de IA creativa del mundo — AI Creative Club, GenHQ, Braud Academy, Imperium Academy, entre otras. Mi trabajo es instalar la capa creativa que le falta a tu agencia: sin shootings, sin equipo extra, sin fricción operativa. Llevo más de 2 años devorando tutoriales, testeando modelos y construyendo workflows desde cero. Pasé de experimentar en mi habitación a liderar la integración de operaciones creativas de performance para ecommerces."
                : "AI creative systems operator. Trained in the world's top AI creative communities — AI Creative Club, GenHQ, Braud Academy, Imperium Academy, and more. My job is to install the creative layer your agency is missing: no shoots, no extra team, no operational friction. For over 2 years, I've spent thousands of hours learning from the absolute best in the industry to turn pure prompt logic into structured workflows."}
            </p>
            <div className="founder-communities">
              {window.SGF_DATA.communities.filter(c => c.url && c.url !== "#").slice(0, 5).map((c, i) => (
                <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="founder-badge">
                  {c.name}
                </a>
              ))}
            </div>
            <a href="#contact" className="btn-primary" style={{ marginTop: "28px", display: "inline-flex" }}>
              {es ? "Trabajar con Santiago" : "Work with Santiago"} <Arrow />
            </a>
          </div>
          <div className="founder-photo-col">
            <div className="founder-photo-frame">
              <img src="assets/founder_original.png" alt="Santiago González — START GROW FAST AI AGENTS" className="founder-photo" />
              <div className="founder-photo-badge">
                <span className="status-dot" />
                <span>{es ? "Fundador & Operador" : "Founder & Operator"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Big CTA ============
function BigCTA({ lang }) {
  const es = lang === "es";
  const [main, tail] = es ? ["Menos fricción,", "más volumen."] : ["Less friction,", "more volume."];
  return (
    <section className="big-cta" style={{ padding: 0 }}>
      <window.LampContainer>
        <h2 style={{
          fontFamily: "var(--display)", fontWeight: 600,
          fontSize: "clamp(48px,9vw,140px)", letterSpacing: "-0.05em", lineHeight: 0.9,
          textAlign: "center", margin: "0 auto", maxWidth: "14ch",
          color: "var(--fg)",
        }}>
          {main}{" "}
          <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>
            {tail}
          </em>
        </h2>
        <p style={{ color: "var(--fg-dim)", margin: "28px auto 36px", maxWidth: "52ch", fontSize: "17px", lineHeight: 1.5, textAlign: "center" }}>
          {es
            ? "Hablemos 20 minutos. Si no te ahorramos tiempo, te decimos exactamente quién sí puede."
            : "Let's talk 20 minutes. If we can't save you time, we'll tell you exactly who can."}
        </p>
        <a href="#contact" style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginTop: "8px", padding: "16px 32px", borderRadius: "100px",
          background: "linear-gradient(135deg,rgba(8,145,178,0.25),rgba(34,211,238,0.15))",
          border: "1px solid rgba(34,211,238,0.3)", color: "#22D3EE",
          fontWeight: 600, fontSize: "16px", textDecoration: "none",
          letterSpacing: "-0.01em", transition: "all .3s",
        }}>
          {es ? "Hablemos" : "Let's talk"} <Arrow size={16} />
        </a>
      </window.LampContainer>
    </section>
  );
}

// ============ Contact ============
// ─── CONFIG DE ENVÍO ────────────────────────────────────────────
// OPCIÓN A — Web3Forms (sin activación, funciona siempre):
//   1. Ve a https://web3forms.com/ → pon team@startgrowfastaiagents.com → copia la clave
//   2. Pégala aquí:
const WEB3FORMS_KEY = "e7f0a1ca-32e0-445c-a1ad-ee8ffe7dff45";   // ← pega aquí la clave de web3forms.com

// OPCIÓN B — FormSubmit (un único endpoint, solo 1 activación):
const FORM_MAIN = "team@startgrowfastaiagents.com";
const FORM_CC   = "santiagogonzalez@startgrowfastaiagents.com,ceo@startgrowfastaiagents.com";
// ────────────────────────────────────────────────────────────────

const RECIPIENTS = {
  es: [
    { label: "Equipo general",             desc: "Consultas generales" },
    { label: "Santiago González (Fundador)",desc: "Propuestas y partnerships" },
    { label: "CEO",                         desc: "Decisiones estratégicas" },
  ],
  en: [
    { label: "General team",               desc: "General inquiries" },
    { label: "Santiago González (Founder)",desc: "Proposals & partnerships" },
    { label: "CEO",                         desc: "Strategic decisions" },
  ],
};

function Contact({ t, lang }) {
  const es = lang === "es";
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const recipients = RECIPIENTS[lang] || RECIPIENTS.es;
  const [recipientIdx, setRecipientIdx] = useState(0);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    const label = recipients[recipientIdx].label;
    const subject = `[${label}] ${es ? "Nueva consulta" : "New inquiry"} — startgrowfastaiagents.com`;

    try {
      if (WEB3FORMS_KEY) {
        // ── Web3Forms: sin activación, sin captcha, funciona siempre ──
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject,
            from_name: "START GROW FAST AI AGENTS",
            ...data,
            para: label,
          }),
        });
        if (!res.ok) throw new Error("web3forms");
      } else {
        // ── FormSubmit: un solo endpoint, CC a todos, sin captcha ──
        const res = await fetch(`https://formsubmit.co/ajax/${FORM_MAIN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...data,
            _cc: FORM_CC,
            _captcha: "false",
            _subject: subject,
            _template: "table",
            para: label,
          }),
        });
        if (!res.ok) throw new Error("formsubmit");
      }
      setSent(true);
      form.reset();
      setRecipientIdx(0);
      setTimeout(() => setSent(false), 6000);
    } catch (_) {
      setError(true);
      setTimeout(() => setError(false), 5000);
    } finally {
      setSending(false);
    }
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
          </div>
          <form className="form reveal d1" onSubmit={onSubmit}>
            <div className="row2">
              <div className="field">
                <label>{t.contact.form.name}</label>
                <input type="text" name="name" required />
              </div>
              <div className="field">
                <label>{t.contact.form.company}</label>
                <input type="text" name="company" />
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>{t.contact.form.email}</label>
                <input type="email" name="email" required />
              </div>
              <div className="field">
                <label>{lang === "es" ? "Sitio Web (URL)" : "Website (URL)"}</label>
                <input type="url" name="website" placeholder="https://..." />
              </div>
            </div>
            <div className="field">
              <label>{t.contact.form.role}</label>
              <input type="text" name="role" placeholder={t.contact.form.rolePlaceholder} />
            </div>

            {/* Recipient selector — dropdown */}
            <div className="field">
              <label className="mono" style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {es ? "Enviar a" : "Send to"}
              </label>
              <div className="select-wrap">
                <select
                  className="recipient-select"
                  value={recipientIdx}
                  onChange={e => setRecipientIdx(Number(e.target.value))}>
                  {recipients.map((r, i) => (
                    <option key={i} value={i}>{r.label} — {r.desc}</option>
                  ))}
                </select>
                <span className="select-chevron" aria-hidden="true">▾</span>
              </div>
            </div>

            <div className="field">
              <label>{t.contact.form.message}</label>
              <textarea name="message" required></textarea>
            </div>

            <div className="field checkbox-field" style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "16px", marginBottom: "16px" }}>
              <input type="checkbox" id="privacy-consent" required style={{ width: "20px", height: "20px", cursor: "pointer", flexShrink: 0, marginTop: "2px" }} />
              <label htmlFor="privacy-consent" style={{ fontSize: "13px", opacity: 0.7, cursor: "pointer", textTransform: "none", letterSpacing: "0" }}>
                {es ? "Acepto la " : "I accept the "}
                <a href="/legal/privacy.html" target="_blank" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  {es ? "política de privacidad" : "privacy policy"}
                </a>
              </label>
            </div>

            <window.MetalButton type="submit" variant="primary" disabled={sending || sent || error} className="w-full mt-2">
              {sent
                ? (es ? "✓ Enviado correctamente" : "✓ Sent successfully")
                : sending
                  ? (es ? "Enviando…" : "Sending…")
                  : error
                    ? (es ? "✗ Error — intenta de nuevo" : "✗ Error — please retry")
                    : t.contact.form.send}
              {!sent && !sending && !error && <Arrow />}
            </window.MetalButton>
          </form>
        </div>
      </div>
    </section>
  );
}

// ============ Footer ============
function Footer({ t, lang }) {
  return (
    <footer className="footer footer-white">
      <div className="container">
        <div className="footer-top">
          <div className="footer-logo">
            <img src="assets/logo_clean.png" alt="SGF" style={{ height: "160px", width: "auto", objectFit: "contain" }} />
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
            <a href="/blog/index.html">{t.nav.blog}</a>
          </div>
          <div className="footer-col">
            <h4>{t.nav.contact}</h4>
            <a href="mailto:team@startgrowfastaiagents.com">team@startgrowfastaiagents.com</a>
            <a href="mailto:santiagogonzalez@startgrowfastaiagents.com">santiagogonzalez@startgrowfastaiagents.com</a>
            <a href="mailto:ceo@startgrowfastaiagents.com">ceo@startgrowfastaiagents.com</a>
          </div>
          <div className="footer-col">
            <h4>{t.footer.legal}</h4>
            <a href="legal/privacy.html">{t.footer.privacy}</a>
            <a href="legal/terms.html">{t.footer.terms}</a>
            <a href="legal/cookies.html">{lang === "es" ? "Política de Cookies" : "Cookie Policy"}</a>
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

function CookieBanner({ lang }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  const es = lang === "es";

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "24px",
      right: "24px",
      background: "rgba(10, 10, 11, 0.95)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "24px",
      zIndex: 9999,
      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
      flexWrap: "wrap"
    }}>
      <div style={{ flex: "1", minWidth: "280px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: "1.5" }}>
          {es 
            ? "Utilizamos cookies propias y de terceros para analizar el tráfico, optimizar tu experiencia y personalizar anuncios." 
            : "We use first and third-party cookies to analyze traffic, optimize your experience, and personalize ads."}{" "}
          <a href="legal/cookies.html" style={{ color: "var(--accent, #0891B2)", textDecoration: "underline", fontWeight: 500 }}>
            {es ? "Política de Cookies" : "Cookie Policy"}
          </a>
        </p>
      </div>
      <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
        <button onClick={decline} style={{
          background: "transparent",
          color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "10px 20px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}
        >
          {es ? "Rechazar" : "Decline"}
        </button>
        <button onClick={accept} style={{
          background: "var(--accent, #0891B2)",
          color: "#ffffff",
          border: "none",
          padding: "10px 24px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity="0.9"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity="1"; }}
        >
          {es ? "Aceptar" : "Accept"}
        </button>
      </div>
    </div>
  );
}

// ============ App ============
function App() {
  const [lang, setLang] = useLang();
  const tweaks = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const [state, setTweak] = tweaks;
  const t = window.I18N[lang];

  useReveal();
  useLenis();
  useGSAP();

  // Apply tweak CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", state.accent);
    root.style.setProperty("--display", `"${state.fontDisplay}", "Syne", Helvetica, sans-serif`);
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
      <HormoziSection lang={lang} />
      <Marquee items={[
        lang === "es" ? "MÁS ADS" : "MORE ADS",
        lang === "es" ? "MÁS UGC" : "MORE UGC",
        lang === "es" ? "MÁS ÁNGULOS" : "MORE ANGLES",
        lang === "es" ? "MÁS VELOCIDAD" : "MORE SPEED",
        lang === "es" ? "MENOS FRICCIÓN" : "LESS FRICTION",
        lang === "es" ? "MENOS COSTE" : "LESS COST",
      ]} />
      <LogoBand id="communities" variant="community" title={t.communities.title} sub={t.communities.sub} hofTitle={t.communities.hofTitle} items={window.SGF_DATA.communities} />
      <ShaderSection lang={lang} />
      <Services t={t} />
      <NotUsSection lang={lang} />
      <ProblemsSection lang={lang} />
      <How t={t} />
      <Founder lang={lang} />
      <LogoBand id="tools" title={t.tools.title} sub={t.tools.sub} items={window.SGF_DATA.tools} />
      <Niches t={t} />
      <Cases t={t} />
      <Manifesto t={t} />
      <Showcase t={t} lang={lang} />
      <FAQ t={t} />
      <Blog t={t} lang={lang} />
      <BigCTA lang={lang} />
      <Contact t={t} lang={lang} />
      <Footer t={t} lang={lang} />
      <CookieBanner lang={lang} />

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
            options={["Syne", "DM Sans", "Cormorant Garamond", "Space Mono"]}
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
