"use client";

import React, {
  useState, useContext, createContext,
  useEffect, useRef, useCallback,
} from "react";
import {
  ShoppingBag, Plus, Minus, X,
  ChevronRight, ArrowRight, Mail,
} from "lucide-react";

// ─── LOGO SVG ─────────────────────────────────────────────────────────────────
function AerLogo({ size = 40, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size} height={Math.round(size * 0.82)}
      viewBox="0 0 120 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: "logoBreath 4s ease-in-out infinite" } : undefined}
    >
      <defs>
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#C8A96E"/>
          <stop offset="55%"  stopColor="#E8D5A8"/>
          <stop offset="100%" stopColor="#C8A96E"/>
        </linearGradient>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E8D5A8"/>
          <stop offset="50%"  stopColor="#F5EDD8"/>
          <stop offset="100%" stopColor="#D4B882"/>
        </linearGradient>
        <filter id="lf" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Outer gold arch: bottom-left rising to top-right */}
      <path d="M 8 72 C 18 72, 28 20, 44 20 C 56 20, 60 48, 68 48 C 78 48, 88 8, 112 8"
        stroke="url(#wg1)" strokeWidth="3.8" strokeLinecap="round" fill="none" filter="url(#lf)"/>
      {/* Inner cream arch, parallel offset */}
      <path d="M 8 80 C 18 80, 30 28, 46 28 C 58 28, 62 56, 70 56 C 80 56, 90 16, 112 16"
        stroke="url(#wg2)" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.9"/>
      {/* Cross diagonal: top-left to bottom-right */}
      <path d="M 10 14 C 28 14, 38 42, 52 58 C 62 70, 74 82, 92 88"
        stroke="url(#wg1)" strokeWidth="3.8" strokeLinecap="round" fill="none" filter="url(#lf)"/>
      {/* Inner parallel to diagonal */}
      <path d="M 18 10 C 36 10, 46 38, 58 54 C 68 66, 80 78, 100 86"
        stroke="url(#wg2)" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.88"/>
      {/* Bottom closing wave */}
      <path d="M 8 88 C 20 88, 32 60, 48 52 C 60 46, 68 60, 78 68 C 88 76, 98 82, 112 82"
        stroke="url(#wg1)" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Lang = "DE" | "EN";
