import { describe, expect, it } from 'vitest';
import { QUIZ_LEVELS, quizItems } from './quiz';

describe('bank soal tantangan', () => {
  it('memiliki id unik', () => {
    const ids = quizItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('setiap soal punya empat opsi dan indeks jawaban yang valid', () => {
    for (const item of quizItems) {
      expect(item.options, item.id).toHaveLength(4);
      expect(item.answer, item.id).toBeGreaterThanOrEqual(0);
      expect(item.answer, item.id).toBeLessThan(item.options.length);
      expect(new Set(item.options).size, item.id).toBe(4);
    }
  });

  it('tidak mengulang prompt yang sama', () => {
    const prompts = quizItems.map((item) => item.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it('setiap level punya minimal 10 soal agar satu sesi penuh', () => {
    for (const level of QUIZ_LEVELS) {
      const count = quizItems.filter((item) => item.level === level.id).length;
      expect(count, level.id).toBeGreaterThanOrEqual(10);
    }
  });

  it('setiap soal punya pembahasan dan kurikulum yang dikenal', () => {
    const curricula = new Set(['merdeka-e', 'merdeka-f', 'gcse']);
    for (const item of quizItems) {
      expect(item.explanation.trim().length, item.id).toBeGreaterThan(10);
      expect(curricula.has(item.curriculum), item.id).toBe(true);
    }
  });
});
