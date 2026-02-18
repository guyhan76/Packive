'use client'

import { useI18n } from '@/components/i18n-context'

import { Package, Box, Archive, Gift, ShoppingBag } from 'lucide-react'

interface BoxType {
  id: string
  name: string
  nameKo: string
  nameJa: string
  descKo: string
  descJa: string
  description: string
  icon: React.ReactNode
  fefcoCode: string
  available: boolean
}

const BOX_TYPES: BoxType[] = [
  {
    id: 'fefco-0215',
    name: 'Tuck End Box',
    nameKo: '맞뚜껑 상자',
    description: 'Cosmetics, food, small products',
    icon: <Package className="w-8 h-8" />,
    fefcoCode: 'FEFCO 0215',
    available: true,
  },
  {
    id: 'fefco-0201',
    name: 'Regular Slotted Box',
    nameKo: '일반 슬로티드 박스',
    nameJa: 'レギュラースロットボックス',
    description: 'Shipping, e-commerce',
    descKo: '배송, 전자상거래',
    descJa: '配送、EC',
    icon: <Box className="w-8 h-8" />,
    fefcoCode: 'FEFCO 0201',
    available: false,
  },
  {
    id: 'fefco-0427',
    name: 'Auto-Lock Bottom',
    nameKo: '바닥 잠금 상자',
    nameJa: 'オートロックボトム',
    description: 'Heavy items, premium packaging',
    descKo: '무거운 제품, 프리미엄 포장',
    descJa: '重量品、プレミアムパッケージ',
    icon: <Archive className="w-8 h-8" />,
    fefcoCode: 'FEFCO 0427',
    available: false,
  },
  {
    id: 'fefco-0301',
    name: 'Telescope Box',
    nameKo: '텔레스코픽 상자',
    nameJa: 'テレスコープボックス',
    description: 'Lid and base separate',
    descKo: '뒜꺻과 바닥 분리형',
    descJa: '蓋と底が別々',
    icon: <Gift className="w-8 h-8" />,
    fefcoCode: 'FEFCO 0301',
    available: false,
  },
  {
    id: 'ecma-a20',
    name: 'Folding Carton',
    nameKo: '폴딩카톤',
    nameJa: 'フォールディングカートン',
    description: 'Retail, display packaging',
    descKo: '리테일, 디스플레이 포장',
    descJa: '小売、ディスプレイパッケージ',
    icon: <ShoppingBag className="w-8 h-8" />,
    fefcoCode: 'ECMA A20',
    available: false,
  },
]

interface BoxTypeSelectorProps {
  selectedType: string | null
  onSelect: (typeId: string) => void
}

export function BoxTypeSelector({ selectedType, onSelect }: BoxTypeSelectorProps) {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {t("new.chooseBox")}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {BOX_TYPES.map((box) => (
          <button
            key={box.id}
            onClick={() => box.available && onSelect(box.id)}
            disabled={!box.available}
            className={`
              relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
              ${selectedType === box.id
                ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-md'
                : box.available
                  ? 'border-gray-200 hover:border-[#2563EB]/50 hover:shadow-sm cursor-pointer'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className={`
              p-2 rounded-lg
              ${selectedType === box.id ? 'text-[#2563EB] bg-[#2563EB]/10' : 'text-gray-400 bg-gray-100'}
            `}>
              {box.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{lang === "ko" ? box.nameKo : lang === "ja" ? box.nameJa : box.name}</span>
                <span className="text-xs text-gray-400">{box.fefcoCode}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{lang === "ko" ? box.descKo : lang === "ja" ? box.descJa : box.description}</p>
            </div>
            {!box.available && (
              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                {t("new.comingSoon")}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
