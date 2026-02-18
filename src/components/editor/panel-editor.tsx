// src/components/editor/panel-editor.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useI18n, LanguageSelector } from "@/components/i18n-context";
const FONT_LIST = [
  // Sans-serif
  { name: 'Inter', family: 'Inter, sans-serif', category: 'Sans' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'Sans' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Sans' },
  { name: 'Poppins', family: 'Poppins, sans-serif', category: 'Sans' },
  { name: 'Nunito', family: 'Nunito, sans-serif', category: 'Sans' },
  { name: 'Oswald', family: 'Oswald, sans-serif', category: 'Sans' },
  // Serif
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif' },
  { name: 'Merriweather', family: 'Merriweather, serif', category: 'Serif' },
  { name: 'Lora', family: 'Lora, serif', category: 'Serif' },
  { name: 'EB Garamond', family: "'EB Garamond', serif", category: 'Serif' },
  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'Serif' },
  // Display
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'Display' },
  { name: 'Archivo Black', family: "'Archivo Black', sans-serif", category: 'Display' },
  { name: 'Raleway', family: 'Raleway, sans-serif', category: 'Display' },
  // Handwriting
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Script' },
  { name: 'Pacifico', family: 'Pacifico, cursive', category: 'Script' },
  { name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'Script' },
  { name: 'Caveat', family: 'Caveat, cursive', category: 'Script' },
  // Korean
  { name: 'Noto Sans KR', family: "'Noto Sans KR', sans-serif", category: 'Korean' },
  { name: 'Noto Serif KR', family: "'Noto Serif KR', serif", category: 'Korean' },
  { name: 'Black Han Sans', family: "'Black Han Sans', sans-serif", category: 'Korean' },
  { name: 'Jua', family: 'Jua, sans-serif', category: 'Korean' },
  { name: 'Nanum Gothic', family: "'Nanum Gothic', sans-serif", category: 'Korean' },
  { name: 'Nanum Myeongjo', family: "'Nanum Myeongjo', serif", category: 'Korean' },
  { name: 'Do Hyeon', family: "'Do Hyeon', sans-serif", category: 'Korean' },
  { name: 'Gamja Flower', family: "'Gamja Flower', cursive", category: 'Korean' },
  { name: 'Gothic A1', family: "'Gothic A1', sans-serif", category: 'Korean' },
  // System fallbacks
  { name: 'Arial', family: 'Arial, sans-serif', category: 'System' },
  { name: 'Georgia', family: 'Georgia, serif', category: 'System' },
  { name: 'Times New Roman', family: "'Times New Roman', serif", category: 'System' },
];
interface PanelEditorProps {
  panelId: string;
  panelName: string;
  widthMM: number;
  heightMM: number;
  guideText: string;
  savedJSON: string | null;
  onSave: (panelId: string, json: string, thumbnail: string) => void;
  onBack: () => void;
  onNextPanel?: () => void;
  onPrevPanel?: () => void;
}

/* ─── 디자인 템플릿 데이터 ─── */
interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  preview: string; // CSS gradient/color for thumbnail
  objects: (canvas: any, w: number, h: number) => Promise<any[]>;
}

