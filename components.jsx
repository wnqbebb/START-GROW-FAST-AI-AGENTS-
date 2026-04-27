const { motion, AnimatePresence } = window.Motion;
const { twMerge } = window.tailwindMerge;
const { clsx } = window.clsx;

window.cn = function cn(...inputs) {
  return twMerge(clsx(inputs));
};

const debounce = window._.debounce;
const { Engine, Render, Runner, MouseConstraint, Mouse, World, Bodies, Events, Query, Common } = window.Matter;
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
    return () => { window.removeEventListener("resize", debouncedResize); debouncedResize.cancel(); };
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
