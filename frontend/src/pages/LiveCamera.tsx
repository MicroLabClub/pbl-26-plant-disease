import { useTranslation } from 'react-i18next';
import { CameraPanel } from '@/components/camera/CameraPanel';
import styles from './shared.module.css';

export function LiveCameraPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('liveCamera.title')}</h1>
          <p className={styles.pageSub}>{t('liveCamera.subtitle')}</p>
        </div>
      </div>
      <CameraPanel />
    </div>
  );
}
