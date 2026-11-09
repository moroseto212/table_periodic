/** Rumus kimia dengan angka sebagai subskrip, mis. H2O -> H₂O */
export default function Formula({ formula, className }: { formula: string; className?: string }) {
  const parts = formula.split(/(\d+)/g).filter((part) => part !== '');
  return (
    <span className={className}>
      {parts.map((part, index) =>
        /^\d+$/.test(part) ? <sub key={index}>{part}</sub> : <span key={index}>{part}</span>,
      )}
    </span>
  );
}

const HALVES: Record<string, string> = {
  '0.5': '½',
  '1.5': '1½',
  '2.5': '2½',
  '3.5': '3½',
};

export function formatCoeff(value: number): string {
  if (Math.abs(value - 1) < 1e-9) return '';
  if (Number.isInteger(value)) return String(value);
  const key = value.toFixed(1);
  return HALVES[key] ?? value.toFixed(2);
}
