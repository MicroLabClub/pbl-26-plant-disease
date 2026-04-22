import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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

// ── Loading skeleton ──────────────────────────────────────

export function Skeleton({ height = 20, width = '100%' }: { height?: number; width?: string }) {
  return (
    <div
      className={styles.skeleton}
      style={{ height, width }}
    />
  );
}
