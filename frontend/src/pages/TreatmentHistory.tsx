import { useTranslation } from 'react-i18next';
import styles from './shared.module.css';

type TreatmentType = 'biological' | 'chemical';

interface MockHistory {
  id: number;
  dot: string;
  product: string;
  row: number;
  from?: string;
  to?: string;
  fullRow?: true;
  type: TreatmentType;
  phiDays?: number;
  daysAgo: number;
}

const MOCK_HISTORY: MockHistory[] = [
  { id: 1, dot: 'var(--forest-3)', product: 'Trichoderma harzianum — 2g/L foliar', row: 7, from: 'P020', to: 'P025', type: 'biological', daysAgo: 2 },
  { id: 2, dot: 'var(--forest-3)', product: 'Trichoderma harzianum — 2g/L foliar', row: 4, from: 'P010', to: 'P015', type: 'biological', daysAgo: 5 },
  { id: 3, dot: '#f59e0b',         product: 'Chlorothalonil 75% WP — 1.5g/L',     row: 2, from: 'P005', to: 'P009', type: 'chemical', phiDays: 7, daysAgo: 9 },
  { id: 4, dot: 'var(--forest-3)', product: 'Trichoderma harzianum — 2g/L foliar', row: 1, fullRow: true, type: 'biological', daysAgo: 12 },
];

export function TreatmentHistoryPage() {
  const { t } = useTranslation();

  function historyDesc(h: MockHistory) {
    const typeLabel = t(`history.type.${h.type}`);
    const base = h.fullRow
      ? t('history.appliedFullRow', { row: h.row, type: typeLabel })
      : t('history.applied', { row: h.row, from: h.from, to: h.to, type: typeLabel });
    return h.phiDays ? `${base} · ${t('history.phiDays', { days: h.phiDays })}` : base;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('treatmentHistory.title')}</h1>
          <p className={styles.pageSub}>{t('treatmentHistory.subtitle')}</p>
        </div>
      </div>

      <div className={styles.card}>
        {MOCK_HISTORY.map(h => (
          <div key={h.id} className={styles.listItem}>
            <div className={styles.listDot} style={{ background: h.dot }} />
            <div>
              <div className={styles.listTitle}>{h.product}</div>
              <div className={styles.listDesc}>{historyDesc(h)}</div>
              <div className={styles.listTime}>{t('alerts.time.daysAgo', { count: h.daysAgo })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