interface Product {
  id: string; slug: string; price: number;
  nameDe: string; nameEn: string;
  descDe: string; descEn: string;
  tagDe: string; tagEn: string;
  accentColor: string; svgPath: string;
}
interface CartItem { product: Product; quantity: number; }
interface CartCtx {
  items: CartItem[]; addItem(p: Product): void;
  removeItem(id: string): void; updateQty(id: string, d: number): void;
  total: number; count: number;
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  DE: {
    nav_col:"Kollektion", nav_phi:"Philosophie", nav_con:"Kontakt",
    hero_tag:"Handgefertigt in der Schweiz",
    hero_h1a:"Die Zukunft", hero_h1b:"des Lichts.",
    hero_sub:"Skulpturale 3D-Leuchten, die Räume in poetische Lichtarchitektur verwandeln.",
    hero_cta:"Kollektion entdecken", hero_scroll:"Scrollen",
    sec_col:"Unsere Kollektion", sec_sub:"Vier Ausnahmewerke. Unzählige Momente des Staunens.",
    add:"In den Warenkorb", view:"Ansehen",
    cart_t:"Warenkorb", cart_empty:"Ihr Warenkorb ist leer.",
    cart_sub:"Zwischensumme", cart_ship:"Versand", cart_free:"Kostenlos",
    cart_tot:"Gesamtbetrag", cart_go:"Zur Kasse",
    chk_t:"Bestellung abschliessen",
    chk_sub:"Sichere Zahlung via Stripe — wird in Kürze verfügbar sein.",
    chk_name:"Vollständiger Name", chk_mail:"E-Mail-Adresse",
    chk_addr:"Lieferadresse", chk_city:"Ort / PLZ",
    chk_btn:"Weiter zur Zahlung", chk_back:"Zurück zum Warenkorb",
    chk_mock:"Stripe-Integration folgt in Kürze. Diese Seite ist strukturell bereit.",
    phi_tag:"Unsere Philosophie", phi_h:"Licht als skulpturales Medium.",
    phi_p1:"Aer Lights entsteht an der Schnittstelle von parametrischem Design, Schweizer Ingenieurskunst und dem kompromisslosen Streben nach Schönheit. Jede Leuchte ist ein Einzelstück – konzipiert für Räume, die mehr als Helligkeit verlangen.",
    phi_p2:"Unsere Diffusoren werden aus hochwertigem, nachhaltig produziertem PLA-Komposit im industriellen 3D-Druck gefertigt. Präzise. Langlebig. Unvergänglich.",
    s1:"100%", s1l:"Schweizer Design", s2:"4", s2l:"Exklusive Modelle", s3:"∞", s3l:"Möglichkeiten",
    nl_h:"Exklusive Einblicke.",
    nl_sub:"Erhalten Sie als Erster Einblicke in neue Editionen und Design-Prozesse.",
    nl_ph:"Ihre E-Mail-Adresse", nl_btn:"Abonnieren",
    f_copy:"© 2025 Aer Lights. Alle Rechte vorbehalten.",
    f_dev:"Entwickelt von Vodnik Digital Solutions",
    f_imp:"Impressum", f_prv:"Datenschutz", f_shp:"Versand & Rückgabe",
    f_tag:"Licht, das bleibt.",
  },
  EN: {
    nav_col:"Collection", nav_phi:"Philosophy", nav_con:"Contact",
    hero_tag:"Handcrafted in Switzerland",
    hero_h1a:"The Future", hero_h1b:"of Light.",
    hero_sub:"Sculptural 3D luminaires that transform spaces into poetic light architecture.",
    hero_cta:"Discover Collection", hero_scroll:"Scroll",
    sec_col:"Our Collection", sec_sub:"Four exceptional works. Countless moments of wonder.",
    add:"Add to Cart", view:"View",
    cart_t:"Shopping Bag", cart_empty:"Your cart is empty.",
    cart_sub:"Subtotal", cart_ship:"Shipping", cart_free:"Free",
    cart_tot:"Total", cart_go:"Proceed to Checkout",
    chk_t:"Complete Your Order",
    chk_sub:"Secure payment via Stripe — coming soon.",
    chk_name:"Full Name", chk_mail:"Email Address",
    chk_addr:"Delivery Address", chk_city:"City / Postcode",
    chk_btn:"Continue to Payment", chk_back:"Back to Cart",
    chk_mock:"Stripe integration coming soon. This page is structurally ready.",
    phi_tag:"Our Philosophy", phi_h:"Light as a sculptural medium.",
    phi_p1:"Aer Lights exists at the intersection of parametric design, Swiss engineering precision, and an uncompromising pursuit of beauty. Each luminaire is unique — conceived for spaces that demand more than brightness.",
    phi_p2:"Our diffusers are crafted from premium, sustainably produced PLA composite using industrial 3D printing. Precise. Durable. Timeless.",
    s1:"100%", s1l:"Swiss Design", s2:"4", s2l:"Exclusive Models", s3:"∞", s3l:"Possibilities",
    nl_h:"Exclusive Insights.",
    nl_sub:"Be the first to receive previews of new editions and design processes.",
    nl_ph:"Your email address", nl_btn:"Subscribe",
    f_copy:"© 2025 Aer Lights. All rights reserved.",
    f_dev:"Developed by Vodnik Digital Solutions",
    f_imp:"Impressum", f_prv:"Privacy Policy", f_shp:"Shipping & Returns",
    f_tag:"Light that endures.",
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id:"loum", slug:"loum", price:380,
    nameDe:"LOUM", nameEn:"LOUM",
    tagDe:"Statement-Piece", tagEn:"Statement Piece",
    accentColor:"#C8A96E",
    descDe:"Eine Symbiose aus skulpturaler Avantgarde und emotionaler Lichtarchitektur. Der sanft gerundete, organisch perforierte Diffusor ruht wie eine schwebende Wolke auf drei massiven, tiefschwarzen Beinen. LOUM bricht das Licht in ein weiches, warmes Leuchten und wirft ein majestätisches, radiales Schattenmuster auf den Boden. Ein exklusives Statement-Piece, das dem Raum eine kraftvolle, beruhigende Seele verleiht.",
    descEn:"A symbiosis of sculptural avant-garde and emotional light architecture. The softly rounded, organically perforated diffuser rests like a hovering cloud upon three massive, deep-black legs. LOUM refracts light into a soft, warm glow, casting a majestic radial shadow pattern across the floor. An exclusive statement piece that gives the room a powerful, calming soul.",
    svgPath:`<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lg_loum" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#F0DFB0"/>
          <stop offset="55%" stop-color="#C8A96E" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#8B6914" stop-opacity="0.2"/>
        </radialGradient>
        <filter id="glow_loum"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="100" cy="100" rx="68" ry="44" fill="url(#lg_loum)" opacity="0.92" filter="url(#glow_loum)"/>
      <ellipse cx="100" cy="98" rx="60" ry="36" fill="none" stroke="rgba(200,169,110,0.35)" stroke-width="0.8"/>
      <ellipse cx="100" cy="98" rx="40" ry="22" fill="none" stroke="rgba(200,169,110,0.2)" stroke-width="0.5"/>
      <circle cx="72" cy="90" r="2.2" fill="rgba(200,169,110,0.5)"/>
      <circle cx="85" cy="78" r="1.6" fill="rgba(200,169,110,0.4)"/>
      <circle cx="100" cy="74" r="2.8" fill="rgba(240,220,160,0.55)"/>
      <circle cx="116" cy="78" r="1.6" fill="rgba(200,169,110,0.4)"/>
      <circle cx="128" cy="90" r="2.2" fill="rgba(200,169,110,0.5)"/>
      <circle cx="118" cy="108" r="1.8" fill="rgba(200,169,110,0.38)"/>
      <circle cx="82" cy="108" r="1.8" fill="rgba(200,169,110,0.38)"/>
      <ellipse cx="100" cy="100" rx="16" ry="9" fill="rgba(255,225,160,0.3)"/>
      <line x1="84" y1="140" x2="70" y2="222" stroke="#181818" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="144" x2="100" y2="226" stroke="#181818" stroke-width="4" stroke-linecap="round"/>
      <line x1="116" y1="140" x2="130" y2="222" stroke="#181818" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id:"torsion", slug:"torsion", price:345,
    nameDe:"TORSION", nameEn:"TORSION",
    tagDe:"Parametrisches Design", tagEn:"Parametric Design",
    accentColor:"#B0C4CC",
    descDe:"Mathematische Perfektion trifft auf immersive Ästhetik. Die dynamisch in sich gedrehte Helix-Struktur inszeniert das Licht völlig neu. Jede einzelne, präzise geführte Schicht des 3D-Drucks bricht das Licht sanft und erzeugt faszinierende, fliessende Lichtwellen an Ihren Wänden. Ein Meisterwerk des parametrischen Designs auf einem minimalistischen, sandfarbenen Sockel.",
    descEn:"Mathematical perfection meets immersive aesthetics. The dynamically twisted helix structure orchestrates light in an entirely new way. Every single, precisely guided 3D-printed layer softly refracts the light, creating mesmerizing, fluid waves of illumination along your walls. A masterpiece of parametric design resting on a minimalist sand-toned base.",
    svgPath:`<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow_tor"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="100" cy="125" rx="30" ry="85" fill="rgba(176,196,204,0.06)" filter="url(#glow_tor)"/>
      ${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>{
        const y=48+i*13; const t=(i/12)*Math.PI*2;
        const ox=Math.sin(t)*14; const w=36-Math.abs(i-6)*1.8;
        const op=0.25+(i%2)*0.28;
        return `<ellipse cx="${(100+ox).toFixed(1)}" cy="${y}" rx="${w.toFixed(1)}" ry="5.5" fill="none" stroke="rgba(176,196,204,${op.toFixed(2)})" stroke-width="1.8"/>`;
      }).join("")}
      <rect x="91" y="214" width="18" height="9" rx="2.5" fill="rgba(180,160,120,0.55)"/>
      <rect x="95" y="207" width="10" height="10" rx="1.5" fill="rgba(180,160,120,0.32)"/>
      <ellipse cx="100" cy="120" rx="12" ry="8" fill="rgba(176,196,204,0.18)" filter="url(#glow_tor)"/>
    </svg>`,
  },
  {
    id:"vals", slug:"vals", price:290,
    nameDe:"VALS", nameEn:"VALS",
    tagDe:"Alpine Architektur", tagEn:"Alpine Architecture",
    accentColor:"#8E9EA8",
    descDe:"Inspiriert von der rauen, zeitlosen Ästhetik alpiner Architektur. VALS besticht durch eine markante, horizontal geschichtete Geometrie, die aus einem massiven, anthrazitfarbenen Sockel emporsteigt. Die ultra-feine Perforation wirkt wie ein edler Lichtfilter, der jede Blendung eliminiert und stattdessen eine behagliche, architektonische Tiefe und präzise geometrische Schattenstrukturen im Raum entfaltet.",
    descEn:"Inspired by the raw, timeless aesthetics of alpine architecture. VALS features a striking, horizontally layered geometry that rises from a solid, charcoal-colored base. The ultra-fine perforation acts as a premium light filter, eliminating all glare and instead unfolding a cozy architectural depth and precise geometric shadow structures within the room.",
    svgPath:`<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow_vals"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${[0,1,2,3,4,5,6,7,8,9].map(i=>{
        const y=48+i*14; const w=58-i*2.5;
        const op=0.12+i*0.08;
        return `<rect x="${(100-w).toFixed(0)}" y="${y}" width="${(w*2).toFixed(0)}" height="10" rx="1.5" fill="rgba(142,158,168,${op.toFixed(2)})"/>
        ${[0,1,2,3,4,5,6,7,8].map(j=>{
          const px=(100-w)+(j+0.5)*((w*2)/9);
          return `<circle cx="${px.toFixed(1)}" cy="${(y+5).toFixed(1)}" r="1.2" fill="rgba(142,158,168,0.45)"/>`;
        }).join("")}`;
      }).join("")}
      <rect x="88" y="188" width="24" height="22" rx="2.5" fill="rgba(50,60,70,0.82)" filter="url(#glow_vals)"/>
      <rect x="93" y="210" width="14" height="5" rx="1" fill="rgba(50,60,70,0.55)"/>
      <ellipse cx="100" cy="118" rx="22" ry="8" fill="rgba(142,158,168,0.12)" filter="url(#glow_vals)"/>
    </svg>`,
  },
  {
    id:"aura", slug:"aura", price:310,
    nameDe:"AURA", nameEn:"AURA",
    tagDe:"Ambiente & Stille", tagEn:"Ambience & Serenity",
    accentColor:"#D4B8A0",
    descDe:"Die Verkörperung von fliessender Poesie und subtilem Luxus. Mit ihrer sanft asymmetrischen, vom Wind geformten Silhouette fängt AURA die Essenz natürlicher Bewegung ein. Das mikroperforierte Geflecht und der elegante, matte Sockel harmonieren perfekt, um ein absolut diffuses, sanftes Umgebungslicht zu erzeugen. Sie beleuchtet den Raum nicht nur – sie umhüllt ihn mit einer Aura von Ruhe und Exklusivität.",
    descEn:"The embodiment of flowing poetry and subtle luxury. With its softly asymmetrical, wind-sculpted silhouette, AURA captures the essence of natural movement. The micro-perforated mesh and elegant matte base harmonize perfectly to create an absolutely diffused, gentle ambient light. It doesn't just illuminate the room – it envelopes it in an aura of serenity and exclusivity.",
    svgPath:`<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="aura_g" cx="44%" cy="38%" r="62%">
          <stop offset="0%" stop-color="#F5E8D5"/>
          <stop offset="50%" stop-color="#D4B8A0" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#9A7B60" stop-opacity="0.15"/>
        </radialGradient>
        <filter id="glow_aura"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M100 52 C130 57,150 80,142 108 C134 136,110 148,92 142 C70 134,55 112,62 87 C70 62,88 49,100 52Z" fill="url(#aura_g)" opacity="0.88" filter="url(#glow_aura)"/>
      <path d="M100 56 C127 61,145 82,138 107 C131 131,109 142,93 136 C74 129,60 109,67 87 C74 65,90 53,100 56Z" fill="none" stroke="rgba(212,184,160,0.35)" stroke-width="0.8"/>
      <circle cx="80" cy="88" r="2" fill="rgba(212,184,160,0.5)"/>
      <circle cx="96" cy="72" r="2.8" fill="rgba(240,210,180,0.6)"/>
      <circle cx="116" cy="80" r="1.8" fill="rgba(212,184,160,0.45)"/>
      <circle cx="122" cy="102" r="2" fill="rgba(212,184,160,0.4)"/>
      <circle cx="108" cy="120" r="1.6" fill="rgba(212,184,160,0.38)"/>
      <circle cx="86" cy="118" r="1.6" fill="rgba(212,184,160,0.38)"/>
      <ellipse cx="100" cy="100" rx="14" ry="12" fill="rgba(255,230,200,0.22)" filter="url(#glow_aura)"/>
      <path d="M95 142 Q97 175 96 208" stroke="#221e1a" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <ellipse cx="97" cy="213" rx="11" ry="4.5" fill="rgba(50,42,34,0.55)"/>
    </svg>`,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const chf = (n: number) => `CHF ${n.toFixed(2)}`;

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── CART CONTEXT ─────────────────────────────────────────────────────────────
const CC = createContext<CartCtx>({ items:[], addItem:()=>{}, removeItem:()=>{}, updateQty:()=>{}, total:0, count:0 });

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = useCallback((p: Product) =>
    setItems(prev => { const ex=prev.find(i=>i.product.id===p.id); if(ex) return prev.map(i=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i); return [...prev,{product:p,quantity:1}]; }), []);
  const removeItem = useCallback((id:string) => setItems(prev=>prev.filter(i=>i.product.id!==id)),[]);
  const updateQty = useCallback((id:string,d:number) =>
    setItems(prev=>prev.map(i=>i.product.id===id?{...i,quantity:i.quantity+d}:i).filter(i=>i.quantity>0)),[]);
  const total=items.reduce((s,i)=>s+i.product.price*i.quantity,0);
  const count=items.reduce((s,i)=>s+i.quantity,0);
  return <CC.Provider value={{items,addItem,removeItem,updateQty,total,count}}>{children}</CC.Provider>;
}

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────
function MagneticBtn({ children, onClick, style }: {
  children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x*0.22}px, ${y*0.22}px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <button ref={ref} onClick={onClick}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition:"transform 0.35s cubic-bezier(0.23,1,0.32,1)", ...style }}>
      {children}
    </button>
  );
}

// ─── AMBIENT PARTICLES ────────────────────────────────────────────────────────
function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    const particles = Array.from({length: 38}, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.12,
      o: 0.04 + Math.random()*0.12,
      c: Math.random() > 0.5 ? "200,169,110" : "176,196,204",
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10;
        if (p.y < -10) p.y = H+10; if (p.y > H+10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${p.c},${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", opacity:0.7 }} />;
}

// ─── CURSOR GLOW ──────────────────────────────────────────────────────────────
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({x:0,y:0});
  const actual = useRef({x:0,y:0});
  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = {x:e.clientX, y:e.clientY}; };
    window.addEventListener("mousemove", move);
    let raf: number;
    const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
    const tick = () => {
      actual.current.x = lerp(actual.current.x, pos.current.x, 0.08);
      actual.current.y = lerp(actual.current.y, pos.current.y, 0.08);
      if (ref.current) {
        ref.current.style.transform = `translate(${actual.current.x-200}px,${actual.current.y-200}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", move); };
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed", top:0, left:0, width:400, height:400,
      borderRadius:"50%", pointerEvents:"none", zIndex:1,
      background:"radial-gradient(circle, rgba(200,169,110,0.04) 0%, transparent 70%)",
      transition:"none",
    }} />
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ lang, setLang, onCart }: { lang:Lang; setLang(l:Lang):void; onCart():void }) {
  const { count } = useContext(CC);
  const [scrolled, setScrolled] = useState(false);
  const tx = T[lang];
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, {passive:true});
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      height:72, display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 clamp(1.5rem,5vw,4rem)",
      background: scrolled ? "rgba(8,8,8,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(22px) saturate(1.4)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.055)" : "1px solid transparent",
      transition:"all 0.45s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <a href="#" style={{
        textDecoration:"none", display:"flex", alignItems:"center", gap:10,
      }}>
        <AerLogo size={36}/>
        <span style={{
          fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:"1.25rem", fontWeight:500, letterSpacing:"0.16em",
          color:"#f5f0e8",
        }}>
          <span style={{color:"#C8A96E"}}>AER</span>{" "}Lights
        </span>
      </a>
      <div style={{display:"flex", alignItems:"center", gap:"2rem"}}>
        {([[`#collection`,tx.nav_col],[`#philosophy`,tx.nav_phi],[`#contact`,tx.nav_con]] as [string,string][]).map(([href,label]) => (
          <a key={href} href={href} style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.7rem",
            letterSpacing:"0.12em", textTransform:"uppercase" as const,
            color:"rgba(245,240,232,0.5)", textDecoration:"none",
            position:"relative", padding:"2px 0", transition:"color 0.25s",
          }}
          onMouseEnter={e => {
            const el=e.currentTarget as HTMLElement;
            el.style.color="#f5f0e8";
          }}
          onMouseLeave={e => {
            const el=e.currentTarget as HTMLElement;
            el.style.color="rgba(245,240,232,0.5)";
          }}>
            {label}
          </a>
        ))}
        <div style={{display:"flex", alignItems:"center", gap:4, fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem", letterSpacing:"0.1em"}}>
          {(["DE","EN"] as Lang[]).map((l,i) => (
            <React.Fragment key={l}>
              {i>0 && <span style={{color:"rgba(255,255,255,0.18)"}}>|</span>}
              <button onClick={()=>setLang(l)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:"inherit", letterSpacing:"inherit",
                color: lang===l ? "#C8A96E" : "rgba(245,240,232,0.38)",
                padding:"2px 4px", transition:"color 0.2s",
              }}>{l}</button>
            </React.Fragment>
          ))}
        </div>
        <button onClick={onCart} style={{
          background:"none", border:"none", cursor:"pointer",
          color:"#f5f0e8", position:"relative",
          display:"flex", padding:4, transition:"transform 0.2s",
        }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="scale(1.12)"}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="scale(1)"}>
          <ShoppingBag size={20} strokeWidth={1.4}/>
          {count>0 && (
            <span style={{
              position:"absolute", top:-3, right:-4,
              background:"#C8A96E", color:"#080808",
              borderRadius:"50%", width:16, height:16,
              fontSize:"0.6rem", fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'DM Sans',sans-serif",
              animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>{count}</span>
          )}
        </button>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ lang }: { lang: Lang }) {
  const tx = T[lang];
  const [vis, setVis] = useState(false);
  const [mousePos, setMousePos] = useState({x:0.5,y:0.5});
  useEffect(() => { const t=setTimeout(()=>setVis(true),100); return ()=>clearTimeout(t); }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePos({x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height});
  },[]);

  return (
    <section onMouseMove={handleMouseMove} style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      justifyContent:"flex-end", position:"relative", overflow:"hidden",
      padding:"0 clamp(1.5rem,5vw,4rem) clamp(3rem,8vh,5rem)",
    }}>
      {/* Parallax bg blobs */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 80% 80% at ${50+mousePos.x*8}% ${30+mousePos.y*8}%, rgba(200,169,110,0.075) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at ${20-mousePos.x*4}% ${80-mousePos.y*4}%, rgba(130,150,160,0.05) 0%, transparent 55%)`,
        transition:"background 0.6s ease",
      }}/>
      {/* Grid */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.032,pointerEvents:"none"}}>
        <defs><pattern id="hg" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#hg)"/>
      </svg>
      {/* Horizontal scan line */}
      <div style={{
        position:"absolute", left:0, right:0, height:1,
        background:"linear-gradient(90deg, transparent, rgba(200,169,110,0.15), transparent)",
        top:`${30+mousePos.y*40}%`,
        transition:"top 1.2s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents:"none",
      }}/>

      {/* Floating SVG lamp */}
      <div style={{
        position:"absolute",
        right:"clamp(2rem,10vw,14rem)", top:"50%",
        transform:`translateY(-52%) translateX(${(mousePos.x-0.5)*-18}px) translateY(${(mousePos.y-0.5)*-10}px)`,
        transition:"transform 0.9s cubic-bezier(0.4,0,0.2,1)",
        width:"clamp(180px,24vw,380px)",
        opacity: vis ? 1 : 0,
        filter:"drop-shadow(0 0 40px rgba(200,169,110,0.18))",
        animation:"floatLamp 7s ease-in-out infinite",
        transitionProperty:"opacity,filter",
        transitionDuration:"1.4s,0.9s",
        transitionDelay:"0.3s,0s",
      }} dangerouslySetInnerHTML={{__html:PRODUCTS[0].svgPath}}/>

      {/* Hero logo watermark — large, faint, top-left */}
      <div style={{
        position:"absolute", top:"clamp(5rem,12vh,8rem)", left:"clamp(1.5rem,5vw,4rem)",
        opacity: vis ? 0.12 : 0,
        transition:"opacity 2s ease 0.8s",
        pointerEvents:"none",
      }}>
        <AerLogo size={180} animated={false}/>
      </div>

      {/* Tag */}
      <div style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem",
        letterSpacing:"0.22em", textTransform:"uppercase" as const,
        color:"#C8A96E", marginBottom:"1.4rem",
        display:"flex", alignItems:"center", gap:10,
        opacity: vis?1:0, transform: vis?"none":"translateY(14px)",
        transition:"all 0.9s ease 0.1s",
      }}>
        <span style={{display:"inline-block", width:28, height:1, background:"#C8A96E"}}/>
        {tx.hero_tag}
      </div>

      {/* H1 — word by word stagger */}
      <h1 style={{
        fontFamily:"'Cormorant Garamond',Georgia,serif",
        fontSize:"clamp(3.5rem,9vw,8.5rem)",
        fontWeight:300, lineHeight:1.02,
        color:"#f5f0e8", margin:"0 0 1.4rem",
        maxWidth:"12ch",
      }}>
        {[tx.hero_h1a, tx.hero_h1b].map((word,wi) => (
          <span key={wi} style={{
            display:"block",
            opacity: vis?1:0,
            transform: vis?"none":"translateY(28px)",
            transition:`all 1s cubic-bezier(0.4,0,0.2,1) ${0.18+wi*0.14}s`,
            color: wi===1 ? "#C8A96E" : "#f5f0e8",
            fontStyle: wi===1 ? "italic" : "normal",
          }}>{word}</span>
        ))}
      </h1>

      {/* Sub */}
      <p style={{
        fontFamily:"'DM Sans',sans-serif",
        fontSize:"clamp(0.85rem,1.4vw,1.05rem)",
        color:"rgba(245,240,232,0.5)", maxWidth:400,
        lineHeight:1.75, margin:"0 0 2.5rem",
        opacity:vis?1:0, transform:vis?"none":"translateY(16px)",
        transition:"all 1s ease 0.42s",
      }}>{tx.hero_sub}</p>

      {/* CTA */}
      <div style={{
        opacity:vis?1:0, transform:vis?"none":"translateY(12px)",
        transition:"all 1s ease 0.56s", alignSelf:"flex-start",
      }}>
        <a href="#collection" style={{
          display:"inline-flex", alignItems:"center", gap:10,
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.76rem",
          letterSpacing:"0.14em", textTransform:"uppercase" as const,
          color:"#080808", background:"#C8A96E", textDecoration:"none",
          padding:"14px 28px", borderRadius:2, position:"relative",
          overflow:"hidden", transition:"all 0.3s",
        }}
        onMouseEnter={e=>{
          const el=e.currentTarget as HTMLElement;
          el.style.background="#b89558";
          el.style.transform="translateY(-2px)";
          el.style.boxShadow="0 12px 32px rgba(200,169,110,0.28)";
        }}
        onMouseLeave={e=>{
          const el=e.currentTarget as HTMLElement;
          el.style.background="#C8A96E";
          el.style.transform="translateY(0)";
          el.style.boxShadow="none";
        }}>
          {tx.hero_cta} <ArrowRight size={14} strokeWidth={2}/>
        </a>
      </div>

      {/* Scroll hint */}
      <div style={{
        position:"absolute", bottom:"2.5rem", right:"clamp(1.5rem,5vw,4rem)",
        writingMode:"vertical-lr" as const,
        fontFamily:"'DM Sans',sans-serif", fontSize:"0.6rem",
        letterSpacing:"0.2em", textTransform:"uppercase" as const,
        color:"rgba(245,240,232,0.22)",
        opacity:vis?1:0, transition:"opacity 1s ease 1.1s",
        animation:"scrollPulse 3s ease-in-out infinite 1.5s",
        display:"flex", alignItems:"center", gap:8,
      }}>
        {tx.hero_scroll}
        <span style={{
          display:"inline-block", width:1, height:28,
          background:"linear-gradient(to bottom, rgba(200,169,110,0.4), transparent)",
          animation:"scanDown 2s ease-in-out infinite",
        }}/>
      </div>
    </section>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ p, lang, onView, index }: { p:Product; lang:Lang; onView(p:Product):void; index:number }) {
  const { addItem } = useContext(CC);
  const { ref, visible } = useReveal(0.12);
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  const [ripple, setRipple] = useState<{x:number;y:number}|null>(null);
  const tx = T[lang];
  const name = lang==="DE"?p.nameDe:p.nameEn;
  const tag  = lang==="DE"?p.tagDe:p.tagEn;

  const handleAdd = (e: React.MouseEvent) => {
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setRipple({x:e.clientX-r.left, y:e.clientY-r.top});
    setTimeout(()=>setRipple(null), 700);
    addItem(p);
    setAdded(true);
    setTimeout(()=>setAdded(false),1600);
  };

  return (
    <div ref={ref} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative",
        background: hov ? "rgba(255,255,255,0.034)" : "rgba(255,255,255,0.016)",
        border:`1px solid ${hov?`${p.accentColor}32`:"rgba(255,255,255,0.055)"}`,
        borderRadius:4, overflow:"hidden",
        transform: visible ? (hov?"translateY(-6px) scale(1.01)":"translateY(0) scale(1)") : "translateY(28px)",
        opacity: visible?1:0,
        transition:`opacity 0.75s ease ${index*0.12}s, transform ${visible?"0.45s cubic-bezier(0.34,1.2,0.64,1)":"0.75s ease "+index*0.12+"s"}, border 0.3s, background 0.3s`,
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${p.accentColor}18` : "0 4px 20px rgba(0,0,0,0.2)",
      }}>
      {/* SVG visual */}
      <div style={{
        height:280, display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden",
        background:`radial-gradient(ellipse 70% 70% at 50% 50%, ${p.accentColor}14 0%, transparent 68%)`,
        padding:"1.8rem",
      }}>
        {/* Pulse glow behind lamp */}
        <div style={{
          position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
          pointerEvents:"none",
        }}>
          <div style={{
            width:120, height:120, borderRadius:"50%",
            background:`radial-gradient(circle, ${p.accentColor}20 0%, transparent 70%)`,
            filter:"blur(18px)",
            opacity: hov?1:0, transform: hov?"scale(1.3)":"scale(0.8)",
            transition:"all 0.6s ease",
            animation: hov?"glowPulse 2.5s ease-in-out infinite":"none",
          }}/>
        </div>
        <div style={{
          width:140, position:"relative", zIndex:1,
          transform: hov?"scale(1.08) translateY(-4px)":"scale(1) translateY(0)",
          transition:"transform 0.6s cubic-bezier(0.34,1.2,0.64,1)",
          filter: hov?`drop-shadow(0 4px 20px ${p.accentColor}35)`:"none",
        }} dangerouslySetInnerHTML={{__html:p.svgPath}}/>

        {/* Quick view */}
        <button onClick={()=>onView(p)} style={{
          position:"absolute", bottom:"0.9rem", right:"0.9rem",
          background:"rgba(8,8,8,0.82)", backdropFilter:"blur(10px)",
          border:`1px solid ${p.accentColor}45`,
          borderRadius:2, color:p.accentColor,
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.6rem",
          letterSpacing:"0.14em", textTransform:"uppercase" as const,
          padding:"7px 12px", cursor:"pointer",
          display:"flex", alignItems:"center", gap:4,
          opacity:hov?1:0,
          transform:hov?"translateY(0)":"translateY(10px)",
          transition:"all 0.35s cubic-bezier(0.34,1.2,0.64,1)",
        }}>
          {tx.view} <ChevronRight size={10}/>
        </button>

        {/* Price badge */}
        <div style={{
          position:"absolute", top:"0.9rem", left:"0.9rem",
          background:"rgba(8,8,8,0.72)", backdropFilter:"blur(6px)",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:2, padding:"5px 10px",
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.7rem",
          color:"rgba(245,240,232,0.65)", letterSpacing:"0.05em",
          opacity:hov?0:1, transition:"opacity 0.25s",
        }}>{chf(p.price)}</div>
      </div>

      {/* Card body */}
      <div style={{padding:"1.1rem 1.4rem 1.4rem"}}>
        <div style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.58rem",
          letterSpacing:"0.22em", textTransform:"uppercase" as const,
          color:p.accentColor, opacity:0.82, marginBottom:5,
        }}>{tag}</div>
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"baseline",
          marginBottom:"1rem",
        }}>
          <span style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"1.85rem", fontWeight:400, color:"#f5f0e8", letterSpacing:"0.04em",
          }}>{name}</span>
          <span style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.8rem",
            color:p.accentColor, opacity:0.9,
            transform:hov?"translateY(0)":"translateY(0)",
            transition:"all 0.3s",
          }}>{chf(p.price)}</span>
        </div>

        {/* Add to cart with ripple */}
        <button onClick={handleAdd} style={{
          width:"100%", position:"relative", overflow:"hidden",
          background: added ? "#C8A96E" : "transparent",
          border:`1px solid ${added?"#C8A96E":"rgba(255,255,255,0.1)"}`,
          borderRadius:2, cursor:"pointer", transition:"all 0.35s",
          color: added?"#080808":"rgba(245,240,232,0.7)",
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem",
          letterSpacing:"0.12em", textTransform:"uppercase" as const,
          padding:"11px 0",
        }}
        onMouseEnter={e=>{
          if(!added){
            const el=e.currentTarget as HTMLElement;
            el.style.borderColor=p.accentColor;
            el.style.color=p.accentColor;
            el.style.background=`${p.accentColor}0f`;
          }
        }}
        onMouseLeave={e=>{
          if(!added){
            const el=e.currentTarget as HTMLElement;
            el.style.borderColor="rgba(255,255,255,0.1)";
            el.style.color="rgba(245,240,232,0.7)";
            el.style.background="transparent";
          }
        }}>
          {ripple && (
            <span style={{
              position:"absolute",
              left:ripple.x-40, top:ripple.y-40,
              width:80, height:80, borderRadius:"50%",
              background:`${p.accentColor}30`,
              animation:"rippleOut 0.65s ease forwards",
              pointerEvents:"none",
            }}/>
          )}
          <span style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
            transform: added?"scale(1.05)":"scale(1)", transition:"transform 0.25s",
          }}>
            {added ? <>✓ <span>Added</span></> : tx.add}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── QUICK VIEW MODAL ─────────────────────────────────────────────────────────
