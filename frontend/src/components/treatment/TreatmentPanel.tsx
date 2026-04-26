import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Chip } from '@/components/shared/UI';
import type { Treatment } from '@/types';
import styles from './TreatmentPanel.module.css';

interface TreatmentPanelProps {
  treatments: Treatment[];
  diseaseName?: string;
}

export function TreatmentPanel({ treatments, diseaseName }: TreatmentPanelProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader
        title={`${t('treatment.title')}${diseaseName ? ` — ${diseaseName}` : ''}`}
        subtitle={t('treatment.subtitle')}
        right={<Chip label={t('treatment.actNow')} variant="amber" />}
      />
      <div className={styles.list}>
        {treatments.map((t) => (
          <TreatmentCard key={t.id} treatment={t} />
        ))}
      </div>
    </Card>
  );
}

function TreatmentCard({ treatment: tr }: { treatment: Treatment }) {
  const { t } = useTranslation();
  const isBio = tr.type === 'biological';

  const computedTags = [
    t(`treatment.type.${tr.type}`),
    t('treatment.phi', { days: tr.phiDays }),
    t(`treatment.cost.${tr.costLevel}`),
  ];

  return (
    <div className={[styles.card, isBio ? styles.cardBio : styles.cardChem].join(' ')}>
      <div className={styles.head}>
        <span className={styles.name}>{tr.name}</span>
        <Chip label={isBio ? t('treatment.bioFirst') : t('treatment.chemical')} variant={isBio ? 'green' : 'red'} />
      </div>
      <p className={styles.desc}>{tr.description}</p>
      <div className={styles.tags}>
        {computedTags.map((tag) => (
          <span
            key={tag}
            className={styles.tag}
            style={
              isBio
                ? { background: 'var(--mist)', color: 'var(--forest)', borderColor: 'var(--br-2)' }
                : { background: 'var(--red-bg)', color: 'var(--red-txt)', borderColor: 'var(--red-br)' }
            }
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
