import { useEffect, useMemo, useRef, useState } from 'react';
import {
  QUIZ_LEVELS,
  quizItems,
  type QuizItem,
  type QuizLevel,
} from '../../core/data/quiz';
import { navigate, segments, withBase } from '../../app/router';
import { useAppStore } from '../../app/store';

const SESSION_KEY = 'periodic-lab.quiz-session';
const BEST_KEY = 'periodic-lab.quiz-best';

type Phase = 'pick' | 'run' | 'done';

interface SavedSession {
  level: QuizLevel;
  ids: string[];
  index: number;
  results: { id: string; correct: boolean }[];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function readBest(): Partial<Record<QuizLevel, number>> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}') as Partial<Record<QuizLevel, number>>;
  } catch {
    return {};
  }
}

function readSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    if (!parsed.ids?.length || parsed.index >= parsed.ids.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function QuizScreen({
  focusSymbol,
  path,
}: {
  focusSymbol: string | null;
  path: string;
}) {
  const [phase, setPhase] = useState<Phase>('pick');
  const [level, setLevel] = useState<QuizLevel>('dasar');
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [best, setBest] = useState<Partial<Record<QuizLevel, number>>>(() =>
    typeof window === 'undefined' ? {} : readBest(),
  );
  const [saved, setSaved] = useState<SavedSession | null>(() =>
    typeof window === 'undefined' ? null : readSession(),
  );
  const [shareLabel, setShareLabel] = useState('Bagikan hasil');
  const startedRef = useRef(false);
  const select = useAppStore((s) => s.select);

  const start = (nextLevel: QuizLevel, items?: QuizItem[]) => {
    const pool = items ?? quizItems.filter((item) => item.level === nextLevel);
    const focus = focusSymbol ? pool.filter((item) => item.symbol === focusSymbol) : [];
    const rest = pool.filter((item) => !focus.includes(item));
    const ordered = [...shuffle(focus), ...shuffle(rest)].slice(0, 10);

    setLevel(nextLevel);
    setQueue(ordered);
    setIndex(0);
    setAttempt(0);
    setSelected(null);
    setRevealed(false);
    setResults([]);
    setPhase('run');
  };

  useEffect(() => {
    if (startedRef.current) return;
    const requested = segments(path)[1] as QuizLevel | undefined;
    if (requested && QUIZ_LEVELS.some((l) => l.id === requested)) {
      startedRef.current = true;
      start(requested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    if (phase !== 'run') return;
    try {
      const payload: SavedSession = { level, ids: queue.map((q) => q.id), index, results };
      localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch {
      // abaikan
    }
  }, [index, level, phase, queue, results]);

  const current = queue[index] ?? null;

  const answer = (option: number) => {
    if (!current || revealed) return;

    if (option === current.answer) {
      setSelected(option);
      setRevealed(true);
      setResults((prev) => [...prev, { id: current.id, correct: attempt === 0 }]);
      return;
    }

    setSelected(option);
    if (attempt === 0) {
      setAttempt(1);
      return;
    }

    setRevealed(true);
    setResults((prev) => [...prev, { id: current.id, correct: false }]);
  };

  const next = () => {
    if (index + 1 >= queue.length) {
      const correct = results.filter((r) => r.correct).length;
      const previous = best[level] ?? 0;
      const percent = Math.round((correct / Math.max(queue.length, 1)) * 100);
      if (percent > previous) {
        const updated = { ...best, [level]: percent };
        setBest(updated);
        try {
          localStorage.setItem(BEST_KEY, JSON.stringify(updated));
        } catch {
          // abaikan
        }
      }
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        // abaikan
      }
      setPhase('done');
      return;
    }
    setIndex((i) => i + 1);
    setAttempt(0);
    setSelected(null);
    setRevealed(false);
  };

  const wrongItems = useMemo(() => {
    const wrongIds = new Set(results.filter((r) => !r.correct).map((r) => r.id));
    return queue.filter((item) => wrongIds.has(item.id));
  }, [queue, results]);

  const shareResult = () => {
    const correct = results.filter((r) => r.correct).length;
    const text = `Tantangan PeriodikLab — ${correct}/${queue.length} benar (${level}).`;
    const url = `${window.location.origin}${withBase('/tantangan')}`;
    navigator.clipboard
      ?.writeText(`${text} ${url}`)
      .then(() => {
        setShareLabel('Hasil disalin');
        window.setTimeout(() => setShareLabel('Bagikan hasil'), 1800);
      })
      .catch(() => {
        setShareLabel('Salin gagal');
        window.setTimeout(() => setShareLabel('Bagikan hasil'), 1800);
      });
  };

  /* ---------------------------------- pilih level ---------------------------------- */
  if (phase === 'pick') {
    return (
      <div className="quiz quiz--pick">
        <header className="quiz__head">
          <div>
            <h1>Tantangan Kimia</h1>
            <p>Soal orisinal, umpan balik langsung, dan pembahasan setiap jawaban.</p>
            {focusSymbol && (
              <button
                type="button"
                className="pill"
                onClick={() => {
                  select(focusSymbol);
                  navigate('/');
                }}
              >
                Fokus unsur {focusSymbol} · kembali ke tabel
              </button>
            )}
          </div>
        </header>

        {saved && (
          <div className="restore">
            <span>
              Ada sesi {saved.level} yang belum selesai ({saved.index}/{saved.ids.length} soal).
            </span>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => {
                const items = saved.ids
                  .map((id) => quizItems.find((item) => item.id === id))
                  .filter((item): item is QuizItem => Boolean(item));
                setLevel(saved.level);
                setQueue(items);
                setIndex(saved.index);
                setResults(saved.results);
                setAttempt(0);
                setSelected(null);
                setRevealed(false);
                setPhase('run');
                setSaved(null);
              }}
            >
              Lanjutkan
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Hapus sesi tersimpan"
              onClick={() => {
                localStorage.removeItem(SESSION_KEY);
                setSaved(null);
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="level-grid">
          {QUIZ_LEVELS.map((item) => {
            const count = quizItems.filter((q) => q.level === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                className="level-card"
                onClick={() => {
                  setSaved(null);
                  start(item.id);
                }}
              >
                <span className="level-card__label">{item.label}</span>
                <span className="level-card__blurb">{item.blurb}</span>
                <span className="level-card__meta">
                  {Math.min(10, count)} soal
                  {best[item.id] != null ? ` · terbaik ${best[item.id]}%` : ''}
                </span>
                <span className="level-card__cta">Mulai →</span>
              </button>
            );
          })}
        </div>

        <p className="quiz__note">
          Kalibrasi kesulitan mengacu pada Kurikulum Merdeka Fase E/F dan GCSE. Semua soal ditulis
          ulang, bukan salinan kertas ujian.
        </p>
      </div>
    );
  }

  /* ------------------------------------ selesai ----------------------------------- */
  if (phase === 'done') {
    const correct = results.filter((r) => r.correct).length;
    const percent = Math.round((correct / Math.max(queue.length, 1)) * 100);
    return (
      <div className="quiz quiz--done">
        <h1 className="sr-only">
          Hasil Tantangan Kimia Tingkat {level.charAt(0).toUpperCase() + level.slice(1)}
        </h1>
        <div className="score">
          <span className="score__kicker">Selesai</span>
          <p className="score__value">
            {correct}
            <span>/{queue.length}</span>
          </p>
          <p className="score__percent">{percent}% benar</p>
          <p className="score__level">Paket {level}</p>
        </div>

        <ul className="score__list">
          {queue.map((item, i) => {
            const result = results.find((r) => r.id === item.id);
            return (
              <li key={item.id} className={result?.correct ? 'is-correct' : 'is-wrong'}>
                <span className="score__num">{i + 1}</span>
                <span className="score__prompt">{item.prompt}</span>
                <span className="score__mark" aria-label={result?.correct ? 'Benar' : 'Salah'}>
                  {result?.correct ? '✓' : '✕'}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="quiz__actions">
          {wrongItems.length > 0 && (
            <button type="button" className="btn btn--primary" onClick={() => start(level, wrongItems)}>
              Ulangi {wrongItems.length} soal yang salah
            </button>
          )}
          <button type="button" className="btn" onClick={() => start(level)}>
            Ulangi paket
          </button>
          <button type="button" className="btn" onClick={() => setPhase('pick')}>
            Pilih level lain
          </button>
          <button type="button" className="btn" onClick={shareResult}>
            {shareLabel}
          </button>
        </div>

        <button type="button" className="quiz__back" onClick={() => navigate('/')}>
          ← Kembali ke tabel periodik
        </button>
      </div>
    );
  }

  /* ------------------------------------- soal ------------------------------------- */
  if (!current) return null;

  const isCorrectPick = revealed && selected === current.answer;
  const retrying = attempt === 1 && !revealed;

  return (
    <div className="quiz quiz--run">
      <h1 className="sr-only">
        Tantangan Kimia Tingkat {level.charAt(0).toUpperCase() + level.slice(1)}
      </h1>
      <div className="quiz__progress" aria-hidden="true">
        <span style={{ width: `${(index / queue.length) * 100}%` }} />
      </div>

      <header className="quiz__run-head">
        <span className="pill">{level}</span>
        <span className="quiz__count" aria-live="polite">
          Soal {index + 1} / {queue.length}
        </span>
        <button type="button" className="quiz__exit" onClick={() => setPhase('pick')}>
          Keluar
        </button>
      </header>

      <article className="question">
        <h2>{current.prompt}</h2>

        <div className="options" role="group" aria-label="Pilihan jawaban">
          {current.options.map((option, i) => {
            let state = '';
            if (revealed) {
              if (i === current.answer) state = 'is-correct';
              else if (i === selected) state = 'is-wrong';
              else state = 'is-muted';
            } else if (i === selected) {
              state = 'is-selected';
            }
            return (
              <button
                key={i}
                type="button"
                className={`option ${state}`}
                onClick={() => answer(i)}
                disabled={revealed}
              >
                <span className="option__key">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {retrying && (
          <p className="feedback feedback--retry" role="status">
            Belum tepat. Coba sekali lagi — pikirkan jumlah elektron atau rasio atomnya.
          </p>
        )}

        {revealed && (
          <div className={`feedback ${isCorrectPick ? 'feedback--ok' : 'feedback--bad'}`} role="status">
            <strong>{isCorrectPick ? 'Benar.' : 'Belum tepat.'}</strong> {current.explanation}
          </div>
        )}

        <div className="quiz__actions">
          {revealed ? (
            <button type="button" className="btn btn--primary btn--wide" onClick={next}>
              {index + 1 >= queue.length ? 'Lihat hasil' : 'Soal berikutnya'}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setRevealed(true);
                setResults((prev) => [...prev, { id: current.id, correct: false }]);
              }}
            >
              Lewati dan lihat pembahasan
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
