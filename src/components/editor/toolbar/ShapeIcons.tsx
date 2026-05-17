import React from "react";

const S = ({ children, ...p }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);

// ─── Basic ───
export const ShapeRect = () => <S><rect x="3" y="5" width="18" height="14" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeRoundRect = () => <S><rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeSquare = () => <S><rect x="4" y="4" width="16" height="16" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeCircle = () => <S><circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeEllipse = () => <S><ellipse cx="12" cy="12" rx="10" ry="7" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeTriangle = () => <S><polygon points="12,3 22,21 2,21" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;

// ─── Polygon ───
export const ShapeDiamond = () => <S><polygon points="12,2 22,12 12,22 2,12" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapePentagon = () => { const pts = [0,1,2,3,4].map(i => { const a = -Math.PI/2 + i*2*Math.PI/5; return `${12+9*Math.cos(a)},${12+9*Math.sin(a)}`; }).join(" "); return <S><polygon points={pts} fill="currentColor" opacity="0.15" stroke="currentColor"/></S>; };
export const ShapeHexagon = () => { const pts = [0,1,2,3,4,5].map(i => { const a = i*Math.PI/3; return `${12+9*Math.cos(a)},${12+9*Math.sin(a)}`; }).join(" "); return <S><polygon points={pts} fill="currentColor" opacity="0.15" stroke="currentColor"/></S>; };
export const ShapeOctagon = () => { const pts = [0,1,2,3,4,5,6,7].map(i => { const a = i*Math.PI/4 + Math.PI/8; return `${12+9*Math.cos(a)},${12+9*Math.sin(a)}`; }).join(" "); return <S><polygon points={pts} fill="currentColor" opacity="0.15" stroke="currentColor"/></S>; };
export const ShapeStar5 = () => { const pts = [0,1,2,3,4,5,6,7,8,9].map(i => { const r = i%2===0?9:4; const a = -Math.PI/2 + i*Math.PI/5; return `${12+r*Math.cos(a)},${12+r*Math.sin(a)}`; }).join(" "); return <S><polygon points={pts} fill="currentColor" opacity="0.15" stroke="currentColor"/></S>; };
export const ShapeStar6 = () => { const pts = [0,1,2,3,4,5,6,7,8,9,10,11].map(i => { const r = i%2===0?9:5; const a = -Math.PI/2 + i*Math.PI/6; return `${12+r*Math.cos(a)},${12+r*Math.sin(a)}`; }).join(" "); return <S><polygon points={pts} fill="currentColor" opacity="0.15" stroke="currentColor"/></S>; };
export const ShapeCross = () => <S><polygon points="8,2 16,2 16,8 22,8 22,16 16,16 16,22 8,22 8,16 2,16 2,8 8,8" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;

// ─── Arrow ───
export const ShapeArrowRight = () => <S><path d="M2 10h14V5l6 7-6 7v-5H2z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeArrowLeft = () => <S><path d="M22 10H8V5L2 12l6 7v-5h14z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeArrowUp = () => <S><path d="M10 22V8H5l7-6 7 6h-5v14z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeArrowDown = () => <S><path d="M10 2v14H5l7 6 7-6h-5V2z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeArrowDouble = () => <S><path d="M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeChevronRight = () => <S><path d="M4 4l8 8-8 8" strokeWidth="2.5" fill="none"/><path d="M12 4l8 8-8 8" strokeWidth="2.5" fill="none"/></S>;

// ─── Callout ───
export const ShapeBubble = () => <S><path d="M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H10l-4 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeThought = () => <S><ellipse cx="12" cy="10" rx="9" ry="7" fill="currentColor" opacity="0.15" stroke="currentColor"/><circle cx="8" cy="19" r="1.5" fill="currentColor" opacity="0.3"/><circle cx="5" cy="21.5" r="1" fill="currentColor" opacity="0.3"/></S>;
export const ShapeCalloutBox = () => <S><rect x="3" y="3" width="18" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor"/><polygon points="8,15 14,15 10,21" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeLabelTag = () => <S><path d="M3 5v14l4-3h14V5z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;

// ─── Line ───
export const ShapeLine = () => <S><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2"/></S>;
export const ShapeDashed = () => <S><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeDasharray="4 3"/></S>;
export const ShapeDotted = () => <S><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeDasharray="1.5 3" strokeLinecap="round"/></S>;
export const ShapeArrowLine = () => <S><line x1="3" y1="12" x2="18" y2="12" strokeWidth="2"/><polygon points="18,8 23,12 18,16" fill="currentColor" stroke="none"/></S>;
export const ShapeArrowLineBoth = () => <S><line x1="6" y1="12" x2="18" y2="12" strokeWidth="2"/><polygon points="18,8 23,12 18,16" fill="currentColor" stroke="none"/><polygon points="6,8 1,12 6,16" fill="currentColor" stroke="none"/></S>;

// ─── Badge ───
export const ShapeRing = () => <S><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3"/></S>;
export const ShapeShield = () => <S><path d="M12 2L3 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeHeart = () => <S><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeRibbon = () => <S><path d="M4 2h16v16l-8-4-8 4z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeBanner = () => <S><path d="M1 5h22v10H1z" fill="currentColor" opacity="0.15" stroke="currentColor"/><path d="M4 5V3" strokeWidth="1.5"/><path d="M20 5V3" strokeWidth="1.5"/><path d="M1 15l3-2v4z" fill="currentColor" opacity="0.2" stroke="currentColor"/><path d="M23 15l-3-2v4z" fill="currentColor" opacity="0.2" stroke="currentColor"/></S>;
export const ShapeSeal = () => { const pts = Array.from({length:16}).map((_,i) => { const r = i%2===0?10:7; const a = i*Math.PI/8; return `${12+r*Math.cos(a)},${12+r*Math.sin(a)}`; }).join(" "); return <S><polygon points={pts} fill="currentColor" opacity="0.15" stroke="currentColor"/></S>; };

// ─── Packaging ───
export const ShapeNutritionBox = () => <S><rect x="3" y="2" width="18" height="20" rx="1" stroke="currentColor" fill="currentColor" opacity="0.05"/><line x1="5" y1="6" x2="19" y2="6" strokeWidth="2"/><line x1="5" y1="9" x2="15" y2="9" strokeWidth="0.7"/><line x1="5" y1="11.5" x2="19" y2="11.5" strokeWidth="0.7"/><line x1="5" y1="14" x2="17" y2="14" strokeWidth="0.7"/><line x1="5" y1="16.5" x2="13" y2="16.5" strokeWidth="0.7"/><line x1="5" y1="19" x2="16" y2="19" strokeWidth="0.7"/></S>;
export const ShapeWarning = () => <S><polygon points="12,2 22,20 2,20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/><text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F59E0B" stroke="none">!</text></S>;
export const ShapeRecycle = () => <S><path d="M12 4l3 5H9z M7 11l-3 5h6z M17 11l3 5h-6z" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;
export const ShapeCertBadge = () => <S><circle cx="12" cy="10" r="7" fill="currentColor" opacity="0.15" stroke="currentColor"/><path d="M8 16l-1 6 5-3 5 3-1-6" fill="currentColor" opacity="0.15" stroke="currentColor"/></S>;

