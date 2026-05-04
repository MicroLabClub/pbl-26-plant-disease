import { useTranslation } from 'react-i18next';
import { TreatmentPanel } from '@/components/treatment/TreatmentPanel';
import { MOCK_TREATMENTS } from '@/services/api';
import styles from './shared.module.css';

export function TreatmentsPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('recommendations.title')}</h1>
          <p className={styles.pageSub}>{t('recommendations.subtitle')}</p>
        </div>
      </div>
      <TreatmentPanel treatments={MOCK_TREATMENTS} diseaseName={t('alerts.disease.lateBlight')} />
    </div>
  );
}
