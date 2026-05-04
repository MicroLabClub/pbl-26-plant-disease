import { useTranslation } from 'react-i18next';
import styles from './shared.module.css';

type AlertAction = 'actionRequired' | 'monitorClosely';
type AlertDisease = 'lateBlight' | 'earlyBlight' | 'scanComplete';

interface MockAlert {
  id: number;
  dot: string;
  disease: AlertDisease;
  row: number;
  plant?: string;
  confidence?: number;
  leafArea?: number;
  action?: AlertAction;
  allHealthy?: true;
  minsAgo: number;
}

const MOCK_ALERTS: MockAlert[] = [
  { id: 1, dot: '#ef4444', disease: 'lateBlight',   row: 7, plant: 'P023', confidence: 94.2, leafArea: 18, action: 'actionRequired', minsAgo: 2 },
  { id: 2, dot: '#f59e0b', disease: 'earlyBlight',  row: 4, plant: 'P011', confidence: 87.6, leafArea: 11, action: 'monitorClosely', minsAgo: 25 },
  { id: 3, dot: 'var(--forest-3)', disease: 'scanComplete', row: 2, allHealthy: true, minsAgo: 55 },
];

export function AlertsPage() {
  const { t } = useTranslation();

  function alertTitle(a: MockAlert) {
    if (a.disease === 'scanComplete') {
      return `${t('alerts.disease.scanComplete')} — ${t('alerts.scanRow', { row: a.row })}`;
    }
    return `${t(`alerts.disease.${a.disease}`)} — ${t('alerts.location', { row: a.row, plant: a.plant })}`;
  }

  function alertDesc(a: MockAlert) {
    if (a.allHealthy) return t('alerts.desc.allHealthy');
    return t('alerts.desc.detected', {
      confidence: a.confidence,
      leafArea: a.leafArea,
      action: t(`alerts.action.${a.action}`),
    });
  }

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
              <div className={styles.listTitle}>{alertTitle(a)}</div>
              <div className={styles.listDesc}>{alertDesc(a)}</div>
              <div className={styles.listTime}>{t('alerts.time.minsAgo', { count: a.minsAgo })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
