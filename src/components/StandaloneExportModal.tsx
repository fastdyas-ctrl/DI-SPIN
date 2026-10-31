import React, { useState } from 'react';
import { Lang } from '../types';
import { translate } from '../data/translations';

interface StandaloneExportModalProps {
  isOpen: boolean;
  lang: Lang;
  onClose: () => void;
  onDownload: () => void;
  onCopySource: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({
  isOpen,
  lang,
  onClose,
  onDownload,
  onCopySource,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    onCopySource();
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal')) onClose();
      }}
    >
      <div className="mcard" style={{ maxWidth: '520px' }}>
        <button className="ibtn mclose" data-tip={translate(lang, 'tip_close')} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="sec-h" style={{ marginBottom: '6px', fontSize: '14px', color: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>
            {lang === 'fr'
              ? 'Télécharger le Site HTML Autonome (Vanilla)'
              : 'Download Standalone Vanilla HTML Site'}
          </span>
        </div>

        <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)', marginBottom: '16px' }}>
          {lang === 'fr'
            ? 'Ce fichier HTML autonome contient l’intégralité de DI SPIN ELITE (HTML5, CSS3 avec tous les thèmes, JavaScript Vanilla, Synthétiseur audio Web Audio API, Moteur Canvas 3D et tous vos choix actuels). Il fonctionne 100% hors-ligne en double-cliquant dessus !'
            : 'This standalone HTML file contains the entire DI SPIN ELITE application (HTML5, CSS3 with all themes, Vanilla JS, Web Audio API synthesizer, 3D Canvas engine, and your current wheel setup). It works 100% offline with zero dependencies!'}
        </p>

        <div
          style={{
            background: 'var(--panel2)',
            border: '1px solid var(--line2)',
            borderRadius: 'var(--r)',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ok)', fontSize: '14px' }}>✓</span>
            <b>{lang === 'fr' ? '100% Autonome & Zéro Serveur' : '100% Standalone & Zero Server'}</b>
            <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>Single File .html</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ok)', fontSize: '14px' }}>✓</span>
            <b>{lang === 'fr' ? 'Audio & Synthèse Intégrés' : 'Integrated Audio Synthesizer'}</b>
            <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>Web Audio API</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ok)', fontSize: '14px' }}>✓</span>
            <b>{lang === 'fr' ? 'Rendu 3D Canvas 60 FPS' : '3D Canvas 60 FPS Engine'}</b>
            <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>Hardware Accelerated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ok)', fontSize: '14px' }}>✓</span>
            <b>{lang === 'fr' ? 'Tous vos choix & profils inclus' : 'All your options & profiles included'}</b>
            <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>Pre-baked Snapshot</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn primary"
            style={{ flex: '1 1 200px', padding: '12px', fontSize: '14px' }}
            onClick={onDownload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{lang === 'fr' ? 'Télécharger .HTML' : 'Download .HTML'}</span>
          </button>

          <button
            className="btn"
            style={{ flex: '1 1 140px', padding: '12px', fontSize: '13px' }}
            onClick={handleCopy}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>
              {copied
                ? lang === 'fr'
                  ? 'Code copié ! ✓'
                  : 'Code Copied! ✓'
                : lang === 'fr'
                ? 'Copier le code'
                : 'Copy Code'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
