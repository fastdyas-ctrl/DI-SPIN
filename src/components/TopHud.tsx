import React, { useState } from 'react';
import { Lang, ThemeId } from '../types';
import { THEMES } from '../data/themes';
import { translate } from '../data/translations';

interface TopHudProps {
  lang: Lang;
  theme: ThemeId;
  volume: number;
  muted: boolean;
  onThemeChange: (t: ThemeId) => void;
  onLangToggle: () => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onOpenSettings: () => void;
  onOpenExportStandalone: () => void;
  onToggleWheelParams?: () => void;
  panelDrawerOpen?: boolean;
  activeOptionsCount?: number;
}

export const TopHud: React.FC<TopHudProps> = ({
  lang,
  theme,
  volume,
  muted,
  onThemeChange,
  onLangToggle,
  onVolumeChange,
  onMuteToggle,
  onOpenSettings,
  onOpenExportStandalone,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const volPercent = Math.round(volume * 100);

  return (
    <header id="topHud">
      <div className="logo">
        <svg className="logo-mark" id="logoMark" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#00f0ff" />
              <stop offset="1" stopColor="#4d9fff" />
            </linearGradient>
          </defs>
          <g className="ring" stroke="url(#logoGrad)" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9.4" strokeDasharray="4.5 3.2" />
            <circle cx="12" cy="2.6" r="1.3" fill="url(#logoGrad)" stroke="none" />
            <circle cx="12" cy="21.4" r="1.3" fill="url(#logoGrad)" stroke="none" />
          </g>
          <path d="M13.2 5.5 7.5 13h4l-1 5.5L16.5 11h-4z" fill="url(#logoGrad)" />
        </svg>
        <div className="logo-txt">
          <b>DI SPIN</b>
          <small>ELITE&nbsp;·&nbsp;DECISION&nbsp;WHEEL</small>
        </div>
      </div>

      {/* HUD Spacer */}

      <div className="hud-spacer" />

      {/* Desktop Theme Dots */}
      <div className="hud-group themes" id="themeBar" role="radiogroup">
        <span className="hud-label">{lang === 'fr' ? 'THÈMES' : 'THEMES'}</span>
        {THEMES.map((th) => (
          <button
            key={th.id}
            className={`theme-dot tip-b ${theme === th.id ? 'on' : ''}`}
            data-tip={th.name}
            data-theme={th.id}
            role="radio"
            aria-checked={theme === th.id}
            onClick={() => onThemeChange(th.id)}
          >
            <i>
              <span style={{ background: th.c[0], flex: 2 }} />
              <span style={{ background: th.c[1] }} />
              <span style={{ background: th.c[2] }} />
            </i>
          </button>
        ))}
      </div>

      {/* Desktop Volume Slider */}
      <div className="hud-group tip-b desktop-only-hud" id="volGroup" data-tip={translate(lang, 'tip_vol')}>
        <button className="ibtn" id="volBtn" aria-label="Mute (M)" onClick={onMuteToggle}>
          {!muted && volPercent > 0 ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.8 5.2a9.5 9.5 0 0 1 0 13.6" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M23 9l-6 6M17 9l6 6" />
            </svg>
          )}
        </button>
        <input
          type="range"
          id="volSlider"
          min="0"
          max="100"
          value={volPercent}
          style={{ '--vfill': `${volPercent}%` } as React.CSSProperties}
          aria-label="Volume"
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
        />
        <span className="vol-num" id="volNum">
          {volPercent}
        </span>
      </div>

      {/* Download Standalone HTML Button */}
      <button
        className="ibtn primary tip-b"
        id="standaloneDownloadBtn"
        data-tip={lang === 'fr' ? 'HTML Hors-ligne (Version autonome)' : 'Standalone HTML (Offline version)'}
        title={lang === 'fr' ? 'HTML Hors-ligne (Version autonome)' : 'Standalone HTML (Offline version)'}
        aria-label={lang === 'fr' ? 'HTML Hors-ligne (Version autonome)' : 'Standalone HTML (Offline version)'}
        onClick={onOpenExportStandalone}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {/* Language Toggle */}
      <button
        className="ibtn tip-b desktop-only-hud"
        id="langBtn"
        data-tip={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
        onClick={onLangToggle}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
        </svg>
        <span className="lang" id="langTxt">
          {lang.toUpperCase()}
        </span>
      </button>

      {/* Settings Button */}
      <button
        className="ibtn tip-b desktop-only-hud"
        id="setBtn"
        data-tip={translate(lang, 'tip_set')}
        onClick={onOpenSettings}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Fullscreen Button */}
      <button
        className="ibtn tip-b desktop-only-hud"
        id="fsBtn"
        data-tip={translate(lang, 'tip_fs')}
        onClick={toggleFullscreen}
      >
        {!isFullscreen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Trigger Button */}
      <button
        className="ibtn mobile-menu-trigger"
        aria-label="Menu"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {mobileMenuOpen ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-hud-menu">
          <div className="mobile-menu-sec">
            <span className="hud-label">{lang === 'fr' ? 'THÈMES' : 'THEMES'}</span>
            <div className="mobile-theme-row">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  className={`theme-dot ${theme === th.id ? 'on' : ''}`}
                  onClick={() => {
                    onThemeChange(th.id);
                  }}
                >
                  <i>
                    <span style={{ background: th.c[0], flex: 2 }} />
                    <span style={{ background: th.c[1] }} />
                    <span style={{ background: th.c[2] }} />
                  </i>
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-menu-sec">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span className="hud-label">{lang === 'fr' ? 'VOLUME' : 'VOLUME'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="ibtn sm" onClick={onMuteToggle}>
                  {muted ? '🔇' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volPercent}
                  onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                  style={{ width: '90px' }}
                />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{volPercent}%</span>
              </div>
            </div>
          </div>

          <div className="mobile-menu-row">
            <button
              className="btn sm"
              style={{ flex: 1 }}
              onClick={() => {
                onLangToggle();
              }}
            >
              🌐 {lang.toUpperCase()}
            </button>
            <button
              className="btn sm"
              style={{ flex: 1 }}
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
            >
              ⚙️ {lang === 'fr' ? 'Réglages' : 'Settings'}
            </button>
            <button
              className="btn sm"
              style={{ flex: 1 }}
              onClick={() => {
                toggleFullscreen();
              }}
            >
              ⛶ {isFullscreen ? 'Normal' : 'Plein Écran'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
