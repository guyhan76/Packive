// ============================================================
// Packive Spot Color Library - Level 2 (Expanded)
// 자체 창작 색상 라이브러리 (Pantone 데이터 미사용)
// 법적 상태: 안전 - 독립적으로 선정한 색상
// 생성일: 2026-02-28 | 확장일: 2026-03-05
// 총 색상: 330개 (11 카테고리 × 30개)
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
  // ═══════════════════════════════════════
  // RED (빨강 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-R001", name: "Vivid Red", nameKo: "비비드 레드", hex: "#E03C31", cmyk: [0, 87, 76, 5], category: "Red" },
  { id: "PKV-R002", name: "Warm Red", nameKo: "웜 레드", hex: "#F2553D", cmyk: [0, 78, 68, 0], category: "Red" },
  { id: "PKV-R003", name: "Cherry", nameKo: "체리", hex: "#C4282D", cmyk: [0, 92, 72, 15], category: "Red" },
  { id: "PKV-R004", name: "Crimson", nameKo: "크림슨", hex: "#A4212A", cmyk: [0, 90, 68, 28], category: "Red" },
  { id: "PKV-R005", name: "Rose Red", nameKo: "로즈 레드", hex: "#D94265", cmyk: [0, 82, 40, 5], category: "Red" },
  { id: "PKV-R006", name: "Flame", nameKo: "플레임", hex: "#E8513A", cmyk: [0, 76, 74, 2], category: "Red" },
  { id: "PKV-R007", name: "Brick Red", nameKo: "브릭 레드", hex: "#9B2D30", cmyk: [0, 85, 60, 35], category: "Red" },
  { id: "PKV-R008", name: "Signal Red", nameKo: "시그널 레드", hex: "#D32011", cmyk: [0, 93, 85, 8], category: "Red" },
  { id: "PKV-R009", name: "Tomato", nameKo: "토마토", hex: "#E74C3C", cmyk: [0, 80, 70, 3], category: "Red" },
  { id: "PKV-R010", name: "Scarlet", nameKo: "스칼렛", hex: "#B91C1C", cmyk: [0, 92, 78, 20], category: "Red" },
  { id: "PKV-R011", name: "Poppy", nameKo: "양귀비", hex: "#E63946", cmyk: [0, 85, 60, 2], category: "Red" },
  { id: "PKV-R012", name: "Cardinal", nameKo: "카디널", hex: "#C41E3A", cmyk: [0, 90, 62, 12], category: "Red" },
  { id: "PKV-R013", name: "Garnet", nameKo: "가넷", hex: "#8B1A1A", cmyk: [0, 88, 75, 42], category: "Red" },
  { id: "PKV-R014", name: "Ruby", nameKo: "루비", hex: "#9B111E", cmyk: [0, 92, 72, 32], category: "Red" },
  { id: "PKV-R015", name: "Cinnabar", nameKo: "진사", hex: "#E44D2E", cmyk: [0, 78, 78, 2], category: "Red" },
  { id: "PKV-R016", name: "Vermillion", nameKo: "버밀리온", hex: "#E34234", cmyk: [0, 82, 74, 3], category: "Red" },
  { id: "PKV-R017", name: "Carnation", nameKo: "카네이션", hex: "#F95F62", cmyk: [0, 72, 52, 0], category: "Red" },
  { id: "PKV-R018", name: "Salsa", nameKo: "살사", hex: "#D63031", cmyk: [0, 86, 76, 6], category: "Red" },
  { id: "PKV-R019", name: "Lava", nameKo: "라바", hex: "#CF1020", cmyk: [0, 94, 82, 10], category: "Red" },
  { id: "PKV-R020", name: "Hibiscus", nameKo: "히비스커스", hex: "#B6174B", cmyk: [0, 90, 48, 18], category: "Red" },
  { id: "PKV-R021", name: "Rosewood", nameKo: "로즈우드", hex: "#7B3F3F", cmyk: [0, 62, 48, 48], category: "Red" },
  { id: "PKV-R022", name: "Persian Red", nameKo: "페르시안 레드", hex: "#CC3333", cmyk: [0, 85, 70, 12], category: "Red" },
  { id: "PKV-R023", name: "Firecracker", nameKo: "파이어크래커", hex: "#E25033", cmyk: [0, 78, 76, 3], category: "Red" },
  { id: "PKV-R024", name: "Cayenne", nameKo: "카옌", hex: "#8D0226", cmyk: [0, 96, 62, 40], category: "Red" },
  { id: "PKV-R025", name: "Blood Orange", nameKo: "블러드 오렌지", hex: "#D1462F", cmyk: [0, 80, 76, 8], category: "Red" },
  { id: "PKV-R026", name: "Coral Red", nameKo: "코럴 레드", hex: "#F76C6C", cmyk: [0, 65, 48, 0], category: "Red" },
  { id: "PKV-R027", name: "Candy Apple", nameKo: "캔디 애플", hex: "#FF0800", cmyk: [0, 97, 100, 0], category: "Red" },
  { id: "PKV-R028", name: "Barn Red", nameKo: "반 레드", hex: "#7C0A02", cmyk: [0, 94, 96, 46], category: "Red" },
  { id: "PKV-R029", name: "Wine Red", nameKo: "와인 레드", hex: "#722F37", cmyk: [0, 72, 55, 50], category: "Red" },
  { id: "PKV-R030", name: "Chili", nameKo: "칠리", hex: "#C21807", cmyk: [0, 92, 94, 15], category: "Red" },

  // ═══════════════════════════════════════
  // ORANGE (주황 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-O001", name: "Bright Orange", nameKo: "브라이트 오렌지", hex: "#FF6B35", cmyk: [0, 65, 78, 0], category: "Orange" },
  { id: "PKV-O002", name: "Tangerine", nameKo: "탠저린", hex: "#F28500", cmyk: [0, 50, 100, 0], category: "Orange" },
  { id: "PKV-O003", name: "Apricot", nameKo: "에이프리콧", hex: "#F7A072", cmyk: [0, 40, 52, 0], category: "Orange" },
  { id: "PKV-O004", name: "Pumpkin", nameKo: "펌프킨", hex: "#E56717", cmyk: [0, 62, 88, 2], category: "Orange" },
  { id: "PKV-O005", name: "Sunset Orange", nameKo: "선셋 오렌지", hex: "#F4845F", cmyk: [0, 52, 58, 0], category: "Orange" },
  { id: "PKV-O006", name: "Rust", nameKo: "러스트", hex: "#B7410E", cmyk: [0, 72, 90, 22], category: "Orange" },
  { id: "PKV-O007", name: "Clementine", nameKo: "클레멘타인", hex: "#EB6123", cmyk: [0, 66, 84, 2], category: "Orange" },
  { id: "PKV-O008", name: "Papaya", nameKo: "파파야", hex: "#FF9A5C", cmyk: [0, 42, 60, 0], category: "Orange" },
  { id: "PKV-O009", name: "Marigold", nameKo: "메리골드", hex: "#EAA221", cmyk: [0, 35, 86, 2], category: "Orange" },
  { id: "PKV-O010", name: "Tiger Orange", nameKo: "타이거 오렌지", hex: "#FC6A03", cmyk: [0, 62, 98, 0], category: "Orange" },
  { id: "PKV-O011", name: "Peach", nameKo: "피치", hex: "#FFB07C", cmyk: [0, 32, 48, 0], category: "Orange" },
  { id: "PKV-O012", name: "Carrot", nameKo: "캐럿", hex: "#ED7117", cmyk: [0, 58, 90, 2], category: "Orange" },
  { id: "PKV-O013", name: "Amber", nameKo: "앰버", hex: "#FFBF00", cmyk: [0, 25, 100, 0], category: "Orange" },
  { id: "PKV-O014", name: "Ginger", nameKo: "진저", hex: "#B06500", cmyk: [0, 50, 100, 25], category: "Orange" },
  { id: "PKV-O015", name: "Burnt Orange", nameKo: "번트 오렌지", hex: "#CC5500", cmyk: [0, 66, 100, 12], category: "Orange" },
  { id: "PKV-O016", name: "Sienna", nameKo: "시에나", hex: "#A0522D", cmyk: [0, 58, 72, 30], category: "Orange" },
  { id: "PKV-O017", name: "Terracotta", nameKo: "테라코타", hex: "#E2725B", cmyk: [0, 58, 56, 4], category: "Orange" },
  { id: "PKV-O018", name: "Copper Glow", nameKo: "코퍼 글로우", hex: "#D27D2D", cmyk: [0, 48, 80, 8], category: "Orange" },
  { id: "PKV-O019", name: "Mango", nameKo: "망고", hex: "#FF8243", cmyk: [0, 52, 72, 0], category: "Orange" },
  { id: "PKV-O020", name: "Nectarine", nameKo: "넥타린", hex: "#FF6347", cmyk: [0, 64, 70, 0], category: "Orange" },
  { id: "PKV-O021", name: "Coral Orange", nameKo: "코럴 오렌지", hex: "#FF7F50", cmyk: [0, 52, 66, 0], category: "Orange" },
  { id: "PKV-O022", name: "Spice", nameKo: "스파이스", hex: "#CE6B2E", cmyk: [0, 55, 78, 10], category: "Orange" },
  { id: "PKV-O023", name: "Kumquat", nameKo: "금귤", hex: "#F09F1B", cmyk: [0, 38, 88, 0], category: "Orange" },
  { id: "PKV-O024", name: "Saffron", nameKo: "사프란", hex: "#F4C430", cmyk: [0, 22, 80, 0], category: "Orange" },
  { id: "PKV-O025", name: "Cantaloupe", nameKo: "칸탈루프", hex: "#FFA62F", cmyk: [0, 38, 80, 0], category: "Orange" },
  { id: "PKV-O026", name: "Tawny", nameKo: "토니", hex: "#CD5700", cmyk: [0, 62, 100, 12], category: "Orange" },
  { id: "PKV-O027", name: "Persimmon", nameKo: "감", hex: "#EC5800", cmyk: [0, 68, 100, 2], category: "Orange" },
  { id: "PKV-O028", name: "Bronze Orange", nameKo: "브론즈 오렌지", hex: "#C36A2D", cmyk: [0, 52, 76, 16], category: "Orange" },
  { id: "PKV-O029", name: "Cinnamon", nameKo: "시나몬", hex: "#D2691E", cmyk: [0, 55, 85, 8], category: "Orange" },
  { id: "PKV-O030", name: "Flamingo", nameKo: "플라밍고", hex: "#FC8EAC", cmyk: [0, 48, 20, 0], category: "Orange" },

  // ═══════════════════════════════════════
  // YELLOW (노랑 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-Y001", name: "Lemon", nameKo: "레몬", hex: "#FFF44F", cmyk: [0, 0, 72, 0], category: "Yellow" },
  { id: "PKV-Y002", name: "Sunflower", nameKo: "해바라기", hex: "#FFDA03", cmyk: [0, 10, 98, 0], category: "Yellow" },
  { id: "PKV-Y003", name: "Mustard", nameKo: "머스타드", hex: "#E1AD01", cmyk: [0, 28, 98, 5], category: "Yellow" },
  { id: "PKV-Y004", name: "Canary", nameKo: "카나리아", hex: "#FFEF00", cmyk: [0, 0, 100, 0], category: "Yellow" },
  { id: "PKV-Y005", name: "Gold", nameKo: "골드", hex: "#FFD700", cmyk: [0, 14, 100, 0], category: "Yellow" },
  { id: "PKV-Y006", name: "Honey", nameKo: "허니", hex: "#EB9605", cmyk: [0, 38, 96, 2], category: "Yellow" },
  { id: "PKV-Y007", name: "Butter", nameKo: "버터", hex: "#FFF599", cmyk: [0, 0, 42, 0], category: "Yellow" },
  { id: "PKV-Y008", name: "Daffodil", nameKo: "수선화", hex: "#FFFF31", cmyk: [0, 0, 80, 0], category: "Yellow" },
  { id: "PKV-Y009", name: "Maize", nameKo: "메이즈", hex: "#FBEC5D", cmyk: [0, 4, 64, 0], category: "Yellow" },
  { id: "PKV-Y010", name: "Banana", nameKo: "바나나", hex: "#FFE135", cmyk: [0, 6, 80, 0], category: "Yellow" },
  { id: "PKV-Y011", name: "Citrine", nameKo: "시트린", hex: "#E4D00A", cmyk: [0, 6, 96, 5], category: "Yellow" },
  { id: "PKV-Y012", name: "Champagne", nameKo: "샴페인", hex: "#F7E7CE", cmyk: [0, 6, 18, 0], category: "Yellow" },
  { id: "PKV-Y013", name: "Wheat", nameKo: "밀", hex: "#F5DEB3", cmyk: [0, 8, 28, 0], category: "Yellow" },
  { id: "PKV-Y014", name: "Flax", nameKo: "아마", hex: "#EEDC82", cmyk: [0, 6, 48, 2], category: "Yellow" },
  { id: "PKV-Y015", name: "Jasmine", nameKo: "재스민", hex: "#F8DE7E", cmyk: [0, 8, 52, 0], category: "Yellow" },
  { id: "PKV-Y016", name: "Goldenrod", nameKo: "골든로드", hex: "#DAA520", cmyk: [0, 28, 86, 8], category: "Yellow" },
  { id: "PKV-Y017", name: "Bumblebee", nameKo: "범블비", hex: "#FCE205", cmyk: [0, 8, 98, 0], category: "Yellow" },
  { id: "PKV-Y018", name: "Pineapple", nameKo: "파인애플", hex: "#FFE338", cmyk: [0, 4, 78, 0], category: "Yellow" },
  { id: "PKV-Y019", name: "Corn", nameKo: "콘", hex: "#FBE870", cmyk: [0, 4, 58, 0], category: "Yellow" },
  { id: "PKV-Y020", name: "Dijon", nameKo: "디종", hex: "#C49102", cmyk: [0, 30, 98, 15], category: "Yellow" },
  { id: "PKV-Y021", name: "Tuscany Sun", nameKo: "투스카니 선", hex: "#FFD145", cmyk: [0, 14, 74, 0], category: "Yellow" },
  { id: "PKV-Y022", name: "Dandelion", nameKo: "민들레", hex: "#F0E130", cmyk: [0, 4, 82, 2], category: "Yellow" },
  { id: "PKV-Y023", name: "Cream", nameKo: "크림", hex: "#FFFDD0", cmyk: [0, 0, 18, 0], category: "Yellow" },
  { id: "PKV-Y024", name: "Satin Gold", nameKo: "새틴 골드", hex: "#CBA135", cmyk: [0, 22, 76, 14], category: "Yellow" },
  { id: "PKV-Y025", name: "Ochre Yellow", nameKo: "오커 옐로", hex: "#CC7722", cmyk: [0, 44, 84, 12], category: "Yellow" },
  { id: "PKV-Y026", name: "Primrose", nameKo: "프림로즈", hex: "#F6EB61", cmyk: [0, 2, 64, 0], category: "Yellow" },
  { id: "PKV-Y027", name: "Electric Yellow", nameKo: "일렉트릭 옐로", hex: "#FFFF00", cmyk: [0, 0, 100, 0], category: "Yellow" },
  { id: "PKV-Y028", name: "Turmeric", nameKo: "터메릭", hex: "#E8B004", cmyk: [0, 28, 98, 2], category: "Yellow" },
  { id: "PKV-Y029", name: "Sand Yellow", nameKo: "샌드 옐로", hex: "#D6C07A", cmyk: [0, 8, 48, 12], category: "Yellow" },
  { id: "PKV-Y030", name: "Mellow Yellow", nameKo: "멜로 옐로", hex: "#F8E473", cmyk: [0, 4, 56, 0], category: "Yellow" },

  // ═══════════════════════════════════════
  // GREEN (초록 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-G001", name: "Forest Green", nameKo: "포레스트 그린", hex: "#228B22", cmyk: [72, 0, 72, 35], category: "Green" },
  { id: "PKV-G002", name: "Emerald", nameKo: "에메랄드", hex: "#50C878", cmyk: [60, 0, 42, 8], category: "Green" },
  { id: "PKV-G003", name: "Mint", nameKo: "민트", hex: "#98FB98", cmyk: [38, 0, 38, 0], category: "Green" },
  { id: "PKV-G004", name: "Olive", nameKo: "올리브", hex: "#6B8E23", cmyk: [30, 0, 82, 38], category: "Green" },
  { id: "PKV-G005", name: "Jade", nameKo: "제이드", hex: "#00A36C", cmyk: [82, 0, 48, 15], category: "Green" },
  { id: "PKV-G006", name: "Lime", nameKo: "라임", hex: "#32CD32", cmyk: [68, 0, 68, 5], category: "Green" },
  { id: "PKV-G007", name: "Sage", nameKo: "세이지", hex: "#9DC183", cmyk: [30, 0, 38, 14], category: "Green" },
  { id: "PKV-G008", name: "Pine", nameKo: "파인", hex: "#01796F", cmyk: [85, 0, 28, 42], category: "Green" },
  { id: "PKV-G009", name: "Fern", nameKo: "고사리", hex: "#4F7942", cmyk: [45, 0, 52, 42], category: "Green" },
  { id: "PKV-G010", name: "Kelly Green", nameKo: "켈리 그린", hex: "#4CBB17", cmyk: [62, 0, 90, 5], category: "Green" },
  { id: "PKV-G011", name: "Moss", nameKo: "모스", hex: "#8A9A5B", cmyk: [20, 0, 42, 32], category: "Green" },
  { id: "PKV-G012", name: "Seafoam", nameKo: "씨폼", hex: "#93E9BE", cmyk: [36, 0, 18, 0], category: "Green" },
  { id: "PKV-G013", name: "Jungle", nameKo: "정글", hex: "#29AB87", cmyk: [72, 0, 32, 18], category: "Green" },
  { id: "PKV-G014", name: "Teal Green", nameKo: "틸 그린", hex: "#006D5B", cmyk: [88, 0, 38, 48], category: "Green" },
  { id: "PKV-G015", name: "Chartreuse", nameKo: "샤트루즈", hex: "#7FFF00", cmyk: [50, 0, 100, 0], category: "Green" },
  { id: "PKV-G016", name: "Avocado", nameKo: "아보카도", hex: "#568203", cmyk: [38, 0, 98, 42], category: "Green" },
  { id: "PKV-G017", name: "Basil", nameKo: "바질", hex: "#579229", cmyk: [42, 0, 72, 35], category: "Green" },
  { id: "PKV-G018", name: "Celadon", nameKo: "셀라돈", hex: "#ACE1AF", cmyk: [24, 0, 24, 2], category: "Green" },
  { id: "PKV-G019", name: "Clover", nameKo: "클로버", hex: "#009E60", cmyk: [80, 0, 52, 15], category: "Green" },
  { id: "PKV-G020", name: "Spring Green", nameKo: "스프링 그린", hex: "#00FF7F", cmyk: [65, 0, 50, 0], category: "Green" },
  { id: "PKV-G021", name: "Hunter Green", nameKo: "헌터 그린", hex: "#355E3B", cmyk: [52, 0, 48, 55], category: "Green" },
  { id: "PKV-G022", name: "Pistachio", nameKo: "피스타치오", hex: "#93C572", cmyk: [32, 0, 48, 10], category: "Green" },
  { id: "PKV-G023", name: "Eucalyptus", nameKo: "유칼립투스", hex: "#44D7A8", cmyk: [62, 0, 28, 2], category: "Green" },
  { id: "PKV-G024", name: "Malachite", nameKo: "말라카이트", hex: "#0BDA51", cmyk: [72, 0, 62, 0], category: "Green" },
  { id: "PKV-G025", name: "Pickle", nameKo: "피클", hex: "#6B6F2A", cmyk: [18, 0, 70, 50], category: "Green" },
  { id: "PKV-G026", name: "Shamrock", nameKo: "샴록", hex: "#009E73", cmyk: [82, 0, 42, 15], category: "Green" },
  { id: "PKV-G027", name: "Verdigris", nameKo: "베르디그리", hex: "#43B3AE", cmyk: [60, 0, 12, 18], category: "Green" },
  { id: "PKV-G028", name: "Apple Green", nameKo: "애플 그린", hex: "#8DB600", cmyk: [30, 0, 100, 15], category: "Green" },
  { id: "PKV-G029", name: "Peppermint", nameKo: "페퍼민트", hex: "#B5EAD7", cmyk: [22, 0, 10, 0], category: "Green" },
  { id: "PKV-G030", name: "Ivy", nameKo: "아이비", hex: "#3B7A57", cmyk: [55, 0, 42, 42], category: "Green" },

  // ═══════════════════════════════════════
  // BLUE (파랑 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-B001", name: "Sky Blue", nameKo: "스카이 블루", hex: "#87CEEB", cmyk: [42, 8, 0, 2], category: "Blue" },
  { id: "PKV-B002", name: "Navy", nameKo: "네이비", hex: "#000080", cmyk: [100, 80, 0, 45], category: "Blue" },
  { id: "PKV-B003", name: "Cobalt", nameKo: "코발트", hex: "#0047AB", cmyk: [95, 62, 0, 18], category: "Blue" },
  { id: "PKV-B004", name: "Royal Blue", nameKo: "로열 블루", hex: "#4169E1", cmyk: [72, 52, 0, 2], category: "Blue" },
  { id: "PKV-B005", name: "Cerulean", nameKo: "세룰리언", hex: "#007BA7", cmyk: [88, 22, 0, 18], category: "Blue" },
  { id: "PKV-B006", name: "Sapphire", nameKo: "사파이어", hex: "#0F52BA", cmyk: [90, 58, 0, 12], category: "Blue" },
  { id: "PKV-B007", name: "Azure", nameKo: "아주르", hex: "#007FFF", cmyk: [80, 35, 0, 0], category: "Blue" },
  { id: "PKV-B008", name: "Powder Blue", nameKo: "파우더 블루", hex: "#B0E0E6", cmyk: [22, 2, 0, 2], category: "Blue" },
  { id: "PKV-B009", name: "Steel Blue", nameKo: "스틸 블루", hex: "#4682B4", cmyk: [58, 22, 0, 22], category: "Blue" },
  { id: "PKV-B010", name: "Indigo", nameKo: "인디고", hex: "#4B0082", cmyk: [68, 90, 0, 38], category: "Blue" },
  { id: "PKV-B011", name: "Ocean Blue", nameKo: "오션 블루", hex: "#0077B6", cmyk: [85, 30, 0, 15], category: "Blue" },
  { id: "PKV-B012", name: "Baby Blue", nameKo: "베이비 블루", hex: "#89CFF0", cmyk: [42, 8, 0, 0], category: "Blue" },
  { id: "PKV-B013", name: "Midnight", nameKo: "미드나잇", hex: "#191970", cmyk: [88, 78, 0, 50], category: "Blue" },
  { id: "PKV-B014", name: "Aegean", nameKo: "에게", hex: "#1F75FE", cmyk: [78, 48, 0, 0], category: "Blue" },
  { id: "PKV-B015", name: "Denim", nameKo: "데님", hex: "#1560BD", cmyk: [88, 50, 0, 12], category: "Blue" },
  { id: "PKV-B016", name: "Prussian Blue", nameKo: "프러시안 블루", hex: "#003153", cmyk: [100, 52, 0, 62], category: "Blue" },
  { id: "PKV-B017", name: "Ice Blue", nameKo: "아이스 블루", hex: "#D6ECEF", cmyk: [12, 2, 0, 0], category: "Blue" },
  { id: "PKV-B018", name: "Electric Blue", nameKo: "일렉트릭 블루", hex: "#7DF9FF", cmyk: [48, 0, 0, 0], category: "Blue" },
  { id: "PKV-B019", name: "Periwinkle", nameKo: "페리윙클", hex: "#CCCCFF", cmyk: [20, 20, 0, 0], category: "Blue" },
  { id: "PKV-B020", name: "Cornflower", nameKo: "콘플라워", hex: "#6495ED", cmyk: [55, 32, 0, 2], category: "Blue" },
  { id: "PKV-B021", name: "Lapis", nameKo: "라피스", hex: "#26619C", cmyk: [78, 42, 0, 28], category: "Blue" },
  { id: "PKV-B022", name: "Peacock Blue", nameKo: "피콕 블루", hex: "#005F6B", cmyk: [90, 10, 0, 52], category: "Blue" },
  { id: "PKV-B023", name: "Slate Blue", nameKo: "슬레이트 블루", hex: "#6A5ACD", cmyk: [52, 58, 0, 5], category: "Blue" },
  { id: "PKV-B024", name: "Bluebell", nameKo: "블루벨", hex: "#A2A2D0", cmyk: [22, 22, 0, 8], category: "Blue" },
  { id: "PKV-B025", name: "Horizon", nameKo: "호라이즌", hex: "#4E7DA2", cmyk: [52, 18, 0, 25], category: "Blue" },
  { id: "PKV-B026", name: "Baltic Blue", nameKo: "발틱 블루", hex: "#2E5090", cmyk: [72, 48, 0, 30], category: "Blue" },
  { id: "PKV-B027", name: "Glacier", nameKo: "글레이셔", hex: "#80B5D0", cmyk: [40, 10, 0, 8], category: "Blue" },
  { id: "PKV-B028", name: "Ultramarine", nameKo: "울트라마린", hex: "#3F00FF", cmyk: [78, 85, 0, 0], category: "Blue" },
  { id: "PKV-B029", name: "Marine", nameKo: "마린", hex: "#0A4D68", cmyk: [90, 28, 0, 52], category: "Blue" },
  { id: "PKV-B030", name: "Twilight Blue", nameKo: "트와일라잇 블루", hex: "#536878", cmyk: [35, 15, 0, 45], category: "Blue" },

  // ═══════════════════════════════════════
  // PURPLE (보라 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-P001", name: "Amethyst", nameKo: "아메시스트", hex: "#9966CC", cmyk: [28, 52, 0, 8], category: "Purple" },
  { id: "PKV-P002", name: "Plum", nameKo: "플럼", hex: "#8E4585", cmyk: [15, 68, 0, 28], category: "Purple" },
  { id: "PKV-P003", name: "Violet", nameKo: "바이올렛", hex: "#7F00FF", cmyk: [52, 85, 0, 0], category: "Purple" },
  { id: "PKV-P004", name: "Lavender", nameKo: "라벤더", hex: "#E6E6FA", cmyk: [8, 8, 0, 0], category: "Purple" },
  { id: "PKV-P005", name: "Mauve", nameKo: "모브", hex: "#E0B0FF", cmyk: [10, 30, 0, 0], category: "Purple" },
  { id: "PKV-P006", name: "Grape", nameKo: "그레이프", hex: "#6F2DA8", cmyk: [42, 78, 0, 18], category: "Purple" },
  { id: "PKV-P007", name: "Orchid", nameKo: "오키드", hex: "#DA70D6", cmyk: [8, 52, 0, 2], category: "Purple" },
  { id: "PKV-P008", name: "Eggplant", nameKo: "에그플랜트", hex: "#614051", cmyk: [15, 62, 22, 52], category: "Purple" },
  { id: "PKV-P009", name: "Iris", nameKo: "아이리스", hex: "#5A4FCF", cmyk: [58, 62, 0, 5], category: "Purple" },
  { id: "PKV-P010", name: "Lilac", nameKo: "라일락", hex: "#C8A2C8", cmyk: [8, 28, 0, 10], category: "Purple" },
  { id: "PKV-P011", name: "Wisteria", nameKo: "위스테리아", hex: "#C9A0DC", cmyk: [12, 32, 0, 2], category: "Purple" },
  { id: "PKV-P012", name: "Mulberry", nameKo: "멀베리", hex: "#C54B8C", cmyk: [0, 68, 10, 12], category: "Purple" },
  { id: "PKV-P013", name: "Heather", nameKo: "헤더", hex: "#B284BE", cmyk: [15, 38, 0, 12], category: "Purple" },
  { id: "PKV-P014", name: "Royal Purple", nameKo: "로열 퍼플", hex: "#7851A9", cmyk: [38, 62, 0, 18], category: "Purple" },
  { id: "PKV-P015", name: "Thistle", nameKo: "시슬", hex: "#D8BFD8", cmyk: [5, 15, 0, 5], category: "Purple" },
  { id: "PKV-P016", name: "Boysenberry", nameKo: "보이즌베리", hex: "#873260", cmyk: [10, 78, 18, 32], category: "Purple" },
  { id: "PKV-P017", name: "Byzantium", nameKo: "비잔티움", hex: "#702963", cmyk: [18, 82, 10, 38], category: "Purple" },
  { id: "PKV-P018", name: "Petunia", nameKo: "페튜니아", hex: "#B768A2", cmyk: [8, 48, 0, 15], category: "Purple" },
  { id: "PKV-P019", name: "Cosmic Purple", nameKo: "코스믹 퍼플", hex: "#763568", cmyk: [18, 72, 8, 38], category: "Purple" },
  { id: "PKV-P020", name: "Tyrian", nameKo: "티리안", hex: "#66023C", cmyk: [15, 98, 38, 48], category: "Purple" },
  { id: "PKV-P021", name: "Pansy", nameKo: "팬지", hex: "#78184A", cmyk: [12, 90, 32, 38], category: "Purple" },
  { id: "PKV-P022", name: "Periwinkle Purple", nameKo: "페리윙클 퍼플", hex: "#8E82FE", cmyk: [42, 48, 0, 0], category: "Purple" },
  { id: "PKV-P023", name: "Dahlia", nameKo: "달리아", hex: "#9B59B6", cmyk: [22, 60, 0, 12], category: "Purple" },
  { id: "PKV-P024", name: "Raisin", nameKo: "건포도", hex: "#49334D", cmyk: [22, 55, 10, 62], category: "Purple" },
  { id: "PKV-P025", name: "Fig", nameKo: "무화과", hex: "#6C4675", cmyk: [22, 55, 0, 42], category: "Purple" },
  { id: "PKV-P026", name: "Aubergine", nameKo: "오베르진", hex: "#3B0837", cmyk: [25, 92, 18, 68], category: "Purple" },
  { id: "PKV-P027", name: "Hyacinth", nameKo: "히아신스", hex: "#7768AE", cmyk: [38, 45, 0, 18], category: "Purple" },
  { id: "PKV-P028", name: "Verbena", nameKo: "버베나", hex: "#A855F7", cmyk: [32, 65, 0, 0], category: "Purple" },
  { id: "PKV-P029", name: "Jam", nameKo: "잼", hex: "#8C1C5A", cmyk: [10, 88, 22, 32], category: "Purple" },
  { id: "PKV-P030", name: "Ube", nameKo: "우베", hex: "#8878C3", cmyk: [32, 40, 0, 12], category: "Purple" },

  // ═══════════════════════════════════════
  // PINK (분홍 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-PK001", name: "Hot Pink", nameKo: "핫 핑크", hex: "#FF69B4", cmyk: [0, 62, 18, 0], category: "Pink" },
  { id: "PKV-PK002", name: "Blush", nameKo: "블러시", hex: "#DE5D83", cmyk: [0, 62, 32, 5], category: "Pink" },
  { id: "PKV-PK003", name: "Fuchsia", nameKo: "퓨시아", hex: "#FF00FF", cmyk: [0, 88, 0, 0], category: "Pink" },
  { id: "PKV-PK004", name: "Bubblegum", nameKo: "버블검", hex: "#FFC1CC", cmyk: [0, 25, 12, 0], category: "Pink" },
  { id: "PKV-PK005", name: "Salmon", nameKo: "살몬", hex: "#FA8072", cmyk: [0, 52, 50, 0], category: "Pink" },
  { id: "PKV-PK006", name: "Magenta", nameKo: "마젠타", hex: "#FF0090", cmyk: [0, 95, 20, 0], category: "Pink" },
  { id: "PKV-PK007", name: "Cerise", nameKo: "세리즈", hex: "#DE3163", cmyk: [0, 82, 48, 5], category: "Pink" },
  { id: "PKV-PK008", name: "Flamingo Pink", nameKo: "플라밍고 핑크", hex: "#FC8EAC", cmyk: [0, 48, 20, 0], category: "Pink" },
  { id: "PKV-PK009", name: "Watermelon", nameKo: "워터멜론", hex: "#FD4659", cmyk: [0, 78, 58, 0], category: "Pink" },
  { id: "PKV-PK010", name: "Rose", nameKo: "로즈", hex: "#FF007F", cmyk: [0, 92, 35, 0], category: "Pink" },
  { id: "PKV-PK011", name: "Peony", nameKo: "모란", hex: "#E8849A", cmyk: [0, 48, 22, 2], category: "Pink" },
  { id: "PKV-PK012", name: "Cotton Candy", nameKo: "솜사탕", hex: "#FFBCD9", cmyk: [0, 25, 8, 0], category: "Pink" },
  { id: "PKV-PK013", name: "Punch", nameKo: "펀치", hex: "#EC5578", cmyk: [0, 72, 38, 2], category: "Pink" },
  { id: "PKV-PK014", name: "Tulip", nameKo: "튤립", hex: "#FF878D", cmyk: [0, 52, 38, 0], category: "Pink" },
  { id: "PKV-PK015", name: "Candy Pink", nameKo: "캔디 핑크", hex: "#E4717A", cmyk: [0, 58, 38, 4], category: "Pink" },
  { id: "PKV-PK016", name: "Thulian", nameKo: "툴리안", hex: "#DE6FA1", cmyk: [0, 55, 15, 5], category: "Pink" },
  { id: "PKV-PK017", name: "Ballet Slipper", nameKo: "발레 슬리퍼", hex: "#F4C2C2", cmyk: [0, 22, 14, 0], category: "Pink" },
  { id: "PKV-PK018", name: "Carnation Pink", nameKo: "카네이션 핑크", hex: "#FFA6C9", cmyk: [0, 38, 12, 0], category: "Pink" },
  { id: "PKV-PK019", name: "Raspberry", nameKo: "라즈베리", hex: "#E30B5C", cmyk: [0, 95, 52, 2], category: "Pink" },
  { id: "PKV-PK020", name: "Rosewater", nameKo: "로즈워터", hex: "#F9E0E5", cmyk: [0, 12, 6, 0], category: "Pink" },
  { id: "PKV-PK021", name: "Petal", nameKo: "꽃잎", hex: "#F0A6CA", cmyk: [0, 35, 8, 2], category: "Pink" },
  { id: "PKV-PK022", name: "Taffy", nameKo: "태피", hex: "#FA86C4", cmyk: [0, 50, 8, 0], category: "Pink" },
  { id: "PKV-PK023", name: "Cherry Blossom", nameKo: "벚꽃", hex: "#FFB7C5", cmyk: [0, 28, 14, 0], category: "Pink" },
  { id: "PKV-PK024", name: "Begonia", nameKo: "베고니아", hex: "#FA6775", cmyk: [0, 65, 44, 0], category: "Pink" },
  { id: "PKV-PK025", name: "Persian Pink", nameKo: "페르시안 핑크", hex: "#F77FBE", cmyk: [0, 52, 10, 0], category: "Pink" },
  { id: "PKV-PK026", name: "Amaranth", nameKo: "아마란스", hex: "#E52B50", cmyk: [0, 88, 58, 2], category: "Pink" },
  { id: "PKV-PK027", name: "Tea Rose", nameKo: "티 로즈", hex: "#F4C2C2", cmyk: [0, 22, 14, 0], category: "Pink" },
  { id: "PKV-PK028", name: "Flambe", nameKo: "플랑베", hex: "#E8543E", cmyk: [0, 72, 70, 2], category: "Pink" },
  { id: "PKV-PK029", name: "Coquette", nameKo: "코케트", hex: "#F7B5CA", cmyk: [0, 28, 10, 0], category: "Pink" },
  { id: "PKV-PK030", name: "Dragonfruit", nameKo: "드래곤프루트", hex: "#D1426F", cmyk: [0, 78, 38, 8], category: "Pink" },

  // ═══════════════════════════════════════
  // BROWN (갈색 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-BR001", name: "Chocolate", nameKo: "초콜릿", hex: "#7B3F00", cmyk: [0, 52, 100, 45], category: "Brown" },
  { id: "PKV-BR002", name: "Mocha", nameKo: "모카", hex: "#967117", cmyk: [0, 30, 82, 35], category: "Brown" },
  { id: "PKV-BR003", name: "Coffee", nameKo: "커피", hex: "#6F4E37", cmyk: [0, 35, 55, 50], category: "Brown" },
  { id: "PKV-BR004", name: "Walnut", nameKo: "월넛", hex: "#773F1A", cmyk: [0, 52, 78, 48], category: "Brown" },
  { id: "PKV-BR005", name: "Camel", nameKo: "카멜", hex: "#C19A6B", cmyk: [0, 22, 48, 18], category: "Brown" },
  { id: "PKV-BR006", name: "Tan", nameKo: "탄", hex: "#D2B48C", cmyk: [0, 15, 38, 10], category: "Brown" },
  { id: "PKV-BR007", name: "Mahogany", nameKo: "마호가니", hex: "#C04000", cmyk: [0, 72, 100, 18], category: "Brown" },
  { id: "PKV-BR008", name: "Chestnut", nameKo: "밤색", hex: "#954535", cmyk: [0, 60, 62, 35], category: "Brown" },
  { id: "PKV-BR009", name: "Cacao", nameKo: "카카오", hex: "#5C3317", cmyk: [0, 48, 78, 58], category: "Brown" },
  { id: "PKV-BR010", name: "Hazel", nameKo: "헤이즐", hex: "#8E7618", cmyk: [0, 20, 82, 38], category: "Brown" },
  { id: "PKV-BR011", name: "Espresso", nameKo: "에스프레소", hex: "#3C2218", cmyk: [0, 48, 60, 72], category: "Brown" },
  { id: "PKV-BR012", name: "Sepia", nameKo: "세피아", hex: "#704214", cmyk: [0, 48, 82, 50], category: "Brown" },
  { id: "PKV-BR013", name: "Cedar", nameKo: "시더", hex: "#A0522D", cmyk: [0, 58, 72, 30], category: "Brown" },
  { id: "PKV-BR014", name: "Almond", nameKo: "아몬드", hex: "#EFDECD", cmyk: [0, 6, 14, 2], category: "Brown" },
  { id: "PKV-BR015", name: "Cinnamon Brown", nameKo: "시나몬 브라운", hex: "#8B4513", cmyk: [0, 58, 86, 40], category: "Brown" },
  { id: "PKV-BR016", name: "Copper Brown", nameKo: "코퍼 브라운", hex: "#A46750", cmyk: [0, 42, 52, 28], category: "Brown" },
  { id: "PKV-BR017", name: "Teak", nameKo: "티크", hex: "#B9825A", cmyk: [0, 35, 55, 20], category: "Brown" },
  { id: "PKV-BR018", name: "Earth", nameKo: "어스", hex: "#8B6D4C", cmyk: [0, 28, 50, 40], category: "Brown" },
  { id: "PKV-BR019", name: "Pecan", nameKo: "피칸", hex: "#A67B5B", cmyk: [0, 30, 48, 28], category: "Brown" },
  { id: "PKV-BR020", name: "Brunette", nameKo: "브루넷", hex: "#6B4226", cmyk: [0, 48, 68, 52], category: "Brown" },
  { id: "PKV-BR021", name: "Umber", nameKo: "엄버", hex: "#635147", cmyk: [0, 22, 32, 58], category: "Brown" },
  { id: "PKV-BR022", name: "Hickory", nameKo: "히코리", hex: "#8D5524", cmyk: [0, 45, 75, 38], category: "Brown" },
  { id: "PKV-BR023", name: "Bark", nameKo: "나무껍질", hex: "#654321", cmyk: [0, 42, 70, 55], category: "Brown" },
  { id: "PKV-BR024", name: "Latte", nameKo: "라테", hex: "#C4A882", cmyk: [0, 18, 38, 15], category: "Brown" },
  { id: "PKV-BR025", name: "Biscotti", nameKo: "비스코티", hex: "#D5C5A1", cmyk: [0, 8, 28, 10], category: "Brown" },
  { id: "PKV-BR026", name: "Clay", nameKo: "클레이", hex: "#B66A50", cmyk: [0, 48, 58, 20], category: "Brown" },
  { id: "PKV-BR027", name: "Tortilla", nameKo: "토르티야", hex: "#C5A35D", cmyk: [0, 20, 58, 15], category: "Brown" },
  { id: "PKV-BR028", name: "Maple", nameKo: "메이플", hex: "#A55D35", cmyk: [0, 50, 70, 28], category: "Brown" },
  { id: "PKV-BR029", name: "Tobacco", nameKo: "토바코", hex: "#71593B", cmyk: [0, 28, 52, 52], category: "Brown" },
  { id: "PKV-BR030", name: "Truffle", nameKo: "트러플", hex: "#4E3B31", cmyk: [0, 28, 42, 65], category: "Brown" },

  // ═══════════════════════════════════════
  // NEUTRAL (중성색 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-N001", name: "White", nameKo: "화이트", hex: "#FFFFFF", cmyk: [0, 0, 0, 0], category: "Neutral" },
  { id: "PKV-N002", name: "Ivory", nameKo: "아이보리", hex: "#FFFFF0", cmyk: [0, 0, 6, 0], category: "Neutral" },
  { id: "PKV-N003", name: "Pearl", nameKo: "펄", hex: "#F0EAD6", cmyk: [0, 2, 12, 2], category: "Neutral" },
  { id: "PKV-N004", name: "Snow", nameKo: "스노우", hex: "#FFFAFA", cmyk: [0, 2, 2, 0], category: "Neutral" },
  { id: "PKV-N005", name: "Silver", nameKo: "실버", hex: "#C0C0C0", cmyk: [0, 0, 0, 25], category: "Neutral" },
  { id: "PKV-N006", name: "Ash", nameKo: "애쉬", hex: "#B2BEB5", cmyk: [5, 0, 5, 20], category: "Neutral" },
  { id: "PKV-N007", name: "Smoke", nameKo: "스모크", hex: "#848884", cmyk: [5, 0, 2, 45], category: "Neutral" },
  { id: "PKV-N008", name: "Slate", nameKo: "슬레이트", hex: "#708090", cmyk: [20, 8, 0, 38], category: "Neutral" },
  { id: "PKV-N009", name: "Charcoal", nameKo: "차콜", hex: "#36454F", cmyk: [25, 12, 0, 65], category: "Neutral" },
  { id: "PKV-N010", name: "Jet Black", nameKo: "제트 블랙", hex: "#0A0A0A", cmyk: [0, 0, 0, 96], category: "Neutral" },
  { id: "PKV-N011", name: "Fog", nameKo: "안개", hex: "#D3D3D3", cmyk: [0, 0, 0, 15], category: "Neutral" },
  { id: "PKV-N012", name: "Graphite", nameKo: "그라파이트", hex: "#54585A", cmyk: [12, 5, 0, 62], category: "Neutral" },
  { id: "PKV-N013", name: "Pewter", nameKo: "퓨터", hex: "#8E9294", cmyk: [5, 2, 0, 40], category: "Neutral" },
  { id: "PKV-N014", name: "Stone", nameKo: "스톤", hex: "#928E85", cmyk: [5, 5, 12, 38], category: "Neutral" },
  { id: "PKV-N015", name: "Dove", nameKo: "도브", hex: "#B3B3B3", cmyk: [0, 0, 0, 30], category: "Neutral" },
  { id: "PKV-N016", name: "Linen", nameKo: "리넨", hex: "#FAF0E6", cmyk: [0, 4, 8, 0], category: "Neutral" },
  { id: "PKV-N017", name: "Oatmeal", nameKo: "오트밀", hex: "#D9C8B4", cmyk: [0, 8, 18, 10], category: "Neutral" },
  { id: "PKV-N018", name: "Oyster", nameKo: "오이스터", hex: "#DFD6C5", cmyk: [0, 4, 12, 8], category: "Neutral" },
  { id: "PKV-N019", name: "Bone", nameKo: "본", hex: "#E3DAC9", cmyk: [0, 4, 12, 5], category: "Neutral" },
  { id: "PKV-N020", name: "Onyx", nameKo: "오닉스", hex: "#353839", cmyk: [8, 5, 0, 76], category: "Neutral" },
  { id: "PKV-N021", name: "Concrete", nameKo: "콘크리트", hex: "#95A5A6", cmyk: [10, 0, 0, 32], category: "Neutral" },
  { id: "PKV-N022", name: "Steel", nameKo: "스틸", hex: "#71797E", cmyk: [10, 2, 0, 48], category: "Neutral" },
  { id: "PKV-N023", name: "Mercury", nameKo: "머큐리", hex: "#E5E5E5", cmyk: [0, 0, 0, 10], category: "Neutral" },
  { id: "PKV-N024", name: "Platinum", nameKo: "플래티넘", hex: "#E5E4E2", cmyk: [0, 0, 2, 8], category: "Neutral" },
  { id: "PKV-N025", name: "Iron", nameKo: "아이언", hex: "#48494B", cmyk: [8, 5, 0, 68], category: "Neutral" },
  { id: "PKV-N026", name: "Chalk", nameKo: "초크", hex: "#F5F0E1", cmyk: [0, 2, 8, 2], category: "Neutral" },
  { id: "PKV-N027", name: "Flint", nameKo: "플린트", hex: "#6D6968", cmyk: [5, 5, 2, 55], category: "Neutral" },
  { id: "PKV-N028", name: "Mineral", nameKo: "미네랄", hex: "#B8B4A8", cmyk: [2, 2, 10, 22], category: "Neutral" },
  { id: "PKV-N029", name: "Pebble", nameKo: "페블", hex: "#9E9E93", cmyk: [2, 0, 8, 35], category: "Neutral" },
  { id: "PKV-N030", name: "Raven", nameKo: "레이븐", hex: "#1C1C1E", cmyk: [15, 10, 5, 88], category: "Neutral" },

  // ═══════════════════════════════════════
  // METALLIC (메탈릭 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-M001", name: "Gold Foil", nameKo: "골드 포일", hex: "#D4AF37", cmyk: [0, 18, 76, 8], category: "Metallic" },
  { id: "PKV-M002", name: "Silver Foil", nameKo: "실버 포일", hex: "#AAA9AD", cmyk: [2, 2, 0, 30], category: "Metallic" },
  { id: "PKV-M003", name: "Rose Gold", nameKo: "로즈 골드", hex: "#B76E79", cmyk: [0, 42, 28, 20], category: "Metallic" },
  { id: "PKV-M004", name: "Copper", nameKo: "코퍼", hex: "#B87333", cmyk: [0, 42, 72, 18], category: "Metallic" },
  { id: "PKV-M005", name: "Bronze", nameKo: "브론즈", hex: "#CD7F32", cmyk: [0, 42, 76, 12], category: "Metallic" },
  { id: "PKV-M006", name: "Champagne Gold", nameKo: "샴페인 골드", hex: "#F7E7CE", cmyk: [0, 6, 18, 0], category: "Metallic" },
  { id: "PKV-M007", name: "Antique Gold", nameKo: "앤틱 골드", hex: "#C9B037", cmyk: [0, 14, 74, 15], category: "Metallic" },
  { id: "PKV-M008", name: "Brass", nameKo: "브래스", hex: "#B5A642", cmyk: [0, 10, 65, 22], category: "Metallic" },
  { id: "PKV-M009", name: "Titanium", nameKo: "티타늄", hex: "#878681", cmyk: [5, 2, 5, 42], category: "Metallic" },
  { id: "PKV-M010", name: "Chrome", nameKo: "크롬", hex: "#DBE1E4", cmyk: [5, 0, 0, 8], category: "Metallic" },
  { id: "PKV-M011", name: "Nickel", nameKo: "니켈", hex: "#929292", cmyk: [0, 0, 0, 42], category: "Metallic" },
  { id: "PKV-M012", name: "Pewter Metallic", nameKo: "퓨터 메탈릭", hex: "#8B8B7D", cmyk: [5, 2, 12, 40], category: "Metallic" },
  { id: "PKV-M013", name: "Gun Metal", nameKo: "건메탈", hex: "#2A3439", cmyk: [22, 8, 0, 76], category: "Metallic" },
  { id: "PKV-M014", name: "Aged Copper", nameKo: "에이지드 코퍼", hex: "#78866B", cmyk: [15, 0, 22, 42], category: "Metallic" },
  { id: "PKV-M015", name: "Iron Grey", nameKo: "아이언 그레이", hex: "#5B5B5B", cmyk: [0, 0, 0, 64], category: "Metallic" },
  { id: "PKV-M016", name: "Palladium", nameKo: "팔라듐", hex: "#BCC1C3", cmyk: [4, 0, 0, 22], category: "Metallic" },
  { id: "PKV-M017", name: "Tin", nameKo: "틴", hex: "#A8A9AD", cmyk: [2, 1, 0, 30], category: "Metallic" },
  { id: "PKV-M018", name: "Burnished Gold", nameKo: "버니시드 골드", hex: "#A67C00", cmyk: [0, 28, 100, 28], category: "Metallic" },
  { id: "PKV-M019", name: "White Gold", nameKo: "화이트 골드", hex: "#E8E0D0", cmyk: [0, 3, 10, 5], category: "Metallic" },
  { id: "PKV-M020", name: "Dark Bronze", nameKo: "다크 브론즈", hex: "#804A00", cmyk: [0, 48, 100, 42], category: "Metallic" },
  { id: "PKV-M021", name: "Mercury Silver", nameKo: "머큐리 실버", hex: "#D5D5D5", cmyk: [0, 0, 0, 16], category: "Metallic" },
  { id: "PKV-M022", name: "Rust Copper", nameKo: "러스트 코퍼", hex: "#944A2D", cmyk: [0, 55, 70, 35], category: "Metallic" },
  { id: "PKV-M023", name: "Zinc", nameKo: "징크", hex: "#BAC4C9", cmyk: [6, 0, 0, 18], category: "Metallic" },
  { id: "PKV-M024", name: "Cobalt Blue Metal", nameKo: "코발트 블루 메탈", hex: "#3D59AB", cmyk: [65, 50, 0, 20], category: "Metallic" },
  { id: "PKV-M025", name: "Emerald Metal", nameKo: "에메랄드 메탈", hex: "#287D5E", cmyk: [70, 0, 40, 38], category: "Metallic" },
  { id: "PKV-M026", name: "Ruby Metal", nameKo: "루비 메탈", hex: "#A02040", cmyk: [0, 80, 60, 28], category: "Metallic" },
  { id: "PKV-M027", name: "Molten", nameKo: "몰튼", hex: "#E8751A", cmyk: [0, 55, 88, 2], category: "Metallic" },
  { id: "PKV-M028", name: "Foil Green", nameKo: "포일 그린", hex: "#5C8A4D", cmyk: [38, 0, 48, 38], category: "Metallic" },
  { id: "PKV-M029", name: "Copper Penny", nameKo: "코퍼 페니", hex: "#AD6F69", cmyk: [0, 40, 35, 25], category: "Metallic" },
  { id: "PKV-M030", name: "Iridescent", nameKo: "이리데슨트", hex: "#C4B5A6", cmyk: [0, 8, 15, 18], category: "Metallic" },

  // ═══════════════════════════════════════
  // PASTEL (파스텔 계열) - 30 colors
  // ═══════════════════════════════════════
  { id: "PKV-PA001", name: "Pastel Pink", nameKo: "파스텔 핑크", hex: "#FFD1DC", cmyk: [0, 18, 8, 0], category: "Pastel" },
  { id: "PKV-PA002", name: "Pastel Blue", nameKo: "파스텔 블루", hex: "#AEC6CF", cmyk: [16, 2, 0, 10], category: "Pastel" },
  { id: "PKV-PA003", name: "Pastel Green", nameKo: "파스텔 그린", hex: "#B5EAD7", cmyk: [22, 0, 10, 0], category: "Pastel" },
  { id: "PKV-PA004", name: "Pastel Yellow", nameKo: "파스텔 옐로", hex: "#FAFAD2", cmyk: [0, 0, 18, 0], category: "Pastel" },
  { id: "PKV-PA005", name: "Pastel Lavender", nameKo: "파스텔 라벤더", hex: "#D4B8E0", cmyk: [8, 20, 0, 2], category: "Pastel" },
  { id: "PKV-PA006", name: "Pastel Peach", nameKo: "파스텔 피치", hex: "#FFDAB9", cmyk: [0, 15, 25, 0], category: "Pastel" },
  { id: "PKV-PA007", name: "Pastel Mint", nameKo: "파스텔 민트", hex: "#C1F0C1", cmyk: [18, 0, 18, 0], category: "Pastel" },
  { id: "PKV-PA008", name: "Pastel Coral", nameKo: "파스텔 코럴", hex: "#F7B5A0", cmyk: [0, 28, 30, 0], category: "Pastel" },
  { id: "PKV-PA009", name: "Pastel Lilac", nameKo: "파스텔 라일락", hex: "#DCD0FF", cmyk: [12, 18, 0, 0], category: "Pastel" },
  { id: "PKV-PA010", name: "Pastel Sky", nameKo: "파스텔 스카이", hex: "#BDE0FE", cmyk: [22, 4, 0, 0], category: "Pastel" },
  { id: "PKV-PA011", name: "Pastel Rose", nameKo: "파스텔 로즈", hex: "#F8C8DC", cmyk: [0, 22, 8, 0], category: "Pastel" },
  { id: "PKV-PA012", name: "Pastel Aqua", nameKo: "파스텔 아쿠아", hex: "#B2E8DE", cmyk: [22, 0, 5, 0], category: "Pastel" },
  { id: "PKV-PA013", name: "Pastel Lemon", nameKo: "파스텔 레몬", hex: "#FFFACD", cmyk: [0, 0, 20, 0], category: "Pastel" },
  { id: "PKV-PA014", name: "Pastel Mauve", nameKo: "파스텔 모브", hex: "#E8C5E5", cmyk: [0, 16, 0, 4], category: "Pastel" },
  { id: "PKV-PA015", name: "Pastel Apricot", nameKo: "파스텔 에이프리콧", hex: "#FDD5B1", cmyk: [0, 16, 28, 0], category: "Pastel" },
  { id: "PKV-PA016", name: "Pastel Sage", nameKo: "파스텔 세이지", hex: "#C5D5CB", cmyk: [10, 0, 8, 10], category: "Pastel" },
  { id: "PKV-PA017", name: "Pastel Butter", nameKo: "파스텔 버터", hex: "#FFF9C4", cmyk: [0, 0, 24, 0], category: "Pastel" },
  { id: "PKV-PA018", name: "Pastel Periwinkle", nameKo: "파스텔 페리윙클", hex: "#C5CAE9", cmyk: [15, 12, 0, 2], category: "Pastel" },
  { id: "PKV-PA019", name: "Pastel Seafoam", nameKo: "파스텔 씨폼", hex: "#C3FAE8", cmyk: [22, 0, 5, 0], category: "Pastel" },
  { id: "PKV-PA020", name: "Pastel Blush", nameKo: "파스텔 블러시", hex: "#F9E4E4", cmyk: [0, 10, 6, 0], category: "Pastel" },
  { id: "PKV-PA021", name: "Pastel Frost", nameKo: "파스텔 프로스트", hex: "#E3F2FD", cmyk: [10, 2, 0, 0], category: "Pastel" },
  { id: "PKV-PA022", name: "Pastel Honey", nameKo: "파스텔 허니", hex: "#FFE4B5", cmyk: [0, 10, 30, 0], category: "Pastel" },
  { id: "PKV-PA023", name: "Pastel Orchid", nameKo: "파스텔 오키드", hex: "#E0C8F0", cmyk: [6, 18, 0, 2], category: "Pastel" },
  { id: "PKV-PA024", name: "Pastel Pear", nameKo: "파스텔 배", hex: "#E8F5C8", cmyk: [6, 0, 20, 0], category: "Pastel" },
  { id: "PKV-PA025", name: "Pastel Wisteria", nameKo: "파스텔 위스테리아", hex: "#D7C4E2", cmyk: [8, 16, 0, 4], category: "Pastel" },
  { id: "PKV-PA026", name: "Pastel Cloud", nameKo: "파스텔 클라우드", hex: "#F0F0F5", cmyk: [3, 3, 0, 2], category: "Pastel" },
  { id: "PKV-PA027", name: "Pastel Tangerine", nameKo: "파스텔 탠저린", hex: "#FFD8B1", cmyk: [0, 15, 28, 0], category: "Pastel" },
  { id: "PKV-PA028", name: "Pastel Iris", nameKo: "파스텔 아이리스", hex: "#B8B8E8", cmyk: [18, 18, 0, 2], category: "Pastel" },
  { id: "PKV-PA029", name: "Pastel Fern", nameKo: "파스텔 고사리", hex: "#C8E6C9", cmyk: [14, 0, 14, 2], category: "Pastel" },
  { id: "PKV-PA030", name: "Pastel Dusk", nameKo: "파스텔 더스크", hex: "#D8CAE8", cmyk: [8, 14, 0, 4], category: "Pastel" },
];

// ─── 카테고리 한글 매핑 ───
export const SPOT_CATEGORIES_KO: Record<string, string> = {
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