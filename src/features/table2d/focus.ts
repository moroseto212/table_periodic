export interface FocusScrollInput {
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  contentWidth: number;
  contentHeight: number;
  zoomLayerLeft: number;
  zoomLayerTop: number;
  tableLeft: number;
  tableTop: number;
  cellLeft: number;
  cellTop: number;
  cellWidth: number;
  cellHeight: number;
  insetRight: number;
  insetBottom: number;
}

export interface ScrollTarget {
  left: number;
  top: number;
}

/**
 * Posisi scroll agar pusat kartu unsur jatuh di tengah area pandang yang tidak
 * tertutup panel. Semua nilai berasal dari metrik layout (bukan rect yang sudah
 * ditransformasi) sehingga hasilnya stabil selama animasi zoom.
 */
export function focusScrollTarget(input: FocusScrollInput): ScrollTarget {
  const centerX =
    input.zoomLayerLeft + input.tableLeft + (input.cellLeft + input.cellWidth / 2) * input.zoom;
  const centerY =
    input.zoomLayerTop + input.tableTop + (input.cellTop + input.cellHeight / 2) * input.zoom;

  const visibleCenterX = (input.viewportWidth - input.insetRight) / 2;
  const visibleCenterY = (input.viewportHeight - input.insetBottom) / 2;

  const maxLeft = Math.max(0, input.contentWidth - input.viewportWidth);
  const maxTop = Math.max(0, input.contentHeight - input.viewportHeight);

  return {
    left: Math.min(maxLeft, Math.max(0, centerX - visibleCenterX)),
    top: Math.min(maxTop, Math.max(0, centerY - visibleCenterY)),
  };
}
