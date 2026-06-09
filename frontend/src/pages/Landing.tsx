import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Leaf, Sparkles, ScanLine, Activity, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useApi';
import styles from './Landing.module.css';

export function LandingPage({ variant = 'public' }: { variant?: 'public' | 'home' }) {
  const { t } = useTranslation();
  const isHome = variant === 'home';

  const features = [
    { icon: <Camera size={20} />, title: t('landing.f1.title'), desc: t('landing.f1.desc'), color: '#F97553' },
    { icon: <Leaf size={20} />, title: t('landing.f2.title'), desc: t('landing.f2.desc'), color: '#4CAF71' },
    { icon: <Sparkles size={20} />, title: t('landing.f3.title'), desc: t('landing.f3.desc'), color: '#4A90E2' },
    { icon: <ShieldCheck size={20} />, title: t('landing.f4.title'), desc: t('landing.f4.desc'), color: '#F4A24A' },
  ];

  const steps = [
    { icon: <ScanLine size={20} />, title: t('landing.s1.title'), desc: t('landing.s1.desc') },
    { icon: <Activity size={20} />, title: t('landing.s2.title'), desc: t('landing.s2.desc') },
    { icon: <ClipboardCheck size={20} />, title: t('landing.s3.title'), desc: t('landing.s3.desc') },
  ];

  return (
    <div className={[styles.page, isHome ? styles.pageHome : ''].join(' ')}>
      {!isHome && (
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <img src="/agricure.png" alt="AgriCure" className={styles.logo} />
            <span className={styles.brandName}>AgriCure</span>
          </div>
          <Link to="/login" className={styles.signInTop}>{t('landing.signIn')}</Link>
        </header>
      )}

      <main className={styles.hero}>
        {/* ── Left: copy ── */}
        <div className={styles.heroLeft}>
          {/* <span className={styles.eyebrow}>{t('landing.eyebrow')}</span> */}
          <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: t('landing.title') }} />
          <p className={styles.lede}>{t('landing.lede')}</p>

          <div className={styles.ctaRow}>
            {isHome ? (
              <>
                <Link to="/camera" className={styles.ctaPrimary}>{t('landing.ctaCamera')}</Link>
                <Link to="/plants" className={styles.ctaSecondary}>{t('landing.ctaPlants')}</Link>
              </>
            ) : (
              <Link to="/login" className={styles.ctaPrimary}>{t('landing.cta')}</Link>
            )}
          </div>

          <div className={styles.socialProof}>
            <span className={styles.proofCount}>1.2K+</span>
            <span className={styles.proofLabel}>Plants monitored</span>
            <span className={styles.proofSep} />
            <span className={styles.proofStars}>★★★★★</span>
            <span className={styles.proofLabel}>94% confidence</span>
          </div>
        </div>

        {/* ── Right: image + dark card ── */}
        <div className={styles.heroRight}>
          <div className={styles.imageArea}>
            <div className={styles.bgBlob} />
            <img
              src="/image-agricure.jpg"
              alt="Greenhouse"
              className={styles.heroImg}
            />
            {/* Floating circular badge */}
            <div className={styles.floatBadge}>
              <span className={styles.floatBadgeLabel}>Plants<br />Monitored</span>
              <strong className={styles.floatBadgeNum}>1.2K+</strong>
            </div>
            {/* Floating scan result card */}
            <div className={styles.floatCard}>
              <span className={styles.floatCardAvatar}>🌿</span>
              <div>
                <div className={styles.floatCardText}>"All clear — no disease detected"</div>
                <div className={styles.floatCardMeta}>Row 7 complete · 94% confidence</div>
                <div className={styles.floatCardStars}>★★★★★</div>
              </div>
            </div>
          </div>

          {/* Dark active-monitoring card */}
          <div className={styles.activeCard}>
            <div className={styles.activePill}>
              <span className={styles.activeDot} />
              Live monitoring
            </div>
            <div className={styles.activeTitle}>Greenhouse A</div>
            <div className={styles.activeSub}>Tomato · 9 rows</div>

            <div className={styles.activeImg}>
              <img src="/agricure.png" alt="" className={styles.activeIcon} />
            </div>

            <div className={styles.activeRows}>
              <div className={styles.activeRow}>
                <span className={styles.activeRowLabel}>Status</span>
                <span className={styles.activeRowValue}>All healthy</span>
              </div>
              <div className={styles.activeRow}>
                <span className={styles.activeRowLabel}>Confidence</span>
                <span className={styles.activeRowValue}>94%</span>
              </div>
            </div>

            {isHome ? (
              <Link to="/camera" className={styles.activeBtn}>Open camera →</Link>
            ) : (
              <Link to="/login" className={styles.activeBtn}>Get started →</Link>
            )}
          </div>
        </div>
      </main>

      {/* ── Features strip ── */}
      <div className={styles.featuresWrap}>
        <div className={styles.featuresLayout}>
          {/* Left: decorative image */}
          <div className={styles.featuresRight}>
            <div className={styles.featuresImgBlob} />
            <img
              src="/image2.jpg"
              alt="AgriCure in action"
              className={styles.featuresImg}
            />
          </div>

          {/* Right: heading + 2×2 cards */}
          <div className={styles.featuresLeft}>
            <h2 className={styles.featuresSectionTitle}>{t('landing.featuresTitle')}</h2>
            <p className={styles.featuresSectionSub}>{t('landing.featuresSub')}</p>
            <div className={styles.featuresStrip}>
              {features.map((f) => (
                <div key={f.title} className={styles.featureItem}>
                  <div className={styles.featureIconWrap} style={{ background: f.color }}>{f.icon}</div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Live stats (home only) ── */}
      {isHome && <LiveStats />}

      {/* ── How it works ── */}
      <div className={styles.howWrap}>
        <div className={styles.howLayout}>

          {/* Left: title + step cards */}
          <div className={styles.howContent}>
            <h2 className={styles.sectionTitle}>{t('landing.howTitle')}</h2>
            <p className={styles.sectionSub}>{t('landing.howSub')}</p>

            <div className={styles.stepsVertical}>
              {steps.map((s, i) => (
                <div key={s.title} className={`${styles.stepCard} ${i === 0 ? styles.stepCardDark : i === 1 ? styles.stepCardMid : styles.stepCardLight}`}>
                  <span className={styles.stepCardWatermark}>0{i + 1}</span>
                  <div className={styles.stepCardInner}>
                    <div className={styles.stepCardLeft}>
                      <div className={styles.stepCardNum}>{i + 1}</div>
                    </div>
                    <div className={styles.stepCardContent}>
                      <div className={styles.stepCardHeader}>
                        <div className={styles.stepIconWrap}>{s.icon}</div>
                        <div className={styles.stepTitle}>{s.title}</div>
                      </div>
                      <div className={styles.stepDesc}>{s.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: farmer image + floating badge */}
          <div className={styles.howImgCol}>
            <div className={styles.howImgBlob} />
            <img src="/farmer.jpg" alt="AgriCure farmer" className={styles.howImg} />
            <div className={styles.howBadge}>
              <span className={styles.howBadgeDot} />
              94% detection accuracy
            </div>
          </div>

        </div>
      </div>

      {!isHome && <footer className={styles.footer}>{t('landing.footer')}</footer>}
    </div>
  );
}

function LiveStats() {
  const { t } = useTranslation();
  const { data } = useDashboardStats();
  if (!data) return null;

  const items = [
    { label: t('dashboard.stats.detectionsToday'), value: data.detectionsToday },
    { label: t('dashboard.stats.avgConfidence'), value: `${Math.round(data.avgConfidence * 100)}%` },
    { label: t('dashboard.stats.rowsScanned'), value: `${data.rowsScanned}/${data.totalRows}` },
    { label: t('dashboard.stats.plantsTracked'), value: data.plantsTracked },
  ];

  return (
    <div className={styles.statsWrap}>
      <div className={styles.stats}>
        {items.map((s) => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
