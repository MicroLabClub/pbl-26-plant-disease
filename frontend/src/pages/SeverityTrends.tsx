import { useTranslation } from 'react-i18next';
import { MOCK_PASSPORT, MOCK_DETECTIONS } from '@/services/api';
import styles from './shared.module.css';
import tStyles from './SeverityTrends.module.css';

export function SeverityTrendsPage() {
  const { t } = useTranslation();
  const history = MOCK_PASSPORT.severityHistory;
  const critical = MOCK_DETECTIONS.filter(d => d.severity === 'critical').length;
  const warning  = MOCK_DETECTIONS.filter(d => d.severity === 'warning').length;
  const healthy  = MOCK_DETECTIONS.filter(d => d.severity === 'healthy').length;

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('severityTrends.title')}</h1>
          <p className={styles.pageSub}>{t('severityTrends.subtitle')}</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className={tStyles.chipRow}>
        <span className={[styles.chip, styles['chip-r']].join(' ')}>
          {t('severityTrends.critical', { count: critical })}
        </span>
        <span className={[styles.chip, styles['chip-a']].join(' ')}>
          {t('severityTrends.warning', { count: warning })}
        </span>
        <span className={[styles.chip, styles['chip-g']].join(' ')}>
          {t('severityTrends.healthy', { count: healthy })}
        </span>
      </div>

      {/* Severity over time chart */}
      <div className={styles.card} style={{ marginBottom: 14 }}>
        <div className={styles.cardTitle}>{t('severityTrends.chartTitle')}</div>
        <div className={styles.cardSub}>{t('severityTrends.chartSub')}</div>
        <div className={tStyles.chart}>
          {history.map((pt, i) => (
            <div key={i} className={tStyles.bar}>
              <div
                className={tStyles.barFill}
                style={{
                  height: `${pt.value}%`,
                  background:
                    pt.value > 70 ? '#dc2626'
                    : pt.value > 40 ? '#ef4444'
                    : pt.value > 20 ? '#fca5a5'
                    : 'var(--forest-3)',
                }}
              />
              <span className={tStyles.barLabel}>{pt.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown cards */}
      <div className={styles.grid3}>
        <div className={styles.card}>
          <div className={styles.statLabel}>{t('severityTrends.criticalLabel')}</div>
          <div className={styles.statValue} style={{ color: '#dc2626' }}>{critical}</div>
          <div className={styles.statUnit}>{t('severityTrends.detections')}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.statLabel}>{t('severityTrends.warningLabel')}</div>
          <div className={styles.statValue} style={{ color: '#d97706' }}>{warning}</div>
          <div className={styles.statUnit}>{t('severityTrends.detections')}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.statLabel}>{t('severityTrends.healthyLabel')}</div>
          <div className={styles.statValue} style={{ color: 'var(--forest-2)' }}>{healthy}</div>
          <div className={styles.statUnit}>{t('severityTrends.detections')}</div>
        </div>
      </div>
    </div>
  );
}
