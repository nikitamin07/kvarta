import styles from "./stepper.module.css";

type Props = { name: string; qty: number; onChange: (delta: number) => void };

export function Stepper({ name, qty, onChange }: Props) {
  return (
    <div className={styles.step}>
      <button type="button" onClick={() => onChange(-1)} aria-label={`Убрать ${name}`}>
        −
      </button>
      <output aria-live="polite">{qty}</output>
      <button type="button" onClick={() => onChange(1)} aria-label={`Добавить ${name}`}>
        +
      </button>
    </div>
  );
}
