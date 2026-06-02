"use client";

import React, { useState, useContext, createContext, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, X, ChevronRight, ArrowRight, Mail } from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Lang = "DE" | "EN";
interface Product {
  id: string; price: number; image: string;
  nameDe: string; nameEn: string;
  tagDe: string; tagEn: string;
  descDe: string; descEn: string;
  accent: string;
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
    sec_heading:"Unsere Kollektion",
    sec_sub:"Vier Ausnahmewerke. Unzählige Momente des Staunens.",
    add:"In den Warenkorb", quick:"Ansehen",
    cart_t:"Warenkorb", cart_empty:"Ihr Warenkorb ist leer.",
    cart_sub:"Zwischensumme", cart_ship:"Versand", cart_free:"Kostenlos",
    cart_tot:"Gesamtbetrag", cart_go:"Zur Kasse",
    chk_t:"Bestellung abschliessen",
    chk_sub:"Sichere Zahlung via Stripe — wird in Kürze verfügbar sein.",
    chk_name:"Vollständiger Name", chk_mail:"E-Mail-Adresse",
    chk_addr:"Lieferadresse", chk_city:"Ort / PLZ",
    chk_btn:"Weiter zur Zahlung", chk_back:"Zurück zum Warenkorb",
    chk_note:"Stripe-Integration folgt in Kürze. Diese Seite ist strukturell bereit.",
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
    sec_heading:"Our Collection",
    sec_sub:"Four exceptional works. Countless moments of wonder.",
    add:"Add to Cart", quick:"View",
    cart_t:"Shopping Bag", cart_empty:"Your cart is empty.",
    cart_sub:"Subtotal", cart_ship:"Shipping", cart_free:"Free",
    cart_tot:"Total", cart_go:"Proceed to Checkout",
    chk_t:"Complete Your Order",
    chk_sub:"Secure payment via Stripe — coming soon.",
    chk_name:"Full Name", chk_mail:"Email Address",
    chk_addr:"Delivery Address", chk_city:"City / Postcode",
    chk_btn:"Continue to Payment", chk_back:"Back to Cart",
    chk_note:"Stripe integration coming soon. This page is structurally ready.",
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
    id:"loum", price:380, image:"/images/loum.jpg", accent:"#C8A96E",
    nameDe:"LOUM", nameEn:"LOUM",
    tagDe:"Statement-Piece", tagEn:"Statement Piece",
    descDe:"Eine Symbiose aus skulpturaler Avantgarde und emotionaler Lichtarchitektur. Der sanft gerundete, organisch perforierte Diffusor ruht wie eine schwebende Wolke auf drei massiven, tiefschwarzen Beinen. LOUM bricht das Licht in ein weiches, warmes Leuchten und wirft ein majestätisches, radiales Schattenmuster auf den Boden. Ein exklusives Statement-Piece, das dem Raum eine kraftvolle, beruhigende Seele verleiht.",
    descEn:"A symbiosis of sculptural avant-garde and emotional light architecture. The softly rounded, organically perforated diffuser rests like a hovering cloud upon three massive, deep-black legs. LOUM refracts light into a soft, warm glow, casting a majestic radial shadow pattern across the floor. An exclusive statement piece that gives the room a powerful, calming soul.",
  },
  {
    id:"torsion", price:345, image:"/images/torsion.jpg", accent:"#B0C4CC",
    nameDe:"TORSION", nameEn:"TORSION",
    tagDe:"Parametrisches Design", tagEn:"Parametric Design",
    descDe:"Mathematische Perfektion trifft auf immersive Ästhetik. Die dynamisch in sich gedrehte Helix-Struktur inszeniert das Licht völlig neu. Jede einzelne, präzise geführte Schicht des 3D-Drucks bricht das Licht sanft und erzeugt faszinierende, fliessende Lichtwellen an Ihren Wänden. Ein Meisterwerk des parametrischen Designs auf einem minimalistischen, sandfarbenen Sockel.",
    descEn:"Mathematical perfection meets immersive aesthetics. The dynamically twisted helix structure orchestrates light in an entirely new way. Every precisely guided 3D-printed layer softly refracts the light, creating mesmerizing, fluid waves of illumination along your walls. A masterpiece of parametric design resting on a minimalist sand-toned base.",
  },
  {
    id:"vals", price:290, image:"/images/vals.jpg", accent:"#9EAEB8",
    nameDe:"VALS", nameEn:"VALS",
    tagDe:"Alpine Architektur", tagEn:"Alpine Architecture",
    descDe:"Inspiriert von der rauen, zeitlosen Ästhetik alpiner Architektur. VALS besticht durch eine markante, horizontal geschichtete Geometrie, die aus einem massiven, anthrazitfarbenen Sockel emporsteigt. Die ultra-feine Perforation eliminiert jede Blendung und entfaltet eine behagliche, architektonische Tiefe und präzise geometrische Schattenstrukturen im Raum.",
    descEn:"Inspired by the raw, timeless aesthetics of alpine architecture. VALS features a striking, horizontally layered geometry rising from a solid charcoal base. The ultra-fine perforation eliminates all glare and unfolds a cozy architectural depth with precise geometric shadow structures.",
  },
  {
    id:"aura", price:310, image:"/images/aura.jpg", accent:"#D4B8A0",
    nameDe:"AURA", nameEn:"AURA",
    tagDe:"Ambiente & Stille", tagEn:"Ambience & Serenity",
    descDe:"Die Verkörperung von fliessender Poesie und subtilem Luxus. Mit ihrer sanft asymmetrischen, vom Wind geformten Silhouette fängt AURA die Essenz natürlicher Bewegung ein. Das mikroperforierte Geflecht und der elegante, matte Sockel erzeugen ein absolut diffuses, sanftes Umgebungslicht. Sie beleuchtet den Raum nicht nur – sie umhüllt ihn mit einer Aura von Ruhe und Exklusivität.",
    descEn:"The embodiment of flowing poetry and subtle luxury. With its softly asymmetrical, wind-sculpted silhouette, AURA captures the essence of natural movement. The micro-perforated mesh and matte base create an absolutely diffused ambient light. It doesn't just illuminate the room – it envelopes it in an aura of serenity.",
  },
];

