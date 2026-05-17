/**
 * Packive Align & Distribute Utilities
 * - 선택된 요소들을 정렬/균등 분배
 */

type AlignType = "left" | "centerH" | "right" | "top" | "centerV" | "bottom";
type DistributeType = "horizontal" | "vertical";

interface BoundsInfo {
  obj: any;
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

function getObjBounds(obj: any): BoundsInfo {
  const br = obj.getBoundingRect(true);
  return {
    obj,
    left: br.left,
    top: br.top,
    right: br.left + br.width,
    bottom: br.top + br.height,
    centerX: br.left + br.width / 2,
    centerY: br.top + br.height / 2,
    width: br.width,
    height: br.height,
  };
}

/**
 * 선택된 요소들을 지정된 방향으로 정렬합니다.
 */
export function alignObjects(canvas: any, type: AlignType): void {
  const active = canvas.getActiveObject();
  if (!active) return;

  let objects: any[];
  if (active.type === "activeSelection" || active.type === "activeselection") {
    objects = active.getObjects();
  } else {
    // 단일 객체면 캔버스 기준 정렬
    const b = getObjBounds(active);
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    switch (type) {
      case "left": active.set({ left: 0 }); break;
      case "centerH": active.set({ left: cw / 2 - b.width / 2 }); break;
      case "right": active.set({ left: cw - b.width }); break;
      case "top": active.set({ top: 0 }); break;
      case "centerV": active.set({ top: ch / 2 - b.height / 2 }); break;
      case "bottom": active.set({ top: ch - b.height }); break;
    }
    active.setCoords();
    canvas.requestRenderAll();
    return;
  }

  if (objects.length < 2) return;

  const boundsArr = objects.map(getObjBounds);

  switch (type) {
    case "left": {
      const minLeft = Math.min(...boundsArr.map(b => b.left));
      for (const b of boundsArr) {
        const diff = minLeft - b.left;
        b.obj.set({ left: (b.obj.left || 0) + diff });
        b.obj.setCoords();
      }
      break;
    }
    case "centerH": {
      const allLeft = Math.min(...boundsArr.map(b => b.left));
      const allRight = Math.max(...boundsArr.map(b => b.right));
      const center = (allLeft + allRight) / 2;
      for (const b of boundsArr) {
        const diff = center - b.centerX;
        b.obj.set({ left: (b.obj.left || 0) + diff });
        b.obj.setCoords();
      }
      break;
    }
    case "right": {
      const maxRight = Math.max(...boundsArr.map(b => b.right));
      for (const b of boundsArr) {
        const diff = maxRight - b.right;
        b.obj.set({ left: (b.obj.left || 0) + diff });
        b.obj.setCoords();
      }
      break;
    }
    case "top": {
      const minTop = Math.min(...boundsArr.map(b => b.top));
      for (const b of boundsArr) {
        const diff = minTop - b.top;
        b.obj.set({ top: (b.obj.top || 0) + diff });
        b.obj.setCoords();
      }
      break;
    }
    case "centerV": {
      const allTop = Math.min(...boundsArr.map(b => b.top));
      const allBottom = Math.max(...boundsArr.map(b => b.bottom));
      const center = (allTop + allBottom) / 2;
      for (const b of boundsArr) {
        const diff = center - b.centerY;
        b.obj.set({ top: (b.obj.top || 0) + diff });
        b.obj.setCoords();
      }
      break;
    }
    case "bottom": {
      const maxBottom = Math.max(...boundsArr.map(b => b.bottom));
      for (const b of boundsArr) {
        const diff = maxBottom - b.bottom;
        b.obj.set({ top: (b.obj.top || 0) + diff });
        b.obj.setCoords();
      }
      break;
    }
  }

  active.setCoords();
  canvas.requestRenderAll();
}

/**
 * 선택된 요소들을 균등 간격으로 분배합니다.
 */
export function distributeObjects(canvas: any, dir: DistributeType): void {
  const active = canvas.getActiveObject();
  if (!active || (active.type !== "activeSelection" && active.type !== "activeselection")) return;

  const objects: any[] = active.getObjects();
  if (objects.length < 3) return;

  const boundsArr = objects.map(getObjBounds);

  if (dir === "horizontal") {
    boundsArr.sort((a, b) => a.left - b.left);
    const totalSpan = boundsArr[boundsArr.length - 1].right - boundsArr[0].left;
    const totalObjWidth = boundsArr.reduce((sum, b) => sum + b.width, 0);
    const gap = (totalSpan - totalObjWidth) / (boundsArr.length - 1);
    
    let currentX = boundsArr[0].left;
    for (const b of boundsArr) {
      const diff = currentX - b.left;
      b.obj.set({ left: (b.obj.left || 0) + diff });
      b.obj.setCoords();
      currentX += b.width + gap;
    }
  } else {
    boundsArr.sort((a, b) => a.top - b.top);
    const totalSpan = boundsArr[boundsArr.length - 1].bottom - boundsArr[0].top;
    const totalObjHeight = boundsArr.reduce((sum, b) => sum + b.height, 0);
    const gap = (totalSpan - totalObjHeight) / (boundsArr.length - 1);

    let currentY = boundsArr[0].top;
    for (const b of boundsArr) {
      const diff = currentY - b.top;
      b.obj.set({ top: (b.obj.top || 0) + diff });
      b.obj.setCoords();
      currentY += b.height + gap;
    }
  }

  active.setCoords();
  canvas.requestRenderAll();
}