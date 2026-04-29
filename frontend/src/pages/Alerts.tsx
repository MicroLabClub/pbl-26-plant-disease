import { useTranslation } from 'react-i18next';
import styles from './shared.module.css';

const MOCK_ALERTS = [
  { id: 1, dot: '#ef4444', title: 'Late blight — Row 7, Plant #P023', desc: '94.2% confidence · 18% leaf area affected · action required', time: '2 min ago' },
  { id: 2, dot: '#f59e0b', title: 'Early blight — Row 4, Plant #P011', desc: '87.6% confidence · 11% leaf area affected · monitor closely', time: '25 min ago' },
  { id: 3, dot: 'var(--forest-3)', title: 'Scan complete — Row 2', desc: 'All plants healthy · No issues detected', time: '55 min ago' },
];

export function AlertsPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('alertsPage.title')}</h1>
          <p className={styles.pageSub}>{t('alertsPage.subtitle')}</p>
        </div>
      </div>

      <div className={styles.card}>
        {MOCK_ALERTS.map(a => (
          <div key={a.id} className={styles.listItem}>
            <div className={styles.listDot} style={{ background: a.dot }} />
            <div>
              <div className={styles.listTitle}>{a.title}</div>
              <div className={styles.listDesc}>{a.desc}</div>
              <div className={styles.listTime}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
