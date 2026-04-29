import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Camera, FileText, Star,
  TrendingUp, Plus, Home, Bell, Monitor, ClipboardList, LogOut,
} from 'lucide-react';
import { useSystemStatus } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  icon: ReactNode;
  labelKey: string;
  badge?: number;
  live?: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' },
  { code: 'ru', label: 'RU' },
] as const;

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const { data: system } = useSystemStatus();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups: { labelKey: string; items: NavItem[] }[] = [
    {
      labelKey: 'sidebar.nav.groups.monitor',
      items: [
        { to: '/', icon: <LayoutDashboard size={15} />, labelKey: 'sidebar.nav.items.dashboard' },
        { to: '/camera', icon: <Camera size={15} />, labelKey: 'sidebar.nav.items.liveCamera', live: true },
      ],
    },
    {
      labelKey: 'sidebar.nav.groups.detection',
      items: [
        { to: '/field-report', icon: <ClipboardList size={15} />, labelKey: 'sidebar.nav.items.fieldReport' },
        { to: '/detections', icon: <FileText size={15} />, labelKey: 'sidebar.nav.items.detectionLog', badge: 3 },
        { to: '/passport', icon: <Star size={15} />, labelKey: 'sidebar.nav.items.plantPassport' },
        { to: '/trends', icon: <TrendingUp size={15} />, labelKey: 'sidebar.nav.items.severityTrends' },
      ],
    },
    {
      labelKey: 'sidebar.nav.groups.treatment',
      items: [
        { to: '/treatments', icon: <Plus size={15} />, labelKey: 'sidebar.nav.items.recommendations' },
        { to: '/history', icon: <Home size={15} />, labelKey: 'sidebar.nav.items.treatmentHistory' },
      ],
    },
    {
      labelKey: 'sidebar.nav.groups.system',
      items: [
        { to: '/position', icon: <Monitor size={15} />, labelKey: 'sidebar.nav.items.standPosition' },
        { to: '/alerts', icon: <Bell size={15} />, labelKey: 'sidebar.nav.items.notifications', badge: 2 },
      ],
    },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('agricure-lang', code);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoBox}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 20 20" fill="none" width={20} height={20}>
            <path d="M10 2C7 2 5 5 5 8c0 2.5 1.5 4.5 4 5.5V11c0-2 1-3.5 3-4.5C11.5 4 10.5 2 10 2z" fill="white" />
            <path d="M12 6.5C11 8 10.5 9.5 10.5 11v3.8c2-.5 3.5-2.5 3.5-5 0-1.5-.7-2.5-2-3.3z" fill="rgba(255,255,255,0.55)" />
          </svg>
        </div>
        <div>
          <div className={styles.logoName}>AgriCure</div>
          <div className={styles.logoTagline}>{t('sidebar.tagline')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navGroups.map((group) => (
          <div key={group.labelKey} className={styles.navGroup}>
            <div className={styles.groupLabel}>{t(group.labelKey)}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.active : ''].join(' ')
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {t(item.labelKey)}
                {item.badge !== undefined && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
                {item.live && <span className={styles.liveDot} />}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Device status */}
      <div className={styles.deviceCard}>
        <div className={styles.deviceRow}>
          <div
            className={styles.deviceDot}
            style={{
              background: system?.deviceStatus === 'online' ? '#22c55e' : '#ef4444',
            }}
          />
          <div>
            <div className={styles.deviceName}>ZED 2 + Jetson</div>
            <div className={styles.deviceSub}>
              {system?.deviceStatus === 'online'
                ? t('sidebar.device.connected')
                : t('sidebar.device.disconnected')}
            </div>
          </div>
        </div>
        <div className={styles.deviceMeta}>
          {system?.gpsActive && <span className={styles.devChip}>GPS</span>}
          {system?.modelLoaded && <span className={styles.devChip}>{system.modelName.split('-')[0]}</span>}
          <span className={styles.devChip}>38ms</span>
        </div>
      </div>

      {/* Language switcher */}
      <div className={styles.langSwitcher}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={[styles.langBtn, i18n.language === lang.code ? styles.langBtnActive : ''].join(' ')}
            onClick={() => changeLanguage(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={13} />
        {t('sidebar.logout')}
      </button>
    </aside>
  );
}
