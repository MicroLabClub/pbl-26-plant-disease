import { useTranslation } from 'react-i18next';
import { PassportTimeline } from '@/components/detection/DetectionList';
import { MOCK_PASSPORT } from '@/services/api';
import styles from './shared.module.css';

export function PlantPassportPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('plantPassport.title')}</h1>
          <p className={styles.pageSub}>{t('plantPassport.subtitle')}</p>
        </div>
      </div>
      <PassportTimeline passport={MOCK_PASSPORT} />
    </div>
  );
}
