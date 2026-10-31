import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppSettings,
  FeedItem,
  HistoryItem,
  Lang,
  PresetDef,
  SavedProfile,
  Segment,
  StatItem,
  ThemeId,
  WheelOption,
} from './types';
import { PALETTE, THEMES } from './data/themes';
import { CM_WIN, TUTO_STEPS, translate } from './data/translations';
import {
  getAudioContext,
  playAdd,
  playClick,
  playDelete,
  playTone,
  playWhoosh,
  playWin,
  updateMasterGain,
} from './utils/audio';

import { TopHud } from './components/TopHud';
import { Panel } from './components/Panel';
import { WheelArena } from './components/WheelArena';
import { WinModal } from './components/WinModal';
import { SaveConflictModal } from './components/SaveConflictModal';
import { SettingsModal } from './components/SettingsModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { buildStandaloneHtml } from './utils/exportStandaloneHtml';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DEF_OPTS: WheelOption[] = [
  ['Ndolé', '#00ff66'],
  ['Poulet DG', '#ffd700'],
  ['Poisson braisé', '#ff7a00'],
  ['Eru', '#2dd4bf'],
  ['Koki', '#a3e635'],
  ['Mbongo Tchobi', '#ff4d4d'],
].map(([label, color]) => ({
  id: uid(),
  label,
  color,
  enabled: true,
  weight: 1,
}));

function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`cae:${key}`);
    return val == null ? fallback : JSON.parse(val);
  } catch {
    return fallback;
  }
}

function setLocalStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`cae:${key}`, JSON.stringify(val));
  } catch {
    // Storage quota or restricted
  }
}

const isLowEnd =
  typeof navigator !== 'undefined' &&
  ((navigator.hardwareConcurrency || 8) <= 4 ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width:820px)').matches));

