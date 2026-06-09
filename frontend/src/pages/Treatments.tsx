import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TreatmentPanel } from '@/components/treatment/TreatmentPanel';
import { Select } from '@/components/shared/UI';
import { useTreatments, usePlants } from '@/hooks/useApi';
import { api } from '@/services/api';
import type { DiseaseClass, Treatment } from '@/types';
import styles from './shared.module.css';

const DISEASES: DiseaseClass[] = [
  'late_blight',
  'early_blight',
  'fusarium_wilt',
  'powdery_mildew',
  'bacterial_spot',
  'leaf_mold',
  'septoria_leaf_spot',
  'spider_mites',
];

export function TreatmentsPage() {
  const { t } = useTranslation();
  const [disease, setDisease] = useState<DiseaseClass>('late_blight');
  const { data: treatments, loading } = useTreatments(disease);

  const { data: plants } = usePlants();
  const [plantId, setPlantId] = useState<string>('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Default the plant selector to the first plant once loaded.
  useEffect(() => {
    if (!plantId && plants && plants.length > 0) setPlantId(plants[0].plantId);
  }, [plants, plantId]);

  async function applyTreatment(treatment: Treatment) {
    if (!plantId) return;
    setApplyingId(treatment.id);
    setFeedback(null);
    try {
      await api.recordAppliedTreatment({
        treatmentId: treatment.id,
        plantId,
        appliedAt: new Date().toISOString(),
      });
      setFeedback({ kind: 'ok', text: t('treatment.applied', { name: treatment.name, plant: plantId }) });
    } catch {
      setFeedback({ kind: 'err', text: t('treatment.applyError') });
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('recommendations.title')}</h1>
          <p className={styles.pageSub}>{t('recommendations.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Select
            value={disease}
            onChange={(v) => setDisease(v as DiseaseClass)}
            options={DISEASES.map((d) => ({ value: d, label: t(`disease.${d}`) }))}
          />
          {plants && plants.length > 0 && (
            <Select
              value={plantId}
              onChange={setPlantId}
              options={plants.map((p) => ({
                value: p.plantId,
                label: `${p.plantId}${p.row != null ? ` · ${t('plants.rowShort', { row: p.row })}` : ''}`,
              }))}
            />
          )}
        </div>
      </div>

      {feedback && (
        <div className={styles.card} style={{ marginBottom: 14 }}>
          <p className={styles.empty} style={{ color: feedback.kind === 'ok' ? 'var(--forest)' : 'var(--red-txt, #b91c1c)' }}>
            {feedback.text}
          </p>
        </div>
      )}

      {loading && <div className={styles.card}><p className={styles.empty}>{t('common.loading')}</p></div>}
      {!loading && (treatments?.length ?? 0) === 0 && (
        <div className={styles.card}><p className={styles.empty}>{t('recommendations.empty')}</p></div>
      )}
      {!loading && treatments && treatments.length > 0 && (
        <TreatmentPanel
          treatments={treatments}
          diseaseName={t(`disease.${disease}`)}
          onApply={applyTreatment}
          applyDisabled={!plantId}
          applyingId={applyingId}
        />
      )}
    </div>
  );
}
