import { describe, expect, it } from 'vitest';
import { focusScrollTarget, type FocusScrollInput } from './focus';

const base: FocusScrollInput = {
  zoom: 2,
  viewportWidth: 1200,
  viewportHeight: 800,
  contentWidth: 2000,
  contentHeight: 1600,
  zoomLayerLeft: 0,
  zoomLayerTop: 0,
  tableLeft: 0,
  tableTop: 0,
  cellLeft: 0,
  cellTop: 0,
  cellWidth: 100,
  cellHeight: 100,
  insetRight: 0,
  insetBottom: 0,
};

describe('focusScrollTarget', () => {
  it('memusatkan kartu di tengah area pandang', () => {
    const target = focusScrollTarget({
      ...base,
      cellLeft: 450,
      cellTop: 350,
    });

    // Kartu 100x100 pada skala 2 berpusat di 1000, 800.
    expect(target).toEqual({ left: 400, top: 400 });
  });

  it('menggeser fokus ke kiri saat panel desktop terbuka', () => {
    const target = focusScrollTarget({
      ...base,
      cellLeft: 450,
      cellTop: 350,
      insetRight: 400,
      viewportWidth: 1000,
    });

    // Area terlihat 600 px; pusat 300 px, bukan 500 px.
    expect(target.left).toBe(700);
    expect(target.top).toBe(400);
  });

  it('menggeser fokus ke atas saat panel mobile terbuka', () => {
    const target = focusScrollTarget({
      ...base,
      cellLeft: 450,
      cellTop: 350,
      insetBottom: 400,
      viewportHeight: 600,
    });

    expect(target.left).toBe(400);
    expect(target.top).toBe(700);
  });

  it('membatasi target agar tidak melewati batas scroll', () => {
    const target = focusScrollTarget({
      ...base,
      cellLeft: 900,
      cellTop: 700,
    });

    expect(target).toEqual({ left: 800, top: 800 });
  });

  it('tidak menghasilkan scroll negatif', () => {
    const target = focusScrollTarget({
      ...base,
      zoom: 1,
      contentWidth: 800,
      contentHeight: 600,
      cellLeft: 10,
      cellTop: 10,
    });

    expect(target).toEqual({ left: 0, top: 0 });
  });
});
