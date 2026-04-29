import { useTranslation } from 'react-i18next';
import styles from './shared.module.css';

const MOCK_HISTORY = [
  { id: 1, dot: 'var(--forest-3)', title: 'Trichoderma harzianum — 2g/L foliar', desc: 'Applied to Row 7, Plants #P020–#P025 · biological', time: '2 days ago' },
  { id: 2, dot: 'var(--forest-3)', title: 'Trichoderma harzianum — 2g/L foliar', desc: 'Applied to Row 4, Plants #P010–#P015 · biological', time: '5 days ago' },
  { id: 3, dot: '#f59e0b',         title: 'Chlorothalonil 75% WP — 1.5g/L',     desc: 'Applied to Row 2, Plants #P005–#P009 · chemical · PHI 7 days', time: '9 days ago' },
  { id: 4, dot: 'var(--forest-3)', title: 'Trichoderma harzianum — 2g/L foliar', desc: 'Applied to Row 1, full row · biological', time: '12 days ago' },
];

export function TreatmentHistoryPage() {
  const { t } = useTranslation();
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
              <div className={styles.listTitle}>{h.title}</div>
              <div className={styles.listDesc}>{h.desc}</div>
              <div className={styles.listTime}>{h.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
