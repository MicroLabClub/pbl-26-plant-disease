import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';
import { ro, ru, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { useDetections } from '@/hooks/useApi';
import type { Detection, DetectionSeverity } from '@/types';
import styles from './DetectionLog.module.css';

type Filter = 'all' | DetectionSeverity;

function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  if (i18n.language === 'ro') return ro;
  if (i18n.language === 'ru') return ru;
  return enUS;
}

export function DetectionLogPage() {
  const { t } = useTranslation();
  const { data: detections, loading } = useDetections(200);
  const [filter, setFilter] = useState<Filter>('all');
  const dateLocale = useDateLocale();

  const counts = useMemo(() => {
    const all = detections ?? [];
    return {
      all: all.length,
      critical: all.filter(d => d.severity === 'critical').length,
      warning: all.filter(d => d.severity === 'warning').length,
      healthy: all.filter(d => d.severity === 'healthy').length,
    };
  }, [detections]);

  const filtered = useMemo(() => {
    if (!detections) return [];
    if (filter === 'all') return detections;
    return detections.filter(d => d.severity === filter);
  }, [detections, filter]);

  const filterDefs: { key: Filter; count: number }[] = [
    { key: 'all',      count: counts.all },
    { key: 'critical', count: counts.critical },
    { key: 'warning',  count: counts.warning },
    { key: 'healthy',  count: counts.healthy },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('detectionLog.title')}</h1>
          <p className={styles.pageSub}>
            {t('detectionLog.subtitle')} ·{' '}
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={styles.totalBadge}>
          {counts.all} {t('detectionLog.total')}
        </div>
      </div>

      <div className={styles.filterRow}>
        {filterDefs.map(f => (
          <button
            key={f.key}
            className={[
              styles.filterBtn,
              filter === f.key ? styles[`filterActive-${f.key}`] : styles.filterInactive,
            ].join(' ')}
            onClick={() => setFilter(f.key)}
          >
            {t(`detectionLog.filter.${f.key}`)}
            <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {loading ? (
          <p className={styles.empty}>{t('detectionLog.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>{t('detectionLog.empty')}</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.thead}>
              <span>{t('detectionLog.cols.severity')}</span>
              <span>{t('detectionLog.cols.disease')}</span>
              <span>{t('detectionLog.cols.confidence')}</span>
              <span>{t('detectionLog.cols.plant')}</span>
              <span>{t('detectionLog.cols.row')}</span>
              <span>{t('detectionLog.cols.area')}</span>
              <span>{t('detectionLog.cols.inference')}</span>
              <span>{t('detectionLog.cols.time')}</span>
            </div>
            {filtered.map(d => (
              <DetectionRow key={d.id} d={d} dateLocale={dateLocale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetectionRow({ d, dateLocale }: { d: Detection; dateLocale: Locale }) {
  const { t } = useTranslation();
  const v = d.severity === 'critical' ? 'r' : d.severity === 'warning' ? 'a' : 'g';

  return (
    <div className={[styles.trow, styles[`trow-${v}`]].join(' ')}>
      <span>
        <span className={[styles.severityBadge, styles[`badge-${v}`]].join(' ')}>
          {t(`detection.severity.${d.severity}`)}
        </span>
      </span>
      <span className={styles.diseaseLabel}>
        {d.topPrediction.diseaseClass === 'healthy'
          ? t('detection.severity.healthy')
          : d.topPrediction.label}
      </span>
      <span
        className={styles.confVal}
        style={{ color: v === 'r' ? '#b91c1c' : v === 'a' ? '#92400e' : 'var(--forest-2)' }}
      >
        {(d.topPrediction.confidence * 100).toFixed(0)}%
      </span>
      <span className={styles.meta}>#{d.plantId}</span>
      <span className={styles.meta}>{d.row}</span>
      <span className={styles.meta}>{d.boundingBox.affectedAreaPercent.toFixed(0)}%</span>
      <span className={styles.meta}>{d.inferenceMs} ms</span>
      <span
        className={styles.timeVal}
        title={format(new Date(d.timestamp), 'dd MMM yyyy, HH:mm', { locale: dateLocale })}
      >
        {formatDistanceToNow(new Date(d.timestamp), { addSuffix: true, locale: dateLocale })}
      </span>
    </div>
  );
}
