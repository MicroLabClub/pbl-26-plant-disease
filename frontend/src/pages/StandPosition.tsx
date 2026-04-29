import { useTranslation } from 'react-i18next';
import { MOCK_POSITION } from '@/services/api';
import styles from './shared.module.css';

export function StandPositionPage() {
  const { t } = useTranslation();
  const p = MOCK_POSITION;

  const cells: { label: string; value: string; unit: string }[] = [
    { label: t('standPosition.lat'),      value: p.gps.lat.toFixed(4), unit: '°N' },
    { label: t('standPosition.lon'),      value: p.gps.lon.toFixed(4), unit: '°E' },
    { label: t('standPosition.row'),      value: `${p.row}/${p.totalRows}`, unit: t('standPosition.rowUnit') },
    { label: t('standPosition.pos'),      value: p.positionMeters.toFixed(1), unit: 'm' },
    { label: t('standPosition.height'),   value: p.heightMeters.toFixed(1), unit: 'm' },
    { label: t('standPosition.speed'),    value: p.speedMs.toFixed(1), unit: 'm/s' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('standPosition.title')}</h1>
          <p className={styles.pageSub}>{t('standPosition.subtitle')}</p>
        </div>
      </div>

      <div className={styles.grid3}>
        {cells.map(c => (
          <div key={c.label} className={styles.card}>
            <div className={styles.statLabel}>{c.label}</div>
            <div className={styles.statValue}>{c.value}</div>
            <div className={styles.statUnit}>{c.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
