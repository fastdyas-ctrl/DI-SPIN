import React, { useState, useRef } from 'react';
import { FeedItem, HistoryItem, Lang, PresetDef, SavedProfile, StatItem, WheelOption } from '../types';
import { PRESETS } from '../data/presets';
import { translate } from '../data/translations';

interface PanelProps {
  lang: Lang;
  options: WheelOption[];
  profiles: SavedProfile[];
  history: HistoryItem[];
  stats: Record<string, StatItem>;
  sessionSpins: number;
  totalSpins: number;
  feedItems: FeedItem[];
  activeTab: 'add' | 'presets' | 'list' | 'stats';
  canUndo: boolean;
  onTabChange: (tab: 'add' | 'presets' | 'list' | 'stats') => void;
  onAddOption: (label: string, weight: number) => void;
  onToggleOption: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onChangeWeight: (id: string, delta: number) => void;
  onRenameOption: (id: string, label: string) => void;
  onDeleteOption: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onShuffle: () => void;
  onClearAll: () => void;
  onUndo: () => void;
  onLoadPreset: (preset: PresetDef) => void;
  onSaveProfileRequest: (name: string) => void;
  onLoadProfile: (profile: SavedProfile) => void;
  onRenameProfile: (id: string, name: string) => void;
  onDuplicateProfile: (profile: SavedProfile) => void;
  onDeleteProfile: (id: string) => void;
  onExportProfile: (profile: SavedProfile) => void;
  onExportAllProfiles: () => void;
  onImportProfilesFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearHistory: () => void;
  onOpenExportStandalone?: () => void;
  onCloseMobile?: () => void;
}

const CHIPS_LIST = ['Ndolé', 'Poulet DG', 'Safou', 'Bissap', 'Makossa', 'Kribi', 'Soja', 'Mokolo'];