function QVModal({ p, lang, onClose }: { p:Product|null; lang:Lang; onClose():void }) {
  const { addItem } = useContext(CC);
  const [added, setAdded] = useState(false);
  const [vis, setVis] = useState(false);
  const tx = T[lang];

  useEffect(() => {
    if (p) { setTimeout(()=>setVis(true),10); document.body.style.overflow="hidden"; }
    else { setVis(false); document.body.style.overflow=""; }
    return ()=>{ document.body.style.overflow=""; };
  }, [p]);

  if (!p) return null;
  const name = lang==="DE"?p.nameDe:p.nameEn;
  const desc = lang==="DE"?p.descDe:p.descEn;
  const tag  = lang==="DE"?p.tagDe:p.tagEn;

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:200,
      background:`rgba(0,0,0,${vis?0.82:0})`,
      backdropFilter:`blur(${vis?8:0}px)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"2rem", transition:"all 0.35s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#0f0f0f",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:6, maxWidth:760, width:"100%",
        display:"grid", gridTemplateColumns:"1fr 1fr",
        overflow:"hidden",
        transform:vis?"translateY(0) scale(1)":"translateY(20px) scale(0.97)",
        opacity:vis?1:0, transition:"all 0.4s cubic-bezier(0.34,1.1,0.64,1)",
        maxHeight:"88vh", boxShadow:"0 40px 100px rgba(0,0,0,0.7)",
      }}>
        {/* SVG panel */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"3rem 2rem", position:"relative",
          background:`radial-gradient(ellipse 70% 70% at 50% 50%, ${p.accentColor}16 0%, transparent 68%)`,
        }}>
          <div style={{
            position:"absolute", inset:0,
            background:`radial-gradient(circle at 50% 50%, ${p.accentColor}10 0%, transparent 60%)`,
            animation:"glowPulse 3s ease-in-out infinite",
          }}/>
          <div style={{width:200, position:"relative", zIndex:1,
            animation:"floatLamp 5s ease-in-out infinite",
            filter:`drop-shadow(0 0 30px ${p.accentColor}28)`
          }} dangerouslySetInnerHTML={{__html:p.svgPath}}/>
        </div>
        {/* Info */}
        <div style={{padding:"2.5rem 2rem", overflowY:"auto"}}>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            color:"rgba(255,255,255,0.28)", float:"right",
            marginTop:-8, marginRight:-8, transition:"all 0.2s",
          }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color="#fff"; el.style.transform="rotate(90deg)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.28)"; el.style.transform="rotate(0deg)";}}>
            <X size={18}/>
          </button>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.6rem",
            letterSpacing:"0.2em", textTransform:"uppercase" as const,
            color:p.accentColor, marginBottom:8,
          }}>{tag}</div>
          <h2 style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"2.5rem", fontWeight:300, color:"#f5f0e8", marginBottom:6,
          }}>{name}</h2>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"1.05rem",
            color:p.accentColor, marginBottom:"1.3rem", letterSpacing:"0.04em",
          }}>{chf(p.price)}</div>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem",
            color:"rgba(245,240,232,0.5)", lineHeight:1.8, marginBottom:"2rem",
          }}>{desc}</p>
          <button onClick={()=>{addItem(p); setAdded(true); setTimeout(()=>setAdded(false),1600);}} style={{
            width:"100%", background:added?"#C8A96E":"transparent",
            border:`1px solid ${added?"#C8A96E":"rgba(200,169,110,0.4)"}`,
            borderRadius:2, cursor:"pointer", transition:"all 0.3s",
            color:added?"#080808":"#C8A96E",
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.7rem",
            letterSpacing:"0.14em", textTransform:"uppercase" as const,
            padding:"13px", transform:added?"scale(1.02)":"scale(1)",
          }}>
            {added ? "✓ Added" : tx.add}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COLLECTION SECTION ───────────────────────────────────────────────────────
function Collection({ lang }: { lang:Lang }) {
  const [qv, setQV] = useState<Product|null>(null);
  const { ref, visible } = useReveal(0.1);
  const tx = T[lang];
  return (
    <section id="collection" style={{padding:"clamp(4rem,10vh,7rem) clamp(1.5rem,5vw,4rem)"}}>
      <div ref={ref} style={{
        marginBottom:"3.5rem",
        opacity:visible?1:0, transform:visible?"none":"translateY(22px)",
        transition:"all 0.8s ease",
      }}>
        <div style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.65rem",
          letterSpacing:"0.22em", textTransform:"uppercase" as const,
          color:"rgba(200,169,110,0.7)", marginBottom:"0.8rem",
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{display:"inline-block", width:28, height:1, background:"rgba(200,169,110,0.5)"}}/>
          {tx.nav_col}
        </div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:"clamp(2rem,4vw,3.2rem)", fontWeight:300,
          color:"#f5f0e8", marginBottom:8,
        }}>{tx.sec_col}</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem",
          color:"rgba(245,240,232,0.36)", letterSpacing:"0.04em",
        }}>{tx.sec_sub}</p>
      </div>
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",
        gap:"1.5rem",
      }}>
        {PRODUCTS.map((p,i) => <ProductCard key={p.id} p={p} lang={lang} onView={setQV} index={i}/>)}
      </div>
      <QVModal p={qv} lang={lang} onClose={()=>setQV(null)}/>
    </section>
  );
}

// ─── DIVIDER LINE ─────────────────────────────────────────────────────────────
function AnimDivider() {
  const { ref, visible } = useReveal(0.5);
  return (
    <div ref={ref} style={{
      height:1, margin:"0 clamp(1.5rem,5vw,4rem)",
      background:"linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)",
      transform:`scaleX(${visible?1:0})`, opacity:visible?1:0,
      transition:"all 1.1s cubic-bezier(0.4,0,0.2,1)",
      transformOrigin:"center",
    }}/>
  );
}

// ─── COUNTER STAT ─────────────────────────────────────────────────────────────
function StatCounter({ value, label }: { value:string; label:string }) {
  const { ref, visible } = useReveal(0.3);
  return (
    <div ref={ref} style={{
      background:"rgba(255,255,255,0.02)",
      border:"1px solid rgba(255,255,255,0.055)",
      borderRadius:4, padding:"1.6rem 1rem", textAlign:"center",
      opacity:visible?1:0, transform:visible?"none":"translateY(16px) scale(0.96)",
      transition:"all 0.7s cubic-bezier(0.34,1.2,0.64,1)",
    }}>
      <div style={{
        fontFamily:"'Cormorant Garamond',Georgia,serif",
        fontSize:"2.1rem", fontWeight:300, color:"#C8A96E",
        marginBottom:4,
      }}>{value}</div>
      <div style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:"0.58rem",
        letterSpacing:"0.14em", textTransform:"uppercase" as const,
        color:"rgba(245,240,232,0.33)",
      }}>{label}</div>
    </div>
  );
}

// ─── PHILOSOPHY ───────────────────────────────────────────────────────────────
function Philosophy({ lang }: { lang:Lang }) {
  const tx = T[lang];
  const { ref: tRef, visible: tVis } = useReveal(0.1);
  const { ref: sRef, visible: sVis } = useReveal(0.15);

  return (
    <section id="philosophy" style={{padding:"clamp(4rem,10vh,7rem) clamp(1.5rem,5vw,4rem)"}}>
      <div style={{
        display:"grid", gridTemplateColumns:"1.2fr 1fr",
        gap:"clamp(2rem,6vw,6rem)", alignItems:"center",
      }}>
        <div ref={tRef}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.65rem",
            letterSpacing:"0.22em", textTransform:"uppercase" as const,
            color:"rgba(200,169,110,0.7)", marginBottom:"1rem",
            display:"flex", alignItems:"center", gap:10,
            opacity:tVis?1:0, transform:tVis?"none":"translateX(-20px)",
            transition:"all 0.8s ease",
          }}>
            <span style={{display:"inline-block", width:28, height:1, background:"rgba(200,169,110,0.5)"}}/>
            {tx.phi_tag}
          </div>
          <h2 style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"clamp(1.8rem,3.5vw,2.9rem)", fontWeight:300,
            color:"#f5f0e8", marginBottom:"1.5rem", lineHeight:1.22,
            opacity:tVis?1:0, transform:tVis?"none":"translateX(-20px)",
            transition:"all 0.85s ease 0.08s",
          }}>{tx.phi_h}</h2>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.88rem",
            color:"rgba(245,240,232,0.5)", lineHeight:1.82, marginBottom:"1.2rem",
            opacity:tVis?1:0, transform:tVis?"none":"translateY(12px)",
            transition:"all 0.85s ease 0.16s",
          }}>{tx.phi_p1}</p>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.88rem",
            color:"rgba(245,240,232,0.38)", lineHeight:1.82,
            opacity:tVis?1:0, transform:tVis?"none":"translateY(12px)",
            transition:"all 0.85s ease 0.24s",
          }}>{tx.phi_p2}</p>
        </div>

        <div ref={sRef} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem"}}>
          {([[tx.s1,tx.s1l],[tx.s2,tx.s2l],[tx.s3,tx.s3l]] as [string,string][]).map(([v,l],i)=>(
            <div key={i} style={{
              background:"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.055)",
              borderRadius:4, padding:"1.6rem 1rem", textAlign:"center",
              opacity:sVis?1:0,
              transform:sVis?"none":"translateY(20px)",
              transition:`all 0.7s cubic-bezier(0.34,1.2,0.64,1) ${i*0.1}s`,
            }}>
              <div style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"2.1rem", fontWeight:300, color:"#C8A96E", marginBottom:4,
              }}>{v}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:"0.58rem",
                letterSpacing:"0.14em", textTransform:"uppercase" as const,
                color:"rgba(245,240,232,0.33)",
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, lang, onCheckout }: {
  open:boolean; onClose():void; lang:Lang; onCheckout():void;
}) {
  const { items, removeItem, updateQty, total } = useContext(CC);
  const tx = T[lang];
  useEffect(()=>{ document.body.style.overflow=open?"hidden":""; return()=>{ document.body.style.overflow=""; }; },[open]);

  return (
    <>
      {open && <div onClick={onClose} style={{
        position:"fixed", inset:0, zIndex:150,
        background:"rgba(0,0,0,0.65)", backdropFilter:"blur(5px)",
        animation:"fadeIn 0.25s ease",
      }}/>}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"min(420px,100vw)", background:"#0d0d0d",
        borderLeft:"1px solid rgba(255,255,255,0.065)",
        zIndex:160, display:"flex", flexDirection:"column",
        transform:open?"translateX(0)":"translateX(100%)",
        transition:"transform 0.44s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:open?"-24px 0 72px rgba(0,0,0,0.55)":"none",
      }}>
        <div style={{
          padding:"1.5rem 1.8rem", display:"flex",
          justifyContent:"space-between", alignItems:"center",
          borderBottom:"1px solid rgba(255,255,255,0.055)",
        }}>
          <span style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"1.3rem", fontWeight:400, color:"#f5f0e8", letterSpacing:"0.06em",
          }}>{tx.cart_t}</span>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            color:"rgba(255,255,255,0.3)", transition:"all 0.2s",
          }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color="#f5f0e8"; el.style.transform="rotate(90deg)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.3)"; el.style.transform="rotate(0deg)";}}>
            <X size={20} strokeWidth={1.5}/>
          </button>
        </div>
        <div style={{flex:1, overflowY:"auto"}}>
          {items.length===0 ? (
            <div style={{
              padding:"4rem 1.8rem", textAlign:"center",
              color:"rgba(245,240,232,0.28)",
              fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem",
              letterSpacing:"0.06em",
            }}>{tx.cart_empty}</div>
          ) : items.map((item,idx)=>{
            const n=lang==="DE"?item.product.nameDe:item.product.nameEn;
            return (
              <div key={item.product.id} style={{
                padding:"1.1rem 1.8rem",
                borderBottom:"1px solid rgba(255,255,255,0.04)",
                display:"flex", gap:"1rem", alignItems:"center",
                animation:`slideInRight 0.35s ease ${idx*0.06}s both`,
              }}>
                <div style={{
                  width:56, height:56, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border:"1px solid rgba(255,255,255,0.065)",
                  borderRadius:3,
                  background:`radial-gradient(circle, ${item.product.accentColor}14 0%, transparent 70%)`,
                }}>
                  <div style={{width:44}} dangerouslySetInnerHTML={{__html:item.product.svgPath}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{
                    fontFamily:"'Cormorant Garamond',Georgia,serif",
                    fontSize:"1rem", color:"#f5f0e8", marginBottom:2,
                  }}>{n}</div>
                  <div style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:"0.74rem",
                    color:"rgba(245,240,232,0.38)",
                  }}>{chf(item.product.price)}</div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  {[-1,1].map(d=>(
                    <button key={d} onClick={()=>updateQty(item.product.id,d)} style={{
                      background:"rgba(255,255,255,0.04)",
                      border:"1px solid rgba(255,255,255,0.075)",
                      borderRadius:2, width:26, height:26, cursor:"pointer",
                      color:"rgba(255,255,255,0.55)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor=item.product.accentColor; el.style.color=item.product.accentColor;}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(255,255,255,0.075)"; el.style.color="rgba(255,255,255,0.55)";}}>
                      {d<0?<Minus size={10}/>:<Plus size={10}/>}
                    </button>
                  ))}
                  <span style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem",
                    color:"#f5f0e8", minWidth:14, textAlign:"center",
                  }}>{item.quantity}</span>
                </div>
                <button onClick={()=>removeItem(item.product.id)} style={{
                  background:"none", border:"none", cursor:"pointer",
                  color:"rgba(255,255,255,0.18)", transition:"all 0.2s",
                }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color="#ff6b6b"; el.style.transform="scale(1.1)";}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.18)"; el.style.transform="scale(1)";}}>
                  <X size={14}/>
                </button>
              </div>
            );
          })}
        </div>
        {items.length>0 && (
          <div style={{padding:"1.5rem 1.8rem", borderTop:"1px solid rgba(255,255,255,0.055)"}}>
            {[[tx.cart_sub,chf(total)],[tx.cart_ship,tx.cart_free]].map(([l,v])=>(
              <div key={l} style={{
                display:"flex", justifyContent:"space-between",
                fontFamily:"'DM Sans',sans-serif", fontSize:"0.76rem",
                color:"rgba(245,240,232,0.38)", marginBottom:"0.6rem",
              }}><span>{l}</span><span>{v}</span></div>
            ))}
            <div style={{
              display:"flex", justifyContent:"space-between",
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"1.1rem", color:"#f5f0e8",
              paddingTop:"0.8rem", marginBottom:"1.4rem",
              borderTop:"1px solid rgba(255,255,255,0.055)",
            }}>
              <span>{tx.cart_tot}</span>
              <span style={{color:"#C8A96E"}}>{chf(total)}</span>
            </div>
            <button onClick={onCheckout} style={{
              width:"100%", background:"#C8A96E", border:"none", borderRadius:2,
              color:"#080808", fontFamily:"'DM Sans',sans-serif", fontSize:"0.7rem",
              letterSpacing:"0.14em", textTransform:"uppercase" as const,
              padding:14, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.25s",
            }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.boxShadow="0 8px 24px rgba(200,169,110,0.28)"; el.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.boxShadow="none"; el.style.transform="translateY(0)";}}>
              {tx.cart_go} <ArrowRight size={14}/>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
function Checkout({ lang, onBack }: { lang:Lang; onBack():void }) {
  const { items, total } = useContext(CC);
  const tx = T[lang];
  const [form, setForm] = useState({name:"",email:"",addr:"",city:""});
  const { ref, visible } = useReveal(0.01);

  const Field = ({ label, k, type="text" }: { label:string; k:keyof typeof form; type?:string }) => (
    <div style={{marginBottom:"1.2rem"}}>
      <label style={{
        display:"block", fontFamily:"'DM Sans',sans-serif",
        fontSize:"0.6rem", letterSpacing:"0.14em",
        textTransform:"uppercase" as const, color:"rgba(245,240,232,0.38)", marginBottom:6,
      }}>{label}</label>
      <input type={type} value={form[k]}
        onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        style={{
          width:"100%", background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.09)", borderRadius:2,
          color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif",
          fontSize:"0.88rem", padding:"11px 14px", outline:"none",
          transition:"border-color 0.25s",
        }}
        onFocus={e=>(e.target as HTMLElement).style.borderColor="rgba(200,169,110,0.5)"}
        onBlur={e=>(e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.09)"}
      />
    </div>
  );

  return (
    <div ref={ref} style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center",
      padding:"100px clamp(1.5rem,5vw,4rem) clamp(3rem,6vh,4rem)",
      opacity:visible?1:0, transform:visible?"none":"translateY(18px)",
      transition:"all 0.7s ease",
    }}>
      <div style={{
        width:"100%", maxWidth:880,
        display:"grid", gridTemplateColumns:"1fr 320px",
        gap:"3rem", alignItems:"start",
      }}>
        <div>
          <button onClick={onBack} style={{
            background:"none", border:"none", cursor:"pointer",
            color:"rgba(200,169,110,0.65)", fontFamily:"'DM Sans',sans-serif",
            fontSize:"0.7rem", letterSpacing:"0.12em",
            textTransform:"uppercase" as const,
            display:"flex", alignItems:"center", gap:6,
            marginBottom:"2rem", padding:0, transition:"color 0.2s",
          }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#C8A96E"}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(200,169,110,0.65)"}>
            ← {tx.chk_back}
          </button>
          <h2 style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"2.1rem", fontWeight:300, color:"#f5f0e8", marginBottom:6,
          }}>{tx.chk_t}</h2>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.78rem",
            color:"rgba(245,240,232,0.3)", marginBottom:"2.5rem",
          }}>{tx.chk_sub}</p>
          <Field label={tx.chk_name} k="name"/>
          <Field label={tx.chk_mail} k="email" type="email"/>
          <Field label={tx.chk_addr} k="addr"/>
          <Field label={tx.chk_city} k="city"/>
          <div style={{
            background:"rgba(200,169,110,0.055)",
            border:"1px solid rgba(200,169,110,0.16)",
            borderRadius:3, padding:"10px 16px", marginBottom:"1.5rem",
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.7rem",
            color:"rgba(200,169,110,0.6)",
            display:"flex", alignItems:"center", gap:8,
          }}>◈ {tx.chk_mock}</div>
          <button style={{
            width:"100%", background:"#C8A96E", border:"none", borderRadius:2,
            color:"#080808", fontFamily:"'DM Sans',sans-serif", fontSize:"0.72rem",
            letterSpacing:"0.14em", textTransform:"uppercase" as const,
            padding:15, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.25s",
          }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 8px 24px rgba(200,169,110,0.28)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.transform="translateY(0)"; el.style.boxShadow="none";}}>
            {tx.chk_btn} <ArrowRight size={14}/>
          </button>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.02)",
          border:"1px solid rgba(255,255,255,0.055)",
          borderRadius:4, padding:"1.8rem",
        }}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.6rem",
            letterSpacing:"0.18em", textTransform:"uppercase" as const,
            color:"rgba(245,240,232,0.32)", marginBottom:"1.2rem",
          }}>{tx.cart_t}</div>
          {items.map(item=>(
            <div key={item.product.id} style={{
              display:"flex", justifyContent:"space-between",
              marginBottom:"0.75rem",
              fontFamily:"'DM Sans',sans-serif", fontSize:"0.8rem",
            }}>
              <span style={{color:"rgba(245,240,232,0.52)"}}>
                {lang==="DE"?item.product.nameDe:item.product.nameEn}{" "}
                <span style={{color:"rgba(245,240,232,0.26)"}}>×{item.quantity}</span>
              </span>
              <span style={{color:"#f5f0e8"}}>{chf(item.product.price*item.quantity)}</span>
            </div>
          ))}
          <div style={{
            borderTop:"1px solid rgba(255,255,255,0.065)",
            paddingTop:"1rem", marginTop:"0.5rem",
            display:"flex", justifyContent:"space-between",
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"1.1rem", color:"#f5f0e8",
          }}>
            <span>{tx.cart_tot}</span>
            <span style={{color:"#C8A96E"}}>{chf(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ lang }: { lang:Lang }) {
  const tx = T[lang];
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { ref, visible } = useReveal(0.1);

  return (
    <footer id="contact" ref={ref} style={{
      borderTop:"1px solid rgba(255,255,255,0.045)",
      padding:"clamp(3rem,8vh,5rem) clamp(1.5rem,5vw,4rem) 2rem",
      opacity:visible?1:0, transform:visible?"none":"translateY(22px)",
      transition:"all 0.9s ease",
    }}>
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
        gap:"3rem", marginBottom:"3.5rem",
      }}>
        <div>
          <AerLogo size={42}/>
          <div style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"1.15rem", fontWeight:500, letterSpacing:"0.16em",
            color:"#f5f0e8", marginBottom:"0.8rem", marginTop:"0.6rem",
            display:"flex", alignItems:"center", gap:0,
          }}>
            <span style={{color:"#C8A96E"}}>AER</span>&nbsp;Lights
          </div>
          <p style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"0.95rem", fontStyle:"italic",
            color:"rgba(245,240,232,0.28)", lineHeight:1.65,
          }}>{tx.f_tag}</p>
        </div>
        <div>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.58rem",
            letterSpacing:"0.2em", textTransform:"uppercase" as const,
            color:"rgba(245,240,232,0.26)", marginBottom:"1rem",
          }}>Legal</div>
          {[tx.f_imp,tx.f_prv,tx.f_shp].map(l=>(
            <div key={l} style={{marginBottom:"0.5rem"}}>
              <a href="#" style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:"0.78rem",
                color:"rgba(245,240,232,0.36)", textDecoration:"none", transition:"color 0.2s",
              }}
              onMouseEnter={e=>(e.target as HTMLElement).style.color="#C8A96E"}
              onMouseLeave={e=>(e.target as HTMLElement).style.color="rgba(245,240,232,0.36)"}>{l}</a>
            </div>
          ))}
        </div>
        <div style={{gridColumn:"span 2"}}>
          <div style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"1.45rem", fontWeight:300, color:"#f5f0e8", marginBottom:4,
          }}>{tx.nl_h}</div>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.78rem",
            color:"rgba(245,240,232,0.36)", marginBottom:"1.2rem",
          }}>{tx.nl_sub}</p>
          {subscribed ? (
            <div style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"1rem", fontStyle:"italic",
              color:"#C8A96E", padding:"11px 0",
              animation:"fadeIn 0.5s ease",
            }}>✦ Merci. Sie hören bald von uns.</div>
          ) : (
            <div style={{display:"flex"}}>
              <input type="email" value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder={tx.nl_ph}
                style={{
                  flex:1, background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.09)", borderRight:"none",
                  borderRadius:"2px 0 0 2px", color:"#f5f0e8",
                  fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem",
                  padding:"11px 14px", outline:"none", transition:"border-color 0.25s",
                }}
                onFocus={e=>(e.target as HTMLElement).style.borderColor="rgba(200,169,110,0.4)"}
                onBlur={e=>(e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.09)"}
              />
              <button onClick={()=>{ if(email) setSubscribed(true); }} style={{
                background:"#C8A96E", border:"none",
                borderRadius:"0 2px 2px 0", color:"#080808",
                fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem",
                letterSpacing:"0.12em", textTransform:"uppercase" as const,
                padding:"11px 20px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:6,
                transition:"all 0.25s", whiteSpace:"nowrap",
              }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.transform="translateX(2px)";}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.transform="translateX(0)";}}>
                {tx.nl_btn} <Mail size={12}/>
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{
        borderTop:"1px solid rgba(255,255,255,0.045)", paddingTop:"1.5rem",
        display:"flex", justifyContent:"space-between",
        alignItems:"center", flexWrap:"wrap", gap:"0.5rem",
      }}>
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem",
          color:"rgba(245,240,232,0.2)",
        }}>{tx.f_copy}</span>
        <a href="https://vodnik.ch" target="_blank" rel="noopener noreferrer" style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem",
          color:"rgba(245,240,232,0.2)", textDecoration:"none", transition:"color 0.2s",
        }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#C8A96E"}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(245,240,232,0.2)"}>
          {tx.f_dev}
        </a>
      </div>
    </footer>
  );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:#080808;color:#f5f0e8;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#0a0a0a}
  ::-webkit-scrollbar-thumb{background:#242424;border-radius:2px}
  ::-webkit-scrollbar-thumb:hover{background:#333}

  @keyframes floatLamp {
    0%,100%{transform:translateY(0px)}
    50%{transform:translateY(-11px)}
  }
  @keyframes glowPulse {
    0%,100%{opacity:0.6;transform:scale(1)}
    50%{opacity:1;transform:scale(1.12)}
  }
  @keyframes fadeIn {
    from{opacity:0} to{opacity:1}
  }
  @keyframes slideInRight {
    from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)}
  }
  @keyframes scrollPulse {
    0%,100%{opacity:0.22} 50%{opacity:0.55}
  }
  @keyframes scanDown {
    0%{transform:scaleY(0);transform-origin:top}
    50%{transform:scaleY(1);transform-origin:top}
    51%{transform:scaleY(1);transform-origin:bottom}
    100%{transform:scaleY(0);transform-origin:bottom}
  }
  @keyframes rippleOut {
    from{transform:scale(0.2);opacity:1}
    to{transform:scale(4);opacity:0}
  }
  @keyframes popIn {
    from{transform:scale(0.3);opacity:0}
    to{transform:scale(1);opacity:1}
  }
  @keyframes logoBreath {
    0%,100%{ filter: drop-shadow(0 0 4px rgba(200,169,110,0.25)); }
    50%     { filter: drop-shadow(0 0 12px rgba(200,169,110,0.55)); }
  }
`;

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AerLightsPage() {
  const [lang, setLang]   = useState<Lang>("DE");
  const [cart, setCart]   = useState(false);
  const [chk, setChk]     = useState(false);

  return (
    <CartProvider>
      <style dangerouslySetInnerHTML={{__html:GLOBAL_CSS}}/>
      <AmbientParticles/>
      <CursorGlow/>
      <div style={{background:"#080808", minHeight:"100vh", position:"relative", zIndex:2}}>
        <Nav lang={lang} setLang={setLang} onCart={()=>setCart(true)}/>
        {chk ? (
          <Checkout lang={lang} onBack={()=>{ setChk(false); setCart(true); }}/>
        ) : (
          <>
            <Hero lang={lang}/>
            <AnimDivider/>
            <Collection lang={lang}/>
            <AnimDivider/>
            <Philosophy lang={lang}/>
            <AnimDivider/>
            <Footer lang={lang}/>
          </>
        )}
        <CartDrawer
          open={cart} onClose={()=>setCart(false)} lang={lang}
          onCheckout={()=>{ setCart(false); setChk(true); }}
        />
      </div>
    </CartProvider>
  );
}
