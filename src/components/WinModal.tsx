import React from 'react';
import { Lang, WheelOption } from '../types';
import { translate } from '../data/translations';

interface WinModalProps {
  isOpen: boolean;
  lang: Lang;
  winner: WheelOption | null;
  slang: string;
  timeString: string;
  elimMode: boolean;
  activeCount: number;
  onClose: () => void;
  onReplay: () => void;
  onRemoveOnly: () => void;
  onRemoveAndNext: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  lang,
  winner,
  slang,
  timeString,
  elimMode,
  activeCount,
  onClose,
  onReplay,
  onRemoveOnly,
  onRemoveAndNext,
}) => {
  if (!isOpen || !winner) return null;

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
      <div
        className="mcard win-card"
        id="winCard"
        style={{ '--wc': winner.color } as React.CSSProperties}
      >
        <div className="rays" />
        <button
          className="ibtn mclose"
          id="btnWinClose"
          data-tip={translate(lang, 'tip_close')}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="win-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
          <span>{translate(lang, 'official')}</span>
        </div>

        <div id="winSlang">{slang}</div>

        <div className="win-trophy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" />
            <path d="M7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
          </svg>
        </div>

        <div id="winLabel">{winner.label}</div>
        <div id="winTime">{translate(lang, 'time_prefix') + timeString}</div>

        {elimMode && activeCount <= 1 && (
          <div id="winNote" style={{ display: 'block' }}>
            {translate(lang, 'last_surv', { x: winner.label })}
          </div>
        )}

        <div className="win-actions">
          <button className="btn primary" id="btnAgain" onClick={onReplay}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.5 15a9 9 0 1 1-2-9.4L23 10" />
            </svg>
            <span>{translate(lang, 'btn_again')}</span> <span className="kbd">R</span>
          </button>

          {elimMode && (
            <button className="btn primary" id="btnNext" onClick={onRemoveAndNext}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
              <span>{translate(lang, 'btn_next')}</span> <span className="kbd">↵</span>
            </button>
          )}

          <button className="btn danger" id="btnRemove" onClick={onRemoveOnly}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
            </svg>
            <span>{translate(lang, 'btn_remove')}</span> <span className="kbd">S</span>
          </button>

          <button className="btn" id="btnClose" onClick={onClose}>
            <span>{translate(lang, 'btn_keep')}</span> <span className="kbd">C</span>
          </button>
        </div>
      </div>
    </div>
  );
};
