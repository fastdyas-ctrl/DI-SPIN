import React from 'react';
import { AppSettings, Lang } from '../types';
import { translate } from '../data/translations';

interface SettingsModalProps {
  isOpen: boolean;
  lang: Lang;
  settings: AppSettings;
  onClose: () => void;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onReplayTutorial: () => void;
  onNukeAll: () => void;
  onOpenExportStandalone: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  lang,
  settings,
  onClose,
  onUpdateSetting,
  onReplayTutorial,
  onNukeAll,
  onOpenExportStandalone,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal open"
      id="setModal"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal')) onClose();
      }}
    >
      <div className="mcard">
        <button className="ibtn mclose" data-tip={translate(lang, 'tip_close')} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="sec-h" style={{ marginBottom: '4px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
          </svg>
          <span>{translate(lang, 'set_title')}</span>
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_elim')}</b>
            <small>{translate(lang, 'set_elim_d')}</small>
          </div>
          <div
            className={`sw ${settings.elim ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.elim}
            onClick={() => onUpdateSetting('elim', !settings.elim)}
          />
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_clutch')}</b>
            <small>{translate(lang, 'set_clutch_d')}</small>
          </div>
          <div
            className={`sw ${settings.clutch ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.clutch}
            onClick={() => onUpdateSetting('clutch', !settings.clutch)}
          />
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_eco')}</b>
            <small>{translate(lang, 'set_eco_d')}</small>
          </div>
          <div
            className={`sw ${settings.eco ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.eco}
            onClick={() => onUpdateSetting('eco', !settings.eco)}
          />
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_confetti')}</b>
            <small>{translate(lang, 'set_confetti_d')}</small>
          </div>
          <div
            className={`sw ${settings.confetti ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.confetti}
            onClick={() => onUpdateSetting('confetti', !settings.confetti)}
          />
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_idle')}</b>
            <small>{translate(lang, 'set_idle_d')}</small>
          </div>
          <div
            className={`sw ${settings.idle ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.idle}
            onClick={() => onUpdateSetting('idle', !settings.idle)}
          />
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_ticks')}</b>
            <small>{translate(lang, 'set_ticks_d')}</small>
          </div>
          <div
            className={`sw ${settings.ticks ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.ticks}
            onClick={() => onUpdateSetting('ticks', !settings.ticks)}
          />
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_dur')}</b>
            <small>{translate(lang, 'set_dur_d')}</small>
          </div>
          <select
            value={settings.duration}
            onChange={(e) => onUpdateSetting('duration', e.target.value as 'fast' | 'normal' | 'epic')}
          >
            <option value="fast">{translate(lang, 'dur_fast')}</option>
            <option value="normal">{translate(lang, 'dur_normal')}</option>
            <option value="epic">{translate(lang, 'dur_epic')}</option>
          </select>
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_tuto')}</b>
            <small>{translate(lang, 'set_tuto_d')}</small>
          </div>
          <button className="btn" onClick={onReplayTutorial}>
            🎓 <span>{translate(lang, 'btn_retuto')}</span>
          </button>
        </div>

        <div className="setrow">
          <div className="txt">
            <b>{translate(lang, 'set_offline')}</b>
            <small>{translate(lang, 'set_offline_d')}</small>
          </div>
          <button className="btn primary" onClick={onOpenExportStandalone}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{lang === 'fr' ? 'Télécharger .HTML' : 'Download .HTML'}</span>
          </button>
        </div>

        <div className="setrow" style={{ border: 'none' }}>
          <div className="txt">
            <b>{translate(lang, 'set_purge')}</b>
            <small>{translate(lang, 'set_purge_d')}</small>
          </div>
          <button className="btn danger" onClick={onNukeAll}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            <span>{translate(lang, 'btn_purge')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
