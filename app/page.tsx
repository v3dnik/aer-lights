"use client";

import React, {
  useState, useContext, createContext,
  useEffect, useCallback,
} from "react";
import Image from "next/image";
import {
  ShoppingBag, Plus, Minus, X,
  ChevronRight, ArrowRight, Mail,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Lang = "DE" | "EN";

interface Product {
  id: string;
  price: number;
  nameDe: string; nameEn: string;
  tagDe: string;  tagEn: string;
  descDe: string; descEn: string;
  image: string;
  accentColor: string;
  baseColor: string;
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
    nav_col: "Kollektion", nav_phi: "Philosophie", nav_con: "Kontakt",
    hero_tag: "Handgefertigt in der Schweiz",
    hero_h1a: "Die Zukunft", hero_h1b: "des Lichts.",
    hero_sub: "Skulpturale 3D-Leuchten, die Räume in poetische Lichtarchitektur verwandeln.",
    hero_cta: "Kollektion entdecken",
    hero_scroll: "Scrollen",
    sec_col: "Unsere Kollektion",
    sec_sub: "Vier Ausnahmewerke. Unzählige Momente des Staunens.",
    add: "In den Warenkorb", view: "Ansehen",
    cart_t: "Warenkorb", cart_empty: "Ihr Warenkorb ist leer.",
    cart_sub: "Zwischensumme", cart_ship: "Versand", cart_free: "Kostenlos",
    cart_tot: "Gesamtbetrag", cart_go: "Zur Kasse",
    chk_t: "Bestellung abschliessen",
    chk_sub: "Sichere Zahlung via Stripe — wird in Kürze verfügbar sein.",
    chk_name: "Vollständiger Name", chk_mail: "E-Mail-Adresse",
    chk_addr: "Lieferadresse", chk_city: "Ort / PLZ",
    chk_btn: "Weiter zur Zahlung", chk_back: "Zurück zum Warenkorb",
    chk_mock: "Stripe-Integration folgt in Kürze. Diese Seite ist strukturell bereit.",
    phi_tag: "Unsere Philosophie",
    phi_h: "Licht als skulpturales Medium.",
    phi_p1: "Aer Lights entsteht an der Schnittstelle von parametrischem Design, Schweizer Ingenieurskunst und dem kompromisslosen Streben nach Schönheit. Jede Leuchte ist ein Einzelstück – konzipiert für Räume, die mehr als Helligkeit verlangen.",
    phi_p2: "Unsere Diffusoren werden aus hochwertigem, nachhaltig produziertem PLA-Komposit im industriellen 3D-Druck gefertigt. Präzise. Langlebig. Unvergänglich.",
    s1: "100%", s1l: "Schweizer Design",
    s2: "4", s2l: "Exklusive Modelle",
    s3: "∞", s3l: "Möglichkeiten",
    nl_h: "Exklusive Einblicke.",
    nl_sub: "Erhalten Sie als Erster Einblicke in neue Editionen und Design-Prozesse.",
    nl_ph: "Ihre E-Mail-Adresse", nl_btn: "Abonnieren",
    f_copy: "© 2025 Aer Lights. Alle Rechte vorbehalten.",
    f_dev: "Entwickelt von Vodnik Digital Solutions",
    f_imp: "Impressum", f_prv: "Datenschutz", f_shp: "Versand & Rückgabe",
    f_tag: "Licht, das bleibt.",
  },
  EN: {
    nav_col: "Collection", nav_phi: "Philosophy", nav_con: "Contact",
    hero_tag: "Handcrafted in Switzerland",
    hero_h1a: "The Future", hero_h1b: "of Light.",
    hero_sub: "Sculptural 3D luminaires that transform spaces into poetic light architecture.",
    hero_cta: "Discover Collection",
    hero_scroll: "Scroll",
    sec_col: "Our Collection",
    sec_sub: "Four exceptional works. Countless moments of wonder.",
    add: "Add to Cart", view: "View",
    cart_t: "Shopping Bag", cart_empty: "Your cart is empty.",
    cart_sub: "Subtotal", cart_ship: "Shipping", cart_free: "Free",
    cart_tot: "Total", cart_go: "Proceed to Checkout",
    chk_t: "Complete Your Order",
    chk_sub: "Secure payment via Stripe — coming soon.",
    chk_name: "Full Name", chk_mail: "Email Address",
    chk_addr: "Delivery Address", chk_city: "City / Postcode",
    chk_btn: "Continue to Payment", chk_back: "Back to Cart",
    chk_mock: "Stripe integration coming soon. This page is structurally ready.",
    phi_tag: "Our Philosophy",
    phi_h: "Light as a sculptural medium.",
    phi_p1: "Aer Lights exists at the intersection of parametric design, Swiss engineering precision, and an uncompromising pursuit of beauty. Each luminaire is unique — conceived for spaces that demand more than brightness.",
    phi_p2: "Our diffusers are crafted from premium, sustainably produced PLA composite using industrial 3D printing. Precise. Durable. Timeless.",
    s1: "100%", s1l: "Swiss Design",
    s2: "4", s2l: "Exclusive Models",
    s3: "∞", s3l: "Possibilities",
    nl_h: "Exclusive Insights.",
    nl_sub: "Be the first to receive previews of new editions and design processes.",
    nl_ph: "Your email address", nl_btn: "Subscribe",
    f_copy: "© 2025 Aer Lights. All rights reserved.",
    f_dev: "Developed by Vodnik Digital Solutions",
    f_imp: "Impressum", f_prv: "Privacy Policy", f_shp: "Shipping & Returns",
    f_tag: "Light that endures.",
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: "loum", price: 380, image: "/images/loum.jpg",
    accentColor: "#C8A96E", baseColor: "rgba(200,169,110,0.12)",
    nameDe: "LOUM", nameEn: "LOUM",
    tagDe: "Statement-Piece", tagEn: "Statement Piece",
    descDe: "Eine Symbiose aus skulpturaler Avantgarde und emotionaler Lichtarchitektur. Der sanft gerundete, organisch perforierte Diffusor ruht wie eine schwebende Wolke auf drei massiven, tiefschwarzen Beinen. LOUM bricht das Licht in ein weiches, warmes Leuchten und wirft ein majestätisches, radiales Schattenmuster auf den Boden. Ein exklusives Statement-Piece, das dem Raum eine kraftvolle, beruhigende Seele verleiht.",
    descEn: "A symbiosis of sculptural avant-garde and emotional light architecture. The softly rounded, organically perforated diffuser rests like a hovering cloud upon three massive, deep-black legs. LOUM refracts light into a soft, warm glow, casting a majestic radial shadow pattern across the floor. An exclusive statement piece that gives the room a powerful, calming soul.",
  },
  {
    id: "torsion", price: 345, image: "/images/torsion.jpg",
    accentColor: "#B0C4CC", baseColor: "rgba(176,196,204,0.10)",
    nameDe: "TORSION", nameEn: "TORSION",
    tagDe: "Parametrisches Design", tagEn: "Parametric Design",
    descDe: "Mathematische Perfektion trifft auf immersive Ästhetik. Die dynamisch in sich gedrehte Helix-Struktur inszeniert das Licht völlig neu. Jede einzelne, präzise geführte Schicht des 3D-Drucks bricht das Licht sanft und erzeugt faszinierende, fliessende Lichtwellen an Ihren Wänden. Ein Meisterwerk des parametrischen Designs auf einem minimalistischen, sandfarbenen Sockel.",
    descEn: "Mathematical perfection meets immersive aesthetics. The dynamically twisted helix structure orchestrates light in an entirely new way. Every single, precisely guided 3D-printed layer softly refracts the light, creating mesmerizing, fluid waves of illumination along your walls. A masterpiece of parametric design resting on a minimalist sand-toned base.",
  },
  {
    id: "vals", price: 290, image: "/images/vals.jpg",
    accentColor: "#8E9EA8", baseColor: "rgba(142,158,168,0.10)",
    nameDe: "VALS", nameEn: "VALS",
    tagDe: "Alpine Architektur", tagEn: "Alpine Architecture",
    descDe: "Inspiriert von der rauen, zeitlosen Ästhetik alpiner Architektur. VALS besticht durch eine markante, horizontal geschichtete Geometrie, die aus einem massiven, anthrazitfarbenen Sockel emporsteigt. Die ultra-feine Perforation wirkt wie ein edler Lichtfilter, der jede Blendung eliminiert und stattdessen eine behagliche, architektonische Tiefe und präzise geometrische Schattenstrukturen im Raum entfaltet.",
    descEn: "Inspired by the raw, timeless aesthetics of alpine architecture. VALS features a striking, horizontally layered geometry that rises from a solid, charcoal-colored base. The ultra-fine perforation acts as a premium light filter, eliminating all glare and instead unfolding a cozy architectural depth and precise geometric shadow structures.",
  },
  {
    id: "aura", price: 310, image: "/images/aura.jpg",
    accentColor: "#D4B8A0", baseColor: "rgba(212,184,160,0.10)",
    nameDe: "AURA", nameEn: "AURA",
    tagDe: "Ambiente & Stille", tagEn: "Ambience & Serenity",
    descDe: "Die Verkörperung von fliessender Poesie und subtilem Luxus. Mit ihrer sanft asymmetrischen, vom Wind geformten Silhouette fängt AURA die Essenz natürlicher Bewegung ein. Das mikroperforierte Geflecht und der elegante, matte Sockel harmonieren perfekt, um ein absolut diffuses, sanftes Umgebungslicht zu erzeugen. Sie beleuchtet den Raum nicht nur – sie umhüllt ihn mit einer Aura von Ruhe und Exklusivität.",
    descEn: "The embodiment of flowing poetry and subtle luxury. With its softly asymmetrical, wind-sculpted silhouette, AURA captures the essence of natural movement. The micro-perforated mesh and elegant matte base harmonize perfectly to create an absolutely diffused, gentle ambient light. It doesn't just illuminate the room – it envelopes it in an aura of serenity and exclusivity.",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const chf = (n: number) => `CHF ${n.toFixed(2)}`;

// ─── CART CONTEXT ─────────────────────────────────────────────────────────────
const CC = createContext<CartCtx>({
  items: [], addItem: () => {}, removeItem: () => {},
  updateQty: () => {}, total: 0, count: 0,
});

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((p: Product) =>
    setItems(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    }), []);

  const removeItem = useCallback((id: string) =>
    setItems(prev => prev.filter(i => i.product.id !== id)), []);

  const updateQty = useCallback((id: string, d: number) =>
    setItems(prev =>
      prev.map(i => i.product.id === id ? { ...i, quantity: i.quantity + d } : i)
          .filter(i => i.quantity > 0)
    ), []);

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <CC.Provider value={{ items, addItem, removeItem, updateQty, total, count }}>{children}</CC.Provider>;
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ lang, setLang, onCart }: { lang: Lang; setLang(l: Lang): void; onCart(): void }) {
  const { count } = useContext(CC);
  const [scrolled, setScrolled] = useState(false);
  const tx = T[lang];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 72, display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 clamp(1.5rem,5vw,4rem)",
      background: scrolled ? "rgba(8,8,8,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all 0.4s ease",
    }}>
      {/* Logo */}
      <a href="#" style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "1.3rem", fontWeight: 500, letterSpacing: "0.18em",
        color: "#f5f0e8", textDecoration: "none",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ color: "#C8A96E" }}>✦</span> AER LIGHTS
      </a>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {([[`#collection`, tx.nav_col], [`#philosophy`, tx.nav_phi], [`#contact`, tx.nav_con]] as [string,string][]).map(([href, label]) => (
          <a key={href} href={href} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem",
            letterSpacing: "0.12em", textTransform: "uppercase" as const,
            color: "rgba(245,240,232,0.55)", textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = "#f5f0e8"}
          onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(245,240,232,0.55)"}>
            {label}
          </a>
        ))}

        {/* Lang toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4,
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em" }}>
          {(["DE","EN"] as Lang[]).map((l,i) => (
            <React.Fragment key={l}>
              {i > 0 && <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>}
              <button onClick={() => setLang(l)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit",
                color: lang === l ? "#C8A96E" : "rgba(245,240,232,0.4)",
                padding: "2px 4px", transition: "color 0.2s",
              }}>{l}</button>
            </React.Fragment>
          ))}
        </div>

        {/* Cart btn */}
        <button onClick={onCart} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#f5f0e8", position: "relative", display: "flex", padding: 4,
        }}>
          <ShoppingBag size={20} strokeWidth={1.4} />
          {count > 0 && (
            <span style={{
              position: "absolute", top: -3, right: -4,
              background: "#C8A96E", color: "#080808",
              borderRadius: "50%", width: 16, height: 16,
              fontSize: "0.6rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
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
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "flex-end", position: "relative", overflow: "hidden",
      padding: "0 clamp(1.5rem,5vw,4rem) clamp(3rem,8vh,5rem)",
    }}>
      {/* Atmospheric bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 80% at 55% 35%, rgba(200,169,110,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 15% 85%, rgba(140,160,170,0.05) 0%, transparent 55%)",
      }} />
      {/* Subtle grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}>
        <defs>
          <pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>

      {/* Hero lamp image — LOUM */}
      <div style={{
        position: "absolute", right: "clamp(2rem,10vw,14rem)", top: "50%",
        transform: "translateY(-52%)",
        width: "clamp(200px,28vw,420px)",
        opacity: vis ? 1 : 0,
        transition: "opacity 1.4s ease 0.3s",
        animation: "floatLamp 7s ease-in-out infinite",
        borderRadius: 4, overflow: "hidden",
      }}>
        <Image
          src="/images/loum.jpg"
          alt="LOUM – Aer Lights"
          width={420} height={520}
          style={{ width: "100%", height: "auto", objectFit: "cover",
            filter: "brightness(0.92) contrast(1.05)" }}
          priority
        />
        {/* Glow overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(200,169,110,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Tag line */}
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
        letterSpacing: "0.22em", textTransform: "uppercase" as const,
        color: "#C8A96E", marginBottom: "1.4rem",
        display: "flex", alignItems: "center", gap: 10,
        opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(12px)",
        transition: "all 0.9s ease 0.1s",
      }}>
        <span style={{ display: "inline-block", width: 28, height: 1, background: "#C8A96E" }} />
        {tx.hero_tag}
      </div>

      {/* H1 */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "clamp(3.5rem,9vw,8.5rem)",
        fontWeight: 300, lineHeight: 1.02,
        color: "#f5f0e8", margin: "0 0 1.4rem",
        maxWidth: "12ch",
        opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(22px)",
        transition: "all 1s ease 0.2s",
      }}>
        {tx.hero_h1a}<br />
        <em style={{ color: "#C8A96E", fontStyle: "italic" }}>{tx.hero_h1b}</em>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "clamp(0.85rem,1.4vw,1.05rem)",
        color: "rgba(245,240,232,0.5)", maxWidth: 400,
        lineHeight: 1.75, margin: "0 0 2.5rem",
        opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(16px)",
        transition: "all 1s ease 0.35s",
      }}>{tx.hero_sub}</p>

      {/* CTA */}
      <a href="#collection" style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        fontFamily: "'DM Sans', sans-serif", fontSize: "0.76rem",
        letterSpacing: "0.14em", textTransform: "uppercase" as const,
        color: "#080808", background: "#C8A96E", textDecoration: "none",
        padding: "14px 28px", borderRadius: 2, alignSelf: "flex-start",
        opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(12px)",
        transition: "all 1s ease 0.5s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#b89558"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#C8A96E"; }}>
        {tx.hero_cta} <ArrowRight size={14} strokeWidth={2} />
      </a>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "2.5rem", right: "clamp(1.5rem,5vw,4rem)",
        writingMode: "vertical-lr" as const,
        fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem",
        letterSpacing: "0.18em", textTransform: "uppercase" as const,
        color: "rgba(245,240,232,0.22)",
        animation: "scrollPulse 2.5s ease-in-out infinite",
        opacity: vis ? 1 : 0, transition: "opacity 1s ease 1s",
      }}>{tx.hero_scroll}</div>
    </section>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ p, lang, onView }: { p: Product; lang: Lang; onView(p: Product): void }) {
  const { addItem } = useContext(CC);
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  const tx = T[lang];
  const name = lang === "DE" ? p.nameDe : p.nameEn;
  const tag  = lang === "DE" ? p.tagDe  : p.tagEn;

  const handleAdd = () => { addItem(p); setAdded(true); setTimeout(() => setAdded(false), 1600); };

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: hov ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.018)",
        border: `1px solid ${hov ? `${p.accentColor}35` : "rgba(255,255,255,0.06)"}`,
        borderRadius: 4, overflow: "hidden",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.4s ease",
      }}>
      {/* Image */}
      <div style={{
        height: 300, position: "relative", overflow: "hidden",
        background: p.baseColor,
      }}>
        <Image
          src={p.image} alt={name}
          fill style={{ objectFit: "cover",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.7s ease",
            filter: "brightness(0.9)",
          }}
        />
        {/* Glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${p.accentColor}12 0%, transparent 70%)`,
          opacity: hov ? 1 : 0, transition: "opacity 0.5s",
          pointerEvents: "none",
        }} />
        {/* Quick view */}
        <button onClick={() => onView(p)} style={{
          position: "absolute", bottom: "1rem", right: "1rem",
          background: "rgba(8,8,8,0.8)", backdropFilter: "blur(8px)",
          border: `1px solid ${p.accentColor}50`,
          borderRadius: 2, color: p.accentColor,
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem",
          letterSpacing: "0.14em", textTransform: "uppercase" as const,
          padding: "7px 12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
          opacity: hov ? 1 : 0,
          transform: hov ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s ease",
        }}>
          {tx.view} <ChevronRight size={10} />
        </button>
        {/* Price badge */}
        <div style={{
          position: "absolute", top: "1rem", left: "1rem",
          background: "rgba(8,8,8,0.7)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2, padding: "5px 10px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem",
          color: "rgba(245,240,232,0.7)", letterSpacing: "0.05em",
        }}>{chf(p.price)}</div>
      </div>

      {/* Card body */}
      <div style={{ padding: "1.2rem 1.4rem 1.4rem" }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem",
          letterSpacing: "0.22em", textTransform: "uppercase" as const,
          color: p.accentColor, opacity: 0.85, marginBottom: 6,
        }}>{tag}</div>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1.9rem", fontWeight: 400,
          color: "#f5f0e8", letterSpacing: "0.04em", marginBottom: "1rem",
        }}>{name}</div>
        <button onClick={handleAdd} style={{
          width: "100%",
          background: added ? "#C8A96E" : "transparent",
          border: `1px solid ${added ? "#C8A96E" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 2, cursor: "pointer", transition: "all 0.3s",
          color: added ? "#080808" : "rgba(245,240,232,0.7)",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
          letterSpacing: "0.12em", textTransform: "uppercase" as const,
          padding: "11px 0",
        }}
        onMouseEnter={e => { if (!added) { const el = e.currentTarget as HTMLElement; el.style.borderColor = p.accentColor; el.style.color = p.accentColor; }}}
        onMouseLeave={e => { if (!added) { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.1)"; el.style.color = "rgba(245,240,232,0.7)"; }}}>
          {added ? "✓" : tx.add}
        </button>
      </div>
    </div>
  );
}

// ─── QUICK VIEW MODAL ─────────────────────────────────────────────────────────
function QVModal({ p, lang, onClose }: { p: Product | null; lang: Lang; onClose(): void }) {
  const { addItem } = useContext(CC);
  const [added, setAdded] = useState(false);
  const tx = T[lang];

  useEffect(() => {
    document.body.style.overflow = p ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [p]);

  if (!p) return null;
  const name = lang === "DE" ? p.nameDe : p.nameEn;
  const desc = lang === "DE" ? p.descDe : p.descEn;
  const tag  = lang === "DE" ? p.tagDe  : p.tagEn;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem", animation: "fadeIn 0.25s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 6, maxWidth: 740, width: "100%",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        overflow: "hidden", animation: "fadeIn 0.3s ease",
        maxHeight: "90vh",
      }}>
        {/* Image */}
        <div style={{ position: "relative", minHeight: 360,
          background: p.baseColor }}>
          <Image src={p.image} alt={name} fill
            style={{ objectFit: "cover", filter: "brightness(0.88)" }} />
        </div>
        {/* Info */}
        <div style={{ padding: "2.5rem 2rem", overflowY: "auto" }}>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.3)", float: "right",
            marginTop: -8, marginRight: -8, transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}>
            <X size={18} />
          </button>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem",
            letterSpacing: "0.2em", textTransform: "uppercase" as const,
            color: p.accentColor, marginBottom: 8,
          }}>{tag}</div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "2.5rem", fontWeight: 300, color: "#f5f0e8", marginBottom: 6,
          }}>{name}</h2>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "1rem",
            color: p.accentColor, marginBottom: "1.2rem",
          }}>{chf(p.price)}</div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
            color: "rgba(245,240,232,0.52)", lineHeight: 1.78, marginBottom: "2rem",
          }}>{desc}</p>
          <button onClick={() => { addItem(p); setAdded(true); setTimeout(() => setAdded(false), 1600); }}
            style={{
              width: "100%", background: added ? "#C8A96E" : "transparent",
              border: `1px solid ${added ? "#C8A96E" : "rgba(200,169,110,0.4)"}`,
              borderRadius: 2, cursor: "pointer", transition: "all 0.3s",
              color: added ? "#080808" : "#C8A96E",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem",
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              padding: "13px",
            }}>
            {added ? "✓ Added" : tx.add}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COLLECTION SECTION ───────────────────────────────────────────────────────
function Collection({ lang }: { lang: Lang }) {
  const [qv, setQV] = useState<Product | null>(null);
  const tx = T[lang];
  return (
    <section id="collection" style={{ padding: "clamp(4rem,10vh,7rem) clamp(1.5rem,5vw,4rem)" }}>
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem",
          letterSpacing: "0.22em", textTransform: "uppercase" as const,
          color: "rgba(200,169,110,0.7)", marginBottom: "0.8rem",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(200,169,110,0.5)" }} />
          {tx.nav_col}
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, color: "#f5f0e8", marginBottom: 8,
        }}>{tx.sec_col}</h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
          color: "rgba(245,240,232,0.38)", letterSpacing: "0.04em",
        }}>{tx.sec_sub}</p>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
        gap: "1.5rem",
      }}>
        {PRODUCTS.map(p => <ProductCard key={p.id} p={p} lang={lang} onView={setQV} />)}
      </div>
      <QVModal p={qv} lang={lang} onClose={() => setQV(null)} />
    </section>
  );
}

// ─── PHILOSOPHY ───────────────────────────────────────────────────────────────
function Philosophy({ lang }: { lang: Lang }) {
  const tx = T[lang];
  return (
    <section id="philosophy" style={{
      padding: "clamp(4rem,10vh,7rem) clamp(1.5rem,5vw,4rem)",
      borderTop: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1.2fr 1fr",
        gap: "clamp(2rem,6vw,6rem)", alignItems: "center",
      }}>
        <div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem",
            letterSpacing: "0.22em", textTransform: "uppercase" as const,
            color: "rgba(200,169,110,0.7)", marginBottom: "1rem",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(200,169,110,0.5)" }} />
            {tx.phi_tag}
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.8rem,3.5vw,2.9rem)", fontWeight: 300,
            color: "#f5f0e8", marginBottom: "1.5rem", lineHeight: 1.22,
          }}>{tx.phi_h}</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
            color: "rgba(245,240,232,0.5)", lineHeight: 1.82, marginBottom: "1.2rem",
          }}>{tx.phi_p1}</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
            color: "rgba(245,240,232,0.4)", lineHeight: 1.82,
          }}>{tx.phi_p2}</p>
        </div>
        {/* Stats + ambient image */}
        <div>
          {/* Small lamp image accent */}
          <div style={{
            position: "relative", height: 220, borderRadius: 4,
            overflow: "hidden", marginBottom: "1.5rem",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <Image src="/images/aura.jpg" alt="AURA lamp detail" fill
              style={{ objectFit: "cover", filter: "brightness(0.7) saturate(0.9)" }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.6) 100%)",
            }} />
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem",
          }}>
            {([[tx.s1,tx.s1l],[tx.s2,tx.s2l],[tx.s3,tx.s3l]] as [string,string][]).map(([val,label],i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4, padding: "1.5rem 1rem", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "2rem", fontWeight: 300, color: "#C8A96E", marginBottom: 4,
                }}>{val}</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem",
                  letterSpacing: "0.14em", textTransform: "uppercase" as const,
                  color: "rgba(245,240,232,0.35)",
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, lang, onCheckout }: {
  open: boolean; onClose(): void; lang: Lang; onCheckout(): void;
}) {
  const { items, removeItem, updateQty, total } = useContext(CC);
  const tx = T[lang];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, zIndex: 150,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
          animation: "fadeIn 0.25s ease",
        }} />
      )}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px,100vw)", background: "#0e0e0e",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        zIndex: 160, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open ? "-24px 0 64px rgba(0,0,0,0.5)" : "none",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.5rem 1.8rem", display: "flex",
          justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.3rem", fontWeight: 400, color: "#f5f0e8", letterSpacing: "0.06em",
          }}>{tx.cart_t}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.35)", transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f5f0e8"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.length === 0 ? (
            <div style={{
              padding: "4rem 1.8rem", textAlign: "center",
              color: "rgba(245,240,232,0.28)",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
              letterSpacing: "0.06em",
            }}>{tx.cart_empty}</div>
          ) : items.map(item => {
            const n = lang === "DE" ? item.product.nameDe : item.product.nameEn;
            return (
              <div key={item.product.id} style={{
                padding: "1.1rem 1.8rem",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                display: "flex", gap: "1rem", alignItems: "center",
              }}>
                {/* Thumb */}
                <div style={{
                  width: 64, height: 64, flexShrink: 0,
                  position: "relative", borderRadius: 3, overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: item.product.baseColor,
                }}>
                  <Image src={item.product.image} alt={n} fill
                    style={{ objectFit: "cover", filter: "brightness(0.85)" }} />
                </div>
                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1rem", color: "#f5f0e8", marginBottom: 2,
                  }}>{n}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.74rem",
                    color: "rgba(245,240,232,0.4)",
                  }}>{chf(item.product.price)}</div>
                </div>
                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[[-1, <Minus key="m" size={10} />],[1, <Plus key="p" size={10} />]].map(([d, icon]) => (
                    <button key={String(d)} onClick={() => updateQty(item.product.id, d as number)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 2, width: 26, height: 26, cursor: "pointer",
                        color: "rgba(255,255,255,0.6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{icon}</button>
                  )).filter((_, i) => i === (d => d < 0 ? 0 : 1)(0))}
                  <button onClick={() => updateQty(item.product.id, -1)} style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2, width: 26, height: 26, cursor: "pointer",
                    color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Minus size={10} /></button>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                    color: "#f5f0e8", minWidth: 16, textAlign: "center",
                  }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2, width: 26, height: 26, cursor: "pointer",
                    color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Plus size={10} /></button>
                </div>
                <button onClick={() => removeItem(item.product.id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.18)", transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ff6b6b"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.18)"}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: "1.5rem 1.8rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {[[tx.cart_sub, chf(total)],[tx.cart_ship, tx.cart_free]].map(([l,v]) => (
              <div key={l} style={{
                display: "flex", justifyContent: "space-between",
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.76rem",
                color: "rgba(245,240,232,0.4)", marginBottom: "0.6rem",
              }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.1rem", color: "#f5f0e8",
              paddingTop: "0.8rem", marginBottom: "1.4rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span>{tx.cart_tot}</span>
              <span style={{ color: "#C8A96E" }}>{chf(total)}</span>
            </div>
            <button onClick={onCheckout} style={{
              width: "100%", background: "#C8A96E", border: "none", borderRadius: 2,
              color: "#080808", fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem",
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              padding: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#b89558"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#C8A96E"}>
              {tx.cart_go} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
function Checkout({ lang, onBack }: { lang: Lang; onBack(): void }) {
  const { items, total } = useContext(CC);
  const tx = T[lang];
  const [form, setForm] = useState({ name: "", email: "", addr: "", city: "" });

  const Field = ({ label, k, type = "text" }: { label: string; k: keyof typeof form; type?: string }) => (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={{
        display: "block", fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.6rem", letterSpacing: "0.14em",
        textTransform: "uppercase" as const, color: "rgba(245,240,232,0.4)",
        marginBottom: 6,
      }}>{label}</label>
      <input type={type} value={form[k]}
        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
        style={{
          width: "100%", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
          color: "#f5f0e8", fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.88rem", padding: "11px 14px", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(200,169,110,0.5)"}
        onBlur={e => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", paddingTop: 100,
      padding: "100px clamp(1.5rem,5vw,4rem) clamp(3rem,6vh,4rem)",
    }}>
      <div style={{
        width: "100%", maxWidth: 880,
        display: "grid", gridTemplateColumns: "1fr 320px", gap: "3rem",
        alignItems: "start",
      }}>
        {/* Form */}
        <div>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(200,169,110,0.7)", fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.7rem", letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            display: "flex", alignItems: "center", gap: 6,
            marginBottom: "2rem", padding: 0, transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#C8A96E"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(200,169,110,0.7)"}>
            ← {tx.chk_back}
          </button>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "2.1rem", fontWeight: 300, color: "#f5f0e8", marginBottom: 6,
          }}>{tx.chk_t}</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
            color: "rgba(245,240,232,0.32)", marginBottom: "2.5rem",
          }}>{tx.chk_sub}</p>
          <Field label={tx.chk_name} k="name" />
          <Field label={tx.chk_mail} k="email" type="email" />
          <Field label={tx.chk_addr} k="addr" />
          <Field label={tx.chk_city} k="city" />
          <div style={{
            background: "rgba(200,169,110,0.06)",
            border: "1px solid rgba(200,169,110,0.18)",
            borderRadius: 3, padding: "10px 16px", marginBottom: "1.5rem",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem",
            color: "rgba(200,169,110,0.65)",
            display: "flex", alignItems: "center", gap: 8,
          }}>◈ {tx.chk_mock}</div>
          <button style={{
            width: "100%", background: "#C8A96E", border: "none", borderRadius: 2,
            color: "#080808", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem",
            letterSpacing: "0.14em", textTransform: "uppercase" as const,
            padding: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {tx.chk_btn} <ArrowRight size={14} />
          </button>
        </div>
        {/* Order summary */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4, padding: "1.8rem",
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem",
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            color: "rgba(245,240,232,0.35)", marginBottom: "1.2rem",
          }}>{tx.cart_t}</div>
          {items.map(item => (
            <div key={item.product.id} style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: "0.75rem",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
            }}>
              <span style={{ color: "rgba(245,240,232,0.55)" }}>
                {lang === "DE" ? item.product.nameDe : item.product.nameEn}{" "}
                <span style={{ color: "rgba(245,240,232,0.28)" }}>×{item.quantity}</span>
              </span>
              <span style={{ color: "#f5f0e8" }}>{chf(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "1rem", marginTop: "0.5rem",
            display: "flex", justifyContent: "space-between",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.1rem", color: "#f5f0e8",
          }}>
            <span>{tx.cart_tot}</span>
            <span style={{ color: "#C8A96E" }}>{chf(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ lang }: { lang: Lang }) {
  const tx = T[lang];
  const [email, setEmail] = useState("");

  return (
    <footer id="contact" style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "clamp(3rem,8vh,5rem) clamp(1.5rem,5vw,4rem) 2rem",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
        gap: "3rem", marginBottom: "3.5rem",
      }}>
        {/* Brand */}
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.15rem", fontWeight: 500, letterSpacing: "0.16em",
            color: "#f5f0e8", marginBottom: "0.8rem",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <span style={{ color: "#C8A96E" }}>✦</span> AER LIGHTS
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.95rem", fontStyle: "italic",
            color: "rgba(245,240,232,0.3)", lineHeight: 1.65,
          }}>{tx.f_tag}</p>
        </div>

        {/* Legal */}
        <div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem",
            letterSpacing: "0.2em", textTransform: "uppercase" as const,
            color: "rgba(245,240,232,0.28)", marginBottom: "1rem",
          }}>Legal</div>
          {[tx.f_imp, tx.f_prv, tx.f_shp].map(l => (
            <div key={l} style={{ marginBottom: "0.5rem" }}>
              <a href="#" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
                color: "rgba(245,240,232,0.38)", textDecoration: "none", transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "#C8A96E"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(245,240,232,0.38)"}>{l}</a>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ gridColumn: "span 2" }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.45rem", fontWeight: 300, color: "#f5f0e8", marginBottom: 4,
          }}>{tx.nl_h}</div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
            color: "rgba(245,240,232,0.38)", marginBottom: "1.2rem",
          }}>{tx.nl_sub}</p>
          <div style={{ display: "flex" }}>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={tx.nl_ph}
              style={{
                flex: 1, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)", borderRight: "none",
                borderRadius: "2px 0 0 2px", color: "#f5f0e8",
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                padding: "11px 14px", outline: "none",
              }} />
            <button style={{
              background: "#C8A96E", border: "none",
              borderRadius: "0 2px 2px 0", color: "#080808",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
              letterSpacing: "0.12em", textTransform: "uppercase" as const,
              padding: "11px 20px", cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {tx.nl_btn} <Mail size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
      }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
          color: "rgba(245,240,232,0.22)",
        }}>{tx.f_copy}</span>
        <a href="https://vodnik.ch" target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
            color: "rgba(245,240,232,0.22)", textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#C8A96E"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(245,240,232,0.22)"}>
          {tx.f_dev}
        </a>
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AerLightsPage() {
  const [lang, setLang]       = useState<Lang>("DE");
  const [cartOpen, setCart]   = useState(false);
  const [checkout, setChk]    = useState(false);

  return (
    <CartProvider>
      <div style={{ background: "#080808", minHeight: "100vh" }}>
        <Nav lang={lang} setLang={setLang} onCart={() => setCart(true)} />

        {checkout ? (
          <Checkout lang={lang} onBack={() => { setChk(false); setCart(true); }} />
        ) : (
          <>
            <Hero lang={lang} />
            <Collection lang={lang} />
            <Philosophy lang={lang} />
            <Footer lang={lang} />
          </>
        )}

        <CartDrawer
          open={cartOpen} onClose={() => setCart(false)} lang={lang}
          onCheckout={() => { setCart(false); setChk(true); }}
        />
      </div>
    </CartProvider>
  );
}
