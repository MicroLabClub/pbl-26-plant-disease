import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Chip } from '@/components/shared/UI';
import { useCameraFrame, useDetections, useEnvironment } from '@/hooks/useApi';
import styles from './CameraPanel.module.css';

export function CameraPanel() {
  const { t } = useTranslation();
  const { data: frame } = useCameraFrame();
  const { data: detections } = useDetections(1);
  const { data: env } = useEnvironment();

  const latest = detections?.[0] ?? null;
  const hasDisease = latest?.severity === 'critical' || latest?.severity === 'warning';
  const pos = frame?.position;
  const diseaseCount = detections?.filter(d => d.severity !== 'healthy').length ?? 1;

  return (
    <div className={styles.wrapper}>
      {/* Live feed */}
      <Card>
        <CardHeader
          title={t('camera.title')}
          subtitle={t('camera.rowSubtitle', {
            row: pos?.row ?? '—',
            pos: pos?.positionMeters?.toFixed(1) ?? '—',
            height: pos?.heightMeters?.toFixed(1) ?? '—',
          })}
          right={<Chip label={hasDisease ? t('camera.diseaseFound') : t('camera.allClear')} variant={hasDisease ? 'red' : 'green'} />}
        />

        {/* Camera preview */}
        <div className={styles.camBox}>
          <div className={styles.camFoliage} />

          {/* TODO: Replace with actual MJPEG/WebRTC stream:
              <img src={`${import.meta.env.VITE_API_BASE_URL}/api/camera/stream`} className={styles.camStream} alt="Live camera" />
          */}

          {/* Bounding box overlay */}
          {hasDisease && latest && (
            <div
              className={styles.bbox}
              style={{
                left: `${latest.boundingBox.x * 100}%`,
                top: `${latest.boundingBox.y * 100}%`,
                width: `${latest.boundingBox.width * 100}%`,
                height: `${latest.boundingBox.height * 100}%`,
              }}
            >
              <span className={styles.bboxLabel}>
                {latest.topPrediction.label.split('(')[0].trim()}{' '}
                {(latest.topPrediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
          )}

          {/* HUD overlay */}
          <div className={styles.hud}>
            <div className={styles.hudTop}>
              <span className={styles.hudChip}>
                ZED 2 · {frame?.resolution ?? '1080p'} · {frame?.fps ?? 30}fps · stereo
              </span>
              {frame?.isRecording && (
                <span className={styles.recChip}>
                  <span className={styles.recDot} />REC
                </span>
              )}
            </div>
            <div className={styles.hudBottom}>
              <span className={styles.hudGps}>
                {pos?.gps.lat.toFixed(4)}°N {pos?.gps.lon.toFixed(4)}°E · Row {pos?.row} · {pos?.positionMeters?.toFixed(1)}m
              </span>
              {hasDisease && (
                <span className={styles.hudFound}>
                  <span className={styles.hudFoundDot} />
                  {t('camera.disease', { count: diseaseCount })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* GPS / position strip */}
        <div className={styles.posGrid}>
          <div className={styles.posItem}>
            <div className={styles.posVal}>{pos?.gps.lat.toFixed(4) ?? '—'}°N</div>
            <div className={styles.posLbl}>{t('camera.latitude')}</div>
          </div>
          <div className={styles.posItem}>
            <div className={styles.posVal}>{pos?.gps.lon.toFixed(4) ?? '—'}°E</div>
            <div className={styles.posLbl}>{t('camera.longitude')}</div>
          </div>
          <div className={styles.posItem}>
            <div className={styles.posVal}>{pos?.positionMeters?.toFixed(1) ?? '—'} m</div>
            <div className={styles.posLbl}>{t('camera.standPos')}</div>
          </div>
        </div>
      </Card>

      {/* Model output */}
      <Card>
        <CardHeader title={t('camera.modelTitle')} right={<Chip label={t('camera.modelOutput')} />} />

        {/* Class probabilities */}
        <div className={styles.predictions}>
          {(latest?.allPredictions ?? []).map((p) => (
            <div key={p.diseaseClass} className={styles.predRow}>
              <span className={styles.predName}>
                {p.diseaseClass === 'healthy' ? t('detection.severity.healthy') : p.label}
              </span>
              <div className={styles.predBarWrap}>
                <div className={styles.predBar}>
                  <div
                    className={styles.predFill}
                    style={{
                      width: `${p.confidence * 100}%`,
                      background: p.diseaseClass === 'healthy' ? 'var(--forest-3)' : p.confidence > 0.6 ? '#ef4444' : '#f59e0b',
                    }}
                  />
                </div>
                <span
                  className={styles.predPct}
                  style={{ color: p.confidence > 0.6 && p.diseaseClass !== 'healthy' ? '#b91c1c' : 'var(--txt-2)' }}
                >
                  {(p.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Details table */}
        <div className={styles.detailTable}>
          <div className={styles.dtRow}>
            <span className={styles.dtLabel}>{t('camera.boundingBoxes')}</span>
            <span className={styles.dtVal}>{t('camera.detected', { count: latest ? 1 : 0 })}</span>
          </div>
          <div className={styles.dtRow}>
            <span className={styles.dtLabel}>{t('camera.depth')}</span>
            <span className={styles.dtVal}>{t('camera.depthVal', { val: latest?.boundingBox.depthMeters.toFixed(2) ?? '—' })}</span>
          </div>
          <div className={styles.dtRow}>
            <span className={styles.dtLabel}>{t('camera.leafArea')}</span>
            <span className={styles.dtVal}>{t('camera.leafAreaVal', { val: latest?.boundingBox.affectedAreaPercent ?? 0 })}</span>
          </div>
          <div className={styles.dtRow}>
            <span className={styles.dtLabel}>{t('camera.confidenceGate')}</span>
            <span className={styles.dtVal} style={{ color: 'var(--forest)' }}>
              {latest?.confidenceGatePassed ? t('camera.pass') : t('camera.fail')}
            </span>
          </div>
          <div className={styles.dtRow}>
            <span className={styles.dtLabel}>{t('camera.inferenceTime')}</span>
            <span className={styles.dtVal}>{t('camera.inferenceVal', { val: latest?.inferenceMs ?? '—' })}</span>
          </div>
        </div>

        {/* Environment */}
        {env && (
          <div className={styles.envRow}>
            <div className={styles.envItem}>
              <div className={styles.envVal}>{env.temperatureC.toFixed(1)}°C</div>
              <div className={styles.envLbl}>{t('camera.temperature')}</div>
              <div className={styles.envBar}>
                <div className={styles.envFill} style={{ width: `${(env.temperatureC / 40) * 100}%` }} />
              </div>
            </div>
            <div className={styles.envItem}>
              <div className={styles.envVal}>{env.humidityPercent.toFixed(0)}%</div>
              <div className={styles.envLbl}>{t('camera.humidity')}</div>
              <div className={styles.envBar}>
                <div className={styles.envFill} style={{ width: `${env.humidityPercent}%` }} />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
