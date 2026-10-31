export interface WheelOption {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
  weight: number;
}

export interface Segment {
  o: WheelOption;
  start: number;
  end: number;
  mid: number;
}

export type ThemeId = 'cyber' | 'dark' | 'light' | 'synthwave' | 'matrix' | 'gold';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  c: [string, string, string];
}

export interface FxColors {
  acc: string;
  acc2: string;
  parts: string;
  segStroke: string;
  metalLo: string;
  metalHi: string;
  peg: string;
  hubRing: string;
  empty: string;
}

export interface AppSettings {
  volume: number;
  muted: boolean;
  confetti: boolean;
  idle: boolean;
  ticks: boolean;
  duration: 'fast' | 'normal' | 'epic';
  elim: boolean;
  eco: boolean;
  clutch: boolean;
}

export interface SavedProfile {
  id: string;
  name: string;
  options: WheelOption[];
  created: number;
  updated: number;
}

export interface HistoryItem {
  label: string;
  color: string;
  time: string;
}

export interface StatItem {
  w: number;
  color: string;
}

export interface FeedItem {
  t: string;
  msg: string;
}

export type Lang = 'fr' | 'en';

export interface PresetDef {
  n: { fr: string; en: string };
  d: { fr: string; en: string };
  ic: string;
  o: [string, string][];
  cm: boolean;
}

export interface TutoStep {
  sel?: string;
  tab?: 'add' | 'presets' | 'list' | 'stats';
  t: string;
  x: string;
}