const chf = (n: number) => `CHF ${n.toFixed(2)}`;

// ─── LOGO SVG — faithful reconstruction from the uploaded image ───────────────
// The mark consists of:
//   Group A: two curved strokes forming a peaked arch (like the letter A),
//            running bottom-left → peak → bottom-right, with a crossing horizontal
//   Group B: two diagonal strokes cutting top-left → bottom-right across the arch
// All strokes have a gold-to-cream gradient matching the original.
function AerMark({ size = 44 }: { size?: number }) {
  const h = Math.round(size * 0.85);
  return (
    <svg width={size} height={h} viewBox="0 0 100 85" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "logoBreath 4s ease-in-out infinite", display:"block" }}>
      <defs>
        <linearGradient id="g_gold" x1="0" y1="0" x2="100" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#C8A96E"/>
          <stop offset="40%" stopColor="#E8D5A8"/>
          <stop offset="70%" stopColor="#F0E4C0"/>
          <stop offset="100%" stopColor="#C8A96E"/>
        </linearGradient>
        <linearGradient id="g_cream" x1="0" y1="85" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#EAD8B0"/>
          <stop offset="50%" stopColor="#F5EDD8"/>
          <stop offset="100%" stopColor="#D4B882"/>
        </linearGradient>
      </defs>

      {/* ── ARCH GROUP (A-shape) ── */}
      {/* Outer arch — gold, bottom-left up to peak, back down to bottom-right */}
      <path
        d="M 4 72  C 4 72, 22 8, 50 8  C 78 8, 96 72, 96 72"
        stroke="url(#g_gold)" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      {/* Inner arch — cream, slightly inset */}
      <path
        d="M 13 72  C 13 72, 28 18, 50 18  C 72 18, 87 72, 87 72"
        stroke="url(#g_cream)" strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Crossbar of the A — horizontal line mid-height */}
      <path
        d="M 22 52  L 78 52"
        stroke="url(#g_gold)" strokeWidth="4.5" strokeLinecap="round"
      />
      <path
        d="M 26 58  L 74 58"
        stroke="url(#g_cream)" strokeWidth="3.5" strokeLinecap="round"
      />

      {/* ── DIAGONAL GROUP (X-cross cutting through) ── */}
      {/* Diagonal 1: top-left → bottom-right */}
      <path
        d="M 2 8  C 20 20, 55 45, 98 78"
        stroke="url(#g_gold)" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      {/* Diagonal 1 inner */}
      <path
        d="M 10 4  C 28 18, 60 44, 100 72"
        stroke="url(#g_cream)" strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

// ─── CART CONTEXT ─────────────────────────────────────────────────────────────
const CC = createContext<CartCtx>({ items:[], addItem:()=>{}, removeItem:()=>{}, updateQty:()=>{}, total:0, count:0 });

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = useCallback((p: Product) =>
    setItems(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity+1 } : i);
      return [...prev, { product:p, quantity:1 }];
    }), []);
  const removeItem = useCallback((id:string) => setItems(p => p.filter(i => i.product.id !== id)), []);
  const updateQty  = useCallback((id:string, d:number) =>
    setItems(prev => prev.map(i => i.product.id===id ? {...i,quantity:i.quantity+d} : i).filter(i=>i.quantity>0)), []);
  const total = items.reduce((s,i) => s + i.product.price*i.quantity, 0);
  const count = items.reduce((s,i) => s + i.quantity, 0);
  return <CC.Provider value={{items,addItem,removeItem,updateQty,total,count}}>{children}</CC.Provider>;
}

