import { type ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Camera, Star, Plus, Home, LogOut,
  Leaf, KeyRound, Users, MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  icon: ReactNode;
  labelKey: string;
  badge?: number;
  live?: boolean;
  adminOnly?: boolean;
}

export function Sidebar() {
  const { t } = useTranslation();
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups: { labelKey: string; items: NavItem[] }[] = [
    {
      labelKey: 'sidebar.nav.groups.monitor',
      items: [
        { to: '/', icon: <LayoutDashboard size={15} />, labelKey: 'sidebar.nav.items.home' },
        { to: '/camera', icon: <Camera size={15} />, labelKey: 'sidebar.nav.items.liveCamera', live: true },
      ],
    },
    {
      labelKey: 'sidebar.nav.groups.detection',
      items: [
        { to: '/plants', icon: <Leaf size={15} />, labelKey: 'sidebar.nav.items.plants' },
        { to: '/passport', icon: <Star size={15} />, labelKey: 'sidebar.nav.items.plantPassport' },
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
        { to: '/admin/users', icon: <Users size={15} />, labelKey: 'sidebar.nav.items.users', adminOnly: true },
        { to: '/admin/api-keys', icon: <KeyRound size={15} />, labelKey: 'sidebar.nav.items.apiKeys', adminOnly: true },
      ],
    },
  ];

  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((i) => !i.adminOnly || isAdmin) }))
    .filter((group) => group.items.length > 0);

  // Bottom tab bar (mobile): primary destinations get their own tab,
  // everything else lives behind "More".
  const primaryItems: NavItem[] = [
    { to: '/', icon: <LayoutDashboard size={20} />, labelKey: 'sidebar.nav.items.home' },
    { to: '/camera', icon: <Camera size={20} />, labelKey: 'sidebar.nav.items.liveCamera', live: true },
    { to: '/plants', icon: <Leaf size={20} />, labelKey: 'sidebar.nav.items.plants' },
    { to: '/treatments', icon: <Plus size={20} />, labelKey: 'sidebar.nav.items.recommendations' },
  ];
  const primaryPaths = new Set(primaryItems.map((i) => i.to));
  const moreItems = visibleGroups
    .flatMap((group) => group.items)
    .filter((item) => !primaryPaths.has(item.to));
  const isMoreActive = moreItems.some((item) => location.pathname.startsWith(item.to));

  return (
    <>
      <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoBox}>
        <img src="/agricure.png" alt="AgriCure" className={styles.logoImg} />
        <div className={styles.logoName}>AgriCure</div>
        <button className={styles.logoutIconBtn} onClick={handleLogout} title={t('sidebar.logout')}>
          <LogOut size={14} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {visibleGroups.map((group) => (
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
      </aside>

      {/* Bottom tab bar (mobile) */}
      <nav className={styles.bottomNav}>
        {primaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [styles.bottomItem, isActive ? styles.bottomItemActive : ''].join(' ')
            }
          >
            <span className={styles.bottomIcon}>
              {item.icon}
              {item.live && <span className={styles.liveDot} />}
            </span>
            <span className={styles.bottomLabel}>{t(item.labelKey)}</span>
          </NavLink>
        ))}
        {moreItems.length > 0 && (
          <button
            type="button"
            className={[styles.bottomItem, isMoreActive ? styles.bottomItemActive : ''].join(' ')}
            onClick={() => setMoreOpen((v) => !v)}
          >
            <span className={styles.bottomIcon}><MoreHorizontal size={20} /></span>
            <span className={styles.bottomLabel}>{t('sidebar.more', 'More')}</span>
          </button>
        )}
      </nav>

      {/* "More" sheet (mobile) */}
      {moreOpen && (
        <>
          <div className={styles.overlay} onClick={() => setMoreOpen(false)} />
          <div className={styles.moreSheet}>
            {moreItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [styles.moreItem, isActive ? styles.active : ''].join(' ')
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {t(item.labelKey)}
              </NavLink>
            ))}
            <button type="button" className={styles.moreItem} onClick={handleLogout}>
              <span className={styles.navIcon}><LogOut size={15} /></span>
              {t('sidebar.logout')}
            </button>
          </div>
        </>
      )}
    </>
  );
}
