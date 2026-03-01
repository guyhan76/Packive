// ============================================================
// Packive Spot Color Library - Level 1
// 자체 창작 색상 라이브러리 (Pantone 데이터 미사용)
// 법적 상태: 안전 - 독립적으로 선정한 색상
// 생성일: 2026-02-28
// ============================================================

export interface SpotColor {
  id: string;
  name: string;
  nameKo: string;
  hex: string;
  cmyk: [number, number, number, number];
  category: string;
}

export const PACKIVE_SPOT_COLORS: SpotColor[] = [
  // === Red (빨강 계열) ===
  { id: "PKV-R001", name: "Vivid Red", nameKo: "비비드 레드", hex: "#E03C31", cmyk: [0, 87, 76, 5], category: "Red" },
  { id: "PKV-R002", name: "Warm Red", nameKo: "웜 레드", hex: "#F2553D", cmyk: [0, 78, 68, 0], category: "Red" },
  { id: "PKV-R003", name: "Cherry", nameKo: "체리", hex: "#C4282D", cmyk: [0, 92, 72, 15], category: "Red" },
  { id: "PKV-R004", name: "Crimson", nameKo: "크림슨", hex: "#A4212A", cmyk: [0, 90, 68, 28], category: "Red" },
  { id: "PKV-R005", name: "Rose Red", nameKo: "로즈 레드", hex: "#D94265", cmyk: [0, 82, 40, 5], category: "Red" },
  { id: "PKV-R006", name: "Flame", nameKo: "플레임", hex: "#E8513A", cmyk: [0, 76, 74, 2], category: "Red" },
  { id: "PKV-R007", name: "Brick Red", nameKo: "브릭 레드", hex: "#9B2D30", cmyk: [0, 85, 60, 35], category: "Red" },
  { id: "PKV-R008", name: "Tomato", nameKo: "토마토", hex: "#E04F3E", cmyk: [0, 78, 70, 3], category: "Red" },
  { id: "PKV-R009", name: "Wine Red", nameKo: "와인 레드", hex: "#7B2339", cmyk: [0, 85, 45, 48], category: "Red" },
  { id: "PKV-R010", name: "Coral Red", nameKo: "코랄 레드", hex: "#EF6D5B", cmyk: [0, 66, 55, 0], category: "Red" },
  // === Orange (주황 계열) ===
  { id: "PKV-O001", name: "Vivid Orange", nameKo: "비비드 오렌지", hex: "#F08A26", cmyk: [0, 48, 88, 0], category: "Orange" },
  { id: "PKV-O002", name: "Tangerine", nameKo: "탠저린", hex: "#F27830", cmyk: [0, 58, 82, 0], category: "Orange" },
  { id: "PKV-O003", name: "Amber", nameKo: "앰버", hex: "#E89B3F", cmyk: [0, 38, 78, 4], category: "Orange" },
  { id: "PKV-O004", name: "Pumpkin", nameKo: "펌킨", hex: "#E56A22", cmyk: [0, 62, 88, 2], category: "Orange" },
  { id: "PKV-O005", name: "Peach", nameKo: "피치", hex: "#F4A77A", cmyk: [0, 38, 48, 0], category: "Orange" },
  { id: "PKV-O006", name: "Burnt Orange", nameKo: "번트 오렌지", hex: "#CC5F1E", cmyk: [0, 62, 90, 15], category: "Orange" },
  { id: "PKV-O007", name: "Apricot", nameKo: "아프리콧", hex: "#F0A868", cmyk: [0, 36, 58, 0], category: "Orange" },
  { id: "PKV-O008", name: "Rust", nameKo: "러스트", hex: "#B54E28", cmyk: [0, 68, 82, 22], category: "Orange" },
  // === Yellow (노랑 계열) ===
  { id: "PKV-Y001", name: "Vivid Yellow", nameKo: "비비드 옐로", hex: "#F5D623", cmyk: [0, 8, 90, 0], category: "Yellow" },
  { id: "PKV-Y002", name: "Lemon", nameKo: "레몬", hex: "#F7E34A", cmyk: [0, 4, 78, 0], category: "Yellow" },
  { id: "PKV-Y003", name: "Gold", nameKo: "골드", hex: "#D4A829", cmyk: [0, 22, 88, 12], category: "Yellow" },
  { id: "PKV-Y004", name: "Sunflower", nameKo: "선플라워", hex: "#F2C418", cmyk: [0, 18, 92, 0], category: "Yellow" },
  { id: "PKV-Y005", name: "Mustard", nameKo: "머스타드", hex: "#C9A832", cmyk: [0, 18, 82, 18], category: "Yellow" },
  { id: "PKV-Y006", name: "Butter", nameKo: "버터", hex: "#F5E27A", cmyk: [0, 4, 58, 0], category: "Yellow" },
  { id: "PKV-Y007", name: "Honey", nameKo: "허니", hex: "#E0A830", cmyk: [0, 30, 84, 6], category: "Yellow" },
  { id: "PKV-Y008", name: "Cream Yellow", nameKo: "크림 옐로", hex: "#F5E6A8", cmyk: [0, 4, 36, 0], category: "Yellow" },
  // === Green (초록 계열) ===
  { id: "PKV-G001", name: "Vivid Green", nameKo: "비비드 그린", hex: "#2EA843", cmyk: [72, 0, 82, 5], category: "Green" },
  { id: "PKV-G002", name: "Emerald", nameKo: "에메랄드", hex: "#1E9E5E", cmyk: [78, 0, 62, 8], category: "Green" },
  { id: "PKV-G003", name: "Forest Green", nameKo: "포레스트 그린", hex: "#2D6A3F", cmyk: [70, 0, 65, 40], category: "Green" },
  { id: "PKV-G004", name: "Mint", nameKo: "민트", hex: "#6DC5A1", cmyk: [48, 0, 30, 0], category: "Green" },
  { id: "PKV-G005", name: "Lime", nameKo: "라임", hex: "#8CBF2E", cmyk: [38, 0, 85, 5], category: "Green" },
  { id: "PKV-G006", name: "Olive", nameKo: "올리브", hex: "#6B7D2E", cmyk: [30, 0, 78, 42], category: "Green" },
  { id: "PKV-G007", name: "Sage", nameKo: "세이지", hex: "#8BA888", cmyk: [28, 0, 22, 22], category: "Green" },
  { id: "PKV-G008", name: "Teal Green", nameKo: "틸 그린", hex: "#1E8C7E", cmyk: [80, 0, 30, 20], category: "Green" },
  { id: "PKV-G009", name: "Spring Green", nameKo: "스프링 그린", hex: "#56C271", cmyk: [58, 0, 60, 0], category: "Green" },
  { id: "PKV-G010", name: "Dark Green", nameKo: "다크 그린", hex: "#1A5C32", cmyk: [75, 0, 72, 52], category: "Green" },
  // === Blue (파랑 계열) ===
  { id: "PKV-B001", name: "Vivid Blue", nameKo: "비비드 블루", hex: "#2568B2", cmyk: [82, 45, 0, 5], category: "Blue" },
  { id: "PKV-B002", name: "Sky Blue", nameKo: "스카이 블루", hex: "#5BA8D9", cmyk: [58, 18, 0, 0], category: "Blue" },
  { id: "PKV-B003", name: "Navy", nameKo: "네이비", hex: "#1C3A5E", cmyk: [90, 60, 0, 50], category: "Blue" },
  { id: "PKV-B004", name: "Cobalt", nameKo: "코발트", hex: "#1A47A0", cmyk: [92, 68, 0, 2], category: "Blue" },
  { id: "PKV-B005", name: "Royal Blue", nameKo: "로열 블루", hex: "#2E58B0", cmyk: [82, 55, 0, 2], category: "Blue" },
  { id: "PKV-B006", name: "Ice Blue", nameKo: "아이스 블루", hex: "#A8D4E6", cmyk: [30, 4, 0, 2], category: "Blue" },
  { id: "PKV-B007", name: "Cerulean", nameKo: "세룰리안", hex: "#2A7AB5", cmyk: [78, 30, 0, 5], category: "Blue" },
  { id: "PKV-B008", name: "Steel Blue", nameKo: "스틸 블루", hex: "#4A7A9B", cmyk: [58, 22, 0, 25], category: "Blue" },
  { id: "PKV-B009", name: "Ocean Blue", nameKo: "오션 블루", hex: "#1E5F8A", cmyk: [82, 35, 0, 25], category: "Blue" },
  { id: "PKV-B010", name: "Powder Blue", nameKo: "파우더 블루", hex: "#B0D0E8", cmyk: [25, 6, 0, 0], category: "Blue" },
  // === Purple (보라 계열) ===
  { id: "PKV-P001", name: "Vivid Purple", nameKo: "비비드 퍼플", hex: "#7B2D8E", cmyk: [42, 90, 0, 5], category: "Purple" },
  { id: "PKV-P002", name: "Violet", nameKo: "바이올렛", hex: "#6A3FA0", cmyk: [55, 78, 0, 2], category: "Purple" },
  { id: "PKV-P003", name: "Plum", nameKo: "플럼", hex: "#6E3058", cmyk: [30, 80, 10, 32], category: "Purple" },
  { id: "PKV-P004", name: "Lavender", nameKo: "라벤더", hex: "#9E85C2", cmyk: [28, 40, 0, 5], category: "Purple" },
  { id: "PKV-P005", name: "Mauve", nameKo: "모브", hex: "#A0688C", cmyk: [15, 55, 0, 22], category: "Purple" },
  { id: "PKV-P006", name: "Grape", nameKo: "그레이프", hex: "#5C2D82", cmyk: [58, 88, 0, 10], category: "Purple" },
  { id: "PKV-P007", name: "Amethyst", nameKo: "아메시스트", hex: "#8A5EB5", cmyk: [38, 60, 0, 5], category: "Purple" },
  { id: "PKV-P008", name: "Lilac", nameKo: "라일락", hex: "#C4A8D8", cmyk: [15, 28, 0, 2], category: "Purple" },
  // === Pink (분홍 계열) ===
  { id: "PKV-K001", name: "Hot Pink", nameKo: "핫 핑크", hex: "#E84890", cmyk: [0, 82, 12, 0], category: "Pink" },
  { id: "PKV-K002", name: "Rose", nameKo: "로즈", hex: "#D96B98", cmyk: [0, 62, 15, 5], category: "Pink" },
  { id: "PKV-K003", name: "Blush", nameKo: "블러쉬", hex: "#E8A0B0", cmyk: [0, 38, 12, 2], category: "Pink" },
  { id: "PKV-K004", name: "Magenta", nameKo: "마젠타", hex: "#D42D7A", cmyk: [0, 90, 20, 2], category: "Pink" },
  { id: "PKV-K005", name: "Fuchsia", nameKo: "퓨샤", hex: "#C83878", cmyk: [0, 85, 18, 8], category: "Pink" },
  { id: "PKV-K006", name: "Baby Pink", nameKo: "베이비 핑크", hex: "#F4C2D0", cmyk: [0, 22, 8, 0], category: "Pink" },
  { id: "PKV-K007", name: "Salmon", nameKo: "살몬", hex: "#E88A82", cmyk: [0, 50, 38, 2], category: "Pink" },
  { id: "PKV-K008", name: "Dusty Rose", nameKo: "더스티 로즈", hex: "#C89898", cmyk: [0, 30, 18, 15], category: "Pink" },
  // === Brown (갈색 계열) ===
  { id: "PKV-N001", name: "Chocolate", nameKo: "초콜릿", hex: "#5C3420", cmyk: [0, 55, 72, 62], category: "Brown" },
  { id: "PKV-N002", name: "Coffee", nameKo: "커피", hex: "#6B4226", cmyk: [0, 48, 68, 52], category: "Brown" },
  { id: "PKV-N003", name: "Caramel", nameKo: "카라멜", hex: "#A8703A", cmyk: [0, 38, 70, 28], category: "Brown" },
  { id: "PKV-N004", name: "Tan", nameKo: "탄", hex: "#C4A06A", cmyk: [0, 20, 52, 18], category: "Brown" },
  { id: "PKV-N005", name: "Sienna", nameKo: "시에나", hex: "#8E4B2A", cmyk: [0, 55, 75, 38], category: "Brown" },
  { id: "PKV-N006", name: "Walnut", nameKo: "월넛", hex: "#5A3E28", cmyk: [0, 42, 62, 60], category: "Brown" },
  { id: "PKV-N007", name: "Beige", nameKo: "베이지", hex: "#D8C4A0", cmyk: [0, 8, 30, 10], category: "Brown" },
  { id: "PKV-N008", name: "Kraft", nameKo: "크라프트", hex: "#B08850", cmyk: [0, 28, 60, 25], category: "Brown" },
  // === Neutral (중성색 계열) ===
  { id: "PKV-X001", name: "Pure Black", nameKo: "퓨어 블랙", hex: "#1A1A1A", cmyk: [0, 0, 0, 95], category: "Neutral" },
  { id: "PKV-X002", name: "Rich Black", nameKo: "리치 블랙", hex: "#0A0A12", cmyk: [60, 40, 40, 100], category: "Neutral" },
  { id: "PKV-X003", name: "Charcoal", nameKo: "차콜", hex: "#3A3A3A", cmyk: [0, 0, 0, 80], category: "Neutral" },
  { id: "PKV-X004", name: "Dark Gray", nameKo: "다크 그레이", hex: "#5A5A5A", cmyk: [0, 0, 0, 65], category: "Neutral" },
  { id: "PKV-X005", name: "Medium Gray", nameKo: "미디엄 그레이", hex: "#808080", cmyk: [0, 0, 0, 50], category: "Neutral" },
  { id: "PKV-X006", name: "Silver", nameKo: "실버", hex: "#A8A8A8", cmyk: [0, 0, 0, 34], category: "Neutral" },
  { id: "PKV-X007", name: "Light Gray", nameKo: "라이트 그레이", hex: "#C8C8C8", cmyk: [0, 0, 0, 22], category: "Neutral" },
  { id: "PKV-X008", name: "Off White", nameKo: "오프 화이트", hex: "#E8E4DA", cmyk: [0, 2, 6, 6], category: "Neutral" },
  { id: "PKV-X009", name: "Warm Gray", nameKo: "웜 그레이", hex: "#9A9088", cmyk: [0, 5, 10, 38], category: "Neutral" },
  { id: "PKV-X010", name: "Cool Gray", nameKo: "쿨 그레이", hex: "#8A9098", cmyk: [10, 4, 0, 38], category: "Neutral" },
  // === Metallic (메탈릭 계열) - 화면 표시는 근사값 ===
  { id: "PKV-M001", name: "Gold Metallic", nameKo: "골드 메탈릭", hex: "#D4A84B", cmyk: [0, 22, 72, 12], category: "Metallic" },
  { id: "PKV-M002", name: "Silver Metallic", nameKo: "실버 메탈릭", hex: "#B0B0B8", cmyk: [0, 0, 2, 30], category: "Metallic" },
  { id: "PKV-M003", name: "Copper", nameKo: "코퍼", hex: "#B87548", cmyk: [0, 42, 65, 20], category: "Metallic" },
  { id: "PKV-M004", name: "Bronze", nameKo: "브론즈", hex: "#A07840", cmyk: [0, 30, 68, 30], category: "Metallic" },
  { id: "PKV-M005", name: "Rose Gold", nameKo: "로즈 골드", hex: "#C8907A", cmyk: [0, 32, 35, 15], category: "Metallic" },
  { id: "PKV-M006", name: "Champagne", nameKo: "샴페인", hex: "#D8C8A0", cmyk: [0, 6, 32, 10], category: "Metallic" },
  { id: "PKV-M007", name: "Platinum", nameKo: "플래티넘", hex: "#C0C0C8", cmyk: [5, 2, 0, 20], category: "Metallic" },
  { id: "PKV-M008", name: "Antique Gold", nameKo: "앤틱 골드", hex: "#B89848", cmyk: [0, 18, 68, 22], category: "Metallic" },
  // === Pastel (파스텔 계열) ===
  { id: "PKV-S001", name: "Pastel Pink", nameKo: "파스텔 핑크", hex: "#F4C8D0", cmyk: [0, 22, 8, 0], category: "Pastel" },
  { id: "PKV-S002", name: "Pastel Blue", nameKo: "파스텔 블루", hex: "#B8D8F0", cmyk: [22, 4, 0, 0], category: "Pastel" },
  { id: "PKV-S003", name: "Pastel Green", nameKo: "파스텔 그린", hex: "#B8E0C8", cmyk: [22, 0, 18, 0], category: "Pastel" },
  { id: "PKV-S004", name: "Pastel Yellow", nameKo: "파스텔 옐로", hex: "#F8F0B0", cmyk: [0, 2, 32, 0], category: "Pastel" },
  { id: "PKV-S005", name: "Pastel Lavender", nameKo: "파스텔 라벤더", hex: "#D0C0E0", cmyk: [12, 18, 0, 2], category: "Pastel" },
  { id: "PKV-S006", name: "Pastel Peach", nameKo: "파스텔 피치", hex: "#F8D8C0", cmyk: [0, 14, 20, 0], category: "Pastel" },
  { id: "PKV-S007", name: "Pastel Mint", nameKo: "파스텔 민트", hex: "#B0E8D0", cmyk: [26, 0, 14, 0], category: "Pastel" },
  { id: "PKV-S008", name: "Pastel Coral", nameKo: "파스텔 코랄", hex: "#F0B8A8", cmyk: [0, 26, 22, 0], category: "Pastel" },
  { id: "PKV-S009", name: "Pastel Sky", nameKo: "파스텔 스카이", hex: "#C8E0F0", cmyk: [16, 4, 0, 0], category: "Pastel" },
  { id: "PKV-S010", name: "Pastel Cream", nameKo: "파스텔 크림", hex: "#F8F0E0", cmyk: [0, 2, 10, 0], category: "Pastel" },
];