// ─── CURSOR GLOW ──────────────────────────────────────────────────────────────
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({x:0,y:0});
  const cur = useRef({x:0,y:0});
  useEffect(() => {
    const onMove = (e:MouseEvent) => { pos.current = {x:e.clientX, y:e.clientY}; };
    window.addEventListener("mousemove", onMove);
    let raf: number;
    const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
    const tick = () => {
      cur.current.x = lerp(cur.current.x, pos.current.x, 0.07);
      cur.current.y = lerp(cur.current.y, pos.current.y, 0.07);
      if (ref.current) ref.current.style.transform = `translate(${cur.current.x-220}px,${cur.current.y-220}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); };
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed", top:0, left:0, width:440, height:440,
      borderRadius:"50%", pointerEvents:"none", zIndex:1,
      background:"radial-gradient(circle, rgba(200,169,110,0.045) 0%, transparent 70%)",
    }}/>
  );
}

// ─── AMBIENT PARTICLES ────────────────────────────────────────────────────────
function Particles() {
  const cvs = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const onR = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", onR);
    const pts = Array.from({length:40}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      r:0.5+Math.random()*1.8,
      vx:(Math.random()-.5)*.15, vy:(Math.random()-.5)*.1,
      o:0.03+Math.random()*.1,
      c:Math.random()>.5?"200,169,110":"160,190,200",
    }));
    let raf:number;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-5) p.x=W+5; if(p.x>W+5) p.x=-5;
        if(p.y<-5) p.y=H+5; if(p.y>H+5) p.y=-5;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.c},${p.o})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",onR); };
  },[]);
  return <canvas ref={cvs} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
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
      position:"fixed", top:0, left:0, right:0, zIndex:100, height:70,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 clamp(1.2rem,5vw,4rem)",
      background: scrolled ? "rgba(8,8,8,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition:"all 0.4s ease",
    }}>

      {/* LOGO */}
      <a href="#" style={{textDecoration:"none", display:"flex", alignItems:"center", gap:10}}>
        <AerMark size={40}/>
        <span style={{
          fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:"1.2rem", fontWeight:400, letterSpacing:"0.1em",
          color:"#f5f0e8", display:"flex", gap:4,
        }}>
          <span style={{color:"#C8A96E", fontWeight:500}}>AER</span>
          <span>Lights</span>
        </span>
      </a>

      {/* RIGHT */}
      <div style={{display:"flex", alignItems:"center", gap:"clamp(1rem,2.5vw,2rem)"}}>
        {([["#collection",tx.nav_col],["#philosophy",tx.nav_phi],["#contact",tx.nav_con]] as [string,string][]).map(([href,label]) => (
          <a key={href} href={href} style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"0.68rem",
            letterSpacing:"0.14em", textTransform:"uppercase" as const,
            color:"rgba(245,240,232,0.5)", textDecoration:"none", transition:"color 0.2s",
          }}
          onMouseEnter={e=>(e.target as HTMLElement).style.color="#f5f0e8"}
          onMouseLeave={e=>(e.target as HTMLElement).style.color="rgba(245,240,232,0.5)"}>
            {label}
          </a>
        ))}

        {/* Lang */}
        <div style={{display:"flex", alignItems:"center", gap:2, fontFamily:"'DM Sans',sans-serif", fontSize:"0.66rem", letterSpacing:"0.12em"}}>
          {(["DE","EN"] as Lang[]).map((l,i) => (
            <React.Fragment key={l}>
              {i>0 && <span style={{color:"rgba(255,255,255,0.2)", margin:"0 2px"}}>|</span>}
              <button onClick={()=>setLang(l)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:"inherit", letterSpacing:"inherit",
                color: lang===l ? "#C8A96E" : "rgba(245,240,232,0.38)",
                padding:"2px 3px", transition:"color 0.2s",
              }}>{l}</button>
            </React.Fragment>
          ))}
        </div>

        {/* Cart */}
        <button onClick={onCart} style={{
          background:"none", border:"none", cursor:"pointer",
          color:"#f5f0e8", position:"relative", display:"flex", padding:4,
          transition:"transform 0.2s",
        }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="scale(1.1)"}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="scale(1)"}>
          <ShoppingBag size={20} strokeWidth={1.4}/>
          {count>0 && (
            <span style={{
              position:"absolute", top:-3, right:-4,
              background:"#C8A96E", color:"#080808",
              borderRadius:"50%", width:16, height:16,
              fontSize:"0.58rem", fontWeight:700,
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
function Hero({ lang }: { lang:Lang }) {
  const tx = T[lang];
  const [vis, setVis] = useState(false);
  const [mp, setMp] = useState({x:0.5,y:0.5});
  useEffect(() => { const t=setTimeout(()=>setVis(true),120); return()=>clearTimeout(t); },[]);
  const onMove = useCallback((e:React.MouseEvent<HTMLElement>) => {
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setMp({x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height});
  },[]);
  return (
    <section onMouseMove={onMove} style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      justifyContent:"flex-end", position:"relative", overflow:"hidden",
      padding:"0 clamp(1.5rem,5vw,4rem) clamp(3rem,8vh,5rem)",
    }}>
      {/* BG blobs reacting to mouse */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 75% 75% at ${48+mp.x*8}% ${28+mp.y*10}%, rgba(200,169,110,0.08) 0%, transparent 58%), radial-gradient(ellipse 45% 55% at ${18-mp.x*5}% ${82-mp.y*5}%, rgba(140,160,175,0.05) 0%, transparent 55%)`,
        transition:"background 0.7s ease",
      }}/>
      {/* Subtle grid */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.03,pointerEvents:"none"}}>
        <defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M60 0L0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
      {/* Scan line */}
      <div style={{
        position:"absolute", left:0, right:0, height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(200,169,110,0.12),transparent)",
        top:`${25+mp.y*45}%`, transition:"top 1.4s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents:"none",
      }}/>

      {/* Hero product image — LOUM, floating right */}
      <div style={{
        position:"absolute",
        right:"clamp(1rem,8vw,12rem)", top:"50%",
        transform:`translateY(-50%) translateX(${(mp.x-.5)*-20}px) translateY(${(mp.y-.5)*-12}px)`,
        transition:"transform 1s cubic-bezier(0.4,0,0.2,1)",
        width:"clamp(220px,30vw,460px)",
        opacity:vis?1:0,
        transitionProperty:"transform,opacity",
        transitionDuration:"1s,1.4s",
        transitionDelay:"0s,0.3s",
        animation:"floatLamp 7s ease-in-out infinite",
        borderRadius:6, overflow:"hidden",
      }}>
        <Image src="/images/loum.jpg" alt="LOUM – Aer Lights" width={460} height={560}
          style={{width:"100%",height:"auto",objectFit:"cover",
            filter:"brightness(0.9) contrast(1.04)"}}
          priority/>
        <div style={{
          position:"absolute",inset:0,
          background:"radial-gradient(ellipse 55% 40% at 50% 50%, rgba(200,169,110,0.07) 0%, transparent 65%)",
          pointerEvents:"none",
        }}/>
      </div>

      {/* Large logo watermark — faint behind text */}
      <div style={{
        position:"absolute", top:"clamp(4rem,10vh,7rem)", left:"clamp(1.5rem,5vw,4rem)",
        opacity:vis?0.07:0, transition:"opacity 2.5s ease 1s", pointerEvents:"none",
      }}>
        <AerMark size={220}/>
      </div>

      {/* Tag */}
      <div style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:"0.65rem",
        letterSpacing:"0.24em", textTransform:"uppercase" as const,
        color:"#C8A96E", marginBottom:"1.4rem",
        display:"flex", alignItems:"center", gap:10,
        opacity:vis?1:0, transform:vis?"none":"translateY(14px)",
        transition:"all 0.9s ease 0.1s",
      }}>
        <span style={{display:"inline-block",width:30,height:1,background:"#C8A96E"}}/>
        {tx.hero_tag}
      </div>

      {/* H1 staggered by word */}
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(3.5rem,9vw,8.5rem)", fontWeight:300, lineHeight:1.02, margin:"0 0 1.4rem", maxWidth:"12ch"}}>
        {[tx.hero_h1a, tx.hero_h1b].map((w,i) => (
          <span key={i} style={{
            display:"block",
            color: i===1?"#C8A96E":"#f5f0e8",
            fontStyle: i===1?"italic":"normal",
            opacity:vis?1:0, transform:vis?"none":"translateY(28px)",
            transition:`all 1.05s cubic-bezier(0.4,0,0.2,1) ${0.18+i*0.15}s`,
          }}>{w}</span>
        ))}
      </h1>

      {/* Subtitle */}
      <p style={{
        fontFamily:"'DM Sans',sans-serif",
        fontSize:"clamp(0.85rem,1.4vw,1.05rem)",
        color:"rgba(245,240,232,0.5)", maxWidth:400, lineHeight:1.75, margin:"0 0 2.5rem",
        opacity:vis?1:0, transform:vis?"none":"translateY(16px)",
        transition:"all 1s ease 0.44s",
      }}>{tx.hero_sub}</p>

      {/* CTA button */}
      <div style={{opacity:vis?1:0,transform:vis?"none":"translateY(12px)",transition:"all 1s ease 0.58s",alignSelf:"flex-start"}}>
        <a href="#collection" style={{
          display:"inline-flex", alignItems:"center", gap:10,
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.75rem",
          letterSpacing:"0.14em", textTransform:"uppercase" as const,
          color:"#080808", background:"#C8A96E", textDecoration:"none",
          padding:"14px 30px", borderRadius:2, transition:"all 0.25s",
        }}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.transform="translateY(-2px)"; el.style.boxShadow="0 12px 32px rgba(200,169,110,0.3)";}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.transform="translateY(0)"; el.style.boxShadow="none";}}>
          {tx.hero_cta} <ArrowRight size={14} strokeWidth={2}/>
        </a>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position:"absolute", bottom:"2rem", right:"clamp(1.5rem,5vw,4rem)",
        writingMode:"vertical-lr" as const,
        fontFamily:"'DM Sans',sans-serif", fontSize:"0.58rem",
        letterSpacing:"0.2em", textTransform:"uppercase" as const,
        color:"rgba(245,240,232,0.2)",
        animation:"scrollBlink 3s ease-in-out infinite",
        opacity:vis?1:0, transition:"opacity 1s ease 1.2s",
      }}>{tx.hero_scroll}</div>
    </section>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
