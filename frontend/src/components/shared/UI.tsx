import { type ReactNode, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import styles from './UI.module.css';

// ── Card ──────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={[styles.card, className].join(' ')}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className={styles.cardHeader}>
      <div>
        <div className={styles.cardTitle}>{title}</div>
        {subtitle && <div className={styles.cardSub}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ── Chip ──────────────────────────────────────────────────

type ChipVariant = 'green' | 'red' | 'amber' | 'gray' | 'blue';

export function Chip({ label, variant = 'gray' }: { label: string; variant?: ChipVariant }) {
  return <span className={[styles.chip, styles[`chip-${variant}`]].join(' ')}>{label}</span>;
}

// ── Stat card ─────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  trend,
  trendUp,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statNum}>{value}</div>
      {sub && <div className={styles.statFoot}>{sub}</div>}
      {trend && (
        <div className={[styles.statTrend, trendUp ? styles.trendUp : styles.trendOk].join(' ')}>
          {trend}
        </div>
      )}
    </Card>
  );
}

// ── Alert strip ───────────────────────────────────────────

export function AlertStrip({
  title,
  description,
  onAction,
}: {
  title: string;
  description: string;
  onAction?: () => void;
}) {
  return (
    <div className={styles.alertStrip}>
      <div className={styles.alertIcon}>
        <svg viewBox="0 0 17 17" fill="none" width={17} height={17}>
          <path d="M8.5 2L1 14h15L8.5 2z" fill="#f59e0b" />
          <path d="M8.5 7v4M8.5 12.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.alertContent}>
        <div className={styles.alertTitle}>{title}</div>
        <div className={styles.alertDesc}>{description}</div>
      </div>
      {onAction && (
        <button className={styles.alertCta} onClick={onAction}>
          <ReviewNowLabel />
        </button>
      )}
    </div>
  );
}

function ReviewNowLabel() {
  const { t } = useTranslation();
  return <>{t('ui.reviewNow')}</>;
}

// ── Select ────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={[styles.selectWrap, className ?? ''].join(' ')}>
      <button
        type="button"
        className={[styles.selectTrigger, open ? styles.selectTriggerOpen : ''].join(' ')}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className={styles.selectValue}>{selected?.label ?? '—'}</span>
        <ChevronDown
          size={14}
          className={[styles.selectChevron, open ? styles.selectChevronUp : ''].join(' ')}
        />
      </button>

      {open && (
        <div className={styles.selectDropdown}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={[
                styles.selectOption,
                opt.value === value ? styles.selectOptionActive : '',
              ].join(' ')}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className={styles.selectOptionCheck}>
                {opt.value === value && <Check size={12} />}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────

export function Skeleton({ height = 20, width = '100%' }: { height?: number; width?: string }) {
  return (
    <div
      className={styles.skeleton}
      style={{ height, width }}
    />
  );
}
