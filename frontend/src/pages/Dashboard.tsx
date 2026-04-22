import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, TrendingUp, LayoutGrid, Leaf } from 'lucide-react';
import { CameraPanel } from '@/components/camera/CameraPanel';
import {
  useDashboardStats,
  useSystemStatus,
} from '@/hooks/useApi';
import styles from './Dashboard.module.css';

// ── Stat block ────────────────────────────────────────────

function StatBlock({
  icon,
  label,
  value,
  sub,
  trend,
  trendUp,
  accentColor,
  iconBg,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  accentColor: string;
  iconBg: string;
}) {
  return (
    <div className={styles.statBlock} style={{ '--stat-accent': accentColor } as React.CSSProperties}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statIconWrap} style={{ background: iconBg, color: accentColor }}>
          {icon}
        </div>
      </div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
      {trend && (
        <div
          className={styles.statTrend}
          style={{ color: trendUp ? '#d97706' : 'var(--forest-2)' }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: stats } = useDashboardStats();
  const { data: system } = useSystemStatus();

  const pendingRows = (stats?.totalRows ?? 0) - (stats?.rowsScanned ?? 0);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageHead}>{t('dashboard.title')}</h1>
          <p className={styles.pageSub}>
            {t('dashboard.subtitle')} ·{' '}
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={styles.tbRight}>
          <span className={styles.syncBadge}>
            <span className={styles.syncDot} />
            {system ? t('dashboard.synced') : t('dashboard.connecting')}
          </span>
          <span className={[styles.pill, styles.pillGreen].join(' ')}>{t('dashboard.systemOk')}</span>
          {(system?.pendingAlerts ?? 0) > 0 && (
            <span className={[styles.pill, styles.pillRed].join(' ')}>
              {t('dashboard.alerts', { count: system!.pendingAlerts })}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <StatBlock
          icon={<AlertTriangle size={16} />}
          label={t('dashboard.stats.detectionsToday')}
          value={stats?.detectionsToday ?? '—'}
          sub={t('dashboard.stats.detectionsDelta', { count: stats?.detectionsDelta ?? 0 })}
          trend={`▲ +${stats ? Math.round((stats.detectionsDelta / Math.max(stats.detectionsToday - stats.detectionsDelta, 1)) * 100) : 0}%`}
          trendUp
          accentColor="#ef4444"
          iconBg="#fef2f2"
        />
        <StatBlock
          icon={<TrendingUp size={16} />}
          label={t('dashboard.stats.avgConfidence')}
          value={stats ? `${(stats.avgConfidence * 100).toFixed(1)}%` : '—'}
          sub={t('dashboard.stats.last50')}
          trend={t('dashboard.stats.modelAccuracy')}
          accentColor="var(--forest-2)"
          iconBg="var(--mist)"
        />
        <StatBlock
          icon={<LayoutGrid size={16} />}
          label={t('dashboard.stats.rowsScanned')}
          value={stats ? `${stats.rowsScanned}/${stats.totalRows}` : '—'}
          sub={t('dashboard.stats.rowsPending', { count: pendingRows })}
          trend={t('dashboard.stats.rowActive')}
          accentColor="#3b82f6"
          iconBg="#dbeafe"
        />
        <StatBlock
          icon={<Leaf size={16} />}
          label={t('dashboard.stats.plantsTracked')}
          value={stats?.plantsTracked ?? '—'}
          sub={t('dashboard.stats.withPassport')}
          trend={t('dashboard.stats.passportsOk')}
          accentColor="var(--forest-3)"
          iconBg="var(--mist)"
        />
      </div>

      {/* Hero: live camera */}
      <div className={styles.cameraSection}>
        <CameraPanel />
      </div>
    </div>
  );
}