export const SPOT_COLOR_CATEGORIES = [
  "All", "Red", "Orange", "Yellow", "Green", "Blue",
  "Purple", "Pink", "Brown", "Neutral", "Metallic", "Pastel"
];

export const CATEGORY_NAMES_KO: Record<string, string> = {
  All: "전체",
  Red: "빨강",
  Orange: "주황",
  Yellow: "노랑",
  Green: "초록",
  Blue: "파랑",
  Purple: "보라",
  Pink: "분홍",
  Brown: "갈색",
  Neutral: "중성색",
  Metallic: "메탈릭",
  Pastel: "파스텔",
};

// 카테고리별 색상 필터링
export function getColorsByCategory(category: string): SpotColor[] {
  if (category === "All") return PACKIVE_SPOT_COLORS;
  return PACKIVE_SPOT_COLORS.filter(c => c.category === category);
}

// 색상 검색 (이름, ID, HEX)
export function searchSpotColors(query: string): SpotColor[] {
  const q = query.toLowerCase().trim();
  if (!q) return PACKIVE_SPOT_COLORS;
  return PACKIVE_SPOT_COLORS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.nameKo.includes(q) ||
    c.id.toLowerCase().includes(q) ||
    c.hex.toLowerCase().includes(q)
  );
}

// ID로 색상 찾기
export function getSpotColorById(id: string): SpotColor | undefined {
  return PACKIVE_SPOT_COLORS.find(c => c.id === id);
}