export const Panel: React.FC<PanelProps> = ({
  lang,
  options,
  profiles,
  history,
  stats,
  sessionSpins,
  totalSpins,
  feedItems,
  activeTab,
  canUndo,
  onCloseMobile,
  onTabChange,
  onAddOption,
  onToggleOption,
  onChangeColor,
  onChangeWeight,
  onRenameOption,
  onDeleteOption,
  onSelectAll,
  onDeselectAll,
  onShuffle,
  onClearAll,
  onUndo,
  onLoadPreset,
  onSaveProfileRequest,
  onLoadProfile,
  onRenameProfile,
  onDuplicateProfile,
  onDeleteProfile,
  onExportProfile,
  onExportAllProfiles,
  onImportProfilesFile,
  onClearHistory,
  onOpenExportStandalone,
}) => {
  const [addInput, setAddInput] = useState('');
  const [addWeight, setAddWeight] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileSearch, setProfileSearch] = useState('');
  const [profileSort, setProfileSort] = useState<'recent' | 'name' | 'size'>('recent');

  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionText, setEditingOptionText] = useState('');

  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingProfileText, setEditingProfileText] = useState('');

  const importFileRef = useRef<HTMLInputElement>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addInput.trim()) {
      onAddOption(addInput.trim(), addWeight);
      setAddInput('');
    }
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfileRequest(profileNameInput.trim());
    setProfileNameInput('');
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const activeCount = options.filter((o) => o.enabled).length;

  const filteredProfiles = profiles
    .filter((p) => p.name.toLowerCase().includes(profileSearch.toLowerCase()))
    .sort((a, b) => {
      if (profileSort === 'name') return a.name.localeCompare(b.name);
      if (profileSort === 'size') return b.options.length - a.options.length;
      return b.updated - a.updated;
    });

  const statsEntries: [string, StatItem][] = (Object.entries(stats) as [string, StatItem][])
    .sort((a, b) => b[1].w - a[1].w)
    .slice(0, 8);
  const maxWins = Math.max(1, ...statsEntries.map(([, v]) => v.w));

  const cmPresets = PRESETS.filter((p) => p.cm);
  const classicPresets = PRESETS.filter((p) => !p.cm);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <aside id="panel">
      {/* Mobile Drawer Header */}
      {onCloseMobile && (
        <div className="panel-drawer-header">
          <div className="panel-drawer-title-group">
            <div className="panel-drawer-icon-wrap">
              <span className="panel-drawer-icon">⚙️</span>
            </div>
            <div>
              <div className="panel-drawer-title">
                <b>{lang === 'fr' ? 'Paramètres de la Roue' : 'Wheel Parameters'}</b>
              </div>
              <div className="panel-drawer-sub">
                {activeCount} {lang === 'fr' ? 'options actives' : 'active options'} · DI SPIN
              </div>
            </div>
          </div>
          <button
            className="panel-drawer-close-btn"
            onClick={onCloseMobile}
            aria-label={lang === 'fr' ? 'Fermer les paramètres' : 'Close settings'}
            title={lang === 'fr' ? 'Fermer les paramètres' : 'Close settings'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            <span>{lang === 'fr' ? 'Fermer' : 'Close'}</span>
          </button>
        </div>
      )}

      <nav id="tabBar" role="tablist">
        <button
          className={`tab ${activeTab === 'add' ? 'on' : ''}`}
          role="tab"
          onClick={() => onTabChange('add')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{translate(lang, 'tab_add')}</span>
        </button>

        <button
          className={`tab ${activeTab === 'presets' ? 'on' : ''}`}
          role="tab"
          onClick={() => onTabChange('presets')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h11a2 2 0 0 1 2 2z" />
          </svg>
          <span>{translate(lang, 'tab_presets')}</span>
        </button>

        <button
          className={`tab ${activeTab === 'list' ? 'on' : ''}`}
          role="tab"
          onClick={() => onTabChange('list')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
          </svg>
          <span>{translate(lang, 'tab_list')}</span>
        </button>

        <button
          className={`tab ${activeTab === 'stats' ? 'on' : ''}`}
          role="tab"
          onClick={() => onTabChange('stats')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
          <span>{translate(lang, 'tab_stats')}</span>
        </button>
      </nav>

      <div className="panes scroll">
        {/* PANE: ADD */}
        <section className={`pane ${activeTab === 'add' ? 'on' : ''}`} id="pane-add">
          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{translate(lang, 'sec_quick')}</span>
            </div>
            <form id="addForm" onSubmit={handleAddSubmit} autoComplete="off">
              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.6 13.4 11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8z" />
                  <circle cx="7.6" cy="7.6" r="1" />
                </svg>
                <input
                  type="text"
                  id="addInput"
                  maxLength={40}
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  placeholder={translate(lang, 'ph_add')}
                  aria-label="Option"
                />
              </div>
              <div className="wline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M5 8l7-5 7 5M5 8a7 7 0 0 0 14 0" />
                </svg>
                <span>{translate(lang, 'weight')}</span>
                <input
                  type="range"
                  id="addWeight"
                  min="1"
                  max="10"
                  value={addWeight}
                  onChange={(e) => setAddWeight(Number(e.target.value))}
                />
                <b id="addWeightVal">×{addWeight}</b>
              </div>
              <button className="btn primary" type="submit" style={{ width: '100%', marginTop: '12px', padding: '13px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>{translate(lang, 'btn_addwheel')}</span>
              </button>
            </form>
            <div className="chips" id="addChips">
              {CHIPS_LIST.map((chip) => (
                <button
                  key={chip}
                  className="chip"
                  type="button"
                  onClick={() => onAddOption(chip, 1)}
                >
                  ＋ {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              <span>{translate(lang, 'sec_tips')}</span>
            </div>
            <div
              id="tipsBox"
              style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: '2' }}
              dangerouslySetInnerHTML={{ __html: translate(lang, 'tips_html') }}
            />
          </div>
        </section>

        {/* PANE: PRESETS */}
        <section className={`pane ${activeTab === 'presets' ? 'on' : ''}`} id="pane-presets">
          {onOpenExportStandalone && (
            <div
              className="sec"
              style={{
                background: 'var(--panel2)',
                border: '1px solid var(--line2)',
                borderRadius: 'var(--r)',
                padding: '12px 14px',
                borderLeft: '4px solid var(--accent)',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <b style={{ fontSize: '12.5px', color: 'var(--accent)', display: 'block', marginBottom: '2px' }}>
                    {lang === 'fr' ? '📦 Fichier HTML Autonome (Vanilla)' : '📦 Standalone Vanilla HTML File'}
                  </b>
                  <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', lineHeight: 1.4 }}>
                    {lang === 'fr'
                      ? 'Emportez la roue partout : 100% hors-ligne, zéro installation, audio & 3D inclus.'
                      : 'Take the wheel everywhere: 100% offline, zero installation, audio & 3D included.'}
                  </small>
                </div>
                <button
                  className="btn primary"
                  style={{ padding: '7px 12px', fontSize: '11.5px', whiteSpace: 'nowrap', flexShrink: 0 }}
                  onClick={onOpenExportStandalone}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{lang === 'fr' ? 'Télécharger' : 'Download'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <path d="M4 22v-7" />
              </svg>
              <span>{translate(lang, 'sec_cm')}</span>
            </div>
            <div className="pgrid" id="presetGridCM">
              {cmPresets.map((p, idx) => (
                <button
                  key={idx}
                  className="pcard"
                  onClick={() => onLoadPreset(p)}
                >
                  <span dangerouslySetInnerHTML={{ __html: p.ic }} />
                  <span>
                    <b>{p.n[lang]}</b>
                    <small>{p.d[lang]}</small>
                  </span>
                  <span className="cnt">{p.o.length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h11a2 2 0 0 1 2 2z" />
              </svg>
              <span>{translate(lang, 'sec_classic')}</span>
            </div>
            <div className="pgrid" id="presetGrid">
              {classicPresets.map((p, idx) => (
                <button
                  key={idx}
                  className="pcard"
                  onClick={() => onLoadPreset(p)}
                >
                  <span dangerouslySetInnerHTML={{ __html: p.ic }} />
                  <span>
                    <b>{p.n[lang]}</b>
                    <small>{p.d[lang]}</small>
                  </span>
                  <span className="cnt">{p.o.length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8M7 3v5h8" />
              </svg>
              <span>{translate(lang, 'sec_saved')}</span>
            </div>
            <div className="prof-tools">
              <div className="field" style={{ flex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  id="profSearch"
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder={translate(lang, 'ph_profsearch')}
                />
              </div>
              <select
                id="profSort"
                value={profileSort}
                onChange={(e) => setProfileSort(e.target.value as 'recent' | 'name' | 'size')}
              >
                <option value="recent">{translate(lang, 'sort_recent')}</option>
                <option value="name">{translate(lang, 'sort_name')}</option>
                <option value="size">{translate(lang, 'sort_size')}</option>
              </select>
            </div>

            <form id="profileForm" style={{ display: 'flex', gap: '6px', marginBottom: '8px' }} onSubmit={handleSaveProfileSubmit}>
              <div className="field" style={{ flex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.6 13.4 11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8z" />
                </svg>
                <input
                  type="text"
                  id="profileName"
                  maxLength={26}
                  value={profileNameInput}
                  onChange={(e) => setProfileNameInput(e.target.value)}
                  placeholder={translate(lang, 'ph_profile')}
                />
              </div>
              <button className="btn" type="submit" data-tip={translate(lang, 'tip_savecur')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
                <span>{translate(lang, 'btn_save')}</span>
              </button>
            </form>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <button
                className="btn"
                id="btnExportAll"
                style={{ flex: 1, padding: '8px' }}
                onClick={onExportAllProfiles}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>{translate(lang, 'btn_exportall')}</span>
              </button>
              <button
                className="btn"
                id="btnImport"
                style={{ flex: 1, padding: '8px' }}
                onClick={() => importFileRef.current?.click()}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>{translate(lang, 'btn_import')}</span>
              </button>
              <input
                type="file"
                ref={importFileRef}
                hidden
                accept=".json,application/json"
                onChange={onImportProfilesFile}
              />
            </div>

            <div id="profileList">
              {profiles.length === 0 ? (
                <div className="empty-list">{translate(lang, 'empty_profiles')}</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="empty-list">{translate(lang, 'empty_search', { q: profileSearch })}</div>
              ) : (
                filteredProfiles.map((p) => (
                  <div key={p.id} className="prof" data-id={p.id}>
                    <div className="info">
                      {editingProfileId === p.id ? (
                        <input
                          className="lbl-input"
                          value={editingProfileText}
                          maxLength={26}
                          autoFocus
                          onChange={(e) => setEditingProfileText(e.target.value)}
                          onBlur={() => {
                            if (editingProfileText.trim()) {
                              onRenameProfile(p.id, editingProfileText.trim());
                            }
                            setEditingProfileId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingProfileText.trim()) {
                                onRenameProfile(p.id, editingProfileText.trim());
                              }
                              setEditingProfileId(null);
                            }
                            if (e.key === 'Escape') setEditingProfileId(null);
                          }}
                        />
                      ) : (
                        <b
                          onDoubleClick={() => {
                            setEditingProfileId(p.id);
                            setEditingProfileText(p.name);
                          }}
                        >
                          {p.name}
                        </b>
                      )}
                      <div className="meta">
                        <span>🗂 {translate(lang, 'meta_opts', { n: p.options.length })}</span>
                        <span>🕒 {formatDate(p.updated)}</span>
                      </div>
                    </div>
                    <div className="acts">
                      <button
                        className="ibtn"
                        data-tip={translate(lang, 'tip_load')}
                        onClick={() => onLoadProfile(p)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </button>
                      <button
                        className="ibtn"
                        data-tip={translate(lang, 'tip_rename')}
                        onClick={() => {
                          setEditingProfileId(p.id);
                          setEditingProfileText(p.name);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
                        </svg>
                      </button>
                      <button
                        className="ibtn"
                        data-tip={translate(lang, 'tip_dup')}
                        onClick={() => onDuplicateProfile(p)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="12" height="12" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <button
                        className="ibtn"
                        data-tip={translate(lang, 'tip_export')}
                        onClick={() => onExportProfile(p)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </button>
                      <button
                        className="ibtn danger"
                        data-tip={translate(lang, 'tip_delp')}
                        onClick={() => onDeleteProfile(p.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* PANE: LIST */}
        <section className={`pane ${activeTab === 'list' ? 'on' : ''}`} id="pane-list">
          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <span>{translate(lang, 'sec_filter')}</span>
            </div>
            <div className="field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                id="searchInput"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={translate(lang, 'ph_filter')}
              />
            </div>
          </div>

          <div className="list-tools">
            <button className="ibtn" id="btnShuffle" data-tip={translate(lang, 'tip_shuffle')} onClick={onShuffle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
            </button>
            <button className="ibtn" id="btnAll" data-tip={translate(lang, 'tip_all')} onClick={onSelectAll}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
            <button className="ibtn" id="btnNone" data-tip={translate(lang, 'tip_none')} onClick={onDeselectAll}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="4" y="4" width="16" height="16" rx="3" />
              </svg>
            </button>
            <button
              className="ibtn"
              id="btnUndo"
              data-tip={translate(lang, 'tip_undo')}
              disabled={!canUndo}
              onClick={onUndo}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
              </svg>
            </button>
            <button className="ibtn danger" id="btnClear" data-tip={translate(lang, 'tip_clear')} onClick={onClearAll}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                <path d="M22 21H7" />
                <path d="m5 11 9 9" />
              </svg>
            </button>
            <span id="listCount">
              {translate(lang, 'active', { a: activeCount, b: options.length })}
            </span>
          </div>

          <div id="optList">
            {options.length === 0 ? (
              <div className="empty-list">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
                </svg>
                <br />
                {translate(lang, 'empty_list')}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="empty-list">{translate(lang, 'empty_search', { q: searchFilter })}</div>
            ) : (
              filteredOptions.map((o) => (
                <div key={o.id} className={`row ${o.enabled ? '' : 'off'}`} data-id={o.id}>
                  <label className="cbox" data-tip={o.enabled ? translate(lang, 'tip_on') : translate(lang, 'tip_off')}>
                    <input
                      type="checkbox"
                      checked={o.enabled}
                      onChange={() => onToggleOption(o.id)}
                    />
                    <span className="box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                  </label>

                  <label className="csw tip-b" data-tip={translate(lang, 'tip_color')} style={{ '--c': o.color } as React.CSSProperties}>
                    <input
                      type="color"
                      value={o.color}
                      onChange={(e) => onChangeColor(o.id, e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M12 2.7s6 6.3 6 10.3a6 6 0 0 1-12 0c0-4 6-10.3 6-10.3z" />
                    </svg>
                  </label>

                  {editingOptionId === o.id ? (
                    <input
                      className="lbl-input"
                      value={editingOptionText}
                      maxLength={40}
                      autoFocus
                      onChange={(e) => setEditingOptionText(e.target.value)}
                      onBlur={() => {
                        if (editingOptionText.trim()) {
                          onRenameOption(o.id, editingOptionText.trim());
                        }
                        setEditingOptionId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingOptionText.trim()) {
                            onRenameOption(o.id, editingOptionText.trim());
                          }
                          setEditingOptionId(null);
                        }
                        if (e.key === 'Escape') setEditingOptionId(null);
                      }}
                    />
                  ) : (
                    <span
                      className="lbl"
                      title={translate(lang, 'tip_edit')}
                      onDoubleClick={() => {
                        setEditingOptionId(o.id);
                        setEditingOptionText(o.label);
                      }}
                    >
                      {o.label}
                    </span>
                  )}

                  <div className="wst" data-tip={translate(lang, 'tip_weight')}>
                    <button onClick={() => onChangeWeight(o.id, -1)} aria-label="-">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <b>×{o.weight || 1}</b>
                    <button onClick={() => onChangeWeight(o.id, 1)} aria-label="+">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>

                  <button
                    className="ibtn danger"
                    data-tip={translate(lang, 'tip_del')}
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => onDeleteOption(o.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANE: STATS */}
        <section className={`pane ${activeTab === 'stats' ? 'on' : ''}`} id="pane-stats">
          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
              <span>{translate(lang, 'sec_dash')}</span>
            </div>
            <div className="kpis">
              <div className="kpi">
                <b id="sSession">{sessionSpins}</b>
                <span>{translate(lang, 'kpi_session')}</span>
              </div>
              <div className="kpi">
                <b id="sTotal">{totalSpins}</b>
                <span>{translate(lang, 'kpi_total')}</span>
              </div>
              <div className="kpi">
                <b id="sOptions">{options.length}</b>
                <span>{translate(lang, 'kpi_opts')}</span>
              </div>
              <div className="kpi">
                <b id="sEnabled">{activeCount}</b>
                <span>{translate(lang, 'kpi_active')}</span>
              </div>
            </div>
          </div>

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" />
                <path d="M7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
              </svg>
              <span>{translate(lang, 'sec_podium')}</span>
            </div>
            <div id="barsBox">
              {statsEntries.length === 0 ? (
                <div className="empty-list">{translate(lang, 'empty_podium')}</div>
              ) : (
                statsEntries.map(([name, val], i) => (
                  <div key={name} className="bar-row">
                    <span className="medal" style={{ opacity: i === 0 ? 1 : 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" />
                        <path d="M7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
                      </svg>
                    </span>
                    <span className="nm" title={name}>
                      {name}
                    </span>
                    <span className="tr">
                      <i style={{ width: `${(val.w / maxWins) * 100}%`, background: val.color, color: val.color }} />
                    </span>
                    <span className="vv">{val.w}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{translate(lang, 'sec_book')}</span>
              {history.length > 0 && (
                <button
                  className="ibtn danger"
                  id="btnClearHist"
                  data-tip={translate(lang, 'tip_clearhist')}
                  style={{ width: '22px', height: '22px', marginLeft: '4px' }}
                  onClick={onClearHistory}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="hlist scroll" id="histList">
              {history.length === 0 ? (
                <div className="empty-list">{translate(lang, 'empty_hist')}</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="hitem">
                    <span className="dot" style={{ background: h.color, color: h.color }} />
                    <b>{h.label}</b>
                    <time>{h.time}</time>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sec">
            <div className="sec-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>{translate(lang, 'sec_log')}</span>
            </div>
            <div id="feedList" className="hlist scroll" style={{ maxHeight: '150px' }}>
              {feedItems.length === 0 ? (
                <div className="empty-list">{translate(lang, 'empty_feed')}</div>
              ) : (
                feedItems.map((f, i) => (
                  <div key={i} className="feeditem">
                    <time>{f.t}</time>
                    <span>{f.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Drawer Quick Validation Footer */}
      {onCloseMobile && (
        <div className="panel-drawer-footer">
          <button
            className="btn primary full-width panel-drawer-action-btn"
            onClick={onCloseMobile}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{lang === 'fr' ? 'Valider & Lancer la Roue' : 'Done & Spin the Wheel'}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