function getTemplates(): DesignTemplate[] {
  return [
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      category: 'Modern',
      preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#1a1a2e', selectable: false, evented: false });
        const line = new F.Rect({ left: w * 0.1, top: h * 0.45, originX: 'left', originY: 'top', width: w * 0.8, height: 2, fill: '#e2b04a' });
        const brand = new F.IText('BRAND NAME', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#e2b04a', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const product = new F.IText('Product Title', { left: w / 2, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
        const sub = new F.IText('Premium Quality · Net Wt. 100g', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#888888', fontFamily: 'Arial, sans-serif' });
        return [bg, line, brand, product, sub];
      },
    },
    {
      id: 'clean-white',
      name: 'Clean White',
      category: 'Modern',
      preview: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#ffffff', selectable: false, evented: false });
        const accent = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.05, fill: '#2563EB' });
        const brand = new F.IText('Brand', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#2563EB', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textTransform: 'uppercase' });
        const product = new F.IText('Product Name', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#111111', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const desc = new F.IText('Short description here', { left: w / 2, top: h * 0.56, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#666666', fontFamily: 'Arial, sans-serif' });
        const weight = new F.IText('250g', { left: w / 2, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#999999', fontFamily: 'Arial, sans-serif' });
        return [bg, accent, brand, product, desc, weight];
      },
    },
    {
      id: 'kraft-natural',
      name: 'Kraft Natural',
      category: 'Organic',
      preview: 'linear-gradient(135deg, #c9a96e 0%, #b8860b 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#d4a857', selectable: false, evented: false });
        const circle = new F.Circle({ left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', radius: Math.min(w, h) * 0.15, fill: 'transparent', stroke: '#5a3e1b', strokeWidth: 2 });
        const brand = new F.IText('ORGANIC', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#5a3e1b', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const product = new F.IText('Product Name', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#3d2b1f', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const sub = new F.IText('100% Natural · Handcrafted', { left: w / 2, top: h * 0.72, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#5a3e1b', fontFamily: 'Arial, sans-serif' });
        return [bg, circle, brand, product, sub];
      },
    },
    {
      id: 'vibrant-gradient',
      name: 'Vibrant Pop',
      category: 'Bold',
      preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#ff6b6b', selectable: false, evented: false });
        const stripe = new F.Rect({ left: 0, top: h * 0.4, originX: 'left', originY: 'top', width: w, height: h * 0.25, fill: '#feca57' });
        const brand = new F.IText('BRAND', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('PRODUCT', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#ff6b6b', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const tag = new F.IText('NEW!', { left: w * 0.8, top: h * 0.1, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const desc = new F.IText('Delicious Flavor · 150ml', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
        return [bg, stripe, brand, product, tag, desc];
      },
    },
    {
      id: 'pastel-soft',
      name: 'Pastel Soft',
      category: 'Beauty',
      preview: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fce4ec', selectable: false, evented: false });
        const topRect = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.03, fill: '#ec407a' });
        const brand = new F.IText('Beauté', { left: w / 2, top: h * 0.22, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#c2185b', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const line = new F.Rect({ left: w * 0.3, top: h * 0.33, originX: 'left', originY: 'top', width: w * 0.4, height: 1, fill: '#ec407a' });
        const product = new F.IText('Rose Facial Cream', { left: w / 2, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#4a148c', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Hydrating · Anti-Aging · 50ml', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#9c27b0', fontFamily: 'Arial, sans-serif' });
        const circle = new F.Circle({ left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', radius: Math.min(w, h) * 0.08, fill: 'transparent', stroke: '#ec407a', strokeWidth: 1 });
        const eco = new F.IText('♡', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#ec407a' });
        return [bg, topRect, brand, line, product, desc, circle, eco];
      },
    },
    {
      id: 'green-eco',
      name: 'Eco Green',
      category: 'Organic',
      preview: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e8f5e9', selectable: false, evented: false });
        const leaf = new F.IText('🌿', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const brand = new F.IText('ECO PURE', { left: w / 2, top: h * 0.38, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#2e7d32', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Green Tea Extract', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#1b5e20', fontFamily: 'Georgia, serif' });
        const badge = new F.IText('100% ORGANIC', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#388e3c', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const sub = new F.IText('Sustainably Sourced · 200g', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#66bb6a', fontFamily: 'Arial, sans-serif' });
        return [bg, leaf, brand, product, badge, sub];
      },
    },
    {
      id: 'luxury-black-gold',
      name: 'Black & Gold',
      category: 'Luxury',
      preview: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#0a0a0a', selectable: false, evented: false });
        const topLine = new F.Rect({ left: w * 0.15, top: h * 0.12, originX: 'left', originY: 'top', width: w * 0.7, height: 1.5, fill: '#c8a84e' });
        const brand = new F.IText('LUXURIA', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#c8a84e', fontFamily: 'Georgia, serif', fontWeight: 'bold', charSpacing: 400 });
        const midLine = new F.Rect({ left: w * 0.15, top: h * 0.38, originX: 'left', originY: 'top', width: w * 0.7, height: 1, fill: '#c8a84e' });
        const product = new F.IText('Premium Collection', { left: w / 2, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.045), fill: '#ffffff', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const desc = new F.IText('Crafted with Excellence', { left: w / 2, top: h * 0.63, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#888888', fontFamily: 'Arial, sans-serif' });
        const botLine = new F.Rect({ left: w * 0.15, top: h * 0.88, originX: 'left', originY: 'top', width: w * 0.7, height: 1.5, fill: '#c8a84e' });
        return [bg, topLine, brand, midLine, product, desc, botLine];
      },
    },
    {
      id: 'kids-fun',
      name: 'Kids Fun',
      category: 'Kids',
      preview: 'linear-gradient(135deg, #42a5f5 0%, #66bb6a 50%, #ffa726 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#42a5f5', selectable: false, evented: false });
        const wave = new F.Rect({ left: 0, top: h * 0.6, originX: 'left', originY: 'top', width: w, height: h * 0.4, fill: '#66bb6a' });
        const star1 = new F.IText('⭐', { left: w * 0.15, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
        const star2 = new F.IText('⭐', { left: w * 0.85, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const product = new F.IText('YUMMY\nSNACKS', { left: w / 2, top: h * 0.38, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textAlign: 'center' });
        const flavor = new F.IText('Strawberry Flavor!', { left: w / 2, top: h * 0.7, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#fff176', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const weight = new F.IText('100g · Fun Size', { left: w / 2, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
        return [bg, wave, star1, star2, product, flavor, weight];
      },
    },
    {
      id: 'coffee-rustic',
      name: 'Coffee Rustic',
      category: 'Food',
      preview: 'linear-gradient(135deg, #3e2723 0%, #5d4037 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#3e2723', selectable: false, evented: false });
        const icon = new F.IText('☕', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const brand = new F.IText('ARTISAN', { left: w / 2, top: h * 0.38, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#d7ccc8', fontFamily: 'Georgia, serif', fontWeight: 'bold', charSpacing: 300 });
        const product = new F.IText('Single Origin\nColombia', { left: w / 2, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#bcaaa4', fontFamily: 'Georgia, serif', textAlign: 'center' });
        const line = new F.Rect({ left: w * 0.2, top: h * 0.68, originX: 'left', originY: 'top', width: w * 0.6, height: 1, fill: '#8d6e63' });
        const desc = new F.IText('Dark Roast · 250g · Whole Bean', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
        return [bg, icon, brand, product, line, desc];
      },
    },
    {
      id: 'tech-minimal',
      name: 'Tech Minimal',
      category: 'Modern',
      preview: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      objects: async (F, w, h) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fafafa', selectable: false, evented: false });
        const strip = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: 4, height: h, fill: '#1976d2' });
        const brand = new F.IText('techBrand', { left: w * 0.12, top: h * 0.12, originX: 'left', originY: 'top', fontSize: Math.round(w * 0.04), fill: '#1976d2', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Smart Device\nPro Max', { left: w * 0.12, top: h * 0.35, originX: 'left', originY: 'top', fontSize: Math.round(w * 0.08), fill: '#212121', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', lineHeight: 1.1 });
        const spec = new F.IText('Model X-100 | 2024', { left: w * 0.12, top: h * 0.62, originX: 'left', originY: 'top', fontSize: Math.round(w * 0.03), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        const bar = new F.Rect({ left: w * 0.12, top: h * 0.72, originX: 'left', originY: 'top', width: w * 0.3, height: 2, fill: '#1976d2' });
        return [bg, strip, brand, product, spec, bar];
      },
    },
        // ── 추가 템플릿 시작 ──
        {
          id: 'japanese-minimal',
          name: 'Japanese Zen',
          category: 'Modern',
          preview: 'linear-gradient(135deg, #f5f0eb 0%, #e8e0d5 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f5f0eb', selectable: false, evented: false });
            const line1 = new F.Rect({ left: w * 0.1, top: h * 0.3, originX: 'left', originY: 'top', width: w * 0.8, height: 0.5, fill: '#c4b5a0' });
            const brand = new F.IText('和', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12), fill: '#8b7355', fontFamily: 'Georgia, serif' });
            const product = new F.IText('Matcha\nPremium', { left: w / 2, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#5a4a3a', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.3 });
            const sub = new F.IText('Kyoto · Since 1890', { left: w / 2, top: h * 0.72, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a09080', fontFamily: 'Arial, sans-serif' });
            const line2 = new F.Rect({ left: w * 0.1, top: h * 0.65, originX: 'left', originY: 'top', width: w * 0.8, height: 0.5, fill: '#c4b5a0' });
            return [bg, line1, brand, product, line2, sub];
          },
        },
        {
          id: 'neon-glow',
          name: 'Neon Glow',
          category: 'Bold',
          preview: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#0f0c29', selectable: false, evented: false });
            const glow1 = new F.Rect({ left: 0, top: h * 0.45, originX: 'left', originY: 'top', width: w, height: h * 0.003, fill: '#00f5ff' });
            const glow2 = new F.Rect({ left: 0, top: h * 0.55, originX: 'left', originY: 'top', width: w, height: h * 0.003, fill: '#ff00e4' });
            const brand = new F.IText('NEON', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12), fill: '#00f5ff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 600 });
            const product = new F.IText('Energy Drink', { left: w / 2, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#ff00e4', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const sub = new F.IText('500ml · Zero Sugar', { left: w / 2, top: h * 0.8, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#6666aa', fontFamily: 'Arial, sans-serif' });
            return [bg, glow1, glow2, brand, product, sub];
          },
        },
        {
          id: 'retro-vintage',
          name: 'Retro Vintage',
          category: 'Bold',
          preview: 'linear-gradient(135deg, #f4e4bc 0%, #e8c87e 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f4e4bc', selectable: false, evented: false });
            const border = new F.Rect({ left: w * 0.05, top: h * 0.05, originX: 'left', originY: 'top', width: w * 0.9, height: h * 0.9, fill: 'transparent', stroke: '#8b6914', strokeWidth: 2 });
            const border2 = new F.Rect({ left: w * 0.08, top: h * 0.08, originX: 'left', originY: 'top', width: w * 0.84, height: h * 0.84, fill: 'transparent', stroke: '#8b6914', strokeWidth: 1 });
            const est = new F.IText('— EST. 1965 —', { left: w / 2, top: h * 0.18, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#8b6914', fontFamily: 'Arial, sans-serif', charSpacing: 300 });
            const brand = new F.IText('HERITAGE', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#5a3e0a', fontFamily: 'Georgia, serif', fontWeight: 'bold', charSpacing: 200 });
            const line = new F.Rect({ left: w * 0.2, top: h * 0.45, originX: 'left', originY: 'top', width: w * 0.6, height: 1.5, fill: '#8b6914' });
            const product = new F.IText('Artisan Cookies', { left: w / 2, top: h * 0.56, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#6b4e14', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            const desc = new F.IText('Hand-baked · All Natural · 200g', { left: w / 2, top: h * 0.72, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#8b7744', fontFamily: 'Arial, sans-serif' });
            return [bg, border, border2, est, brand, line, product, desc];
          },
        },
        {
          id: 'floral-elegant',
          name: 'Floral Elegant',
          category: 'Beauty',
          preview: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e6 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff5f5', selectable: false, evented: false });
            const flower1 = new F.IText('🌸', { left: w * 0.15, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
            const flower2 = new F.IText('🌺', { left: w * 0.85, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
            const flower3 = new F.IText('🌷', { left: w * 0.12, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
            const brand = new F.IText('Rosé', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#d4536a', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            const line = new F.Rect({ left: w * 0.25, top: h * 0.4, originX: 'left', originY: 'top', width: w * 0.5, height: 1, fill: '#e8a0b0' });
            const product = new F.IText('Petal Perfume', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#9c3050', fontFamily: 'Georgia, serif' });
            const desc = new F.IText('Eau de Parfum · 30ml', { left: w / 2, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#c07088', fontFamily: 'Arial, sans-serif' });
            return [bg, flower1, flower2, flower3, brand, line, product, desc];
          },
        },
        {
          id: 'midnight-blue',
          name: 'Midnight Blue',
          category: 'Luxury',
          preview: 'linear-gradient(135deg, #0c1445 0%, #1a237e 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#0c1445', selectable: false, evented: false });
            const star = new F.IText('✧', { left: w / 2, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#b8a04e' });
            const brand = new F.IText('ROYAL', { left: w / 2, top: h * 0.32, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#c8a84e', fontFamily: 'Georgia, serif', fontWeight: 'bold', charSpacing: 500 });
            const line1 = new F.Rect({ left: w * 0.15, top: h * 0.42, originX: 'left', originY: 'top', width: w * 0.3, height: 1, fill: '#4a5090' });
            const diamond = new F.IText('◇', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.02), fill: '#c8a84e' });
            const line2 = new F.Rect({ left: w * 0.55, top: h * 0.42, originX: 'left', originY: 'top', width: w * 0.3, height: 1, fill: '#4a5090' });
            const product = new F.IText('Reserve Whisky', { left: w / 2, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.045), fill: '#e0d0a0', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            const age = new F.IText('Aged 18 Years', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#8090c0', fontFamily: 'Arial, sans-serif' });
            const vol = new F.IText('700ml · 43% ABV', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#5a6090', fontFamily: 'Arial, sans-serif' });
            return [bg, star, brand, line1, diamond, line2, product, age, vol];
          },
        },
        {
          id: 'candy-pop',
          name: 'Candy Pop',
          category: 'Kids',
          preview: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fbc2eb 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff0f5', selectable: false, evented: false });
            const stripe1 = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.15, fill: '#ff9a9e' });
            const stripe2 = new F.Rect({ left: 0, top: h * 0.85, originX: 'left', originY: 'top', width: w, height: h * 0.15, fill: '#fbc2eb' });
            const candy1 = new F.IText('🍬', { left: w * 0.15, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
            const candy2 = new F.IText('🍭', { left: w * 0.85, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
            const brand = new F.IText('SWEET!', { left: w / 2, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#ff6b8a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const product = new F.IText('Gummy Bears', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#e04070', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const desc = new F.IText('Mixed Fruit · 150g', { left: w / 2, top: h * 0.72, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#c06080', fontFamily: 'Arial, sans-serif' });
            return [bg, stripe1, stripe2, candy1, candy2, brand, product, desc];
          },
        },
        {
          id: 'health-wellness',
          name: 'Health Vita',
          category: 'Organic',
          preview: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e0f7fa', selectable: false, evented: false });
            const circle = new F.Circle({ left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', radius: Math.min(w, h) * 0.12, fill: '#ffffff', stroke: '#00897b', strokeWidth: 2 });
            const icon = new F.IText('✦', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#00897b' });
            const brand = new F.IText('VITAPLUS', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#00695c', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 200 });
            const product = new F.IText('Daily Multivitamin', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#00897b', fontFamily: 'Georgia, serif' });
            const badge = new F.IText('60 Capsules · Plant Based', { left: w / 2, top: h * 0.73, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#4db6ac', fontFamily: 'Arial, sans-serif' });
            const bottom = new F.Rect({ left: 0, top: h * 0.9, originX: 'left', originY: 'top', width: w, height: h * 0.1, fill: '#00897b' });
            const cert = new F.IText('FDA Approved · GMP Certified', { left: w / 2, top: h * 0.95, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.02), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
            return [bg, circle, icon, brand, product, badge, bottom, cert];
          },
        },
        {
          id: 'wine-label',
          name: 'Wine Classic',
          category: 'Luxury',
          preview: 'linear-gradient(135deg, #4a0e0e 0%, #722f37 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#4a0e0e', selectable: false, evented: false });
            const cream = new F.Rect({ left: w * 0.1, top: h * 0.1, originX: 'left', originY: 'top', width: w * 0.8, height: h * 0.8, fill: '#faf3e6' });
            const topLine = new F.Rect({ left: w * 0.15, top: h * 0.18, originX: 'left', originY: 'top', width: w * 0.7, height: 1, fill: '#8b6914' });
            const year = new F.IText('2019', { left: w / 2, top: h * 0.27, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#8b6914', fontFamily: 'Georgia, serif', charSpacing: 400 });
            const brand = new F.IText('Château\nMontclair', { left: w / 2, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#4a0e0e', fontFamily: 'Georgia, serif', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 });
            const botLine = new F.Rect({ left: w * 0.15, top: h * 0.6, originX: 'left', originY: 'top', width: w * 0.7, height: 1, fill: '#8b6914' });
            const region = new F.IText('Bordeaux · France', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#6b5040', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            const vol = new F.IText('750ml · 13.5% Vol.', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#999', fontFamily: 'Arial, sans-serif' });
            return [bg, cream, topLine, year, brand, botLine, region, vol];
          },
        },
        {
          id: 'sport-energy',
          name: 'Sport Energy',
          category: 'Bold',
          preview: 'linear-gradient(135deg, #1a1a1a 0%, #e53935 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#1a1a1a', selectable: false, evented: false });
            const slash = new F.Rect({ left: w * 0.6, top: 0, originX: 'left', originY: 'top', width: w * 0.5, height: h, fill: '#e53935', skewX: -15 });
            const brand = new F.IText('POWER', { left: w * 0.08, top: h * 0.2, originX: 'left', originY: 'center', fontSize: Math.round(w * 0.12), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const product = new F.IText('PRO\nWHEY', { left: w * 0.08, top: h * 0.48, originX: 'left', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#e53935', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', lineHeight: 1.1 });
            const flavor = new F.IText('CHOCOLATE', { left: w * 0.08, top: h * 0.7, originX: 'left', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 300 });
            const weight = new F.IText('2.5 KG', { left: w * 0.85, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            return [bg, slash, brand, product, flavor, weight];
          },
        },
        {
          id: 'bakery-warm',
          name: 'Bakery Warm',
          category: 'Food',
          preview: 'linear-gradient(135deg, #f5e6d0 0%, #e8c9a0 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f5e6d0', selectable: false, evented: false });
            const top = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#c4956a' });
            const icon = new F.IText('🥐', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
            const brand = new F.IText('La Boulangerie', { left: w / 2, top: h * 0.38, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#6b4226', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            const line = new F.Rect({ left: w * 0.2, top: h * 0.47, originX: 'left', originY: 'top', width: w * 0.6, height: 1, fill: '#c4956a' });
            const product = new F.IText('Butter Croissants', { left: w / 2, top: h * 0.57, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.045), fill: '#8b5e3c', fontFamily: 'Georgia, serif' });
            const desc = new F.IText('Freshly Baked · Pack of 6', { left: w / 2, top: h * 0.7, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a07850', fontFamily: 'Arial, sans-serif' });
            const badge = new F.IText('✧ Artisan Recipe ✧', { left: w / 2, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#c4956a', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            return [bg, top, icon, brand, line, product, desc, badge];
          },
        },
        {
          id: 'pet-food',
          name: 'Pet Friendly',
          category: 'Kids',
          preview: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff3e0', selectable: false, evented: false });
            const topBar = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.2, fill: '#ff8f00' });
            const paw = new F.IText('🐾', { left: w / 2, top: h * 0.1, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
            const brand = new F.IText('PAWSOME', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#e65100', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const product = new F.IText('Premium Dog Food', { left: w / 2, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.045), fill: '#bf360c', fontFamily: 'Arial, sans-serif' });
            const flavor = new F.IText('Chicken & Rice Formula', { left: w / 2, top: h * 0.63, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#8d6e63', fontFamily: 'Arial, sans-serif' });
            const weight = new F.IText('5 KG · All Breeds', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
            const badge = new F.IText('🐕 Vet Recommended', { left: w / 2, top: h * 0.9, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#ff8f00', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            return [bg, topBar, paw, brand, product, flavor, weight, badge];
          },
        },
        {
          id: 'skincare-clean',
          name: 'Skincare Pure',
          category: 'Beauty',
          preview: 'linear-gradient(135deg, #fafafa 0%, #e8f5e9 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fafafa', selectable: false, evented: false });
            const accent = new F.Rect({ left: w * 0.04, top: h * 0.04, originX: 'left', originY: 'top', width: 3, height: h * 0.92, fill: '#81c784' });
            const brand = new F.IText('PURE', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#2e7d32', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 600 });
            const product = new F.IText('Hyaluronic\nSerum', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#1b5e20', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.3 });
            const line = new F.Rect({ left: w * 0.3, top: h * 0.57, originX: 'left', originY: 'top', width: w * 0.4, height: 1, fill: '#a5d6a7' });
            const desc = new F.IText('Advanced Hydration Complex', { left: w / 2, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#66bb6a', fontFamily: 'Arial, sans-serif' });
            const vol = new F.IText('30ml · Dermatologist Tested', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#a5d6a7', fontFamily: 'Arial, sans-serif' });
            const leaf = new F.IText('🌱', { left: w * 0.85, top: h * 0.9, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04) });
            return [bg, accent, brand, product, line, desc, vol, leaf];
          },
        },
        {
          id: 'bbq-sauce',
          name: 'BBQ Bold',
          category: 'Food',
          preview: 'linear-gradient(135deg, #b71c1c 0%, #ff6f00 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#2a0a00', selectable: false, evented: false });
            const flame = new F.Rect({ left: 0, top: h * 0.7, originX: 'left', originY: 'top', width: w, height: h * 0.3, fill: '#b71c1c' });
            const fire = new F.IText('🔥', { left: w / 2, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
            const brand = new F.IText('SMOKIN\'', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#ff6f00', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const product = new F.IText('BBQ SAUCE', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 200 });
            const flavor = new F.IText('Hickory Smoked · Extra Hot', { left: w / 2, top: h * 0.67, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#ffab40', fontFamily: 'Arial, sans-serif' });
            const vol = new F.IText('350ml', { left: w / 2, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            return [bg, flame, fire, brand, product, flavor, vol];
          },
        },
        {
          id: 'tea-zen',
          name: 'Tea Garden',
          category: 'Organic',
          preview: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f1f8e9', selectable: false, evented: false });
            const icon = new F.IText('🍵', { left: w / 2, top: h * 0.18, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
            const brand = new F.IText('TEA GARDEN', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#33691e', fontFamily: 'Georgia, serif', fontWeight: 'bold', charSpacing: 300 });
            const line1 = new F.Rect({ left: w * 0.15, top: h * 0.43, originX: 'left', originY: 'top', width: w * 0.7, height: 0.5, fill: '#8bc34a' });
            const product = new F.IText('Chamomile\n& Honey', { left: w / 2, top: h * 0.57, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#558b2f', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.3 });
            const desc = new F.IText('Caffeine Free · 20 Tea Bags', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#7cb342', fontFamily: 'Arial, sans-serif' });
            const cert = new F.IText('✧ Organic Certified ✧', { left: w / 2, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.02), fill: '#9ccc65', fontFamily: 'Georgia, serif' });
            return [bg, icon, brand, line1, product, desc, cert];
          },
        },
        {
          id: 'geometric-modern',
          name: 'Geo Modern',
          category: 'Modern',
          preview: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#263238', selectable: false, evented: false });
            const tri1 = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w * 0.4, height: h * 0.4, fill: '#00bcd4' });
            const tri2 = new F.Rect({ left: w * 0.6, top: h * 0.6, originX: 'left', originY: 'top', width: w * 0.4, height: h * 0.4, fill: '#ff5722' });
            const brand = new F.IText('STUDIO', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 400 });
            const product = new F.IText('Design Kit', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#b0bec5', fontFamily: 'Arial, sans-serif' });
            const desc = new F.IText('Premium Tools · Vol. 1', { left: w / 2, top: h * 0.66, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#78909c', fontFamily: 'Arial, sans-serif' });
            return [bg, tri1, tri2, brand, product, desc];
          },
        },
        {
          id: 'honey-natural',
          name: 'Honey Gold',
          category: 'Food',
          preview: 'linear-gradient(135deg, #fff8e1 0%, #ffca28 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff8e1', selectable: false, evented: false });
            const hex = new F.Rect({ left: w * 0.05, top: h * 0.05, originX: 'left', originY: 'top', width: w * 0.9, height: h * 0.9, fill: 'transparent', stroke: '#f9a825', strokeWidth: 2 });
            const icon = new F.IText('🍯', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
            const brand = new F.IText('Golden Hive', { left: w / 2, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#e65100', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
            const product = new F.IText('Raw Manuka Honey', { left: w / 2, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#bf360c', fontFamily: 'Georgia, serif' });
            const rating = new F.IText('UMF 15+ · MGO 514+', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#f57f17', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const weight = new F.IText('250g · New Zealand', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
            return [bg, hex, icon, brand, product, rating, weight];
          },
        },
        {
          id: 'perfume-luxe',
          name: 'Perfume Luxe',
          category: 'Luxury',
          preview: 'linear-gradient(135deg, #1a0033 0%, #4a0066 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#1a0033', selectable: false, evented: false });
            const line1 = new F.Rect({ left: w * 0.1, top: h * 0.15, originX: 'left', originY: 'top', width: w * 0.8, height: 0.5, fill: '#9c27b0' });
            const brand = new F.IText('NOIR', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12), fill: '#ce93d8', fontFamily: 'Georgia, serif', fontWeight: 'bold', charSpacing: 600 });
            const product = new F.IText('Velvet Orchid', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#e1bee7', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
            const line2 = new F.Rect({ left: w * 0.25, top: h * 0.56, originX: 'left', originY: 'top', width: w * 0.5, height: 0.5, fill: '#7b1fa2' });
            const desc = new F.IText('Eau de Parfum', { left: w / 2, top: h * 0.66, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#ba68c8', fontFamily: 'Arial, sans-serif', charSpacing: 400 });
            const vol = new F.IText('100ml', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#9c27b0', fontFamily: 'Arial, sans-serif' });
            const line3 = new F.Rect({ left: w * 0.1, top: h * 0.88, originX: 'left', originY: 'top', width: w * 0.8, height: 0.5, fill: '#9c27b0' });
            return [bg, line1, brand, product, line2, desc, vol, line3];
          },
        },
        {
          id: 'cereal-fun',
          name: 'Cereal Box',
          category: 'Kids',
          preview: 'linear-gradient(135deg, #ffeb3b 0%, #ff9800 100%)',
          objects: async (F: any, w: number, h: number) => {
            const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#ffeb3b', selectable: false, evented: false });
            const burst = new F.IText('💥', { left: w * 0.8, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
            const brand = new F.IText('CRUNCH\nTIME!', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#d32f2f', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.1 });
            const stripe = new F.Rect({ left: 0, top: h * 0.42, originX: 'left', originY: 'top', width: w, height: h * 0.2, fill: '#ff5722' });
            const flavor = new F.IText('🍫 Chocolate Blast!', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            const desc = new F.IText('Whole Grain · Vitamins & Iron', { left: w / 2, top: h * 0.72, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#e65100', fontFamily: 'Arial, sans-serif' });
            const weight = new F.IText('375g · Family Size', { left: w / 2, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#bf360c', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
            return [bg, burst, brand, stripe, flavor, desc, weight];
          },
        },
          // ── Animal 템플릿 시작 ──
    {
      id: 'safari-wild',
      name: 'Safari Wild',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #5d4037 0%, #ff8f00 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f5e6c8', selectable: false, evented: false });
        const topBar = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.12, fill: '#5d4037' });
        const icon = new F.IText('🦁', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const brand = new F.IText('SAFARI', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#5d4037', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 400 });
        const line = new F.Rect({ left: w * 0.2, top: h * 0.57, originX: 'left', originY: 'top', width: w * 0.6, height: 1.5, fill: '#ff8f00' });
        const product = new F.IText('Wild Animal Crackers', { left: w / 2, top: h * 0.66, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#795548', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('All Natural · 200g', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
        const paw = new F.IText('🐾', { left: w * 0.85, top: h * 0.9, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04) });
        return [bg, topBar, icon, brand, line, product, desc, paw];
      },
    },
    {
      id: 'ocean-whale',
      name: 'Ocean Whale',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #01579b 0%, #4fc3f7 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e1f5fe', selectable: false, evented: false });
        const wave = new F.Rect({ left: 0, top: h * 0.65, originX: 'left', originY: 'top', width: w, height: h * 0.35, fill: '#01579b' });
        const icon = new F.IText('🐋', { left: w / 2, top: h * 0.22, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const brand = new F.IText('DEEP BLUE', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#01579b', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 300 });
        const product = new F.IText('Ocean Salt Soap', { left: w / 2, top: h * 0.56, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#0277bd', fontFamily: 'Georgia, serif' });
        const bubble1 = new F.IText('○', { left: w * 0.2, top: h * 0.7, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#4fc3f7' });
        const bubble2 = new F.IText('○', { left: w * 0.75, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.02), fill: '#81d4fa' });
        const desc = new F.IText('100% Natural · Marine Minerals', { left: w / 2, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#b3e5fc', fontFamily: 'Arial, sans-serif' });
        return [bg, wave, icon, brand, product, bubble1, bubble2, desc];
      },
    },
    {
      id: 'panda-cute',
      name: 'Panda Cute',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #212121 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fafafa', selectable: false, evented: false });
        const bottomHalf = new F.Rect({ left: 0, top: h * 0.6, originX: 'left', originY: 'top', width: w, height: h * 0.4, fill: '#212121' });
        const icon = new F.IText('🐼', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.16) });
        const brand = new F.IText('PANDA', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#212121', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Bamboo Cookies', { left: w / 2, top: h * 0.7, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
        const desc = new F.IText('Matcha Cream · 120g', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        const leaf = new F.IText('🎋', { left: w * 0.15, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04) });
        return [bg, bottomHalf, icon, brand, product, desc, leaf];
      },
    },
    {
      id: 'cat-meow',
      name: 'Cat Lover',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fce4ec', selectable: false, evented: false });
        const icon = new F.IText('🐱', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const paw1 = new F.IText('🐾', { left: w * 0.15, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04) });
        const paw2 = new F.IText('🐾', { left: w * 0.85, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035) });
        const brand = new F.IText('MEOW', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#c2185b', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Premium Cat Treats', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#880e4f', fontFamily: 'Georgia, serif' });
        const flavor = new F.IText('Tuna & Salmon Flavor', { left: w / 2, top: h * 0.7, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#ad1457', fontFamily: 'Arial, sans-serif' });
        const heart = new F.IText('♥', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#e91e63' });
        const desc = new F.IText('80g · Grain Free', { left: w / 2, top: h * 0.92, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#f48fb1', fontFamily: 'Arial, sans-serif' });
        return [bg, icon, paw1, paw2, brand, product, flavor, heart, desc];
      },
    },
    {
      id: 'dog-happy',
      name: 'Happy Dog',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e3f2fd', selectable: false, evented: false });
        const topBar = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.08, fill: '#1565c0' });
        const icon = new F.IText('🐕', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const bone = new F.IText('🦴', { left: w * 0.2, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05) });
        const bone2 = new F.IText('🦴', { left: w * 0.8, top: h * 0.18, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04) });
        const brand = new F.IText('GOOD BOY', { left: w / 2, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#1565c0', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Dental Chew Sticks', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#1976d2', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Fresh Breath · 7 Sticks', { left: w / 2, top: h * 0.72, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#42a5f5', fontFamily: 'Arial, sans-serif' });
        const badge = new F.IText('🏆 Vet Approved', { left: w / 2, top: h * 0.86, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#1565c0', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        return [bg, topBar, icon, bone, bone2, brand, product, desc, badge];
      },
    },
    {
      id: 'butterfly-garden',
      name: 'Butterfly',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #e8f5e9 0%, #fff9c4 50%, #f3e5f5 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fafff5', selectable: false, evented: false });
        const b1 = new F.IText('🦋', { left: w * 0.25, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
        const b2 = new F.IText('🦋', { left: w * 0.75, top: h * 0.18, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const b3 = new F.IText('🦋', { left: w * 0.15, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05) });
        const flower = new F.IText('🌼', { left: w * 0.85, top: h * 0.85, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const brand = new F.IText('Papillon', { left: w / 2, top: h * 0.32, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#7b1fa2', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const line = new F.Rect({ left: w * 0.2, top: h * 0.42, originX: 'left', originY: 'top', width: w * 0.6, height: 1, fill: '#ce93d8' });
        const product = new F.IText('Floral Body Lotion', { left: w / 2, top: h * 0.53, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#4a148c', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Lavender & Vanilla · 250ml', { left: w / 2, top: h * 0.66, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#9c27b0', fontFamily: 'Arial, sans-serif' });
        return [bg, b1, b2, b3, flower, brand, line, product, desc];
      },
    },
    {
      id: 'fox-forest',
      name: 'Forest Fox',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #2e3b2e 0%, #e65100 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#2e3b2e', selectable: false, evented: false });
        const icon = new F.IText('🦊', { left: w / 2, top: h * 0.22, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const tree1 = new F.IText('🌲', { left: w * 0.1, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const tree2 = new F.IText('🌲', { left: w * 0.9, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05) });
        const brand = new F.IText('FOXWOOD', { left: w / 2, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ff6d00', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 300 });
        const line = new F.Rect({ left: w * 0.15, top: h * 0.55, originX: 'left', originY: 'top', width: w * 0.7, height: 1, fill: '#ff8f00' });
        const product = new F.IText('Forest Berry Jam', { left: w / 2, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.045), fill: '#ffcc80', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Wild Harvest · 340g', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a5d6a7', fontFamily: 'Arial, sans-serif' });
        const leaf = new F.IText('🍂', { left: w * 0.5, top: h * 0.9, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04) });
        return [bg, icon, tree1, tree2, brand, line, product, desc, leaf];
      },
    },
    {
      id: 'penguin-cool',
      name: 'Penguin Cool',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #1565c0 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e3f2fd', selectable: false, evented: false });
        const ice = new F.Rect({ left: 0, top: h * 0.7, originX: 'left', originY: 'top', width: w, height: h * 0.3, fill: '#bbdefb' });
        const icon = new F.IText('🐧', { left: w / 2, top: h * 0.22, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const snow1 = new F.IText('❄', { left: w * 0.15, top: h * 0.1, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#90caf9' });
        const snow2 = new F.IText('❄', { left: w * 0.85, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#90caf9' });
        const brand = new F.IText('CHILL', { left: w / 2, top: h * 0.44, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#1565c0', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 400 });
        const product = new F.IText('Frozen Yogurt Bites', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#1976d2', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Blueberry · 150g · -18°C', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#42a5f5', fontFamily: 'Arial, sans-serif' });
        const snow3 = new F.IText('❄', { left: w * 0.3, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#64b5f6' });
        return [bg, ice, icon, snow1, snow2, brand, product, desc, snow3];
      },
    },
    {
      id: 'bee-honey',
      name: 'Bee Honey',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #fff8e1 0%, #ffc107 50%, #5d4037 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff8e1', selectable: false, evented: false });
        const stripe1 = new F.Rect({ left: 0, top: h * 0.0, originX: 'left', originY: 'top', width: w, height: h * 0.06, fill: '#ffc107' });
        const stripe2 = new F.Rect({ left: 0, top: h * 0.94, originX: 'left', originY: 'top', width: w, height: h * 0.06, fill: '#5d4037' });
        const icon = new F.IText('🐝', { left: w / 2, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const bee2 = new F.IText('🐝', { left: w * 0.82, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05) });
        const hex = new F.IText('⬡', { left: w * 0.12, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffca28' });
        const brand = new F.IText('BEE PURE', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#5d4037', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 200 });
        const product = new F.IText('Wildflower Honey', { left: w / 2, top: h * 0.57, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.045), fill: '#795548', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Raw · Unfiltered · 500g', { left: w / 2, top: h * 0.7, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
        const badge = new F.IText('🏅 100% Pure', { left: w / 2, top: h * 0.84, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#f9a825', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        return [bg, stripe1, stripe2, icon, bee2, hex, brand, product, desc, badge];
      },
    },
    {
      id: 'tropical-bird',
      name: 'Tropical Bird',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #00c853 0%, #ffeb3b 50%, #ff6d00 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e8f5e9', selectable: false, evented: false });
        const topBar = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.1, fill: '#00c853' });
        const icon = new F.IText('🦜', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.14) });
        const palm = new F.IText('🌴', { left: w * 0.12, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
        const palm2 = new F.IText('🌴', { left: w * 0.88, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const brand = new F.IText('TROPICAL', { left: w / 2, top: h * 0.46, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ff6d00', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 200 });
        const product = new F.IText('Mango Passion\nFruit Juice', { left: w / 2, top: h * 0.62, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#2e7d32', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.3 });
        const desc = new F.IText('100% Natural · No Added Sugar', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.023), fill: '#66bb6a', fontFamily: 'Arial, sans-serif' });
        const vol = new F.IText('1L · Vitamin C Rich', { left: w / 2, top: h * 0.9, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.022), fill: '#a5d6a7', fontFamily: 'Arial, sans-serif' });
        return [bg, topBar, icon, palm, palm2, brand, product, desc, vol];
      },
    },
    // ── Animal 템플릿 끝 ──
    // ── Kids ──
    {
      id: 'kids-playful',
      name: 'Playful Kids',
      category: 'Kids',
      preview: 'linear-gradient(135deg, #42a5f5 0%, #ab47bc 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#42a5f5', selectable: false, evented: false });
        const wave = new F.Rect({ left: 0, top: h * 0.6, originX: 'left', originY: 'top', width: w, height: h * 0.4, fill: '#ab47bc', rx: 30, ry: 30 });
        const star = new F.IText('⭐', { left: w * 0.15, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
        const star2 = new F.IText('⭐', { left: w * 0.85, top: h * 0.08, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
        const brand = new F.IText('FUN SNACKS', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Yummy Cookies', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#fff9c4', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const desc = new F.IText('🍪 Chocolate Chip · 150g', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#ffffff', fontFamily: 'Arial, sans-serif' });
        return [bg, wave, star, star2, brand, product, desc];
      },
    },
    {
      id: 'kids-rainbow',
      name: 'Rainbow Joy',
      category: 'Kids',
      preview: 'linear-gradient(135deg, #ff9800 0%, #f44336 50%, #9c27b0 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff3e0', selectable: false, evented: false });
        const stripe1 = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#f44336' });
        const stripe2 = new F.Rect({ left: 0, top: h * 0.04, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#ff9800' });
        const stripe3 = new F.Rect({ left: 0, top: h * 0.08, originX: 'left', originY: 'top', width: w, height: h * 0.04, fill: '#ffeb3b' });
        const emoji = new F.IText('🌈', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const brand = new F.IText('RAINBOW', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.09), fill: '#e91e63', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Fruit Gummies', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#4a148c', fontFamily: 'Arial, sans-serif' });
        const badge = new F.IText('No Artificial Colors!', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#ff6f00', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        return [bg, stripe1, stripe2, stripe3, emoji, brand, product, badge];
      },
    },
    // ── Food ──
    {
      id: 'food-warm',
      name: 'Warm Bakery',
      category: 'Food',
      preview: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#5d4037', selectable: false, evented: false });
        const banner = new F.Rect({ left: w * 0.08, top: h * 0.15, originX: 'left', originY: 'top', width: w * 0.84, height: h * 0.35, fill: '#f5e6d0', rx: 8, ry: 8 });
        const brand = new F.IText('ARTISAN BAKE', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#3e2723', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const divider = new F.Rect({ left: w * 0.25, top: h * 0.32, originX: 'left', originY: 'top', width: w * 0.5, height: 1.5, fill: '#8d6e63' });
        const product = new F.IText('Sourdough Bread', { left: w / 2, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#5d4037', fontFamily: 'Georgia, serif' });
        const icon = new F.IText('🍞', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
        const weight = new F.IText('Freshly Baked · 500g', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#d7ccc8', fontFamily: 'Arial, sans-serif' });
        return [bg, banner, brand, divider, product, icon, weight];
      },
    },
    {
      id: 'food-fresh',
      name: 'Fresh Market',
      category: 'Food',
      preview: 'linear-gradient(135deg, #ffffff 0%, #c8e6c9 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#ffffff', selectable: false, evented: false });
        const topBar = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.15, fill: '#43a047' });
        const brand = new F.IText('FRESH', { left: w / 2, top: h * 0.075, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Organic Salad Mix', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#2e7d32', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const leaf = new F.IText('🥗', { left: w / 2, top: h * 0.55, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const badge = new F.IText('FARM TO TABLE', { left: w / 2, top: h * 0.73, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.035), fill: '#66bb6a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const weight = new F.IText('Net Wt. 200g · Keep Refrigerated', { left: w / 2, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.025), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        return [bg, topBar, brand, product, leaf, badge, weight];
      },
    },
    // ── Luxury ──
    {
      id: 'luxury-marble',
      name: 'Marble Luxe',
      category: 'Luxury',
      preview: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#f5f5f5', selectable: false, evented: false });
        const goldLine1 = new F.Rect({ left: w * 0.08, top: h * 0.08, originX: 'left', originY: 'top', width: w * 0.84, height: 1, fill: '#c8a84e' });
        const goldLine2 = new F.Rect({ left: w * 0.08, top: h * 0.92, originX: 'left', originY: 'top', width: w * 0.84, height: 1, fill: '#c8a84e' });
        const brand = new F.IText('MAISON', { left: w / 2, top: h * 0.25, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#c8a84e', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 400 });
        const product = new F.IText('Eau de Parfum', { left: w / 2, top: h * 0.42, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#212121', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const vol = new F.IText('50ml · 1.7 fl oz', { left: w / 2, top: h * 0.58, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        const diamond = new F.IText('◇', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#c8a84e' });
        return [bg, goldLine1, goldLine2, brand, product, vol, diamond];
      },
    },
    // ── Beauty ──
    {
      id: 'beauty-floral',
      name: 'Floral Beauty',
      category: 'Beauty',
      preview: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fce4ec', selectable: false, evented: false });
        const flower1 = new F.IText('🌸', { left: w * 0.2, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
        const flower2 = new F.IText('🌺', { left: w * 0.8, top: h * 0.2, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const flower3 = new F.IText('🌷', { left: w * 0.15, top: h * 0.8, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07) });
        const brand = new F.IText('BLOOM', { left: w / 2, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ad1457', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const line = new F.Rect({ left: w * 0.3, top: h * 0.4, originX: 'left', originY: 'top', width: w * 0.4, height: 1, fill: '#e91e63' });
        const product = new F.IText('Body Lotion', { left: w / 2, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#880e4f', fontFamily: 'Georgia, serif', fontStyle: 'italic' });
        const desc = new F.IText('Rose & Jasmine · 200ml', { left: w / 2, top: h * 0.64, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#c2185b', fontFamily: 'Arial, sans-serif' });
        return [bg, flower1, flower2, flower3, brand, line, product, desc];
      },
    },
    // ── Animal ──
    {
      id: 'animal-pet',
      name: 'Pet Care',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff8e1', selectable: false, evented: false });
        const topBand = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h * 0.12, fill: '#f57f17' });
        const paw = new F.IText('🐾', { left: w / 2, top: h * 0.06, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06) });
        const brand = new F.IText('HAPPY PAWS', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.065), fill: '#e65100', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const pet = new F.IText('🐕', { left: w / 2, top: h * 0.48, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.15) });
        const product = new F.IText('Premium Dog Food', { left: w / 2, top: h * 0.68, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#bf360c', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const desc = new F.IText('Chicken & Rice · 2kg', { left: w / 2, top: h * 0.82, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#8d6e63', fontFamily: 'Arial, sans-serif' });
        return [bg, topBand, paw, brand, pet, product, desc];
      },
    },
    {
      id: 'animal-cat',
      name: 'Cat Lover',
      category: 'Animal',
      preview: 'linear-gradient(135deg, #e8eaf6 0%, #9fa8da 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#e8eaf6', selectable: false, evented: false });
        const circle = new F.Circle({ left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', radius: Math.min(w, h) * 0.18, fill: '#ffffff', stroke: '#5c6bc0', strokeWidth: 2 });
        const cat = new F.IText('🐱', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.12) });
        const brand = new F.IText('WHISKERS', { left: w / 2, top: h * 0.62, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#283593', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Gourmet Cat Treats', { left: w / 2, top: h * 0.75, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#5c6bc0', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Salmon Flavor · 100g', { left: w / 2, top: h * 0.87, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#9e9e9e', fontFamily: 'Arial, sans-serif' });
        return [bg, circle, cat, brand, product, desc];
      },
    },
    // ── Modern ──
    {
      id: 'modern-split',
      name: 'Split Modern',
      category: 'Modern',
      preview: 'linear-gradient(135deg, #263238 0%, #263238 50%, #ff7043 50%, #ff7043 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bgLeft = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w / 2, height: h, fill: '#263238', selectable: false, evented: false });
        const bgRight = new F.Rect({ left: w / 2, top: 0, originX: 'left', originY: 'top', width: w / 2, height: h, fill: '#ff7043', selectable: false, evented: false });
        const brand = new F.IText('STUDIO', { left: w * 0.25, top: h * 0.3, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.055), fill: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', charSpacing: 300 });
        const product = new F.IText('Coffee\nBeans', { left: w * 0.75, top: h * 0.4, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.07), fill: '#ffffff', fontFamily: 'Georgia, serif', fontWeight: 'bold', textAlign: 'center' });
        const desc = new F.IText('Single Origin', { left: w * 0.25, top: h * 0.5, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#90a4ae', fontFamily: 'Arial, sans-serif' });
        const weight = new F.IText('250g', { left: w * 0.75, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.04), fill: '#ffccbc', fontFamily: 'Arial, sans-serif' });
        return [bgLeft, bgRight, brand, product, desc, weight];
      },
    },
    // ── Bold ──
    {
      id: 'bold-neon',
      name: 'Neon Bold',
      category: 'Bold',
      preview: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#0a0a1a', selectable: false, evented: false });
        const glow1 = new F.Rect({ left: w * 0.05, top: h * 0.2, originX: 'left', originY: 'top', width: w * 0.9, height: 2, fill: '#00ffff' });
        const glow2 = new F.Rect({ left: w * 0.05, top: h * 0.75, originX: 'left', originY: 'top', width: w * 0.9, height: 2, fill: '#ff00ff' });
        const brand = new F.IText('NEON', { left: w / 2, top: h * 0.35, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1), fill: '#00ffff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const product = new F.IText('Energy Drink', { left: w / 2, top: h * 0.52, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ff00ff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' });
        const desc = new F.IText('ZERO SUGAR · 355ml', { left: w / 2, top: h * 0.65, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.03), fill: '#666688', fontFamily: 'Arial, sans-serif' });
        const bolt = new F.IText('⚡', { left: w / 2, top: h * 0.88, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08) });
        return [bg, glow1, glow2, brand, product, desc, bolt];
      },
    },
    // ── Organic ──
    {
      id: 'organic-honey',
      name: 'Honey Gold',
      category: 'Organic',
      preview: 'linear-gradient(135deg, #fff8e1 0%, #ffca28 100%)',
      objects: async (F: any, w: number, h: number) => {
        const bg = new F.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: w, height: h, fill: '#fff8e1', selectable: false, evented: false });
        const hex = new F.IText('⬡', { left: w * 0.3, top: h * 0.15, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.08), fill: '#ffca28' });
        const hex2 = new F.IText('⬡', { left: w * 0.7, top: h * 0.12, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#ffe082' });
        const bee = new F.IText('🐝', { left: w / 2, top: h * 0.28, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.1) });
        const brand = new F.IText('GOLDEN HIVE', { left: w / 2, top: h * 0.45, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.06), fill: '#f57f17', fontFamily: 'Georgia, serif', fontWeight: 'bold' });
        const product = new F.IText('Raw Honey', { left: w / 2, top: h * 0.6, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.05), fill: '#795548', fontFamily: 'Georgia, serif' });
        const desc = new F.IText('Pure · Unfiltered · 340g', { left: w / 2, top: h * 0.78, originX: 'center', originY: 'center', fontSize: Math.round(w * 0.028), fill: '#a1887f', fontFamily: 'Arial, sans-serif' });
        return [bg, hex, hex2, bee, brand, product, desc];
      },
    },
  ];
}

function ToolButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {

  return (
    <button onClick={onClick} title={label}
      className="w-14 h-14 flex flex-col items-center justify-center rounded-lg text-xs bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 transition-colors">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] mt-1">{label}</span>
    </button>
  );
}

export default function PanelEditor({
  panelId, panelName, widthMM, heightMM, guideText, savedJSON,
  onSave, onBack, onNextPanel, onPrevPanel,
}: PanelEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fcRef = useRef<any>(null);
  const fabricModRef = useRef<any>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(0);
  const loadingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { t } = useI18n();
  const [color, setColor] = useState('#000000');
  const [fSize, setFSize] = useState(24);
  const [selectedFont, setSelectedFont] = useState('Arial, sans-serif');
  const [aiTab, setAiTab] = useState<'templates' | 'copy' | 'review' | 'layers' | 'history'>('templates');
  const [layersList, setLayersList] = useState<{id:string;type:string;name:string;visible:boolean;locked:boolean}[]>([]);
  const [historyThumbs, setHistoryThumbs] = useState<{idx:number;thumb:string;time:string}[]>([]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [exportScale, setExportScale] = useState<number>(2);
  const [zoom, setZoom] = useState(100);
  const zoomRef = useRef(100);
  const [showMinimap, setShowMinimap] = useState(false);
  const isPanningRef = useRef(false);

  // ── Space bar panning handler (capture phase to prevent scroll) ──
  useEffect(() => {
    const handleSpaceDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // Always prevent default to stop browser scroll (even on repeat)
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      // Save scroll position before any changes
      const scrollEl0 = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      const savedScrollLeft = scrollEl0?.scrollLeft || 0;
      const savedScrollTop = scrollEl0?.scrollTop || 0;
      isPanningRef.current = true;
      // Immediate cursor change
      document.body.style.cursor = "grab";
      const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) {
        scrollEl.style.cursor = "grab";
        // Restore scroll position that may have shifted
        requestAnimationFrame(() => {
          if (scrollEl0) {
            scrollEl0.scrollLeft = savedScrollLeft;
            scrollEl0.scrollTop = savedScrollTop;
          }
        });
      }
      const fc = fcRef.current;
      if (fc) {
        fc.defaultCursor = "grab";
        fc.hoverCursor = "grab";
        fc.getObjects().forEach((o: any) => { o.hoverCursor = "grab"; });
        fc.requestRenderAll();
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      // Save scroll position
      const scrollElUp = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      const savedSL = scrollElUp?.scrollLeft || 0;
      const savedST = scrollElUp?.scrollTop || 0;
      isPanningRef.current = false;
      panActiveRef.current = false;
      // Reset cursor
      document.body.style.cursor = "";
      const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) {
        scrollEl.style.cursor = "";
        requestAnimationFrame(() => {
          if (scrollElUp) { scrollElUp.scrollLeft = savedSL; scrollElUp.scrollTop = savedST; }
        });
      }
      const fc = fcRef.current;
      if (fc) {
        fc.defaultCursor = "default";
        fc.hoverCursor = "move";
        fc.getObjects().forEach((o: any) => { o.hoverCursor = "move"; });
        fc.selection = true;
        fc.requestRenderAll();
      }
    };
    // Use CAPTURE phase to intercept before browser scrolls
    document.addEventListener("keydown", handleSpaceDown, true);
    document.addEventListener("keyup", handleSpaceUp, true);
    return () => {
      document.removeEventListener("keydown", handleSpaceDown, true);
      document.removeEventListener("keyup", handleSpaceUp, true);
    };
  }, []);
  const panStartRef = useRef<{x:number;y:number;scrollLeft:number;scrollTop:number}|null>(null);
  const panActiveRef = useRef(false);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const minimapDragging = useRef(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set([]));
  const toggleSection = (id: string) => setOpenSections(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const [ctxMenu, setCtxMenu] = useState<{x:number;y:number;target:any}|null>(null);
  const [textShadowOn, setTextShadowOn] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(5);
  const [shadowOffX, setShadowOffX] = useState(3);
  const [shadowOffY, setShadowOffY] = useState(3);
  const [bgPattern, setBgPattern] = useState<'none'|'dots'|'lines'|'grid'>('none');
  const [customFonts, setCustomFonts] = useState<{name:string;family:string}[]>([]);
  const fontUploadRef = useRef<HTMLInputElement>(null);
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [measureStart, setMeasureStart] = useState<{x:number,y:number}|null>(null);
  const [measureEnd, setMeasureEnd] = useState<{x:number,y:number}|null>(null);
  const [pickedColor, setPickedColor] = useState('#000000');
  const [showRuler, setShowRuler] = useState(true);
  const rulerCanvasTopRef = useRef<HTMLCanvasElement>(null);
  const rulerCanvasLeftRef = useRef<HTMLCanvasElement>(null);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [cropMode, setCropMode] = useState(false);
  const cropRectRef = useRef<any>(null);
  const cropTargetRef = useRef<any>(null);
  const autoSaveRef = useRef<any>(null);
  const beforeUnloadRef = useRef<any>(null);
  const pasteHandlerRef = useRef<any>(null);
  const measureStartRef = useRef<{x:number;y:number}|null>(null);
  const measureLineRef = useRef<any>(null);
  const measureTextRef = useRef<any>(null);
  const scaleRef = useRef(1);

  const refreshLayers = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel && o.name !== '__bgImage__');
    const list = objs.map((o:any, i:number) => ({
      id: o.__id || ('obj_' + i),
      type: o.type || 'object',
      name: o.text ? (o.text.substring(0, 20) + (o.text.length > 20 ? '...' : '')) : (o.type === 'image' ? 'Image' : o.type || 'Shape'),
      locked: !!o.lockMovementX,
      visible: o.visible !== false,
    })).reverse();
    setLayersList(list);
  }, []);

    const applyZoom = useCallback((newZoom: number) => {
      const c = fcRef.current; if (!c) return;
      const z = Math.max(25, Math.min(400, newZoom));
      const scale = z / 100;
      const vpt = c.viewportTransform || [1,0,0,1,0,0];
      vpt[0] = scale;
      vpt[3] = scale;
      c.setViewportTransform(vpt);
      c.requestRenderAll();
      setZoom(z);
      zoomRef.current = z;
      if (z >= 150) setShowMinimap(true);
    }, []);
  // ── Minimap render ──
  const updateMinimap = useCallback(() => {
    const mc = minimapRef.current;
    const fc = fcRef.current;
    if (!mc || !fc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    const MW = 160, MH = 110;
    // Don't reset canvas size (causes flicker)
    if (mc.width !== MW) mc.width = MW;
    if (mc.height !== MH) mc.height = MH;
    // Render to offscreen canvas first to avoid flicker
    const offscreen = document.createElement("canvas");
    offscreen.width = MW;
    offscreen.height = MH;
    const octx = offscreen.getContext("2d");
    if (!octx) return;
    octx.fillStyle = "#f8f9fa";
    octx.fillRect(0, 0, MW, MH);
    try {
      const cw = canvasElRef.current?.width || 400;
      const ch = canvasElRef.current?.height || 300;
      const s = Math.min((MW - 8) / cw, (MH - 8) / ch);
      const ox = (MW - cw * s) / 2;
      const oy = (MH - ch * s) / 2;
      // Draw border
      octx.strokeStyle = "#d1d5db";
      octx.lineWidth = 1;
      octx.strokeRect(ox - 1, oy - 1, cw * s + 2, ch * s + 2);
      // Draw canvas snapshot directly from the canvas element
      const srcCanvas = canvasElRef.current;
      if (srcCanvas) {
        octx.drawImage(srcCanvas, ox, oy, cw * s, ch * s);
      }
      // Draw viewport rectangle when zoomed
      if (zoom > 100) {
        const scrollEl = document.querySelector("[data-scroll-container]");
        if (scrollEl) {
          const vx = ox + (scrollEl.scrollLeft / (zoom / 100)) * s;
          const vy = oy + (scrollEl.scrollTop / (zoom / 100)) * s;
          const vw = (scrollEl.clientWidth / (zoom / 100)) * s;
          const vh = (scrollEl.clientHeight / (zoom / 100)) * s;
          octx.strokeStyle = "#3b82f6";
          octx.lineWidth = 2;
          octx.strokeRect(vx, vy, vw, vh);
          octx.fillStyle = "rgba(59,130,246,0.1)";
          octx.fillRect(vx, vy, vw, vh);
        }
      }
      // Single draw to visible canvas (no flicker)
      ctx.clearRect(0, 0, MW, MH);
      ctx.drawImage(offscreen, 0, 0);
    } catch (e) { /* silent */ }
  }, [zoom]);
  // Minimap auto-update
  useEffect(() => {
    if (!showMinimap) return;
    updateMinimap();
    const interval = setInterval(updateMinimap, 500);
    return () => clearInterval(interval);
  }, [showMinimap, zoom, updateMinimap]);


  // Template states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [templateLoading, setTemplateLoading] = useState<string | null>(null);

  // Copy states
  const [copyProduct, setCopyProduct] = useState('');
  const [copyBrand, setCopyBrand] = useState('');
  const [copyResult, setCopyResult] = useState<any>(null);
  const [copyLoading, setCopyLoading] = useState(false);

  // Review states
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);


  const templates = getTemplates();
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

    

    // ── Safe Zone (5mm margin) ──

    const addSafeZone = useCallback(() => {
      // Disabled for MVP
    }, [widthMM, heightMM, guideText]);



  /* ────── Fabric.js v7 초기화 ────── */
  useEffect(() => {
    let disposed = false;
    let keyHandler: ((e: KeyboardEvent) => void) | null = null;

    const boot = async () => {
      // Wait for wrapper to have real dimensions (layout must complete)
      const waitForLayout = () => new Promise<void>(resolve => {
        const check = () => {
          if (disposed) { resolve(); return; }
          const w = wrapperRef.current;
          if (w && w.clientWidth > 100 && w.clientHeight > 100) { resolve(); return; }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));
      if (disposed || !canvasElRef.current || !wrapperRef.current) return;

      const fabricMod = await import('fabric');
      fabricModRef.current = fabricMod;
      const { Canvas, Rect, FabricText } = fabricMod;

      if (fcRef.current) {
        try { fcRef.current.dispose(); } catch {}
        fcRef.current = null;
      }

      const cw = wrapperRef.current!.clientWidth;
      const ch = wrapperRef.current!.clientHeight;
      // Canvas sizing: fit within available space with generous margins
      const availW = cw - 160;
      const availH = ch - 100;
      const ratio = widthMM / heightMM;
      let canvasW: number, canvasH: number;
      // Unified sizing: fit within available area maintaining aspect ratio
      const maxW = availW * 0.7;
      const maxH = availH * 0.75;
      if (maxW / maxH > ratio) {
        canvasH = maxH;
        canvasW = maxH * ratio;
      } else {
        canvasW = maxW;
        canvasH = maxW / ratio;
      }
      // Ensure minimum visible size
      if (canvasW < 200) { canvasW = 200; canvasH = 200 / ratio; }
      if (canvasH < 120) { canvasH = 120; canvasW = 120 * ratio; }
      // Ensure doesn't exceed available space
      if (canvasW > availW * 0.85) { canvasW = availW * 0.85; canvasH = canvasW / ratio; }
      if (canvasH > availH * 0.85) { canvasH = availH * 0.85; canvasW = canvasH * ratio; }
      canvasW = Math.round(Math.max(canvasW, 150));
      canvasH = Math.round(Math.max(canvasH, 100));

      const el = canvasElRef.current!;
      el.width = canvasW;
      el.height = canvasH;
      el.style.width = canvasW + 'px';
      el.style.height = canvasH + 'px';

      if (disposed) return;

      const canvas = new Canvas(el, {
        width: canvasW,
        height: canvasH,
        backgroundColor: '#FFFFFF',
        selection: true,
      });
      fcRef.current = canvas;
      scaleRef.current = canvasW / widthMM;

      // Handle path creation — push history for normal drawing
      canvas.on('path:created', () => {
        if (!loadingRef.current) { pushHistory(); refreshLayers(); }
      });

      // Enable right-click on canvas
      canvas.fireRightClick = true;
      canvas.stopContextMenu = true;

      // Prevent browser context menu on canvas
      const upperEl = canvas.upperCanvasEl || canvas.getElement();
      if (upperEl) {
        upperEl.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); });
      }

      // Right-click context menu
      canvas.on('mouse:down', (opt: any) => {
        if (opt.e && opt.e.button === 2) {
          opt.e.preventDefault();
          opt.e.stopPropagation();
          const target = opt.target;
          if (target && target.selectable !== false) {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            const wrapperEl = wrapperRef.current;
            if (wrapperEl) {
              const rect = wrapperEl.getBoundingClientRect();
              setCtxMenu({ x: opt.e.clientX - rect.left, y: opt.e.clientY - rect.top, target });
            }
          }
        } else {
          setCtxMenu(null);
        }
      });

      let didRestore = false;


      // Auto-save: restore from localStorage
      const storageKey = 'panelEditor_autoSave_' + panelId;
      // Clean corrupted auto-save that might contain safe zone objects
      try { const _checkSave = localStorage.getItem(storageKey); if (_checkSave) { const _p = JSON.parse(_checkSave); if (_p?.objects) { const before = _p.objects.length; _p.objects = _p.objects.filter((o:any) => !o._isSafeZone && !o._isGuideText && !o._isSizeLabel && !(o.type==="rect" && o.stroke==="#93B5F7" && o.fill==="transparent") && !(o.type==="rect" && o.stroke==="#3B82F6" && o.fill==="transparent")); if (_p.objects.length !== before) { localStorage.setItem(storageKey, JSON.stringify(_p)); console.log("[CLEAN] Removed", before - _p.objects.length, "safe zone objects from auto-save"); } } } } catch {}
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.objects && parsed.objects.length > 0) {
            // Remove objects with blob/object URLs that cannot be restored
            parsed.objects = parsed.objects.filter((obj: any) => {
              if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel) return false;
              if (obj.selectable === false && obj.evented === false) return false;
              if (obj.type === 'rect' && obj.stroke === '#93B5F7' && obj.fill === 'transparent') return false;
              if (obj.type === 'text' && obj.fill === '#C0C0C0' && obj.selectable === false) return false;
              if (obj.type === 'text' && obj.fill === '#B0B0B0' && obj.selectable === false) return false;
              if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:') || obj.src.startsWith('object:'))) {
                console.warn('Skipping blob image in auto-save restore');
                return false;
              }
              return true;
            });
            if (parsed.objects.length > 0) {
              console.log('[RESTORE] Using auto-save path, objects:', parsed.objects?.length, 'bgImages:', parsed.objects?.filter((o:any)=>o._isBgImage).length);
              await canvas.loadFromJSON(parsed);
            canvas.getObjects().forEach((o: any) => { if (o.name === '__bgImage__') { o._isBgImage = true; o.set({ selectable: false, evented: false }); } });
              canvas.requestRenderAll();
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);
              });



              // Re-lock template background images after auto-restore
              canvas.getObjects().forEach((o: any) => {
                if (o._isBgImage || o.name === '__bgImage__') {
                o._isBgImage = true;
                o.set({ selectable: false, evented: false });
              }
              });

              addSafeZone();
              didRestore = true;
            }
          }
        }
      } catch (e) { console.warn('auto-save restore failed', e); }

      if (!didRestore && savedJSON) {
        try {
          const parsed = typeof savedJSON === 'string' ? JSON.parse(savedJSON) : savedJSON;
          if (parsed && parsed.objects) {
            parsed.objects = parsed.objects.filter((obj: any) => {
              if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel) return false;
              if (obj.selectable === false && obj.evented === false && !obj._isBgImage && obj.name !== '__bgImage__') return false;
              if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:') || obj.src.startsWith('object:'))) return false;
              return true;
            });
            await canvas.loadFromJSON(parsed);
            canvas.getObjects().forEach((o: any) => { if (o.name === '__bgImage__') { o._isBgImage = true; o.set({ selectable: false, evented: false }); } });
            canvas.requestRenderAll();
            canvas.getObjects().slice().forEach((o: any) => {
              if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);
            });
            addSafeZone();
            didRestore = true;
          }
        } catch (e) { console.warn('savedJSON restore failed', e); }
      }
      if (!didRestore) { addSafeZone(); }

      // Save initial history excluding guides
      const initGuides: any[] = [];
      canvas.getObjects().slice().forEach((o: any) => {
        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {
          initGuides.push(o); canvas.remove(o);
        }
      });
      historyRef.current = [JSON.stringify(canvas.toJSON())];
      initGuides.forEach(g => canvas.add(g));
      canvas.renderAll();
      historyIdxRef.current = 0;
      loadingRef.current = false;
      setTimeout(() => { if(typeof drawRulers==='function') drawRulers(); }, 100);

      let vLine: any = null; let hLine: any = null; const snapPx = 8;
      canvas.on('object:moving', (opt: any) => {
        if (vLine) { canvas.remove(vLine); vLine = null; } if (hLine) { canvas.remove(hLine); hLine = null; }
        const obj = opt.target; if (!obj) return;
        const bound = obj.getBoundingRect(); const cx = bound.left + bound.width/2; const cy = bound.top + bound.height/2;
        const cw = canvas.getWidth(); const ch = canvas.getHeight(); let snappedV = false, snappedH = false;
        if (Math.abs(cx - cw/2) < snapPx) { obj.set("left", cw/2 - bound.width/2 + (obj.left - bound.left)); snappedV = true; }
        if (Math.abs(cy - ch/2) < snapPx) { obj.set("top", ch/2 - bound.height/2 + (obj.top - bound.top)); snappedH = true; }
        const lc = (snappedV && snappedH) ? "#4CAF50" : "#ff0000";
        if (snappedV) { const { Line } = require("fabric"); vLine = new Line([cw/2,0,cw/2,ch], { stroke:lc, strokeWidth:1, strokeDashArray:[5,3], selectable:false, evented:false }); (vLine as any)._isGuideLine = true; canvas.add(vLine); }
        if (snappedH) { const { Line } = require("fabric"); hLine = new Line([0,ch/2,cw,ch/2], { stroke:lc, strokeWidth:1, strokeDashArray:[5,3], selectable:false, evented:false }); (hLine as any)._isGuideLine = true; canvas.add(hLine); }
        canvas.renderAll();
      });
      canvas.on('object:modified', () => { if (vLine) { canvas.remove(vLine); vLine = null; } if (hLine) { canvas.remove(hLine); hLine = null; } canvas.renderAll(); if (!loadingRef.current) { pushHistory(); refreshLayers(); } });
      canvas.on('object:added', (opt: any) => { if (opt.target?._isGuideLine || opt.target?._isSafeZone || opt.target?._isGuideText || opt.target?._isSizeLabel || opt.target?._isBgPattern) return; if (!loadingRef.current) { refreshLayers(); } });
      canvas.on('object:removed', () => { if (!loadingRef.current) { refreshLayers(); } });
      canvas.on('selection:created', () => refreshLayers()); canvas.on('selection:updated', () => refreshLayers()); canvas.on('selection:cleared', () => refreshLayers());

      keyHandler = (e: KeyboardEvent) => {
        const canvas = fcRef.current; if (!canvas) return;
        const tag = (document.activeElement?.tagName || '').toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyZ' && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyZ' && e.shiftKey) { e.preventDefault(); redo(); }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyA') { e.preventDefault(); const { ActiveSelection } = require("fabric"); const objs = canvas.getObjects().filter((o:any) => o.selectable !== false); if (objs.length > 0) { const sel = new ActiveSelection(objs, { canvas }); canvas.setActiveObject(sel); canvas.renderAll(); } }
        if (e.code==='F1') { e.preventDefault(); setShowShortcuts((p:boolean) => !p); }
        if (e.key==='Escape') { setShowShortcuts(false); setCropMode(false); }
        if (e.key==='Delete' || e.key==='Backspace') { const obj = canvas.getActiveObject(); if (obj && obj.selectable !== false) { if (obj.type==='activeSelection'||obj.type==='activeselection') { const objs = (obj as any).getObjects ? (obj as any).getObjects() : ((obj as any)._objects||[]); const toRemove = objs.filter((o:any) => o.selectable !== false); canvas.discardActiveObject(); toRemove.forEach((o:any) => canvas.remove(o)); } else { canvas.remove(obj); canvas.discardActiveObject(); } canvas.renderAll(); refreshLayers(); pushHistory(); } }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyC') { e.preventDefault(); const obj = canvas.getActiveObject(); if (!obj) return; (window as any).__clipboardObjects = obj; if (obj.type==='activeSelection'||obj.type==='activeselection') { const ch = (obj as any).getObjects ? (obj as any).getObjects() : ((obj as any)._objects||[]); const items:any[] = []; const m = obj.calcTransformMatrix(); for (const o of ch) { const j = o.toJSON(['_isBgImage','selectable','evented','name']); const p = require('fabric').util.transformPoint({x:o.left||0,y:o.top||0},m); j._absLeft = p.x; j._absTop = p.y; j._origType = o.type; if ((o.type==='image'||o instanceof (require('fabric').FabricImage)) && o._element) { try { const t=document.createElement('canvas'); t.width=o._element.naturalWidth||o._element.width||200; t.height=o._element.naturalHeight||o._element.height||200; t.getContext('2d')?.drawImage(o._element,0,0); j._dataUrl=t.toDataURL('image/png'); } catch{} } items.push(j); } (window as any).__clipboardJSON = {type:'multi',items,cx:obj.left||canvas.getWidth()/2,cy:obj.top||canvas.getHeight()/2}; } else { const j = obj.toJSON(['_isBgImage','selectable','evented','name']); j._absLeft = obj.left; j._absTop = obj.top; j._origType = obj.type; if ((obj.type==='image'||obj instanceof (require('fabric').FabricImage)) && (obj as any)._element) { try { const t=document.createElement('canvas'); t.width=(obj as any)._element.naturalWidth||(obj as any)._element.width||200; t.height=(obj as any)._element.naturalHeight||(obj as any)._element.height||200; t.getContext('2d')?.drawImage((obj as any)._element,0,0); j._dataUrl=t.toDataURL('image/png'); } catch{} } (window as any).__clipboardJSON = {type:'single',items:[j]}; } }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyV') { e.preventDefault(); const cj = (window as any).__clipboardJSON; if (!cj || !cj.items) return; (async () => { const { FabricImage, ActiveSelection, util } = await import('fabric'); const cl:any[] = []; const offset = 15; for (const item of cj.items) { let newObj:any = null; if (item._dataUrl) { try { newObj = await FabricImage.fromURL(item._dataUrl); newObj.set({left:(item._absLeft||50)+offset,top:(item._absTop||50)+offset,scaleX:item.scaleX||1,scaleY:item.scaleY||1,angle:item.angle||0}); } catch{} } else { try { const arr = await util.enlivenObjects([item]); if (arr[0]) { newObj = arr[0]; newObj.set({left:(item._absLeft||item.left||50)+offset,top:(item._absTop||item.top||50)+offset}); } } catch{} } if (newObj) { canvas.add(newObj); cl.push(newObj); } } if (cl.length>1) { const s = new ActiveSelection(cl,{canvas}); canvas.setActiveObject(s); } else if (cl.length===1) { canvas.setActiveObject(cl[0]); } canvas.renderAll(); refreshLayers(); pushHistory(); })(); }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyX') { e.preventDefault(); const obj = canvas.getActiveObject(); if (!obj) return; const ci = async (o:any) => { if ((o.type==='image'||o instanceof (require('fabric').FabricImage)) && o._element) { try { const t = document.createElement('canvas'); t.width=o._element.naturalWidth||o._element.width||200; t.height=o._element.naturalHeight||o._element.height||200; t.getContext('2d')?.drawImage(o._element,0,0); return t.toDataURL('image/png'); } catch { return null; } } return null; }; (async () => { if (obj.type==='activeselection') { const ch = (obj as any)._objects||[]; const items:any[] = []; for (const o of ch) { const d = await ci(o); const j = o.toJSON(['_isBgImage','selectable','evented','name']); if (d) j._dataUrl = d; const m = obj.calcTransformMatrix(); const p = require('fabric').util.transformPoint({x:o.left,y:o.top},m); j._absLeft = p.x; j._absTop = p.y; items.push(j); } (window as any).__clipboardJSON = {type:'activeselection',items}; (window as any).__clipboardObjects = null; const rm = [...ch]; canvas.discardActiveObject(); rm.forEach((o:any)=>canvas.remove(o)); } else { const d = await ci(obj); const j = obj.toJSON(['_isBgImage','selectable','evented','name']); if (d) j._dataUrl = d; j._absLeft = obj.left; j._absTop = obj.top; (window as any).__clipboardJSON = {type:'single',items:[j]}; (window as any).__clipboardObjects = null; canvas.remove(obj); canvas.discardActiveObject(); } canvas.renderAll(); refreshLayers(); })(); }
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { const obj = canvas.getActiveObject(); if (!obj) return; e.preventDefault(); const s = (e.ctrlKey||e.metaKey) ? 1 : 5; if (e.key==='ArrowUp') obj.set('top',obj.top-s); if (e.key==='ArrowDown') obj.set('top',obj.top+s); if (e.key==='ArrowLeft') obj.set('left',obj.left-s); if (e.key==='ArrowRight') obj.set('left',obj.left+s); obj.setCoords(); canvas.renderAll(); }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyD') { e.preventDefault(); const obj = canvas.getActiveObject(); if (!obj || obj.selectable===false) return; if (obj.type==='image'||obj instanceof (require('fabric').FabricImage)) { const t = document.createElement('canvas'); t.width=obj._element?.naturalWidth||obj._element?.width||200; t.height=obj._element?.naturalHeight||obj._element?.height||200; t.getContext('2d')?.drawImage(obj._element,0,0); (require('fabric').FabricImage).fromURL(t.toDataURL('image/png')).then((img:any) => { img.set({left:obj.left+20,top:obj.top+20,scaleX:obj.scaleX,scaleY:obj.scaleY,angle:obj.angle}); canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); refreshLayers(); }); } else { obj.clone().then((c:any) => { c.set({left:obj.left+20,top:obj.top+20}); canvas.add(c); canvas.setActiveObject(c); canvas.renderAll(); refreshLayers(); }); } }
        if ((e.ctrlKey||e.metaKey) && e.code==='KeyG') { e.preventDefault(); setShowGrid((p:boolean) => !p); }
      };
      document.addEventListener('keydown', keyHandler);canvas.renderAll();
      const wheelHandler = (opt:any) => { const e = opt.e as WheelEvent; if (e.ctrlKey||e.metaKey) { e.preventDefault(); e.stopPropagation(); const d = e.deltaY > 0 ? -10 : 10; applyZoom(Math.max(25,Math.min(400,zoomRef.current+d))); } };
      canvas.on('mouse:wheel', wheelHandler);
      autoSaveRef.current = setInterval(() => { const c = fcRef.current; if (!c) return; try { const _safeObjs:any[]=[];c.getObjects().forEach((o:any)=>{if(o._isSafeZone||o._isGuideText||o._isSizeLabel){_safeObjs.push(o);c.remove(o);}}); localStorage.setItem('panelEditor_autoSave_'+panelId, JSON.stringify(c.toJSON(['_isBgImage','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgPattern','selectable','evented','name']))); _safeObjs.forEach(o=>c.add(o)); c.renderAll(); } catch {} }, 10000);
      // beforeunload disabled for smoother UX
      pasteHandlerRef.current = async (e: ClipboardEvent) => { const items = e.clipboardData?.items; if (!items) return; for (let i = 0; i < items.length; i++) { if (items[i].type.indexOf('image')!==-1) { e.preventDefault(); const blob = items[i].getAsFile(); if (!blob) continue; const reader = new FileReader(); reader.onload = async () => { const { FabricImage } = await import('fabric'); const img = await FabricImage.fromURL(reader.result as string); const c = fcRef.current; if (!c) return; const sc = Math.min(c.getWidth()*0.8/(img.width||1),c.getHeight()*0.8/(img.height||1),1); img.set({left:c.getWidth()/2,top:c.getHeight()/2,originX:'center',originY:'center',scaleX:sc,scaleY:sc}); c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers(); }; reader.readAsDataURL(blob); break; } } };
      wrapperRef.current?.addEventListener('paste', pasteHandlerRef.current);
      refreshLayers();
    };
    boot();
    return () => { disposed = true; if (keyHandler) document.removeEventListener('keydown', keyHandler); if (autoSaveRef.current) clearInterval(autoSaveRef.current); if (beforeUnloadRef.current) window.removeEventListener('beforeunload', beforeUnloadRef.current); if (pasteHandlerRef.current && wrapperRef.current) wrapperRef.current.removeEventListener('paste', pasteHandlerRef.current); const c = fcRef.current; if (c) { c.dispose(); fcRef.current = null; } };
  }, [panelId, savedJSON]);

  const pushHistory = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    // Remove guide objects before saving
    const guides: any[] = [];
    c.getObjects().slice().forEach((o: any) => {
      if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {
        guides.push(o); c.remove(o);
      }
    });
    const json = JSON.stringify(c.toJSON(['_isBgImage','selectable','evented','name']));
    // Re-add guides
    guides.forEach(g => c.add(g));
    c.renderAll();
    const arr = historyRef.current;
    if (historyIdxRef.current < arr.length - 1) arr.splice(historyIdxRef.current + 1);
    arr.push(json); if (arr.length > 50) arr.shift();
    historyIdxRef.current = arr.length - 1; setHistoryIdx(historyIdxRef.current);
  }, []);


  const undo = useCallback(() => { const c = fcRef.current; if (!c||historyIdxRef.current<=0) return; historyIdxRef.current--; loadingRef.current=true; c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(()=>{ c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.getObjects().slice().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern)c.remove(o);}); c.renderAll(); loadingRef.current=false; addSafeZone(); refreshLayers(); setHistoryIdx(historyIdxRef.current); }); }, [refreshLayers, addSafeZone]);
  const redo = useCallback(() => { const c = fcRef.current; if (!c||historyIdxRef.current>=historyRef.current.length-1) return; historyIdxRef.current++; loadingRef.current=true; c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(()=>{ c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.getObjects().slice().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern)c.remove(o);}); c.renderAll(); loadingRef.current=false; addSafeZone(); refreshLayers(); setHistoryIdx(historyIdxRef.current); }); }, [refreshLayers, addSafeZone]);

  const del = useCallback(() => { const c = fcRef.current; if (!c) return; const obj = c.getActiveObject(); if (obj && obj.selectable!==false) { if (obj.type==='activeselection') { const ch=(obj as any)._objects||[]; c.discardActiveObject(); ch.forEach((o:any)=>{if(o.selectable!==false)c.remove(o)}); c.renderAll(); refreshLayers(); } else { c.remove(obj); c.discardActiveObject(); c.renderAll(); } } }, []);

    const handleExport = useCallback(async (format: 'png'|'svg'|'pdf') => {
      const c = fcRef.current; if (!c) return;
      const usePicker = typeof (window as any).showSaveFilePicker === "function";
      const guides:any[] = []; c.getObjects().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern) guides.push(o);}); guides.forEach(g=>c.remove(g)); c.renderAll();
      if (format==="png") {
        const d=c.toDataURL({format:"png",multiplier:exportScale});
        if (usePicker) {
          try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+"_"+exportScale+"x.png",types:[{description:"PNG",accept:{"image/png":[".png"]}}]}); const w=await h.createWritable(); const r=await fetch(d); await w.write(await r.blob()); await w.close(); } catch(e:any){ if(e.name!=="AbortError") console.error(e); }
        } else { const a=document.createElement("a"); a.download=panelId+"_"+exportScale+"x.png"; a.href=d; a.click(); }
      } else if (format==="svg") {
        const s=c.toSVG(); const b=new Blob([s],{type:"image/svg+xml"});
        if (usePicker) {
          try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+".svg",types:[{description:"SVG",accept:{"image/svg+xml":[".svg"]}}]}); const w=await h.createWritable(); await w.write(b); await w.close(); } catch(e:any){ if(e.name!=="AbortError") console.error(e); }
        } else { const u=URL.createObjectURL(b); const a=document.createElement("a"); a.download=panelId+".svg"; a.href=u; a.click(); URL.revokeObjectURL(u); }
      } else if (format==="pdf") {
        const d=c.toDataURL({format:"png",multiplier:exportScale}); const pw=c.getWidth()*exportScale; const ph=c.getHeight()*exportScale;
        try { const {jsPDF}=await import("jspdf"); const pdf=new jsPDF({orientation:pw>ph?"landscape":"portrait",unit:"px",format:[pw,ph]}); pdf.addImage(d,"PNG",0,0,pw,ph);
          const pdfBlob=pdf.output("blob");
          if (usePicker) {
            try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+".pdf",types:[{description:"PDF",accept:{"application/pdf":[".pdf"]}}]}); const w=await h.createWritable(); await w.write(pdfBlob); await w.close(); } catch(e2:any){ if(e2.name!=="AbortError") console.error(e2); }
          } else { const u=URL.createObjectURL(pdfBlob); const a=document.createElement("a"); a.href=u; a.download=panelId+".pdf"; a.click(); URL.revokeObjectURL(u); }
        } catch{ alert("PDF requires jspdf"); }
      }
      guides.forEach(g=>c.add(g)); c.renderAll();
    }, [panelId, exportScale]);

  const handleSavePanel = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    // Remove guides before saving
    const guides: any[] = [];
    c.getObjects().slice().forEach((o: any) => {
      if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {
        guides.push(o); c.remove(o);
      }
    });
    const json = JSON.stringify(c.toJSON(['_isBgImage','selectable','evented','name']));
    const thumb = c.toDataURL({format:'png',multiplier:0.3});
    // Re-add guides
    guides.forEach(g => c.add(g)); c.renderAll();
    onSave(panelId, json, thumb);
  }, [panelId, onSave]);

  const addText = useCallback((content?: string, opts?: any) => {
    const c = fcRef.current; if (!c) return; const { IText } = require('fabric');
    const t = new IText(content||'Text', { left:c.getWidth()/2-30, top:c.getHeight()/2-15, fontSize:opts?.fontSize||fSize, fill:opts?.fill||color, fontFamily:opts?.fontFamily||selectedFont, ...opts });
    c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers(); pushHistory();
  }, [fSize, color, selectedFont, refreshLayers]);

  const addShape = useCallback((type: string) => {
    const c = fcRef.current; if (!c) return;
    const { Rect, Circle, Triangle, Line:FL, Polygon, Ellipse, Path } = require("fabric");
    const cx=c.getWidth()/2, cy=c.getHeight()/2; let s:any;
    // Rectangles
    if (type==="rect") s=new Rect({left:cx-40,top:cy-30,width:80,height:60,fill:color});
    else if (type==="roundrect") s=new Rect({left:cx-40,top:cy-30,width:80,height:60,fill:color,rx:12,ry:12});
    else if (type==="diamond") { const r=30; s=new Polygon([{x:cx,y:cy-r},{x:cx+r,y:cy},{x:cx,y:cy+r},{x:cx-r,y:cy}],{fill:color}); }
    // Circles
    else if (type==="circle") s=new Circle({left:cx-30,top:cy-30,radius:30,fill:color});
    else if (type==="ellipse") s=new Ellipse({left:cx-30,top:cy-20,rx:40,ry:25,fill:color});
    else if (type==="semicircle") s=new Path("M 0 30 A 30 30 0 0 1 60 30 L 0 30 Z",{left:cx-30,top:cy-15,fill:color});
    else if (type==="arc") s=new Path("M 0 30 A 30 30 0 0 1 60 30",{left:cx-30,top:cy-15,fill:"",stroke:color,strokeWidth:3});
    // Triangles
    else if (type==="triangle") s=new Triangle({left:cx-30,top:cy-30,width:60,height:60,fill:color});
    else if (type==="righttri") s=new Polygon([{x:cx-30,y:cy+30},{x:cx-30,y:cy-30},{x:cx+30,y:cy+30}],{fill:color});
    else if (type==="trapezoid") s=new Polygon([{x:cx-20,y:cy-25},{x:cx+20,y:cy-25},{x:cx+35,y:cy+25},{x:cx-35,y:cy+25}],{fill:color});
    // Polygons
    else if (type==="pentagon") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<5;i++){const a=(Math.PI/2*3)+(i*2*Math.PI/5); pts.push({x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*30});} s=new Polygon(pts,{fill:color}); }
    else if (type==="hexagon") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<6;i++){const a=i*Math.PI/3; pts.push({x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*30});} s=new Polygon(pts,{fill:color}); }
    else if (type==="octagon") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<8;i++){const a=i*Math.PI/4; pts.push({x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*30});} s=new Polygon(pts,{fill:color}); }
    else if (type==="cross") { s=new Polygon([{x:cx-10,y:cy-30},{x:cx+10,y:cy-30},{x:cx+10,y:cy-10},{x:cx+30,y:cy-10},{x:cx+30,y:cy+10},{x:cx+10,y:cy+10},{x:cx+10,y:cy+30},{x:cx-10,y:cy+30},{x:cx-10,y:cy+10},{x:cx-30,y:cy+10},{x:cx-30,y:cy-10},{x:cx-10,y:cy-10}],{fill:color}); }
    // Stars & Badges
    else if (type==="star") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<10;i++){const r=i%2===0?30:15; const a=(Math.PI/2*3)+(i*Math.PI/5); pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }
    else if (type==="star6") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<12;i++){const r=i%2===0?30:15; const a=(Math.PI/2*3)+(i*Math.PI/6); pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }
    else if (type==="burst") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<16;i++){const r=i%2===0?35:18; const a=i*Math.PI/8; pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }
    else if (type==="badge") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<20;i++){const r=i%2===0?30:25; const a=i*Math.PI/10; pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }
    // Lines
    else if (type==="line") s=new FL([cx-40,cy,cx+40,cy],{stroke:color,strokeWidth:3,fill:""});
    else if (type==="dashed") s=new FL([cx-40,cy,cx+40,cy],{stroke:color,strokeWidth:3,strokeDashArray:[10,5],fill:""});
    else if (type==="dotted") s=new FL([cx-40,cy,cx+40,cy],{stroke:color,strokeWidth:3,strokeDashArray:[2,4],fill:""});
    // Arrows
    else if (type==="arrow") s=new Path("M 0 15 L 50 15 L 50 5 L 70 20 L 50 35 L 50 25 L 0 25 Z",{left:cx-35,top:cy-20,fill:color});
    else if (type==="arrowThin") s=new Path("M 0 18 L 55 18 L 55 8 L 75 22 L 55 36 L 55 26 L 0 26 Z",{left:cx-37,top:cy-22,fill:color,scaleX:0.8,scaleY:0.8});
    else if (type==="arrowDouble") s=new Path("M 20 5 L 0 20 L 20 35 L 20 25 L 50 25 L 50 35 L 70 20 L 50 5 L 50 15 L 20 15 Z",{left:cx-35,top:cy-20,fill:color});
    else if (type==="arrowCurved") s=new Path("M 5 35 Q 5 5 40 5 L 35 0 L 45 5 L 35 10 L 40 5 Q 10 5 10 35 Z",{left:cx-22,top:cy-17,fill:color,scaleX:1.5,scaleY:1.5});
    // Callouts / Speech Bubbles
    else if (type==="bubble") s=new Path("M 5 5 Q 5 0 10 0 L 60 0 Q 65 0 65 5 L 65 35 Q 65 40 60 40 L 25 40 L 15 50 L 18 40 L 10 40 Q 5 40 5 35 Z",{left:cx-32,top:cy-25,fill:color});
    else if (type==="bubbleRound") s=new Path("M 35 0 A 30 25 0 1 0 35 50 L 20 60 L 25 48 A 30 25 0 0 0 35 0 Z",{left:cx-30,top:cy-30,fill:color,scaleX:1,scaleY:0.9});
    else if (type==="bubbleCloud") s=new Path("M 30 45 Q 15 55 10 50 Q 0 50 5 40 Q 0 30 10 25 Q 5 15 15 10 Q 15 0 30 5 Q 40 0 45 10 Q 55 5 55 15 Q 65 20 60 30 Q 65 40 55 45 Q 50 55 40 50 Z",{left:cx-32,top:cy-27,fill:color});
    else if (type==="callout") s=new Path("M 0 0 L 70 0 L 70 40 L 30 40 L 15 55 L 20 40 L 0 40 Z",{left:cx-35,top:cy-27,fill:color});
    // Hearts & Misc
    else if (type==="heart") s=new Path("M 25 45 L 5 25 A 10 10 0 0 1 25 10 A 10 10 0 0 1 45 25 Z",{left:cx-22,top:cy-22,fill:color});
    else if (type==="ring") { s=new Circle({left:cx-30,top:cy-30,radius:30,fill:"",stroke:color,strokeWidth:8}); }
    if (s) { c.add(s); c.setActiveObject(s); c.renderAll(); refreshLayers(); pushHistory(); }
  }, [color, refreshLayers]);

  const addImage = useCallback(() => { fileRef.current?.click(); }, []);
  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if(!file) return; const c=fcRef.current; if(!c) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(reader.result as string);
      const sc = Math.min(c.getWidth()*0.6/(img.width||1), c.getHeight()*0.6/(img.height||1), 1);
      img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center", scaleX: sc, scaleY: sc });
      c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers(); pushHistory();
    };
    reader.readAsDataURL(file); e.target.value="";
  }, [refreshLayers, pushHistory]);

    const toggleDraw = useCallback(() => {
      const c = fcRef.current; if (!c) return;
      const fab = fabricModRef.current;
      if (drawMode) {
        c.isDrawingMode = false;
        setDrawMode(false);
      } else {
        c.isDrawingMode = true;
        if (fab && fab.PencilBrush) {
          const brush = new fab.PencilBrush(c);
          brush.color = color;
          brush.width = brushSize;
          c.freeDrawingBrush = brush;
        } else if (c.freeDrawingBrush) {
          c.freeDrawingBrush.color = color;
          c.freeDrawingBrush.width = brushSize;
        }
        setDrawMode(true);
        // Full eraser cleanup
      }
    }, [drawMode, color, brushSize]);

  const handleAiCopy = useCallback(async () => {
    if (!copyProduct.trim()) return; setCopyLoading(true); setCopyResult(null);
    try { const r=await fetch('/api/ai/generate-copy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productName:copyProduct,brandName:copyBrand||undefined})}); const d=await r.json(); if(d.error) throw new Error(d.error); setCopyResult(d); } catch(e:any) { alert('AI Copy: '+e.message); }
    setCopyLoading(false);
  }, [copyProduct, copyBrand]);

  const handleAiReview = useCallback(async () => {
    const c=fcRef.current; if(!c) return; setReviewLoading(true); setReviewResult(null);
    try { const d=c.toDataURL({format:'png',multiplier:1}); const r=await fetch('/api/ai/review-design',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:d.replace(/^data:image\/[a-z]+;base64,/,''),boxType:panelId||'package',dimensions:{width:widthMM,height:heightMM},material:'standard'})}); const data=await r.json(); if(data.error) throw new Error(data.error); setReviewResult(data); } catch(e:any) { alert('AI Review: '+e.message); }
    setReviewLoading(false);
  }, []);



  const applyCopyToCanvas = useCallback((field:string, value:string) => {
    const c=fcRef.current; if(!c) return; const { IText } = require('fabric');
    const sz:Record<string,number>={headline:28,description:16,slogan:20,features:14,backPanel:12};
    const t=new IText(value,{left:c.getWidth()/2,top:c.getHeight()/2,originX:'center',originY:'center',fontSize:sz[field]||16,fill:'#000',fontFamily:selectedFont});
    c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers();
  }, [selectedFont, refreshLayers]);

  const applyTemplate = useCallback(async (tpl: DesignTemplate) => {
    const c=fcRef.current; if(!c) return; setTemplateLoading(tpl.id);
    const F = require('fabric');
    const objs = await tpl.objects(F, c.getWidth(), c.getHeight());
    c.getObjects().filter((o:any)=>o.selectable!==false||o._isBgImage).forEach((o:any)=>{if(!o._isSafeZone&&!o._isGuideLine&&!o._isGuideText&&!o._isSizeLabel)c.remove(o)});
    objs.forEach((o:any)=>c.add(o)); c.renderAll(); refreshLayers(); pushHistory(); setTemplateLoading(null);
  }, [refreshLayers]);

  const handleBgUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if(!file) return; const c=fcRef.current; if(!c) return;
    const reader = new FileReader();
    reader.onload = async () => { const { FabricImage } = await import('fabric'); const img = await FabricImage.fromURL(reader.result as string); img.set({left:0,top:0,originX:'left',originY:'top',scaleX:c.getWidth()/(img.width||1),scaleY:c.getHeight()/(img.height||1),selectable:false,evented:false,name:'__bgImage__'}); (img as any)._isBgImage=true; c.getObjects().filter((o:any)=>o._isBgImage&&o!==img).forEach((o:any)=>c.remove(o)); c.add(img); c.sendObjectToBack(img); c.getObjects().filter((o:any)=>o._isSafeZone||o._isGuideText||o._isSizeLabel).forEach((o:any)=>c.sendObjectToBack(o)); c.renderAll(); refreshLayers(); };
    reader.readAsDataURL(file); e.target.value='';
  }, [refreshLayers]);
  const removeBg = useCallback(() => { const c=fcRef.current; if(!c) return; c.getObjects().filter((o:any)=>o._isBgImage).forEach((o:any)=>c.remove(o)); c.renderAll(); refreshLayers(); }, [refreshLayers]);

    const handleSaveDesign = useCallback(async () => {
      const c=fcRef.current; if(!c) return;
      const json=c.toJSON(["_isBgImage","_isSafeZone","_isGuideLine","_isGuideText","_isSizeLabel","_isBgPattern","selectable","evented","name"]);
      const b=new Blob([JSON.stringify(json,null,2)],{type:"application/json"});
      if (typeof (window as any).showSaveFilePicker === "function") {
        try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+"_design.json",types:[{description:"Design JSON",accept:{"application/json":[".json"]}}]}); const w=await h.createWritable(); await w.write(b); await w.close(); } catch(e:any){ if(e.name!=="AbortError") console.error(e); }
      } else { const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=panelId+"_design.json"; a.click(); URL.revokeObjectURL(u); }
    }, [panelId]);

  const handleLoadDesign = useCallback(() => {
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
    inp.onchange = async (e:any) => { const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=async()=>{ try { const json=JSON.parse(reader.result as string); const c=fcRef.current; if(!c) return; await c.loadFromJSON(json); c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.renderAll(); refreshLayers(); pushHistory(); } catch{alert('Load failed')} }; reader.readAsText(file); };
    inp.click();
  }, [refreshLayers]);

  /* ══════════ JSX ══════════ */
  const activeObj = fcRef.current?.getActiveObject?.();
  const isText = activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text');


  // Draw rulers matching canvas pixel size to physical mm
  const drawRulers = useCallback(() => {
    if (!showRuler) return;
    const fc = fcRef.current;
    if (!fc) return;
    const cw = fc.getWidth(); const ch = fc.getHeight();
    // Top ruler
    const tC = rulerCanvasTopRef.current;
    if (tC) {
      tC.width = cw; tC.height = 20; tC.style.width = cw+'px'; tC.style.height='20px';
      const ctx = tC.getContext('2d')!;
      ctx.fillStyle='#2a2a3d'; ctx.fillRect(0,0,cw,20);
      const pxPerMm = cw / widthMM;
      for (let mm=0; mm<=widthMM; mm++) {
        const x = (mm/widthMM)*cw;
        const is10=mm%10===0; const is5=mm%5===0;
        const h = is10 ? 2 : is5 ? 8 : 13;
        ctx.strokeStyle = is10 ? '#eee' : is5 ? '#bbb' : '#777';
        ctx.lineWidth = is10 ? 1 : 0.5;
        if (pxPerMm < 2 && !is5) continue;
        ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x,h); ctx.stroke();
        if(is10){ctx.fillStyle='#eee';ctx.font='9px Arial';ctx.textAlign='center';ctx.fillText(mm+'',x,12);}
      }
    }
    // Left ruler
    const lC = rulerCanvasLeftRef.current;
    if (lC) {
      lC.width=20; lC.height=ch; lC.style.width='20px'; lC.style.height=ch+'px';
      const ctx = lC.getContext('2d')!;
      ctx.fillStyle='#2a2a3d'; ctx.fillRect(0,0,20,ch);
      const pxPerMm = ch / heightMM;
      for (let mm=0; mm<=heightMM; mm++) {
        const y = (mm/heightMM)*ch;
        const is10=mm%10===0; const is5=mm%5===0;
        const w = is10 ? 2 : is5 ? 8 : 13;
        ctx.strokeStyle = is10 ? '#eee' : is5 ? '#bbb' : '#777';
        ctx.lineWidth = is10 ? 1 : 0.5;
        if (pxPerMm < 2 && !is5) continue;
        ctx.beginPath(); ctx.moveTo(20,y); ctx.lineTo(w,y); ctx.stroke();
        if(is10){ctx.fillStyle='#eee';ctx.font='9px Arial';ctx.save();ctx.translate(12,y+3);ctx.textAlign='center';ctx.fillText(mm+'',0,0);ctx.restore();}
      }
    }
  }, [showRuler, widthMM, heightMM]);

  useEffect(() => { drawRulers(); }, [drawRulers]);

  return (
    <div ref={wrapperRef} className="flex h-screen overflow-hidden bg-[#1e1e2e]" tabIndex={0} onContextMenu={e=>e.preventDefault()}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* ══ LEFT TOOLBAR — Figma-style dark icon bar ══ */}
      <div className="w-[52px] bg-[#1e1e2e] flex flex-col items-center py-2 gap-0.5 shrink-0 border-r border-white/5">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black mb-3">P</div>

        {/* Select */}
        <button onClick={() => { const c=fcRef.current; if(c){c.isDrawingMode=false;setDrawMode(false);} setShowShapePanel(false);setShowTextPanel(false); }} title="Select (V)"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[15px] text-gray-400 hover:text-white hover:bg-white/10 transition-all">↖</button>

        {/* Text popup */}
        <div className="relative">
          <button onClick={()=>{addText();setShowTextPanel(p=>!p);setShowShapePanel(false);}} title="Text (T)"
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showTextPanel?"text-blue-400 bg-blue-500/20":"text-gray-400 hover:text-white hover:bg-white/10"}`}>T</button>
          {showTextPanel && (
            <div className="absolute left-[48px] top-0 w-[210px] bg-[#252538] border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-2.5 max-h-[80vh] overflow-y-auto">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Size</div>
              <div className="flex items-center gap-2">
                <input type="range" min="8" max="120" value={fSize} onChange={e=>{const s=Number(e.target.value);setFSize(s);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontSize",s);cv?.renderAll();}}} className="flex-1" />
                <input type="number" min="8" max="200" value={fSize} onChange={e=>{const s=Number(e.target.value);if(s>=8&&s<=200){setFSize(s);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontSize",s);cv?.renderAll();}}}} className="w-12 text-[11px] text-center bg-white/5 border border-white/10 rounded px-1 py-0.5 text-gray-300 outline-none" />
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Weight</div>
              <div className="grid grid-cols-4 gap-1">{([["Thin","100"],["Light","300"],["Normal","400"],["Medium","500"],["Semi","600"],["Bold","700"],["ExBold","800"],["Black","900"]] as [string,string][]).map(([label,w])=>(<button key={w} onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontWeight",w);cv?.renderAll();}}} className="py-1 text-[9px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all" style={{fontWeight:Number(w)}}>{label}</button>))}</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Align</div>
              <div className="flex gap-1">
                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("textAlign","left");cv?.renderAll();}}} className="flex-1 py-1.5 text-[12px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all" title="Left Align">≡</button>
                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("textAlign","center");cv?.renderAll();}}} className="flex-1 py-1.5 text-[12px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all" title="Center Align">☰</button>
                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("textAlign","right");cv?.renderAll();}}} className="flex-1 py-1.5 text-[12px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all" title="Right Align">≣</button>
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Style</div>
              <div className="flex gap-1">
                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){const cur=(obj as any).fontStyle;(obj as any).set("fontStyle",cur==="italic"?"normal":"italic");cv?.renderAll();}}} className="flex-1 py-1.5 text-[11px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all italic" title="Italic">I</button>
                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){const cur=(obj as any).underline;(obj as any).set("underline",!cur);cv?.renderAll();}}} className="flex-1 py-1.5 text-[11px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all underline" title="Underline">U</button>
                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){const cur=(obj as any).linethrough;(obj as any).set("linethrough",!cur);cv?.renderAll();}}} className="flex-1 py-1.5 text-[11px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all line-through" title="Strikethrough">S</button>
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Font</div>
              <select value={selectedFont} onChange={e=>{setSelectedFont(e.target.value);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontFamily",e.target.value);cv?.renderAll();}}} className="w-full text-[10px] bg-white border border-white/10 rounded-lg px-2 py-1.5 text-black outline-none">{["Arial, sans-serif","Helvetica, sans-serif","Georgia, serif","Times New Roman, serif","Courier New, monospace","Verdana, sans-serif","Impact, sans-serif","Trebuchet MS, sans-serif","Palatino, serif","Garamond, serif"].map(f=>(<option key={f} value={f} style={{fontFamily:f,color:"#000"}}>{f.split(",")[0]}</option>))}</select>
            </div>
          )}
        </div>

        {/* Shapes popup */}
        <div className="relative">
          <button onClick={()=>{setShowShapePanel(p=>!p);setShowTextPanel(false);}} title="Shapes"
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showShapePanel?"text-purple-400 bg-purple-500/20":"text-gray-400 hover:text-white hover:bg-white/10"}`}>▣</button>
          {showShapePanel && (
            <div className="absolute left-[48px] top-0 w-[230px] bg-[#252538] border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-2.5 max-h-[70vh] overflow-y-auto">
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rectangles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"rect",icon:"□",tip:"Rect"},{id:"roundrect",icon:"▢",tip:"Rounded"},{id:"diamond",icon:"◇",tip:"Diamond"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Circles & Arcs</div><div className="grid grid-cols-3 gap-1.5">{[{id:"circle",icon:"○",tip:"Circle"},{id:"ellipse",icon:"⬭",tip:"Ellipse"},{id:"semicircle",icon:"◓",tip:"Half"},{id:"arc",icon:"◠",tip:"Arc"},{id:"ring",icon:"◎",tip:"Ring"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Triangles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"triangle",icon:"△",tip:"Triangle"},{id:"righttri",icon:"◹",tip:"Right"},{id:"trapezoid",icon:"⏢",tip:"Trapezoid"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Polygons</div><div className="grid grid-cols-3 gap-1.5">{[{id:"pentagon",icon:"⬠",tip:"Pentagon"},{id:"hexagon",icon:"⬡",tip:"Hexagon"},{id:"octagon",icon:"⯂",tip:"Octagon"},{id:"cross",icon:"✚",tip:"Cross"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stars & Badges</div><div className="grid grid-cols-3 gap-1.5">{[{id:"star",icon:"☆",tip:"5-Star"},{id:"star6",icon:"✡",tip:"6-Star"},{id:"burst",icon:"✸",tip:"Burst"},{id:"badge",icon:"★",tip:"Badge"},{id:"heart",icon:"♥",tip:"Heart"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Arrows</div><div className="grid grid-cols-3 gap-1.5">{[{id:"arrow",icon:"➡",tip:"Arrow"},{id:"arrowThin",icon:"➜",tip:"Thin"},{id:"arrowDouble",icon:"↔",tip:"Double"},{id:"arrowCurved",icon:"↷",tip:"Curved"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Speech Bubbles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"bubble",icon:"💬",tip:"Speech"},{id:"bubbleRound",icon:"🗨",tip:"Round"},{id:"bubbleCloud",icon:"💭",tip:"Thought"},{id:"callout",icon:"📢",tip:"Callout"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Lines</div><div className="grid grid-cols-3 gap-1.5">{[{id:"line",icon:"─",tip:"Line"},{id:"dashed",icon:"┄",tip:"Dashed"},{id:"dotted",icon:"┈",tip:"Dotted"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>
            </div>
          )}
        </div>

        <div className="w-6 h-px bg-white/10 my-1" />

        <button onClick={addImage} title="Image" className="w-9 h-9 flex items-center justify-center rounded-lg text-[15px] text-gray-400 hover:text-white hover:bg-white/10 transition-all">🖼</button>
        <button onClick={()=>{setShowRuler(r=>!r)}} title="Ruler" className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showRuler ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>📏</button>
        <button onClick={toggleDraw} title="Draw" className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${drawMode ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>✏</button>
            {drawMode && (
              <div className="px-1 space-y-1">
                <input type="range" min="1" max="30" value={brushSize} onChange={e => {
                  const s = Number(e.target.value); setBrushSize(s);
                  const c = fcRef.current; if (c?.freeDrawingBrush) c.freeDrawingBrush.width = s;
                }} className="w-full" title={'Brush: ' + brushSize} />
                <input type="color" value={color} onChange={e => {
                  const cl = e.target.value; setColor(cl);
                  const c = fcRef.current; if (c?.freeDrawingBrush) c.freeDrawingBrush.color = cl;
                }} className="w-8 h-6 cursor-pointer mx-auto block" title="Brush Color" />
              </div>
            )}

        <div className="w-6 h-px bg-white/10 my-1" />
        <button onClick={()=>setShowColorPanel(p=>!p)} title="Colors" className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showColorPanel ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>🎨</button>
        {showColorPanel && (
          <div className="absolute left-[52px] bottom-16 w-[200px] bg-[#252538] border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-3">
            {/* Background Color */}
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Background</div>
              <div className="grid grid-cols-7 gap-1">
                {['#FFFFFF','#F8F9FA','#F1F3F5','#E9ECEF','#DEE2E6','#CED4DA','#ADB5BD',
                  '#FFF5F5','#FFE3E3','#FFC9C9','#FFA8A8','#FF8787','#FF6B6B','#FA5252',
                  '#FFF0F6','#FFDEEB','#FCC2D7','#FAA2C1','#F783AC','#E64980','#C2255C',
                  '#F8F0FC','#F3D9FA','#EEBEFA','#DA77F2','#CC5DE8','#BE4BDB','#9C36B5',
                  '#EDF2FF','#DBE4FF','#BAC8FF','#91A7FF','#748FFC','#5C7CFA','#4C6EF5',
                  '#E7F5FF','#D0EBFF','#A5D8FF','#74C0FC','#4DABF7','#339AF0','#228BE6',
                  '#E3FAFC','#C5F6FA','#99E9F2','#66D9E8','#3BC9DB','#22B8CF','#15AABF',
                  '#EBFBEE','#D3F9D8','#B2F2BB','#8CE99A','#69DB7C','#51CF66','#40C057',
                  '#FFF9DB','#FFF3BF','#FFEC99','#FFE066','#FFD43B','#FCC419','#FAB005',
                  '#FFF4E6','#FFE8CC','#FFD8A8','#FFC078','#FFA94D','#FF922B','#FD7E14',
                  '#212529','#343A40','#495057','#868E96','#000000','#1A1A2E','#16213E'
                ].map(c=>(
                  <button key={'bg-'+c} onClick={()=>{setBgColor(c);const cv=fcRef.current;if(cv){cv.backgroundColor=c;cv.renderAll();}}}
                    className={`w-5 h-5 rounded-sm border transition-all hover:scale-125 ${bgColor===c?'border-blue-400 ring-1 ring-blue-400 scale-110':'border-white/20'}`}
                    style={{background:c}} title={c} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2"><input type="color" value={bgColor} onChange={e=>{const c=e.target.value;setBgColor(c);const cv=fcRef.current;if(cv){cv.backgroundColor=c;cv.renderAll();}}} className="w-6 h-6 cursor-pointer rounded border border-white/20" title="Custom background color"/><span className="text-[9px] text-gray-500">Custom</span></div>
            </div>
            {/* Object Fill Color */}
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Object / Text</div>
              <div className="grid grid-cols-7 gap-1">
                {['#000000','#212529','#343A40','#495057','#868E96','#ADB5BD','#FFFFFF',
                  '#FF6B6B','#F06595','#CC5DE8','#845EF7','#5C7CFA','#339AF0','#22B8CF',
                  '#20C997','#51CF66','#94D82D','#FCC419','#FF922B','#FD7E14','#FA5252',
                  '#E64980','#BE4BDB','#7950F2','#4C6EF5','#228BE6','#15AABF','#12B886',
                  '#40C057','#82C91E','#FAB005','#F76707','#C92A2A','#A61E4D','#862E9C',
                  '#5F3DC4','#364FC7','#1864AB','#0B7285','#087F5B','#2B8A3E','#5C940D',
                  '#E67700','#D9480F','transparent'
                ].map(c=>(
                  <button key={'obj-'+c} onClick={()=>{setColor(c);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj){if(c==='transparent'){obj.set('fill','');obj.set('stroke','#000');obj.set('strokeWidth',2);}else{obj.set('fill',c);}cv?.renderAll();}}}
                    className={`w-5 h-5 rounded-sm border transition-all hover:scale-125 ${color===c?'border-blue-400 ring-1 ring-blue-400 scale-110':'border-white/20'}`}
                    style={{background:c==='transparent'?'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px':c}} title={c==='transparent'?'No fill':c} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={color===' transparent'?'#000000':color} onChange={e=>{setColor(e.target.value);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj){obj.set('fill',e.target.value);cv?.renderAll();}}} className="w-6 h-6 cursor-pointer rounded border border-white/20" title="Custom color"/>
                <span className="text-[9px] text-gray-500">Custom</span>
              </div>
            </div>
            <div className="w-full h-px bg-white/10 my-2" />
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Pick Color</div>
            <button onClick={()=>{if(typeof (window as any).EyeDropper!=='undefined'){new ((window as any).EyeDropper)().open().then((r:any)=>{setPickedColor(r.sRGBHex);setColor(r.sRGBHex);}).catch(()=>{});}}} className="w-full px-2 py-1.5 text-[10px] bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-all text-center">💉 Pick from Screen</button>
            {pickedColor && <div className="mt-1.5 flex items-center gap-2"><div className="w-6 h-6 rounded border border-white/20" style={{background:pickedColor}}/><span className="text-[10px] text-white font-mono">{pickedColor}</span></div>}
          </div>
        )}
        <div className="flex-1" />

        <button onClick={del} title="Delete" className="w-9 h-9 flex items-center justify-center rounded-lg text-[15px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">🗑</button>
        <button onClick={() => setShowShortcuts(true)} title="Shortcuts (F1)" className="w-9 h-9 flex items-center justify-center rounded-lg text-[13px] text-gray-500 hover:text-white hover:bg-white/10 transition-all">⌨</button>
      </div>

      {/* ══ CENTER AREA ══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Bar ── */}
        <div className="h-11 bg-[#252536] flex items-center px-3 gap-2 shrink-0 border-b border-white/5">
          <button onClick={onBack} className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">← {t('back')}</button>
          <div className="h-5 w-px bg-white/10" />
          <div>
            <span className="text-xs font-semibold text-white">{panelName}</span>
            <span className="text-[10px] text-gray-500 ml-2">{widthMM}×{heightMM}mm</span>
          </div>
          <div className="flex-1" />
          {onPrevPanel && <button onClick={()=>{handleSavePanel();onPrevPanel()}} className="px-2.5 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">← {t('ed.prev')}</button>}
          {onNextPanel && <button onClick={()=>{handleSavePanel();onNextPanel()}} className="px-3 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-500 font-medium transition-colors">{t('ed.next')} →</button>}
          <div className="h-5 w-px bg-white/10" />
          <button onClick={handleSaveDesign} title="Save design file" className="px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">💾 {t('ed.save')}</button>
          <button onClick={handleLoadDesign} title="Load design file" className="px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">📂 {t('ed.load')}</button>
          <div className="h-5 w-px bg-white/10" />
          <button onClick={undo} title="Undo" className="px-1.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">↩</button>
          <button onClick={redo} title="Redo" className="px-1.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">↪</button>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-1 bg-white/5 rounded px-1.5 py-0.5">
            <button onClick={()=>applyZoom(Math.max(25,zoom-10))} className="text-gray-400 hover:text-white text-[10px] w-4 text-center">−</button>
            <span className="text-[10px] text-gray-300 w-8 text-center">{zoom}%</span>
            <button onClick={()=>applyZoom(Math.min(400,zoom+10))} className="text-gray-400 hover:text-white text-[10px] w-4 text-center">+</button>
          </div>
          <button onClick={() => setShowGrid(g => !g)} className={`px-1.5 py-1 text-[10px] rounded transition-colors ${showGrid?'text-blue-400 bg-blue-500/20':'text-gray-400 hover:text-white hover:bg-white/10'}`}>⊞</button>
          <div className="h-5 w-px bg-white/10" />
          <select value={exportScale} onChange={e=>setExportScale(Number(e.target.value))} className="text-[10px] bg-white/5 text-gray-300 border-0 rounded px-1 py-0.5 outline-none"><option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option><option value={4}>4x</option></select>
          <button onClick={()=>handleExport('png')} className="px-2 py-1 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-500 font-medium transition-colors">PNG</button>
          <button onClick={()=>handleExport('svg')} className="px-2 py-1 text-[10px] bg-teal-600 text-white rounded hover:bg-teal-500 font-medium transition-colors">SVG</button>
          <button onClick={()=>handleExport('pdf')} className="px-2 py-1 text-[10px] bg-rose-600 text-white rounded hover:bg-rose-500 font-medium transition-colors">PDF</button>
          <div className="h-5 w-px bg-white/10" />
          <button onClick={()=>{handleSavePanel();onBack();}} className="px-3 py-1 text-[10px] bg-green-600 text-white rounded hover:bg-green-500 font-medium transition-colors">✅ Complete</button>
          <div className="h-5 w-px bg-white/10" />
          <LanguageSelector className="text-[10px] bg-white/10 text-white border border-white/20 rounded px-1.5 py-0.5 outline-none cursor-pointer" />
        </div>

        {/* ── Canvas with Rulers ── */}
        <div className="flex-1 overflow-auto bg-[#2a2a3d] relative flex items-center justify-center p-8">
          <div className="relative">
            {/* Corner square */}
            {showRuler && <div className="absolute -top-[20px] -left-[20px] w-[20px] h-[20px] bg-[#2a2a3d] border-r border-b border-[#555] z-10 flex items-center justify-center text-[7px] text-gray-400">mm</div>}
            {/* Top ruler */}
            {showRuler && <canvas ref={rulerCanvasTopRef} className="absolute -top-[20px] left-0 h-[20px] border-b border-[#555]" />}
            {/* Left ruler */}
            {showRuler && <canvas ref={rulerCanvasLeftRef} className="absolute top-0 -left-[20px] w-[20px] border-r border-[#555]" />}
            {/* Canvas */}
            {/* Canvas */}
            <div className="rounded-sm shadow-2xl ring-1 ring-black/20">
              <canvas ref={canvasElRef} style={{boxShadow:'0 2px 16px rgba(0,0,0,0.25)', border:'1px solid #e0e0e0'}} />
              {showGrid && <div className="absolute inset-0 pointer-events-none opacity-60" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(200,200,220,0.4) 19px,rgba(200,200,220,0.4) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(200,200,220,0.4) 19px,rgba(200,200,220,0.4) 20px)',backgroundSize:'20px 20px'}} />}
            </div>
          </div>
          {showMinimap && <div className="absolute bottom-4 right-[290px] border border-white/10 rounded-lg overflow-hidden bg-black/40 shadow-xl backdrop-blur-sm"><canvas ref={minimapRef} width={160} height={100} /></div>}
        </div>

        {/* ── Bottom Status ── */}
        <div className="h-6 bg-[#252536] border-t border-white/5 flex items-center px-3 gap-3 shrink-0">
          <span className="text-[9px] text-gray-500">{panelId}</span>
          <span className="text-[9px] text-gray-600">|</span>
          <span className="text-[9px] text-gray-500">{widthMM}×{heightMM}mm</span>
          <span className="text-[9px] text-gray-600">|</span>
          <span className="text-[9px] text-gray-500">Objects: {layersList.length}</span>
          <div className="flex-1" />
          <button onClick={()=>setShowMinimap(!showMinimap)} className={`text-[9px] px-1 rounded ${showMinimap?'text-blue-400':'text-gray-500 hover:text-gray-300'}`}>Minimap</button>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="w-[280px] bg-[#252536] flex flex-col overflow-hidden shrink-0 border-l border-white/5">
        {/* Tabs */}
        <div className="flex shrink-0 border-b border-white/5">
          {(['templates','copy','review','layers','history'] as const).map(tab => (
            <button key={tab} onClick={()=>setAiTab(tab)}
              className={`flex-1 py-2 text-[10px] font-medium transition-all ${aiTab===tab ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>
              {tab==='templates'?'🎨':tab==='copy'?'✍':tab==='review'?'🔍':tab==='layers'?'◫':'⏱'}<br/>{t('tab.'+tab)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ─ Templates ─ */}
          {aiTab === 'templates' && (
            <div className="p-2">
              <div className="flex flex-wrap gap-1 mb-2">{categories.map(cat=>(
                <button key={cat} onClick={()=>setSelectedCategory(cat)} className={`px-2 py-0.5 text-[10px] rounded-full transition-all ${selectedCategory===cat?'bg-blue-500 text-white shadow-lg shadow-blue-500/25':'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'}`}>{cat}</button>
              ))}</div>
              <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => { const c=fcRef.current; if(!c) return; c.getObjects().slice().forEach((o:any)=>c.remove(o)); c.backgroundColor="#FFFFFF"; c.renderAll(); setTimeout(()=>{pushHistory();handleSavePanel();},50); }} className="col-span-2 py-2 mb-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
                <span>🗑️</span> Clear Canvas
              </button>
                {filteredTemplates.map(tpl=>(
                  <button key={tpl.id} onClick={()=>applyTemplate(tpl)} disabled={templateLoading===tpl.id}
                    className="relative rounded-lg border border-white/5 hover:border-blue-500/50 transition-all text-left overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="aspect-[3/4] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200" style={{background: tpl.preview || '#333'}}></div>
                    <div className="px-1.5 py-1 bg-black/20">
                      <div className="text-[10px] font-medium text-gray-300 truncate">{tpl.name}</div>
                      <div className="text-[8px] text-gray-500">{tpl.category}</div>
                    </div>
                    {templateLoading===tpl.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"><div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"/></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─ AI Copy ─ */}
          {aiTab === 'copy' && (
            <div className="p-3 space-y-2.5">
              <div><label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Product Name</label><input value={copyProduct} onChange={e=>setCopyProduct(e.target.value)} className="w-full mt-1 px-2.5 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all" placeholder="e.g. Green Tea Extract"/></div>
              <div><label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Brand Name</label><input value={copyBrand} onChange={e=>setCopyBrand(e.target.value)} className="w-full mt-1 px-2.5 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all" placeholder="e.g. EcoPure"/></div>
              <button onClick={handleAiCopy} disabled={copyLoading||!copyProduct.trim()} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25">{copyLoading?'⏳ Generating...':'✨ Generate AI Copy'}</button>
              {copyResult && <div className="space-y-1.5 mt-2">{Object.entries(copyResult).filter(([k])=>['headline','description','slogan','features','backPanel'].includes(k)).map(([key,val])=>(
                <div key={key} className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-0.5"><span className="text-[9px] font-bold text-gray-500 uppercase">{key}</span><button onClick={()=>applyCopyToCanvas(key,String(val))} className="text-[9px] text-blue-400 hover:text-blue-300 font-medium">+ Canvas</button></div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{String(val)}</p>
                </div>
              ))}</div>}
            </div>
          )}

          {/* ─ AI Review ─ */}
          {aiTab === 'review' && (
            <div className="p-3 space-y-2.5">
              <button onClick={handleAiReview} disabled={reviewLoading} className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold rounded-lg hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/25">{reviewLoading?'⏳ Analyzing...':'🔍 AI Design Review'}</button>
              {reviewResult && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-baseline gap-2"><span className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{reviewResult.score}</span><span className="text-xs text-gray-500">/ 100</span></div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{reviewResult.summary}</p>
                  {reviewResult.issues?.length>0 && <div className="mt-1.5 space-y-1 p-2 bg-red-500/10 rounded-lg border border-red-500/20"><div className="text-[10px] font-bold text-red-400 mb-1">Issues Found:</div>{reviewResult.issues.map((issue:string,i:number)=><p key={i} className="text-[10px] text-red-300/80 leading-snug">• {issue}</p>)}</div>}
                </div>
              )}
            </div>
          )}

          {/* ─ Layers ─ */}
          {aiTab === 'layers' && (
            <div className="p-2">
              {layersList.length===0 && <p className="text-[11px] text-gray-600 text-center py-8">No objects on canvas</p>}
              {[...layersList].reverse().map((layer,i)=>(
                <div key={layer.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-all" onClick={()=>{const c=fcRef.current;if(!c)return;const idx=layersList.length-1-i;const obj=c.getObjects().filter((o:any)=>o.selectable!==false)[idx];if(obj){c.setActiveObject(obj);c.renderAll();}}}>
                  <span className="text-xs w-5 text-center">{layer.type==='image'?'🖼':layer.type==='i-text'?'T':layer.type==='path'?'✏':'■'}</span>
                  <span className="flex-1 text-[10px] text-gray-400 truncate group-hover:text-gray-200">{layer.name||layer.type}</span>
                  <button onClick={e=>{e.stopPropagation();const c=fcRef.current;if(!c)return;const idx=layersList.length-1-i;const obj=c.getObjects().filter((o:any)=>o.selectable!==false)[idx];if(obj){obj.visible=!obj.visible;c.renderAll();refreshLayers();}}} className="text-gray-600 hover:text-gray-300 text-[10px] opacity-0 group-hover:opacity-100 transition-all">{layer.visible?'👁':'ー'}</button>
                </div>
              ))}
            </div>
          )}

          {/* ─ History ─ */}
          {aiTab === 'history' && (
            <div className="p-2">
              {historyRef.current.length<=1 && <p className="text-[11px] text-gray-600 text-center py-8">No history yet</p>}
              {historyRef.current.map((_,i)=>(
                <button key={i} onClick={()=>{const c=fcRef.current;if(!c)return;historyIdxRef.current=i;loadingRef.current=true;c.loadFromJSON(JSON.parse(historyRef.current[i])).then(()=>{c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}});c.renderAll();loadingRef.current=false;refreshLayers();setHistoryIdx(i);});}}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] mb-0.5 transition-all ${i===historyIdx?'bg-blue-500/20 text-blue-300 font-medium':'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                  Step #{i+1} {i===historyRef.current.length-1 && <span className="text-[8px] text-blue-500 ml-1">● current</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Properties Panel (bottom of right sidebar) ── */}
        <div className="shrink-0 border-t border-white/5 p-3 space-y-2.5 max-h-[280px] overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Properties</div>

          {/* Color */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input type="color" value={color} onChange={e=>{setColor(e.target.value);const c=fcRef.current;const obj=c?.getActiveObject();if(obj){obj.set('fill',e.target.value);c?.renderAll();}}} className="w-7 h-7 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0 appearance-none" />
            </div>
            <input type="text" value={color} onChange={e=>setColor(e.target.value)} className="flex-1 text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 outline-none focus:border-blue-500/50" />
          </div>

          {/* Font size */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500 w-8">Size</span>
            <input type="number" value={fSize} onChange={e=>{const v=Number(e.target.value);setFSize(v);const c=fcRef.current;const obj=c?.getActiveObject();if(obj&&(obj.type==='i-text'||obj.type==='text')){obj.set('fontSize',v);c?.renderAll();}}} className="flex-1 text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 outline-none focus:border-blue-500/50" min={8} max={200} />
          </div>

          {/* Font family */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500 w-8">Font</span>
            <select value={selectedFont} onChange={e=>{setSelectedFont(e.target.value);const c=fcRef.current;const obj=c?.getActiveObject();if(obj&&(obj.type==='i-text'||obj.type==='text')){obj.set('fontFamily',e.target.value);c?.renderAll();}}} className="flex-1 text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 outline-none focus:border-blue-500/50 appearance-none">
              {FONT_LIST.map(f=><option key={f.family} value={f.family} className="bg-[#252536]">{f.name}</option>)}
            </select>
          </div>

          {/* Background */}
          <div className="pt-1 border-t border-white/5">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Background</div>
            <div className="flex gap-1.5">
              <label className="flex-1 py-1.5 text-center text-[9px] text-gray-400 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 hover:text-gray-300 transition-all border border-white/5">
                Upload<input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
              </label>
              <button onClick={removeBg} className="flex-1 py-1.5 text-[9px] text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/10">Remove</button>
            </div>
          </div>

        </div>
      </div>

      {/* ══ CONTEXT MENU ══ */}
      {ctxMenu && (
        <div className="fixed bg-[#2a2a3d] rounded-xl shadow-2xl border border-white/10 py-1 z-50 min-w-[160px] backdrop-blur-xl" style={{left:ctxMenu.x+(wrapperRef.current?.getBoundingClientRect().left||0),top:ctxMenu.y+(wrapperRef.current?.getBoundingClientRect().top||0)}}>
          <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-[11px] text-gray-300 transition-colors" onClick={()=>{const c=fcRef.current;if(!c||!ctxMenu.target)return;if(ctxMenu.target.type==='activeselection'){const ch=(ctxMenu.target as any)._objects||[];c.discardActiveObject();ch.forEach((o:any)=>{if(o.selectable!==false)c.remove(o)});}else{c.remove(ctxMenu.target);c.discardActiveObject();}c.renderAll();refreshLayers();setCtxMenu(null);}}>🗑 Delete</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-[11px] text-gray-300 transition-colors" onClick={()=>{const c=fcRef.current;if(!c||!ctxMenu.target)return;const tgt=ctxMenu.target;const lk=!!tgt.lockMovementX;tgt.set({lockMovementX:!lk,lockMovementY:!lk,lockRotation:!lk,lockScalingX:!lk,lockScalingY:!lk,hasControls:lk});c.renderAll();setCtxMenu(null);}}>{ctxMenu.target?.lockMovementX?'🔓 Unlock':'🔒 Lock'}</button>
          <div className="h-px bg-white/5 my-0.5" />
          <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-[11px] text-gray-300 transition-colors" onClick={()=>{fcRef.current?.bringObjectToFront(ctxMenu.target);fcRef.current?.renderAll();refreshLayers();setCtxMenu(null);}}>⏫ Bring to Front</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-[11px] text-gray-300 transition-colors" onClick={()=>{fcRef.current?.bringObjectForward(ctxMenu.target);fcRef.current?.renderAll();refreshLayers();setCtxMenu(null);}}>⬆ Bring Forward</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-[11px] text-gray-300 transition-colors" onClick={()=>{fcRef.current?.sendObjectBackwards(ctxMenu.target);fcRef.current?.renderAll();refreshLayers();setCtxMenu(null);}}>⬇ Send Backward</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-[11px] text-gray-300 transition-colors" onClick={()=>{fcRef.current?.sendObjectToBack(ctxMenu.target);fcRef.current?.renderAll();refreshLayers();setCtxMenu(null);}}>⏬ Send to Back</button>
        </div>
      )}

      {/* ══ SHORTCUTS MODAL ══ */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={()=>setShowShortcuts(false)}>
          <div className="bg-[#2a2a3d] rounded-2xl shadow-2xl p-6 max-w-xs w-full mx-4 border border-white/10" onClick={e=>e.stopPropagation()}>
            <h2 className="text-sm font-bold text-white mb-4">⌨ Keyboard Shortcuts</h2>
            <div className="space-y-1">
              {[['Undo','Ctrl+Z'],['Redo','Ctrl+Shift+Z'],['Copy','Ctrl+C'],['Paste','Ctrl+V'],['Cut','Ctrl+X'],['Duplicate','Ctrl+D'],['Delete','Del / Backspace'],['Select All','Ctrl+A'],['Zoom','Ctrl+Scroll'],['Pan','Space+Drag'],['Grid','Ctrl+G'],['Shortcuts','F1']].map(([n,k])=>(
                <div key={n} className="flex justify-between py-1"><span className="text-[11px] text-gray-400">{n}</span><kbd className="text-[9px] bg-white/5 text-gray-500 px-2 py-0.5 rounded border border-white/10 font-mono">{k}</kbd></div>
              ))}
            </div>
            <button onClick={()=>setShowShortcuts(false)} className="mt-4 w-full py-2 bg-white/5 rounded-xl text-xs text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-all border border-white/5">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
