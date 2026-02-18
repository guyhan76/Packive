export interface TemplateElement {
  type: 'text' | 'rect' | 'circle' | 'image-placeholder'
  panel: 'panel1' | 'panel2' | 'panel3' | 'panel4' | 'top' | 'bottom'
  relativeX: number
  relativeY: number
  relativeWidth: number
  relativeHeight: number
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  text?: string
  fontSize?: number
  fontWeight?: string
  fontFamily?: string
  textAlign?: string
  editable: boolean
  editHint?: string
  locked?: boolean
}

export interface DesignTemplate {
  id: string
  name: string
  category: string
  subcategory: string
  thumbnail: string
  description: string
  isPremium: boolean
  colors: string[]
  elements: TemplateElement[]
}

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: '🎨' },
  { id: 'cosmetics', name: 'Cosmetics & Beauty', icon: '✨' },
  { id: 'food', name: 'Food & Beverage', icon: '🍕' },
  { id: 'electronics', name: 'Electronics & Tech', icon: '📱' },
  { id: 'eco', name: 'Eco-Friendly', icon: '🌿' },
  { id: 'luxury', name: 'Premium & Luxury', icon: '👑' },
  { id: 'minimal', name: 'Minimalist', icon: '◻️' },
]

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  // === Cosmetics ===
  {
    id: 'cosmetics-minimal-white', name: 'Pure Glow', category: 'cosmetics', subcategory: 'Skincare',
    thumbnail: '', description: 'Clean white with gold accents for premium skincare', isPremium: false,
    colors: ['#FFFFFF', '#D4AF37', '#333333', '#888888', '#FAFAF8'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFFFFF', editable: false, locked: true, opacity: 0.9 },
      { type: 'rect', panel: 'panel2', relativeX: 0.1, relativeY: 0.05, relativeWidth: 0.8, relativeHeight: 0.003, fill: '#D4AF37', editable: false, locked: true },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.15, relativeWidth: 0.8, relativeHeight: 0.08, fill: '#D4AF37', text: 'BRAND NAME', fontSize: 22, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Replace with your brand name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.7, relativeHeight: 0.06, fill: '#333333', text: 'Product Name', fontSize: 18, fontWeight: 'normal', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Replace with product name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.45, relativeWidth: 0.6, relativeHeight: 0.04, fill: '#888888', text: 'Subtitle or variant', fontSize: 12, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Add product subtitle' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.65, relativeWidth: 0.3, relativeHeight: 0.2, fill: '#F5F0E8', editable: true, editHint: 'Drop your product image here' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.88, relativeWidth: 0.5, relativeHeight: 0.03, fill: '#AAAAAA', text: '50ml / 1.7 fl oz', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product size/weight' },
      { type: 'rect', panel: 'panel2', relativeX: 0.1, relativeY: 0.95, relativeWidth: 0.8, relativeHeight: 0.003, fill: '#D4AF37', editable: false, locked: true },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFFFFF', editable: false, locked: true, opacity: 0.9 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.8, relativeHeight: 0.06, fill: '#D4AF37', text: 'BRAND NAME', fontSize: 16, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.8, relativeHeight: 0.2, fill: '#666666', text: 'Our premium skincare line is crafted with the finest natural ingredients.', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand story' },
      { type: 'image-placeholder', panel: 'panel4', relativeX: 0.5, relativeY: 0.6, relativeWidth: 0.4, relativeHeight: 0.1, fill: '#F0F0F0', editable: true, editHint: 'Place barcode here' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.82, relativeWidth: 0.8, relativeHeight: 0.1, fill: '#999999', text: 'Manufacturer: Your Company\nSeoul, Korea', fontSize: 7, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Manufacturer info' },
    ]
  },
  {
    id: 'cosmetics-floral-pink', name: 'Rose Petal', category: 'cosmetics', subcategory: 'Skincare',
    thumbnail: '', description: 'Soft pink with floral feel for feminine beauty products', isPremium: false,
    colors: ['#FFF0F3', '#C4507A', '#8B3A5E', '#FFD6E0', '#FFBCD0'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFF0F3', editable: false, locked: true, opacity: 0.95 },
      { type: 'circle', panel: 'panel2', relativeX: 0.15, relativeY: 0.12, relativeWidth: 0.12, relativeHeight: 0.08, fill: '#FFD6E0', editable: false, locked: true, opacity: 0.5 },
      { type: 'circle', panel: 'panel2', relativeX: 0.85, relativeY: 0.85, relativeWidth: 0.15, relativeHeight: 0.1, fill: '#FFD6E0', editable: false, locked: true, opacity: 0.3 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.12, relativeWidth: 0.8, relativeHeight: 0.07, fill: '#C4507A', text: 'Brand Name', fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Your brand name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.32, relativeWidth: 0.7, relativeHeight: 0.06, fill: '#8B3A5E', text: 'Product Name', fontSize: 16, fontWeight: 'normal', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.42, relativeWidth: 0.6, relativeHeight: 0.04, fill: '#C4507A', text: 'with Rose Extract', fontSize: 11, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Key ingredient' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.63, relativeWidth: 0.35, relativeHeight: 0.2, fill: '#FFE4EC', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.88, relativeWidth: 0.4, relativeHeight: 0.03, fill: '#C4507A', text: '30ml', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Size' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFF5F7', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.8, relativeHeight: 0.06, fill: '#C4507A', text: 'Brand Name', fontSize: 14, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Brand' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.8, relativeHeight: 0.25, fill: '#8B3A5E', text: 'Description of your wonderful product.', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product description' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.85, relativeWidth: 0.8, relativeHeight: 0.08, fill: '#AAAAAA', text: 'Manufacturer Info', fontSize: 7, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Manufacturer' },
    ]
  },
  {
    id: 'cosmetics-dark-luxury', name: 'Noir Elegance', category: 'cosmetics', subcategory: 'Premium',
    thumbnail: '', description: 'Dark sophisticated design with metallic accents', isPremium: true,
    colors: ['#1A1A2E', '#C9A96E', '#FFFFFF', '#2A2A4A', '#888888'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#1A1A2E', editable: false, locked: true, opacity: 0.95 },
      { type: 'rect', panel: 'panel2', relativeX: 0.05, relativeY: 0.03, relativeWidth: 0.9, relativeHeight: 0.94, fill: 'transparent', stroke: '#C9A96E', strokeWidth: 1, editable: false, locked: true },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.15, relativeWidth: 0.7, relativeHeight: 0.08, fill: '#C9A96E', text: 'BRAND', fontSize: 24, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.6, relativeHeight: 0.06, fill: '#FFFFFF', text: 'Product Name', fontSize: 16, fontWeight: 'normal', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.6, relativeWidth: 0.3, relativeHeight: 0.2, fill: '#2A2A4A', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.88, relativeWidth: 0.4, relativeHeight: 0.03, fill: '#C9A96E', text: '50ml', fontSize: 10, fontWeight: 'normal', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Size' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#1A1A2E', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.7, relativeHeight: 0.06, fill: '#C9A96E', text: 'BRAND', fontSize: 14, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Brand' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.4, relativeWidth: 0.8, relativeHeight: 0.2, fill: '#CCCCCC', text: 'Luxury product description.', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Description' },
    ]
  },
  // === Food ===
  {
    id: 'food-organic-green', name: 'Fresh Harvest', category: 'food', subcategory: 'Organic',
    thumbnail: '', description: 'Natural green tones for health food products', isPremium: false,
    colors: ['#F4F9F0', '#4A7C59', '#2D5A3D', '#D4E8C0', '#E8F0E0'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#F4F9F0', editable: false, locked: true, opacity: 0.95 },
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 0.25, fill: '#4A7C59', editable: false, locked: true, opacity: 0.9 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.08, relativeWidth: 0.8, relativeHeight: 0.07, fill: '#FFFFFF', text: 'BRAND NAME', fontSize: 20, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.18, relativeWidth: 0.6, relativeHeight: 0.04, fill: '#D4E8C0', text: '100% ORGANIC', fontSize: 10, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Tagline' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.38, relativeWidth: 0.7, relativeHeight: 0.07, fill: '#2D5A3D', text: 'Product Name', fontSize: 18, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.58, relativeWidth: 0.4, relativeHeight: 0.2, fill: '#E8F0E0', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.82, relativeWidth: 0.5, relativeHeight: 0.03, fill: '#4A7C59', text: 'Net Wt. 250g', fontSize: 11, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Weight' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#F4F9F0', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.7, relativeHeight: 0.05, fill: '#4A7C59', text: 'Nutrition Facts', fontSize: 13, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Section title' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.8, relativeHeight: 0.25, fill: '#555555', text: 'Calories: 120\nProtein: 5g\nCarbs: 20g', fontSize: 9, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'left', editable: true, editHint: 'Nutrition info' },
    ]
  },
  {
    id: 'food-bold-snack', name: 'Snack Attack', category: 'food', subcategory: 'Snacks',
    thumbnail: '', description: 'Bold colorful design for snack products', isPremium: false,
    colors: ['#FF6B35', '#FFD23F', '#FFFFFF', '#FF8C5A', '#FFF4E6'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FF6B35', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.8, relativeHeight: 0.08, fill: '#FFFFFF', text: 'BRAND', fontSize: 22, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'rect', panel: 'panel2', relativeX: 0.1, relativeY: 0.25, relativeWidth: 0.8, relativeHeight: 0.18, fill: '#FFD23F', editable: false, locked: true, opacity: 0.9 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.32, relativeWidth: 0.7, relativeHeight: 0.08, fill: '#FF6B35', text: 'PRODUCT', fontSize: 20, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.58, relativeWidth: 0.5, relativeHeight: 0.22, fill: '#FF8C5A', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.88, relativeWidth: 0.5, relativeHeight: 0.04, fill: '#FFFFFF', text: '150g', fontSize: 14, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Weight' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFF4E6', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.7, relativeHeight: 0.05, fill: '#FF6B35', text: 'BRAND', fontSize: 14, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.4, relativeWidth: 0.8, relativeHeight: 0.2, fill: '#555555', text: 'Ingredients & Nutrition', fontSize: 9, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Ingredients' },
    ]
  },
  // === Electronics ===
  {
    id: 'electronics-clean-blue', name: 'Tech Edge', category: 'electronics', subcategory: 'Gadgets',
    thumbnail: '', description: 'Clean modern design for tech products', isPremium: false,
    colors: ['#F8FAFC', '#2563EB', '#1E293B', '#64748B', '#EEF2FF'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#F8FAFC', editable: false, locked: true, opacity: 0.95 },
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 0.02, relativeHeight: 1, fill: '#2563EB', editable: false, locked: true },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.08, relativeWidth: 0.7, relativeHeight: 0.06, fill: '#2563EB', text: 'BRAND', fontSize: 18, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.5, relativeHeight: 0.25, fill: '#EEF2FF', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.65, relativeWidth: 0.8, relativeHeight: 0.07, fill: '#1E293B', text: 'Product Name', fontSize: 18, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.75, relativeWidth: 0.7, relativeHeight: 0.04, fill: '#64748B', text: 'Next-Gen Technology', fontSize: 11, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Tagline' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#F1F5F9', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.7, relativeHeight: 0.05, fill: '#1E293B', text: 'Specifications', fontSize: 13, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Section title' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.8, relativeHeight: 0.25, fill: '#475569', text: 'Feature 1\nFeature 2\nFeature 3', fontSize: 9, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'left', editable: true, editHint: 'Specs' },
    ]
  },
  {
    id: 'electronics-dark-premium', name: 'Stealth Pro', category: 'electronics', subcategory: 'Premium',
    thumbnail: '', description: 'Dark premium design for high-end electronics', isPremium: true,
    colors: ['#0F172A', '#38BDF8', '#FFFFFF', '#1E293B', '#64748B'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#0F172A', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.1, relativeWidth: 0.6, relativeHeight: 0.06, fill: '#38BDF8', text: 'BRAND', fontSize: 18, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.4, relativeWidth: 0.6, relativeHeight: 0.25, fill: '#1E293B', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.7, relativeWidth: 0.8, relativeHeight: 0.07, fill: '#FFFFFF', text: 'PRODUCT NAME', fontSize: 18, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.8, relativeWidth: 0.6, relativeHeight: 0.03, fill: '#38BDF8', text: 'PREMIUM SERIES', fontSize: 10, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Series' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#0F172A', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.15, relativeWidth: 0.7, relativeHeight: 0.05, fill: '#38BDF8', text: 'BRAND', fontSize: 14, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.45, relativeWidth: 0.8, relativeHeight: 0.2, fill: '#CBD5E1', text: 'Specifications', fontSize: 9, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Specs' },
    ]
  },
  // === Eco ===
  {
    id: 'eco-kraft-natural', name: 'Earth First', category: 'eco', subcategory: 'Sustainable',
    thumbnail: '', description: 'Kraft paper look for eco-conscious brands', isPremium: false,
    colors: ['#D4A574', '#2D5016', '#3D2B1F', '#5C4033', '#C49A6C'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#D4A574', editable: false, locked: true, opacity: 0.9 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.08, relativeWidth: 0.6, relativeHeight: 0.04, fill: '#2D5016', text: 'ECO FRIENDLY', fontSize: 10, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Eco badge' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.2, relativeWidth: 0.8, relativeHeight: 0.08, fill: '#3D2B1F', text: 'Brand Name', fontSize: 22, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.35, relativeWidth: 0.7, relativeHeight: 0.06, fill: '#5C4033', text: 'Product Name', fontSize: 16, fontWeight: 'normal', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'image-placeholder', panel: 'panel2', relativeX: 0.5, relativeY: 0.58, relativeWidth: 0.35, relativeHeight: 0.2, fill: '#C49A6C', editable: true, editHint: 'Product image' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.85, relativeWidth: 0.7, relativeHeight: 0.04, fill: '#2D5016', text: 'Made with recycled materials', fontSize: 9, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Eco message' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#D4A574', editable: false, locked: true, opacity: 0.9 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.15, relativeWidth: 0.7, relativeHeight: 0.05, fill: '#3D2B1F', text: 'Our Story', fontSize: 13, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Section title' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.4, relativeWidth: 0.8, relativeHeight: 0.2, fill: '#5C4033', text: 'We believe in sustainable packaging.', fontSize: 10, fontWeight: 'normal', fontFamily: 'serif', textAlign: 'center', editable: true, editHint: 'Brand story' },
    ]
  },
  // === Minimal ===
  {
    id: 'minimal-clean-mono', name: 'Pure Form', category: 'minimal', subcategory: 'Universal',
    thumbnail: '', description: 'Ultra-clean monochrome design for any product', isPremium: false,
    colors: ['#FFFFFF', '#000000', '#333333', '#999999', '#F5F5F5'],
    elements: [
      { type: 'rect', panel: 'panel2', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFFFFF', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.15, relativeWidth: 0.6, relativeHeight: 0.06, fill: '#000000', text: 'BRAND', fontSize: 20, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand name' },
      { type: 'rect', panel: 'panel2', relativeX: 0.35, relativeY: 0.22, relativeWidth: 0.3, relativeHeight: 0.002, fill: '#000000', editable: false, locked: true },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.4, relativeWidth: 0.7, relativeHeight: 0.06, fill: '#333333', text: 'Product Name', fontSize: 16, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Product name' },
      { type: 'text', panel: 'panel2', relativeX: 0.5, relativeY: 0.85, relativeWidth: 0.4, relativeHeight: 0.03, fill: '#999999', text: '100ml', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Size' },
      { type: 'rect', panel: 'panel4', relativeX: 0, relativeY: 0, relativeWidth: 1, relativeHeight: 1, fill: '#FFFFFF', editable: false, locked: true, opacity: 0.95 },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.15, relativeWidth: 0.6, relativeHeight: 0.05, fill: '#000000', text: 'BRAND', fontSize: 14, fontWeight: 'bold', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Brand' },
      { type: 'text', panel: 'panel4', relativeX: 0.5, relativeY: 0.4, relativeWidth: 0.8, relativeHeight: 0.2, fill: '#555555', text: 'Simple. Clean. Effective.', fontSize: 10, fontWeight: 'normal', fontFamily: 'sans-serif', textAlign: 'center', editable: true, editHint: 'Description' },
      { type: 'image-placeholder', panel: 'panel4', relativeX: 0.5, relativeY: 0.65, relativeWidth: 0.35, relativeHeight: 0.08, fill: '#F5F5F5', editable: true, editHint: 'Barcode' },
    ]
  },
]

export function getTemplatesByCategory(categoryId: string): DesignTemplate[] {
  if (categoryId === 'all') return DESIGN_TEMPLATES
  return DESIGN_TEMPLATES.filter(t => t.category === categoryId)
}

export function getTemplateById(id: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find(t => t.id === id)
}