function Divider() {
  const {ref,vis} = useReveal(0.5);
  return <div ref={ref} style={{
    height:1, margin:"0 clamp(1.5rem,5vw,4rem)",
    background:"linear-gradient(90deg,transparent,rgba(200,169,110,0.25),transparent)",
    transform:`scaleX(${vis?1:0})`, opacity:vis?1:0,
    transition:"all 1.2s cubic-bezier(0.4,0,0.2,1)", transformOrigin:"center",
  }}/>;
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ p, lang, onView, idx }: { p:Product; lang:Lang; onView(p:Product):void; idx:number }) {
  const { addItem } = useContext(CC);
  const {ref,vis} = useReveal(0.1);
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  const [ripple, setRipple] = useState<{x:number;y:number}|null>(null);
  const tx = T[lang];
  const name = lang==="DE"?p.nameDe:p.nameEn;
  const tag  = lang==="DE"?p.tagDe:p.tagEn;

  const handleAdd = (e:React.MouseEvent) => {
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setRipple({x:e.clientX-r.left,y:e.clientY-r.top});
    setTimeout(()=>setRipple(null),700);
    addItem(p); setAdded(true); setTimeout(()=>setAdded(false),1600);
  };

  return (
    <div ref={ref}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative",
        background: hov?"rgba(255,255,255,0.038)":"rgba(255,255,255,0.016)",
        border:`1px solid ${hov?p.accent+"38":"rgba(255,255,255,0.07)"}`,
        borderRadius:4, overflow:"hidden",
        opacity:vis?1:0,
        transform:vis?(hov?"translateY(-6px)":"translateY(0)"):"translateY(30px)",
        transition:`opacity 0.7s ease ${idx*0.1}s, transform ${vis?"0.4s cubic-bezier(0.34,1.2,0.64,1)":"0.7s ease "+idx*0.1+"s"}, border 0.3s, background 0.3s`,
        boxShadow:hov?`0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px ${p.accent}14`:"0 4px 20px rgba(0,0,0,0.2)",
      }}>

      {/* Photo */}
      <div style={{height:300, position:"relative", overflow:"hidden", background:"#0e0e0e"}}>
        <Image src={p.image} alt={name} fill
          style={{objectFit:"cover", objectPosition:"center",
            transform:hov?"scale(1.05)":"scale(1)",
            transition:"transform 0.7s ease",
            filter:"brightness(0.88) contrast(1.05)"}}
        />
        {/* Overlay gradient */}
        <div style={{
          position:"absolute", inset:0,
          background:`linear-gradient(to top, rgba(8,8,8,0.55) 0%, transparent 50%)`,
          pointerEvents:"none",
        }}/>
        {/* Accent glow on hover */}
        <div style={{
          position:"absolute", inset:0,
          background:`radial-gradient(ellipse 60% 50% at 50% 50%, ${p.accent}10 0%, transparent 70%)`,
          opacity:hov?1:0, transition:"opacity 0.5s", pointerEvents:"none",
        }}/>
        {/* Quick view */}
        <button onClick={()=>onView(p)} style={{
          position:"absolute", bottom:"0.9rem", right:"0.9rem",
          background:"rgba(8,8,8,0.82)", backdropFilter:"blur(10px)",
          border:`1px solid ${p.accent}50`, borderRadius:2,
          color:p.accent, fontFamily:"'DM Sans',sans-serif",
          fontSize:"0.6rem", letterSpacing:"0.14em", textTransform:"uppercase" as const,
          padding:"7px 12px", cursor:"pointer",
          display:"flex", alignItems:"center", gap:4,
          opacity:hov?1:0, transform:hov?"translateY(0)":"translateY(10px)",
          transition:"all 0.32s cubic-bezier(0.34,1.2,0.64,1)",
        }}>
          {tx.quick} <ChevronRight size={10}/>
        </button>
      </div>

      {/* Card body */}
      <div style={{padding:"1.1rem 1.4rem 1.4rem"}}>
        <div style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.57rem",
          letterSpacing:"0.22em", textTransform:"uppercase" as const,
          color:p.accent, marginBottom:5,
        }}>{tag}</div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"1rem"}}>
          <span style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"1.9rem", fontWeight:400, color:"#f5f0e8", letterSpacing:"0.03em",
          }}>{name}</span>
          <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem", color:p.accent}}>
            {chf(p.price)}
          </span>
        </div>
        {/* Add to cart */}
        <button onClick={handleAdd} style={{
          width:"100%", position:"relative", overflow:"hidden",
          background:added?p.accent:"transparent",
          border:`1px solid ${added?p.accent:"rgba(255,255,255,0.1)"}`,
          borderRadius:2, cursor:"pointer",
          color:added?"#080808":"rgba(245,240,232,0.7)",
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.67rem",
          letterSpacing:"0.12em", textTransform:"uppercase" as const,
          padding:"11px 0", transition:"all 0.3s",
        }}
        onMouseEnter={e=>{ if(!added){ const el=e.currentTarget as HTMLElement; el.style.borderColor=p.accent; el.style.color=p.accent; el.style.background=p.accent+"12"; }}}
        onMouseLeave={e=>{ if(!added){ const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(255,255,255,0.1)"; el.style.color="rgba(245,240,232,0.7)"; el.style.background="transparent"; }}}>
          {ripple && (
            <span style={{
              position:"absolute", left:ripple.x-40, top:ripple.y-40,
              width:80, height:80, borderRadius:"50%",
              background:`${p.accent}28`, animation:"rippleOut 0.65s ease forwards",
              pointerEvents:"none",
            }}/>
          )}
          {added ? "✓ Hinzugefügt" : tx.add}
        </button>
      </div>
    </div>
  );
}

// ─── QUICK VIEW ───────────────────────────────────────────────────────────────
function QuickView({ p, lang, onClose }: { p:Product|null; lang:Lang; onClose():void }) {
  const { addItem } = useContext(CC);
  const [added, setAdded] = useState(false);
  const [vis, setVis] = useState(false);
  const tx = T[lang];
  useEffect(() => {
    if(p){ setTimeout(()=>setVis(true),10); document.body.style.overflow="hidden"; }
    else { setVis(false); document.body.style.overflow=""; }
    return ()=>{ document.body.style.overflow=""; };
  },[p]);
  if(!p) return null;
  const name=lang==="DE"?p.nameDe:p.nameEn;
  const desc=lang==="DE"?p.descDe:p.descEn;
  const tag =lang==="DE"?p.tagDe:p.tagEn;
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:200,
      background:`rgba(0,0,0,${vis?.8:0})`,
      backdropFilter:`blur(${vis?8:0}px)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"2rem", transition:"all 0.35s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#101010", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:6, maxWidth:740, width:"100%",
        display:"grid", gridTemplateColumns:"1fr 1fr", overflow:"hidden",
        maxHeight:"88vh",
        transform:vis?"scale(1) translateY(0)":"scale(0.96) translateY(18px)",
        opacity:vis?1:0, transition:"all 0.4s cubic-bezier(0.34,1.1,0.64,1)",
        boxShadow:"0 40px 100px rgba(0,0,0,0.75)",
      }}>
        <div style={{position:"relative", minHeight:360, background:"#0a0a0a"}}>
          <Image src={p.image} alt={name} fill style={{objectFit:"cover",filter:"brightness(0.85)"}}/>
        </div>
        <div style={{padding:"2.5rem 2rem", overflowY:"auto"}}>
          <button onClick={onClose} style={{
            background:"none",border:"none",cursor:"pointer",
            color:"rgba(255,255,255,0.3)",float:"right",
            marginTop:-8,marginRight:-8,transition:"all 0.2s",
          }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color="#fff"; el.style.transform="rotate(90deg)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.3)"; el.style.transform="rotate(0deg)";}}>
            <X size={18}/>
          </button>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase" as const,color:p.accent,marginBottom:8}}>{tag}</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"2.4rem",fontWeight:300,color:"#f5f0e8",marginBottom:6}}>{name}</h2>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"1.05rem",color:p.accent,marginBottom:"1.3rem"}}>{chf(p.price)}</div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.82rem",color:"rgba(245,240,232,0.5)",lineHeight:1.8,marginBottom:"2rem"}}>{desc}</p>
          <button onClick={()=>{addItem(p);setAdded(true);setTimeout(()=>setAdded(false),1600);}} style={{
            width:"100%",background:added?p.accent:"transparent",
            border:`1px solid ${added?p.accent:"rgba(200,169,110,0.4)"}`,
            borderRadius:2,cursor:"pointer",transition:"all 0.3s",
            color:added?"#080808":p.accent,
            fontFamily:"'DM Sans',sans-serif",fontSize:"0.7rem",
            letterSpacing:"0.14em",textTransform:"uppercase" as const,padding:"13px",
          }}>
            {added?"✓ Hinzugefügt":tx.add}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COLLECTION SECTION ───────────────────────────────────────────────────────
function Collection({ lang }: { lang:Lang }) {
  const [qv, setQV] = useState<Product|null>(null);
  const {ref,vis} = useReveal(0.08);
  const tx = T[lang];
  return (
    <section id="collection" style={{padding:"clamp(4rem,10vh,7rem) clamp(1.5rem,5vw,4rem)"}}>
      <div ref={ref} style={{marginBottom:"3.5rem",opacity:vis?1:0,transform:vis?"none":"translateY(22px)",transition:"all 0.8s ease"}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.62rem",letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"rgba(200,169,110,0.7)",marginBottom:"0.8rem",display:"flex",alignItems:"center",gap:10}}>
          <span style={{display:"inline-block",width:28,height:1,background:"rgba(200,169,110,0.5)"}}/>
          {tx.nav_col}
        </div>
        <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:300,color:"#f5f0e8",marginBottom:8}}>{tx.sec_heading}</h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.85rem",color:"rgba(245,240,232,0.36)",letterSpacing:"0.03em"}}>{tx.sec_sub}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1.5rem"}}>
        {PRODUCTS.map((p,i)=><ProductCard key={p.id} p={p} lang={lang} onView={setQV} idx={i}/>)}
      </div>
      <QuickView p={qv} lang={lang} onClose={()=>setQV(null)}/>
    </section>
  );
}

// ─── PHILOSOPHY ───────────────────────────────────────────────────────────────
function Philosophy({ lang }: { lang:Lang }) {
  const tx = T[lang];
  const {ref:tRef,vis:tVis} = useReveal(0.1);
  const {ref:sRef,vis:sVis} = useReveal(0.12);
  return (
    <section id="philosophy" style={{padding:"clamp(4rem,10vh,7rem) clamp(1.5rem,5vw,4rem)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:"clamp(2rem,6vw,6rem)",alignItems:"center"}}>
        <div ref={tRef}>
          {[
            [tx.phi_tag,true,false,"0.62rem","rgba(200,169,110,0.7)",0],
            [tx.phi_h,false,false,"clamp(1.8rem,3.5vw,2.8rem)","#f5f0e8",0.08],
            [tx.phi_p1,false,false,"0.88rem","rgba(245,240,232,0.5)",0.16],
            [tx.phi_p2,false,false,"0.88rem","rgba(245,240,232,0.38)",0.24],
          ].map(([text,isTag,_,size,color,delay],i)=>
            isTag ? (
              <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:size as string,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:color as string,marginBottom:"1rem",display:"flex",alignItems:"center",gap:10,opacity:tVis?1:0,transform:tVis?"none":"translateX(-18px)",transition:`all 0.8s ease ${delay}s`}}>
                <span style={{display:"inline-block",width:28,height:1,background:"rgba(200,169,110,0.5)"}}/>
                {text as string}
              </div>
            ) : i===1 ? (
              <h2 key={i} style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:size as string,fontWeight:300,color:color as string,marginBottom:"1.5rem",lineHeight:1.2,opacity:tVis?1:0,transform:tVis?"none":"translateX(-18px)",transition:`all 0.85s ease ${delay}s`}}>{text as string}</h2>
            ) : (
              <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:size as string,color:color as string,lineHeight:1.82,marginBottom:"1.2rem",opacity:tVis?1:0,transform:tVis?"none":"translateY(12px)",transition:`all 0.85s ease ${delay}s`}}>{text as string}</p>
            )
          )}
        </div>
        <div ref={sRef} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem"}}>
          {([[tx.s1,tx.s1l],[tx.s2,tx.s2l],[tx.s3,tx.s3l]] as [string,string][]).map(([v,l],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:4,padding:"1.6rem 1rem",textAlign:"center" as const,opacity:sVis?1:0,transform:sVis?"none":"translateY(20px)",transition:`all 0.7s cubic-bezier(0.34,1.2,0.64,1) ${i*.1}s`}}>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"2rem",fontWeight:300,color:"#C8A96E",marginBottom:4}}>{v}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.58rem",letterSpacing:"0.14em",textTransform:"uppercase" as const,color:"rgba(245,240,232,0.32)"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, lang, onCheckout }: { open:boolean; onClose():void; lang:Lang; onCheckout():void }) {
  const { items, removeItem, updateQty, total } = useContext(CC);
  const tx = T[lang];
  useEffect(()=>{ document.body.style.overflow=open?"hidden":""; return()=>{ document.body.style.overflow=""; }; },[open]);
  return (
    <>
      {open && <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:150,background:"rgba(0,0,0,0.68)",backdropFilter:"blur(5px)",animation:"fadeIn 0.25s ease"}}/>}
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:"min(420px,100vw)",
        background:"#0d0d0d", borderLeft:"1px solid rgba(255,255,255,0.06)",
        zIndex:160, display:"flex", flexDirection:"column",
        transform:open?"translateX(0)":"translateX(100%)",
        transition:"transform 0.42s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:open?"-24px 0 72px rgba(0,0,0,0.55)":"none",
      }}>
        {/* Header */}
        <div style={{padding:"1.4rem 1.8rem",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.055)"}}>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1.3rem",fontWeight:400,color:"#f5f0e8",letterSpacing:"0.06em"}}>{tx.cart_t}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",transition:"all 0.2s"}}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color="#f5f0e8"; el.style.transform="rotate(90deg)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.3)"; el.style.transform="rotate(0deg)";}}>
            <X size={20} strokeWidth={1.5}/>
          </button>
        </div>
        {/* Items */}
        <div style={{flex:1,overflowY:"auto"}}>
          {items.length===0 ? (
            <div style={{padding:"4rem 1.8rem",textAlign:"center" as const,color:"rgba(245,240,232,0.26)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.82rem",letterSpacing:"0.06em"}}>{tx.cart_empty}</div>
          ) : items.map((item,idx)=>{
            const n=lang==="DE"?item.product.nameDe:item.product.nameEn;
            return (
              <div key={item.product.id} style={{padding:"1rem 1.8rem",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",gap:"1rem",alignItems:"center",animation:`slideRight 0.3s ease ${idx*0.05}s both`}}>
                <div style={{width:60,height:60,flexShrink:0,position:"relative",borderRadius:3,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <Image src={item.product.image} alt={n} fill style={{objectFit:"cover",filter:"brightness(0.82)"}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1rem",color:"#f5f0e8",marginBottom:2}}>{n}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.72rem",color:"rgba(245,240,232,0.38)"}}>{chf(item.product.price)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  {([-1,1] as const).map(d=>(
                    <button key={d} onClick={()=>updateQty(item.product.id,d)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:2,width:26,height:26,cursor:"pointer",color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor=item.product.accent; el.style.color=item.product.accent;}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(255,255,255,0.08)"; el.style.color="rgba(255,255,255,0.5)";}}>
                      {d<0?<Minus size={10}/>:<Plus size={10}/>}
                    </button>
                  ))}
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.8rem",color:"#f5f0e8",minWidth:14,textAlign:"center" as const,margin:"0 2px"}}>{item.quantity}</span>
                </div>
                <button onClick={()=>removeItem(item.product.id)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.18)",transition:"all 0.2s"}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color="#ff6666"; el.style.transform="scale(1.1)";}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.18)"; el.style.transform="scale(1)";}}>
                  <X size={14}/>
                </button>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        {items.length>0 && (
          <div style={{padding:"1.4rem 1.8rem",borderTop:"1px solid rgba(255,255,255,0.055)"}}>
            {[[tx.cart_sub,chf(total)],[tx.cart_ship,tx.cart_free]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontFamily:"'DM Sans',sans-serif",fontSize:"0.75rem",color:"rgba(245,240,232,0.38)",marginBottom:"0.55rem"}}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1.1rem",color:"#f5f0e8",paddingTop:"0.8rem",marginBottom:"1.3rem",borderTop:"1px solid rgba(255,255,255,0.055)"}}>
              <span>{tx.cart_tot}</span>
              <span style={{color:"#C8A96E"}}>{chf(total)}</span>
            </div>
            <button onClick={onCheckout} style={{width:"100%",background:"#C8A96E",border:"none",borderRadius:2,color:"#080808",fontFamily:"'DM Sans',sans-serif",fontSize:"0.7rem",letterSpacing:"0.14em",textTransform:"uppercase" as const,padding:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.25s"}}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 8px 24px rgba(200,169,110,0.28)";}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.transform="translateY(0)"; el.style.boxShadow="none";}}>
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
  const {ref,vis} = useReveal(0.01);
  const Field = ({label,k,type="text"}:{label:string;k:keyof typeof form;type?:string}) => (
    <div style={{marginBottom:"1.2rem"}}>
      <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"0.58rem",letterSpacing:"0.14em",textTransform:"uppercase" as const,color:"rgba(245,240,232,0.35)",marginBottom:6}}>{label}</label>
      <input type={type} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:2,color:"#f5f0e8",fontFamily:"'DM Sans',sans-serif",fontSize:"0.88rem",padding:"11px 14px",outline:"none",transition:"border-color 0.25s"}}
        onFocus={e=>(e.target as HTMLElement).style.borderColor="rgba(200,169,110,0.5)"}
        onBlur={e=>(e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.09)"}/>
    </div>
  );
  return (
    <div ref={ref} style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"100px clamp(1.5rem,5vw,4rem) 4rem",opacity:vis?1:0,transform:vis?"none":"translateY(18px)",transition:"all 0.7s ease"}}>
      <div style={{width:"100%",maxWidth:880,display:"grid",gridTemplateColumns:"1fr 320px",gap:"3rem",alignItems:"start"}}>
        <div>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(200,169,110,0.65)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase" as const,display:"flex",alignItems:"center",gap:6,marginBottom:"2rem",padding:0,transition:"color 0.2s"}}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#C8A96E"}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(200,169,110,0.65)"}>
            ← {tx.chk_back}
          </button>
          <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"2rem",fontWeight:300,color:"#f5f0e8",marginBottom:6}}>{tx.chk_t}</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.78rem",color:"rgba(245,240,232,0.3)",marginBottom:"2.5rem"}}>{tx.chk_sub}</p>
          <Field label={tx.chk_name} k="name"/>
          <Field label={tx.chk_mail} k="email" type="email"/>
          <Field label={tx.chk_addr} k="addr"/>
          <Field label={tx.chk_city} k="city"/>
          <div style={{background:"rgba(200,169,110,0.055)",border:"1px solid rgba(200,169,110,0.15)",borderRadius:3,padding:"10px 16px",marginBottom:"1.5rem",fontFamily:"'DM Sans',sans-serif",fontSize:"0.7rem",color:"rgba(200,169,110,0.6)",display:"flex",alignItems:"center",gap:8}}>
            ◈ {tx.chk_note}
          </div>
          <button style={{width:"100%",background:"#C8A96E",border:"none",borderRadius:2,color:"#080808",fontFamily:"'DM Sans',sans-serif",fontSize:"0.72rem",letterSpacing:"0.14em",textTransform:"uppercase" as const,padding:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.25s"}}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 8px 24px rgba(200,169,110,0.28)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.transform="translateY(0)"; el.style.boxShadow="none";}}>
            {tx.chk_btn} <ArrowRight size={14}/>
          </button>
        </div>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:4,padding:"1.8rem"}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.58rem",letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"rgba(245,240,232,0.3)",marginBottom:"1.2rem"}}>{tx.cart_t}</div>
          {items.map(item=>(
            <div key={item.product.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"0.75rem",fontFamily:"'DM Sans',sans-serif",fontSize:"0.8rem"}}>
              <span style={{color:"rgba(245,240,232,0.52)"}}>{lang==="DE"?item.product.nameDe:item.product.nameEn} <span style={{color:"rgba(245,240,232,0.26)"}}>×{item.quantity}</span></span>
              <span style={{color:"#f5f0e8"}}>{chf(item.product.price*item.quantity)}</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.065)",paddingTop:"1rem",marginTop:"0.5rem",display:"flex",justifyContent:"space-between",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1.1rem",color:"#f5f0e8"}}>
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
  const {ref,vis} = useReveal(0.08);
  return (
    <footer id="contact" ref={ref} style={{borderTop:"1px solid rgba(255,255,255,0.045)",padding:"clamp(3rem,8vh,5rem) clamp(1.5rem,5vw,4rem) 2rem",opacity:vis?1:0,transform:vis?"none":"translateY(22px)",transition:"all 0.9s ease"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"3rem",marginBottom:"3.5rem"}}>
        {/* Brand */}
        <div>
          <div style={{marginBottom:"0.9rem"}}><AerMark size={42}/></div>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1.1rem",fontWeight:400,letterSpacing:"0.12em",color:"#f5f0e8",marginBottom:"0.7rem",display:"flex",gap:4}}>
            <span style={{color:"#C8A96E"}}>AER</span> Lights
          </div>
          <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"0.92rem",fontStyle:"italic",color:"rgba(245,240,232,0.28)",lineHeight:1.6}}>{tx.f_tag}</p>
        </div>
        {/* Legal */}
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.57rem",letterSpacing:"0.2em",textTransform:"uppercase" as const,color:"rgba(245,240,232,0.25)",marginBottom:"1rem"}}>Legal</div>
          {[tx.f_imp,tx.f_prv,tx.f_shp].map(l=>(
            <div key={l} style={{marginBottom:"0.5rem"}}>
              <a href="#" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.78rem",color:"rgba(245,240,232,0.35)",textDecoration:"none",transition:"color 0.2s"}}
              onMouseEnter={e=>(e.target as HTMLElement).style.color="#C8A96E"}
              onMouseLeave={e=>(e.target as HTMLElement).style.color="rgba(245,240,232,0.35)"}>{l}</a>
            </div>
          ))}
        </div>
        {/* Newsletter */}
        <div style={{gridColumn:"span 2"}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1.4rem",fontWeight:300,color:"#f5f0e8",marginBottom:4}}>{tx.nl_h}</div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.78rem",color:"rgba(245,240,232,0.35)",marginBottom:"1.2rem"}}>{tx.nl_sub}</p>
          {subscribed ? (
            <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1rem",fontStyle:"italic",color:"#C8A96E",animation:"fadeIn 0.5s ease"}}>✦ Merci. Sie hören bald von uns.</div>
          ) : (
            <div style={{display:"flex"}}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={tx.nl_ph}
                style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.09)",borderRight:"none",borderRadius:"2px 0 0 2px",color:"#f5f0e8",fontFamily:"'DM Sans',sans-serif",fontSize:"0.82rem",padding:"11px 14px",outline:"none"}}/>
              <button onClick={()=>{if(email)setSubscribed(true);}} style={{background:"#C8A96E",border:"none",borderRadius:"0 2px 2px 0",color:"#080808",fontFamily:"'DM Sans',sans-serif",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase" as const,padding:"11px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" as const,transition:"all 0.25s"}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#b89558"; el.style.transform="translateX(2px)";}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background="#C8A96E"; el.style.transform="translateX(0)";}}>
                {tx.nl_btn} <Mail size={12}/>
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.045)",paddingTop:"1.4rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:"0.5rem"}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.67rem",color:"rgba(245,240,232,0.2)"}}>{tx.f_copy}</span>
        <a href="https://vodnik.ch" target="_blank" rel="noopener noreferrer"
          style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.67rem",color:"rgba(245,240,232,0.2)",textDecoration:"none",transition:"color 0.2s"}}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#C8A96E"}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(245,240,232,0.2)"}>
          {tx.f_dev}
        </a>
      </div>
    </footer>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────
export default function AerLightsPage() {
  const [lang, setLang] = useState<Lang>("DE");
  const [cart, setCart] = useState(false);
  const [chk,  setChk]  = useState(false);
  return (
    <CartProvider>
      <Particles/>
      <CursorGlow/>
      <div style={{background:"#080808", minHeight:"100vh", position:"relative", zIndex:2}}>
        <Nav lang={lang} setLang={setLang} onCart={()=>setCart(true)}/>
        {chk ? (
          <Checkout lang={lang} onBack={()=>{ setChk(false); setCart(true); }}/>
        ) : (
          <>
            <Hero lang={lang}/>
            <Divider/>
            <Collection lang={lang}/>
            <Divider/>
            <Philosophy lang={lang}/>
            <Divider/>
            <Footer lang={lang}/>
          </>
        )}
        <CartDrawer open={cart} onClose={()=>setCart(false)} lang={lang}
          onCheckout={()=>{ setCart(false); setChk(true); }}/>
      </div>
    </CartProvider>
  );
}