export default function App() {
  // Global App States
  const [lang, setLang] = useState<Lang>(() => getLocalStorage('lang', 'fr'));
  const [theme, setTheme] = useState<ThemeId>(() => getLocalStorage('theme', 'cyber'));
  const [options, setOptions] = useState<WheelOption[]>(() => getLocalStorage('options', DEF_OPTS));
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => getLocalStorage('profiles', []));
  const [history, setHistory] = useState<HistoryItem[]>(() => getLocalStorage('history', []));
  const [stats, setStats] = useState<Record<string, StatItem>>(() => getLocalStorage('stats', {}));
  const [totalSpins, setTotalSpins] = useState<number>(() => getLocalStorage('spinsTotal', 0));

  const [settings, setSettings] = useState<AppSettings>(() => {
    const s = getLocalStorage('settings', {
      volume: 0.7,
      muted: false,
      confetti: true,
      idle: true,
      ticks: true,
      duration: 'normal' as const,
      elim: false,
      eco: isLowEnd,
      clutch: true,
    });
    return {
      volume: s.volume ?? 0.7,
      muted: !!s.muted,
      confetti: s.confetti ?? true,
      idle: s.idle ?? true,
      ticks: s.ticks ?? true,
      duration: s.duration || 'normal',
      elim: !!s.elim,
      eco: s.eco !== undefined ? s.eco : isLowEnd,
      clutch: s.clutch ?? true,
    };
  });

  // Session & Temporary States
  const [sessionSpins, setSessionSpins] = useState<number>(0);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [tickerText, setTickerText] = useState<string>('…');
  const [activeTab, setActiveTab] = useState<'add' | 'presets' | 'list' | 'stats'>('add');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Undo Stack
  const undoStackRef = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // Modals state
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<WheelOption | null>(null);
  const [winnerSlang, setWinnerSlang] = useState('');
  const [winnerTimeString, setWinnerTimeString] = useState('');

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [standaloneModalOpen, setStandaloneModalOpen] = useState(false);
  const [panelDrawerOpen, setPanelDrawerOpen] = useState(false);
  const [saveConflictOpen, setSaveConflictOpen] = useState(false);
  const [pendingSaveProfile, setPendingSaveProfile] = useState<{
    name: string;
    replaceId: string;
  } | null>(null);

  // Close parameter drawer with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelDrawerOpen) {
        setPanelDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelDrawerOpen]);

  // Toast feedback helper
  const addToast = useCallback((msg: string, type: 'info' | 'warn' | 'err' = 'info') => {
    const id = uid();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Live session feed logger
  const logFeed = useCallback(
    (msg: string) => {
      const now = new Date().toLocaleTimeString('fr-FR', { hour12: false });
      setFeedItems((prev) => [{ t: now, msg }, ...prev.slice(0, 60)]);
      setTickerText(`[${now}] ${msg}`);
    },
    []
  );

  const handleDownloadStandalone = useCallback(() => {
    try {
      const htmlContent = buildStandaloneHtml(options, profiles, settings, theme, lang);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DI_SPIN_ELITE_STANDALONE.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      playWin(settings.muted);
      addToast(
        lang === 'fr'
          ? 'Fichier HTML autonome téléchargé ! 📥'
          : 'Standalone HTML file downloaded! 📥'
      );
    } catch (err) {
      addToast(lang === 'fr' ? 'Erreur lors du téléchargement' : 'Download error', 'err');
    }
  }, [options, profiles, settings, theme, lang, addToast]);

  const handleCopyStandaloneSource = useCallback(() => {
    try {
      const htmlContent = buildStandaloneHtml(options, profiles, settings, theme, lang);
      navigator.clipboard.writeText(htmlContent);
      addToast(lang === 'fr' ? 'Code HTML copié dans le presse-papier ! ✓' : 'HTML code copied to clipboard! ✓');
      playClick(settings.muted);
    } catch (err) {
      addToast(lang === 'fr' ? 'Impossible de copier le code' : 'Failed to copy code', 'err');
    }
  }, [options, profiles, settings, theme, lang, addToast]);

  // Tutorial state
  const [tutoOpen, setTutoOpen] = useState(false);
  const [tutoIndex, setTutoIndex] = useState(0);

  const arenaWheelRef = useRef<{
    spinWheel: (onFinish: (winner: Segment) => void) => void;
  } | null>(null);

  // Sync document dataset attributes for theme & eco mode
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
    setLocalStorage('theme', theme);
  }, [theme, lang]);

  useEffect(() => {
    document.body.classList.toggle('eco', settings.eco);
  }, [settings.eco]);

  // Audio master volume synchronization
  useEffect(() => {
    updateMasterGain(settings.volume, settings.muted);
  }, [settings.volume, settings.muted]);

  // Initial welcome & tutorial launch
  useEffect(() => {
    logFeed(translate(lang, 'f_boot'));
    const tutoDone = getLocalStorage('tuto', 0);
    if (!tutoDone) {
      setTimeout(() => {
        setTutoIndex(0);
        setTutoOpen(true);
      }, 700);
    }
  }, []);

  // Compute Active Segments
  const activeOptions = options.filter((o) => o.enabled && o.label);
  const totalWeight = activeOptions.reduce((s, o) => s + (o.weight || 1), 0) || 1;
  let currentAngle = 0;
  const segments: Segment[] = activeOptions.map((o) => {
    const sweep = ((o.weight || 1) / totalWeight) * 360;
    const seg: Segment = {
      o,
      start: currentAngle,
      end: currentAngle + sweep,
      mid: currentAngle + sweep / 2,
    };
    currentAngle += sweep;
    return seg;
  });

  // Snapshot for undo
  const saveSnapshot = useCallback(() => {
    undoStackRef.current.push(JSON.stringify(options));
    if (undoStackRef.current.length > 50) undoStackRef.current.shift();
    setCanUndo(true);
  }, [options]);

  const handleUndo = useCallback(() => {
    if (!undoStackRef.current.length) {
      addToast(translate(lang, 'to_noundo'), 'warn');
      return;
    }
    const previous = JSON.parse(undoStackRef.current.pop()!);
    setOptions(previous);
    setLocalStorage('options', previous);
    playAdd(settings.muted);
    addToast(translate(lang, 'to_restored'), 'info');
    logFeed(translate(lang, 'f_undo'));
    setCanUndo(undoStackRef.current.length > 0);
  }, [lang, settings.muted, addToast, logFeed]);

  // Option Operations
  const handleAddOption = (label: string, weight = 1) => {
    saveSnapshot();
    const newOpt: WheelOption = {
      id: uid(),
      label: label.trim(),
      weight: Math.max(1, Math.min(10, weight)),
      enabled: true,
      color: PALETTE[options.length % PALETTE.length],
    };
    const updated = [...options, newOpt];
    setOptions(updated);
    setLocalStorage('options', updated);
    playAdd(settings.muted);
    addToast(translate(lang, 'to_added'));
    logFeed(translate(lang, 'f_add', { x: newOpt.label }));
  };

  const handleToggleOption = (id: string) => {
    const updated = options.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o));
    setOptions(updated);
    setLocalStorage('options', updated);
    playClick(settings.muted);
    const target = options.find((o) => o.id === id);
    if (target) {
      logFeed(translate(lang, !target.enabled ? 'f_on' : 'f_off', { x: target.label }));
    }
  };

  const handleChangeColor = (id: string, color: string) => {
    const updated = options.map((o) => (o.id === id ? { ...o, color } : o));
    setOptions(updated);
    setLocalStorage('options', updated);
    const target = options.find((o) => o.id === id);
    if (target) {
      logFeed(translate(lang, 'f_color', { x: target.label }));
    }
  };

  const handleChangeWeight = (id: string, delta: number) => {
    const updated = options.map((o) =>
      o.id === id ? { ...o, weight: Math.max(1, Math.min(10, (o.weight || 1) + delta)) } : o
    );
    setOptions(updated);
    setLocalStorage('options', updated);
    playClick(settings.muted);
  };

  const handleRenameOption = (id: string, label: string) => {
    const updated = options.map((o) => (o.id === id ? { ...o, label } : o));
    setOptions(updated);
    setLocalStorage('options', updated);
    logFeed(translate(lang, 'f_rename', { x: label }));
  };

  const handleDeleteOption = (id: string) => {
    const target = options.find((o) => o.id === id);
    saveSnapshot();
    const updated = options.filter((o) => o.id !== id);
    setOptions(updated);
    setLocalStorage('options', updated);
    playDelete(settings.muted);
    if (target) {
      addToast(translate(lang, 'to_deleted', { x: target.label }));
      logFeed(translate(lang, 'f_del', { x: target.label }));
    }
  };

  const handleSelectAll = () => {
    const updated = options.map((o) => ({ ...o, enabled: true }));
    setOptions(updated);
    setLocalStorage('options', updated);
    playClick(settings.muted);
  };

  const handleDeselectAll = () => {
    const updated = options.map((o) => ({ ...o, enabled: false }));
    setOptions(updated);
    setLocalStorage('options', updated);
    playClick(settings.muted);
  };

  const handleShuffle = () => {
    if (options.length < 2) return;
    saveSnapshot();
    const copy = [...options];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setOptions(copy);
    setLocalStorage('options', copy);
    playClick(settings.muted);
    addToast(translate(lang, 'to_shuffled'));
    logFeed(translate(lang, 'f_shuffle'));
  };

  const handleClearAll = () => {
    if (!options.length) return;
    saveSnapshot();
    setOptions([]);
    setLocalStorage('options', []);
    playDelete(settings.muted);
    addToast(translate(lang, 'to_cleared'));
    logFeed(translate(lang, 'f_clear'));
  };

  // Presets & Profiles
  const handleLoadPreset = (preset: PresetDef) => {
    saveSnapshot();
    const newOptions: WheelOption[] = preset.o.map(([label, color]) => ({
      id: uid(),
      label,
      color,
      enabled: true,
      weight: 1,
    }));
    setOptions(newOptions);
    setLocalStorage('options', newOptions);
    playAdd(settings.muted);
    addToast(translate(lang, 'to_preset', { x: preset.n[lang] }));
    logFeed(translate(lang, 'f_preset', { x: preset.n[lang] }));
  };

  const nextSuffix = (name: string): string => {
    const base = name.replace(/ \(\d+\)$/, '');
    let i = 2;
    let candidate = `${base} (2)`;
    while (profiles.some((p) => p.name.toLowerCase() === candidate.toLowerCase())) {
      i++;
      candidate = `${base} (${i})`;
    }
    return candidate;
  };

  const doSaveProfile = (name: string, replaceId?: string, isSuffix = false) => {
    const now = Date.now();
    const optsCopy = JSON.parse(JSON.stringify(options));
    let updatedProfiles: SavedProfile[];

    if (replaceId) {
      updatedProfiles = profiles.map((p) =>
        p.id === replaceId ? { ...p, options: optsCopy, updated: now } : p
      );
      addToast(translate(lang, 'to_profreplaced', { x: name }));
    } else {
      const newProf: SavedProfile = {
        id: uid(),
        name,
        options: optsCopy,
        created: now,
        updated: now,
      };
      updatedProfiles = [newProf, ...profiles].slice(0, 40);
      addToast(translate(lang, isSuffix ? 'to_profsuffix' : 'to_profsaved', { x: name }));
    }

    setProfiles(updatedProfiles);
    setLocalStorage('profiles', updatedProfiles);
    logFeed(translate(lang, 'f_profsave', { x: name }));
    playAdd(settings.muted);
  };

  const handleSaveProfileRequest = (rawName: string) => {
    const name =
      rawName.trim() ||
      `${translate(lang, 'auto_list')} ${new Date().toLocaleString(
        lang === 'fr' ? 'fr-FR' : 'en-GB',
        { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
      )}`;

    if (!options.length) {
      addToast(translate(lang, 'to_emptywheel'), 'warn');
      return;
    }

    const existing = profiles.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setPendingSaveProfile({ name, replaceId: existing.id });
      setSaveConflictOpen(true);
    } else {
      doSaveProfile(name);
    }
  };

  const handleLoadProfile = (profile: SavedProfile) => {
    saveSnapshot();
    const freshOptions = profile.options.map((o) => ({ ...o, id: uid() }));
    setOptions(freshOptions);
    setLocalStorage('options', freshOptions);
    playAdd(settings.muted);
    addToast(translate(lang, 'to_profloaded', { x: profile.name }));
    logFeed(translate(lang, 'f_profload', { x: profile.name }));
  };

  const handleRenameProfile = (id: string, name: string) => {
    const updated = profiles.map((p) => (p.id === id ? { ...p, name, updated: Date.now() } : p));
    setProfiles(updated);
    setLocalStorage('profiles', updated);
    addToast(translate(lang, 'to_renamed'));
    logFeed(translate(lang, 'f_rename', { x: name }));
  };

  const handleDuplicateProfile = (profile: SavedProfile) => {
    const dupName = nextSuffix(profile.name);
    const now = Date.now();
    const newProf: SavedProfile = {
      id: uid(),
      name: dupName,
      options: JSON.parse(JSON.stringify(profile.options)),
      created: now,
      updated: now,
    };
    const updated = [newProf, ...profiles].slice(0, 40);
    setProfiles(updated);
    setLocalStorage('profiles', updated);
    playAdd(settings.muted);
    addToast(translate(lang, 'to_profsuffix', { x: dupName }));
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    setLocalStorage('profiles', updated);
    playDelete(settings.muted);
    addToast(translate(lang, 'to_profdel'));
  };

  const handleExportProfile = (profile: SavedProfile) => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/[^\w\d-]+/g, '_')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 600);
    addToast(translate(lang, 'to_exported'));
  };

  const handleExportAllProfiles = () => {
    if (!profiles.length) {
      addToast(translate(lang, 'empty_profiles'), 'warn');
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ app: 'GO SPIN-elite', exported: Date.now(), profiles }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GO_SPIN_ELITE_PROFILES.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 600);
    addToast(translate(lang, 'to_exported'));
    playClick(settings.muted);
  };

  const handleImportProfilesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.profiles)
          ? data.profiles
          : [data];
        let importedCount = 0;
        const newProfilesList = [...profiles];

        arr.forEach((it: any) => {
          if (it && it.name && Array.isArray(it.options) && it.options.length) {
            let nm = String(it.name).slice(0, 26);
            if (newProfilesList.some((p) => p.name.toLowerCase() === nm.toLowerCase())) {
              nm = nextSuffix(nm);
            }
            const now = Date.now();
            newProfilesList.unshift({
              id: uid(),
              name: nm,
              options: it.options.map((o: any, idx: number) => ({
                id: uid(),
                label: String(o.label || '?'),
                color: /^#[0-9a-f]{6}$/i.test(o.color || '') ? o.color : PALETTE[idx % 12],
                enabled: o.enabled !== false,
                weight: Math.max(1, Math.min(10, Number(o.weight) || 1)),
              })),
              created: now,
              updated: now,
            });
            importedCount++;
          }
        });

        const clamped = newProfilesList.slice(0, 40);
        setProfiles(clamped);
        setLocalStorage('profiles', clamped);
        addToast(translate(lang, 'to_imported', { n: importedCount }));
        playAdd(settings.muted);
      } catch {
        addToast('JSON invalide / Invalid file format', 'err');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearHistory = () => {
    setHistory([]);
    setStats({});
    setTotalSpins(0);
    setLocalStorage('history', []);
    setLocalStorage('stats', {});
    setLocalStorage('spinsTotal', 0);
    playDelete(settings.muted);
    addToast(translate(lang, 'to_histclear'));
    logFeed(translate(lang, 'f_hist'));
  };

  const handleDownloadStandaloneHtml = useCallback(() => {
    playClick(settings.muted);
    const html = buildStandaloneHtml(options, profiles, settings, theme, lang);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'di-spin-elite-standalone.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addToast(
      lang === 'fr'
        ? 'Site HTML autonome téléchargé ! ⚡'
        : 'Standalone HTML site downloaded! ⚡'
    );
  }, [options, profiles, settings, theme, lang, addToast]);

  const handleCopyStandaloneHtml = useCallback(() => {
    playClick(settings.muted);
    const html = buildStandaloneHtml(options, profiles, settings, theme, lang);
    const fallbackCopy = (text: string) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        addToast(
          lang === 'fr'
            ? 'Code HTML autonome copié dans le presse-papier ! ✓'
            : 'Standalone HTML code copied to clipboard! ✓'
        );
      } catch {
        addToast(lang === 'fr' ? 'Échec de la copie' : 'Failed to copy code', 'err');
      }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(html)
        .then(() => {
          addToast(
            lang === 'fr'
              ? 'Code HTML autonome copié dans le presse-papier ! ✓'
              : 'Standalone HTML code copied to clipboard! ✓'
          );
        })
        .catch(() => fallbackCopy(html));
    } else {
      fallbackCopy(html);
    }
  }, [options, profiles, settings, theme, lang, addToast]);

  // Spinning Core
  const triggerSpin = useCallback(() => {
    if (isSpinning || tutoOpen) return;
    if (segments.length < 2) {
      addToast(translate(lang, 'to_need2'), 'warn');
      return;
    }

    getAudioContext();
    setIsSpinning(true);
    playWhoosh(settings.muted);
    logFeed(translate(lang, 'f_spin'));

    arenaWheelRef.current?.spinWheel((winner) => {
      const now = new Date();
      const timeStr = now.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const slang = CM_WIN[Math.floor(Math.random() * CM_WIN.length)];

      setCurrentWinner(winner.o);
      setWinnerSlang(slang);
      setWinnerTimeString(timeStr);

      // Record in statistics
      setTotalSpins((prev) => {
        const next = prev + 1;
        setLocalStorage('spinsTotal', next);
        return next;
      });
      setSessionSpins((prev) => prev + 1);

      setStats((prev) => {
        const cur = prev[winner.o.label] || { w: 0, color: winner.o.color };
        const updated = {
          ...prev,
          [winner.o.label]: { w: cur.w + 1, color: winner.o.color },
        };
        setLocalStorage('stats', updated);
        return updated;
      });

      setHistory((prev) => {
        const updated = [{ label: winner.o.label, color: winner.o.color, time: timeStr }, ...prev].slice(0, 300);
        setLocalStorage('history', updated);
        return updated;
      });

      logFeed(translate(lang, 'f_win', { x: winner.o.label, s: slang }));

      setTimeout(() => {
        setIsSpinning(false);
        setWinnerModalOpen(true);
        playWin(settings.muted);
      }, 420);
    });
  }, [isSpinning, tutoOpen, segments, settings.muted, lang, addToast, logFeed]);

  // Remove winner after modal
  const handleRemoveOnlyWinner = () => {
    if (currentWinner) {
      saveSnapshot();
      const updated = options.filter((x) => x.id !== currentWinner.id);
      setOptions(updated);
      setLocalStorage('options', updated);
      addToast(translate(lang, 'to_winremove'));
      logFeed(translate(lang, 'f_elim', { x: currentWinner.label }));
    }
    setWinnerModalOpen(false);
  };

  const handleRemoveAndNextRound = () => {
    if (!currentWinner) {
      setWinnerModalOpen(false);
      return;
    }
    saveSnapshot();
    const updated = options.filter((x) => x.id !== currentWinner.id);
    setOptions(updated);
    setLocalStorage('options', updated);
    playDelete(settings.muted);
    logFeed(translate(lang, 'f_elim', { x: currentWinner.label }));
    setWinnerModalOpen(false);

    const remainingActive = updated.filter((x) => x.enabled).length;
    if (remainingActive >= 2) {
      setTimeout(triggerSpin, 280);
    } else {
      addToast(translate(lang, 'to_lastsurv'));
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (winnerModalOpen) {
        const key = e.key.toLowerCase();
        if (e.key === 'Escape') {
          e.preventDefault();
          playClick(settings.muted);
          setWinnerModalOpen(false);
        } else if (key === 'r') {
          e.preventDefault();
          playClick(settings.muted);
          setWinnerModalOpen(false);
          setTimeout(triggerSpin, 120);
        } else if (key === 's') {
          e.preventDefault();
          handleRemoveOnlyWinner();
        } else if (key === 'c') {
          e.preventDefault();
          playClick(settings.muted);
          setWinnerModalOpen(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (settings.elim) handleRemoveAndNextRound();
          else {
            playClick(settings.muted);
            setWinnerModalOpen(false);
          }
        }
        return;
      }

      if (saveConflictOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setSaveConflictOpen(false);
        }
        return;
      }

      if (tutoOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setTutoOpen(false);
          setLocalStorage('tuto', 1);
        } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          const steps = TUTO_STEPS[lang];
          if (tutoIndex < steps.length - 1) {
            setTutoIndex((i) => i + 1);
          } else {
            setTutoOpen(false);
            setLocalStorage('tuto', 1);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (tutoIndex > 0) setTutoIndex((i) => i - 1);
        }
        return;
      }

      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(activeEl.tagName) ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape') {
        if (settingsModalOpen) setSettingsModalOpen(false);
        else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
        return;
      }

      if (isTyping) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerSpin();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key.toLowerCase() === 'm') {
        setSettings((prev) => {
          const nextMuted = !prev.muted;
          setLocalStorage('settings', { ...prev, muted: nextMuted });
          addToast(translate(lang, nextMuted ? 'to_mute_on' : 'to_mute_off'));
          return { ...prev, muted: nextMuted };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    winnerModalOpen,
    saveConflictOpen,
    tutoOpen,
    tutoIndex,
    settingsModalOpen,
    settings,
    lang,
    triggerSpin,
    handleUndo,
    addToast,
  ]);

  // Sync tutorial tab step
  useEffect(() => {
    if (tutoOpen) {
      const step = TUTO_STEPS[lang][tutoIndex];
      if (step?.tab) {
        setActiveTab(step.tab);
      }
    }
  }, [tutoOpen, tutoIndex, lang]);

  return (
    <div id="app">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-scan" />

      {/* Top Header / HUD */}
      <TopHud
        lang={lang}
        theme={theme}
        volume={settings.volume}
        muted={settings.muted}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          playClick(settings.muted);
          const thObj = THEMES.find((x) => x.id === newTheme);
          if (thObj) logFeed(translate(lang, 'f_theme', { x: thObj.name }));
        }}
        onLangToggle={() => {
          const nextLang = lang === 'fr' ? 'en' : 'fr';
          setLang(nextLang);
          setLocalStorage('lang', nextLang);
          playClick(settings.muted);
          addToast(nextLang === 'fr' ? 'Langue : Français 🇫🇷' : 'Language: English 🇬🇧');
        }}
        onVolumeChange={(vol) => {
          setSettings((prev) => {
            const updated = { ...prev, volume: vol, muted: false };
            setLocalStorage('settings', updated);
            return updated;
          });
        }}
        onMuteToggle={() => {
          setSettings((prev) => {
            const updated = { ...prev, muted: !prev.muted };
            setLocalStorage('settings', updated);
            addToast(translate(lang, updated.muted ? 'to_mute_on' : 'to_mute_off'));
            return updated;
          });
        }}
        onOpenSettings={() => {
          playClick(settings.muted);
          setSettingsModalOpen(true);
        }}
        onOpenExportStandalone={() => {
          playClick(settings.muted);
          setStandaloneModalOpen(true);
        }}
        onToggleWheelParams={() => {
          playClick(settings.muted);
          setPanelDrawerOpen((prev) => !prev);
        }}
        panelDrawerOpen={panelDrawerOpen}
        activeOptionsCount={options.filter((o) => o.enabled).length}
      />

      {/* Mobile Parameters Drawer Backdrop Overlay */}
      <div
        className={`panel-drawer-backdrop ${panelDrawerOpen ? 'open' : ''}`}
        onClick={() => {
          playClick(settings.muted);
          setPanelDrawerOpen(false);
        }}
        aria-hidden="true"
      />

      {/* Main Container: Control Panel (Drawer on Mobile / Docked on Desktop) + Wheel Arena */}
      <main id="main">
        <div className={`panel-wrapper ${panelDrawerOpen ? 'drawer-open' : ''}`}>
          <Panel
            lang={lang}
            options={options}
            profiles={profiles}
            history={history}
            stats={stats}
            sessionSpins={sessionSpins}
            totalSpins={totalSpins}
            feedItems={feedItems}
            activeTab={activeTab}
            canUndo={canUndo}
            onCloseMobile={() => {
              playClick(settings.muted);
              setPanelDrawerOpen(false);
            }}
            onTabChange={(tab) => {
              playClick(settings.muted);
              setActiveTab(tab);
            }}
            onAddOption={handleAddOption}
            onToggleOption={handleToggleOption}
            onChangeColor={handleChangeColor}
            onChangeWeight={handleChangeWeight}
            onRenameOption={handleRenameOption}
            onDeleteOption={handleDeleteOption}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onShuffle={handleShuffle}
            onClearAll={handleClearAll}
            onUndo={handleUndo}
            onLoadPreset={handleLoadPreset}
            onSaveProfileRequest={handleSaveProfileRequest}
            onLoadProfile={handleLoadProfile}
            onRenameProfile={handleRenameProfile}
            onDuplicateProfile={handleDuplicateProfile}
            onDeleteProfile={handleDeleteProfile}
            onExportProfile={handleExportProfile}
            onExportAllProfiles={handleExportAllProfiles}
            onImportProfilesFile={handleImportProfilesFile}
            onClearHistory={handleClearHistory}
            onOpenExportStandalone={() => {
              playClick(settings.muted);
              setStandaloneModalOpen(true);
            }}
          />
        </div>

        <div className="arena-wrapper">
          <WheelArena
            lang={lang}
            theme={theme}
            spinning={isSpinning}
            elimMode={settings.elim}
            sessionSpins={sessionSpins}
            segments={segments}
            tickerText={tickerText}
            ecoMode={settings.eco}
            panelDrawerOpen={panelDrawerOpen}
            onToggleWheelParams={() => {
              playClick(settings.muted);
              setPanelDrawerOpen((prev) => !prev);
            }}
            onSpin={triggerSpin}
            onToggleElimMode={() => {
              setSettings((prev) => {
                const updated = { ...prev, elim: !prev.elim };
                setLocalStorage('settings', updated);
                playClick(prev.muted);
                addToast(translate(lang, updated.elim ? 'to_elim' : 'to_classic'));
                logFeed(translate(lang, updated.elim ? 'f_mode_e' : 'f_mode_c'));
                return updated;
              });
            }}
            wheelRef={arenaWheelRef}
            onAutoTuneTriggered={() => {
              logFeed(translate(lang, 'f_tune'));
            }}
          />
        </div>
      </main>

      {/* Modals & Overlays */}
      <StandaloneExportModal
        isOpen={standaloneModalOpen}
        lang={lang}
        onClose={() => {
          playClick(settings.muted);
          setStandaloneModalOpen(false);
        }}
        onDownload={handleDownloadStandalone}
        onCopySource={handleCopyStandaloneSource}
      />

      <WinModal
        isOpen={winnerModalOpen}
        lang={lang}
        winner={currentWinner}
        slang={winnerSlang}
        timeString={winnerTimeString}
        elimMode={settings.elim}
        activeCount={activeOptions.length}
        onClose={() => {
          playClick(settings.muted);
          setWinnerModalOpen(false);
        }}
        onReplay={() => {
          playClick(settings.muted);
          setWinnerModalOpen(false);
          setTimeout(triggerSpin, 120);
        }}
        onRemoveOnly={handleRemoveOnlyWinner}
        onRemoveAndNext={handleRemoveAndNextRound}
      />

      <SaveConflictModal
        isOpen={saveConflictOpen}
        lang={lang}
        existingName={pendingSaveProfile?.name || ''}
        suggestedSuffixName={pendingSaveProfile ? nextSuffix(pendingSaveProfile.name) : ''}
        onReplace={() => {
          if (pendingSaveProfile) {
            doSaveProfile(pendingSaveProfile.name, pendingSaveProfile.replaceId);
          }
          setSaveConflictOpen(false);
        }}
        onUseSuffix={() => {
          if (pendingSaveProfile) {
            const suf = nextSuffix(pendingSaveProfile.name);
            doSaveProfile(suf, undefined, true);
          }
          setSaveConflictOpen(false);
        }}
        onCancel={() => {
          playClick(settings.muted);
          setSaveConflictOpen(false);
        }}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        lang={lang}
        settings={settings}
        onClose={() => {
          playClick(settings.muted);
          setSettingsModalOpen(false);
        }}
        onUpdateSetting={(key, val) => {
          setSettings((prev) => {
            const updated = { ...prev, [key]: val };
            setLocalStorage('settings', updated);
            playClick(prev.muted);
            return updated;
          });
        }}
        onReplayTutorial={() => {
          playClick(settings.muted);
          setSettingsModalOpen(false);
          setTutoIndex(0);
          setTutoOpen(true);
        }}
        onNukeAll={() => {
          if (window.confirm(translate(lang, 'to_purge'))) {
            Object.keys(localStorage)
              .filter((k) => k.startsWith('cae:'))
              .forEach((k) => localStorage.removeItem(k));
            window.location.reload();
          }
        }}
        onOpenExportStandalone={() => {
          playClick(settings.muted);
          setSettingsModalOpen(false);
          setStandaloneModalOpen(true);
        }}
      />

      <StandaloneExportModal
        isOpen={standaloneModalOpen}
        lang={lang}
        onClose={() => {
          playClick(settings.muted);
          setStandaloneModalOpen(false);
        }}
        onDownload={handleDownloadStandaloneHtml}
        onCopySource={handleCopyStandaloneHtml}
      />

      <TutorialOverlay
        isOpen={tutoOpen}
        lang={lang}
        stepIndex={tutoIndex}
        onNext={() => {
          playClick(settings.muted);
          const steps = TUTO_STEPS[lang];
          if (tutoIndex < steps.length - 1) {
            setTutoIndex((i) => i + 1);
          } else {
            setTutoOpen(false);
            setLocalStorage('tuto', 1);
            addToast(translate(lang, 'to_tutodone'));
            logFeed(translate(lang, 'f_tuto'));
          }
        }}
        onPrev={() => {
          playClick(settings.muted);
          if (tutoIndex > 0) setTutoIndex((i) => i - 1);
        }}
        onSkip={() => {
          playClick(settings.muted);
          setTutoOpen(false);
          setLocalStorage('tuto', 1);
          addToast(translate(lang, 'to_tutoavail'));
        }}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
