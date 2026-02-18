export interface PanelBounds {
  x: number
  y: number
  width: number
  height: number
}

export function calculatePanelBounds(
  imgBounds: { x: number; y: number; width: number; height: number },
  dimensions: { L: number; W: number; D: number }
): Record<string, PanelBounds> {
  const { L, W } = dimensions
  const glueFlap = 15
  const totalW = glueFlap + L + W + L + W

  const bodyTopRatio = 0.28
  const bodyHeightRatio = 0.44

  const bodyTop = imgBounds.y + imgBounds.height * bodyTopRatio
  const bodyH = imgBounds.height * bodyHeightRatio

  const usableW = imgBounds.width * 0.96
  const startX = imgBounds.x + imgBounds.width * 0.02

  const gfW = usableW * (glueFlap / totalW)
  const lW = usableW * (L / totalW)
  const wW = usableW * (W / totalW)

  let cx = startX + gfW

  const bounds: Record<string, PanelBounds> = {}
  bounds.panel1 = { x: cx, y: bodyTop, width: lW, height: bodyH }; cx += lW
  bounds.panel2 = { x: cx, y: bodyTop, width: wW, height: bodyH }; cx += wW
  bounds.panel3 = { x: cx, y: bodyTop, width: lW, height: bodyH }; cx += lW
  bounds.panel4 = { x: cx, y: bodyTop, width: wW, height: bodyH }
  bounds.top = { x: imgBounds.x, y: imgBounds.y, width: imgBounds.width, height: imgBounds.height * bodyTopRatio }
  bounds.bottom = { x: imgBounds.x, y: bodyTop + bodyH, width: imgBounds.width, height: imgBounds.height * (1 - bodyTopRatio - bodyHeightRatio) }

  return bounds
}
