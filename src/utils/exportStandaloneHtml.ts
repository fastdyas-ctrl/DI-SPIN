import { PRESETS } from '../data/presets';
import { FX_CONFIGS, PALETTE, THEMES } from '../data/themes';
import { CM_WIN, STR, TUTO_STEPS } from '../data/translations';
import { AppSettings, SavedProfile, ThemeId, WheelOption } from '../types';

export function buildStandaloneHtml(
  currentOptions: WheelOption[],
  currentProfiles: SavedProfile[],
  currentSettings: AppSettings,
  currentTheme: ThemeId,
  currentLang: 'fr' | 'en'
): string {
  const optionsJson = JSON.stringify(currentOptions);
  const profilesJson = JSON.stringify(currentProfiles);
  const settingsJson = JSON.stringify(currentSettings);
  const presetsJson = JSON.stringify(PRESETS);
  const themesJson = JSON.stringify(THEMES);
  const fxConfigsJson = JSON.stringify(FX_CONFIGS);
  const paletteJson = JSON.stringify(PALETTE);
  const translationsJson = JSON.stringify(STR);
  const tutoStepsJson = JSON.stringify(TUTO_STEPS);
  const cmWinJson = JSON.stringify(CM_WIN);

  return `<!DOCTYPE html>
<html lang="${currentLang}" data-theme="${currentTheme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>DI SPIN ELITE · Roue de Décision 3D (Offline Vanilla)</title>
  <style>
    :root {
      --font-display: "Bahnschrift", "Avenir Next Condensed", "Arial Narrow", "Segoe UI", sans-serif;
      --font-body: "Segoe UI", "SF Pro Text", system-ui, -apple-system, sans-serif;
      --font-mono: "Cascadia Code", "JetBrains Mono", "Fira Code", Consolas, "SF Mono", monospace;
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
      --r: 8px;
      --bg: #070b14;
      --bg2: #0a1220;
      --panel: #0c1524;
      --panel2: #111e33;
      --ink: #e8f4ff;
      --muted: #7d93ad;
      --line: rgba(120, 180, 255, 0.14);
      --line2: rgba(120, 180, 255, 0.32);
      --accent: #00f0ff;
      --accent2: #4d9fff;
      --danger: #ff4d6d;
      --ok: #3ddc84;
      --warn: #ffc857;
      --glow: rgba(0, 240, 255, 0.45);
      --glow-soft: rgba(0, 240, 255, 0.12);
      --grid: rgba(0, 240, 255, 0.05);
      --shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.65);
    }
    :root[data-theme="dark"] {
      --bg: #000; --bg2: #050505; --panel: #0a0a0a; --panel2: #111; --ink: #f5f5f5; --muted: #8a8a8a;
      --line: rgba(255, 255, 255, 0.1); --line2: rgba(255, 255, 255, 0.3); --accent: #fff; --accent2: #9aa4ad;
      --glow: rgba(255, 255, 255, 0.35); --glow-soft: rgba(255, 255, 255, 0.08); --grid: rgba(255, 255, 255, 0.035);
    }
    :root[data-theme="light"] {
      --bg: #f0f4f9; --bg2: #e6edf5; --panel: #ffffff; --panel2: #f3f7fb; --ink: #152435; --muted: #5b7186;
      --line: rgba(21, 36, 53, 0.12); --line2: rgba(21, 36, 53, 0.28); --accent: #0077ff; --accent2: #38bdf8;
      --glow: rgba(0, 119, 255, 0.3); --glow-soft: rgba(0, 119, 255, 0.08); --grid: rgba(0, 119, 255, 0.06);
      --shadow: 0 18px 40px -18px rgba(30, 60, 100, 0.35);
    }
    :root[data-theme="synthwave"] {
      --bg: #0f031e; --bg2: #170630; --panel: #180731; --panel2: #241046; --ink: #ffe9f7; --muted: #9d7fc0;
      --line: rgba(255, 0, 127, 0.22); --line2: rgba(255, 0, 127, 0.5); --accent: #ff007f; --accent2: #8b00ff;
      --glow: rgba(255, 0, 127, 0.5); --glow-soft: rgba(255, 0, 127, 0.14); --grid: rgba(255, 0, 127, 0.07);
    }
    :root[data-theme="matrix"] {
      --bg: #020b05; --bg2: #04120a; --panel: #04160d; --panel2: #072415; --ink: #d9ffe9; --muted: #4e9b72;
      --line: rgba(0, 255, 102, 0.18); --line2: rgba(0, 255, 102, 0.45); --accent: #00ff66; --accent2: #00b34a;
      --glow: rgba(0, 255, 102, 0.45); --glow-soft: rgba(0, 255, 102, 0.1); --grid: rgba(0, 255, 102, 0.06);
      --font-body: var(--font-mono); --font-display: var(--font-mono);
    }
    :root[data-theme="gold"] {
      --bg: #0d0c0a; --bg2: #141208; --panel: #151208; --panel2: #211b0e; --ink: #fff4d6; --muted: #a08b56;
      --line: rgba(255, 215, 0, 0.18); --line2: rgba(255, 215, 0, 0.45); --accent: #ffd700; --accent2: #ffaa33;
      --glow: rgba(255, 215, 0, 0.45); --glow-soft: rgba(255, 215, 0, 0.1); --grid: rgba(255, 215, 0, 0.05);
    }

    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 100%;
      height: 100%;
      height: 100vh;
      height: 100dvh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: var(--font-body);
      color: var(--ink);
      background: var(--bg);
      user-select: none;
      -webkit-user-select: none;
      -webkit-font-smoothing: antialiased;
    }
    input, textarea { user-select: text; -webkit-user-select: text; font-family: inherit; color: inherit; }
    button { font-family: inherit; color: inherit; background: none; border: none; cursor: pointer; }
    
    #app {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .bg-grid {
      position: absolute;
      inset: 0;
      background-size: 32px 32px;
      background-image: linear-gradient(to right, var(--grid) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
      pointer-events: none;
      z-index: 0;
    }
    .bg-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 65% 50%, var(--glow-soft) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    /* TOP HUD */
    #topHud {
      position: relative;
      z-index: 40;
      display: flex;
      align-items: center;
      gap: 12px;
      height: 54px;
      padding: 0 16px;
      background: var(--panel);
      border-bottom: 1px solid var(--line);
      flex: none;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo svg {
      width: 28px;
      height: 28px;
    }
    .logo-txt b {
      font-family: var(--font-display);
      font-size: 15px;
      letter-spacing: 1.2px;
      display: block;
      line-height: 1.1;
      color: var(--ink);
    }
    .logo-txt small {
      font-size: 9px;
      letter-spacing: 1.6px;
      color: var(--muted);
      font-family: var(--font-mono);
      display: block;
    }
    .hud-spacer { flex: 1; }

    .hud-group {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      background: var(--panel2);
      border: 1px solid var(--line);
      border-radius: var(--r);
      height: 36px;
    }
    .hud-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      letter-spacing: 1px;
      margin-right: 4px;
    }
    .theme-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid transparent;
      padding: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s var(--ease);
    }
    .theme-dot.on {
      border-color: var(--accent);
      transform: scale(1.15);
      box-shadow: 0 0 8px var(--glow);
    }
    .theme-dot i {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      overflow: hidden;
    }
    .ibtn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 36px;
      padding: 0 10px;
      background: var(--panel2);
      border: 1px solid var(--line);
      border-radius: var(--r);
      font-size: 12px;
      font-weight: 600;
      color: var(--ink);
      transition: all 0.2s var(--ease);
    }
    .ibtn:hover {
      background: var(--line2);
      border-color: var(--accent);
    }
    .ibtn svg { width: 16px; height: 16px; }
    .ibtn.primary {
      background: rgba(0, 240, 255, 0.12);
      border-color: rgba(0, 240, 255, 0.35);
      color: var(--accent);
      font-weight: 700;
      box-shadow: 0 0 12px var(--glow-soft);
    }
    .ibtn.primary:hover {
      background: var(--accent);
      color: #070b14;
      box-shadow: 0 0 16px var(--glow);
    }

    #volSlider {
      -webkit-appearance: none;
      width: 65px;
      height: 4px;
      background: var(--line2);
      border-radius: 2px;
      outline: none;
    }
    #volSlider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: var(--accent);
      border-radius: 50%;
      cursor: pointer;
    }
    .vol-num {
      font-size: 10.5px;
      font-family: var(--font-mono);
      color: var(--muted);
      min-width: 20px;
    }

    /* MAIN SPLIT */
    #main {
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: 390px 1fr;
      grid-template-rows: 100%;
      height: calc(100% - 54px);
      min-height: 0;
      width: 100%;
      align-items: stretch;
      overflow: hidden;
      position: relative;
      z-index: 10;
    }

    /* RESPONSIVE DRAWER */
    .wheel-params-hamburger {
      display: none;
      align-items: center;
      gap: 7px;
      height: 36px;
      padding: 0 10px;
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.28);
      border-radius: 8px;
      color: var(--ink);
      cursor: pointer;
      transition: all 0.2s;
    }
    .wheel-params-hamburger.active {
      background: var(--accent);
      color: #070b14;
      box-shadow: 0 0 14px var(--glow);
    }
    .hamburger-lines {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 16px;
      height: 12px;
    }
    .hamburger-lines .h-line {
      display: block;
      height: 2px;
      width: 100%;
      background: currentColor;
      border-radius: 2px;
      transition: all 0.2s;
    }
    .hamburger-lines.open .l1 { transform: translateY(5px) rotate(45deg); }
    .hamburger-lines.open .l2 { opacity: 0; }
    .hamburger-lines.open .l3 { transform: translateY(-5px) rotate(-45deg); }

    .panel-drawer-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(4, 7, 16, 0.72);
      backdrop-filter: blur(6px);
      z-index: 115;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
    }
    .panel-drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .panel-drawer-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--panel2);
      border-bottom: 1px solid var(--line2);
      flex: none;
    }
    .panel-drawer-close-btn {
      padding: 5px 10px;
      background: rgba(255,255,255,0.08);
      border: 1px solid var(--line2);
      border-radius: 6px;
      color: var(--ink);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    /* PANEL */
    #panel {
      background: var(--panel);
      border-right: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
    .panel-tabs {
      display: flex;
      border-bottom: 1px solid var(--line);
      background: var(--panel2);
      flex: none;
    }
    .ptab {
      flex: 1;
      padding: 12px 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--muted);
      text-align: center;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ptab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      background: var(--panel);
    }
    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .card {
      background: var(--panel2);
      border: 1px solid var(--line);
      border-radius: var(--r);
      padding: 14px;
    }
    .sec-h {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .sec-h svg { width: 14px; height: 14px; color: var(--accent); }

    .quick-form {
      display: flex;
      gap: 8px;
    }
    .input-wrap {
      flex: 1;
      display: flex;
      background: var(--panel);
      border: 1px solid var(--line2);
      border-radius: var(--r);
      overflow: hidden;
    }
    .input-wrap input {
      flex: 1;
      padding: 10px 12px;
      border: none;
      background: none;
      outline: none;
      font-size: 13.5px;
    }
    .weight-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      background: var(--bg2);
      border-left: 1px solid var(--line);
      font-size: 11px;
      color: var(--muted);
    }
    .weight-wrap input {
      width: 32px;
      background: none;
      border: none;
      color: var(--accent);
      font-weight: 700;
      font-family: var(--font-mono);
      text-align: center;
      outline: none;
    }

    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .tag-chip {
      padding: 4px 8px;
      background: rgba(0, 240, 255, 0.06);
      border: 1px solid var(--line);
      border-radius: 12px;
      font-size: 11px;
      color: var(--ink);
      cursor: pointer;
      transition: all 0.15s;
    }
    .tag-chip:hover {
      background: var(--line2);
      border-color: var(--accent);
      color: var(--accent);
    }

    .bulk-textarea {
      width: 100%;
      height: 80px;
      background: var(--panel);
      border: 1px solid var(--line2);
      border-radius: var(--r);
      padding: 10px;
      font-size: 12px;
      font-family: var(--font-mono);
      resize: vertical;
      outline: none;
      margin-bottom: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      background: var(--panel2);
      border: 1px solid var(--line2);
      border-radius: var(--r);
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
      transition: all 0.2s var(--ease);
      cursor: pointer;
    }
    .btn:hover { background: var(--line2); border-color: var(--accent); }
    .btn.primary {
      background: var(--accent);
      color: #070b14;
      border-color: var(--accent);
      font-weight: 700;
      box-shadow: 0 0 12px var(--glow-soft);
    }
    .btn.primary:hover { background: var(--accent2); box-shadow: 0 0 16px var(--glow); }
    .btn.danger { color: var(--danger); border-color: rgba(255, 77, 109, 0.4); }
    .btn.danger:hover { background: rgba(255, 77, 109, 0.15); }
    .btn.sm { padding: 6px 10px; font-size: 11.5px; }

    /* OPTION LIST */
    .opt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--r);
      margin-bottom: 6px;
      transition: all 0.15s;
    }
    .opt-row.disabled { opacity: 0.45; }
    .opt-chk {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      border: 1.5px solid var(--line2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      font-weight: 800;
      flex: none;
    }
    .opt-chk.on { background: var(--accent); border-color: var(--accent); color: #070b14; }
    .opt-color {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      border: 1px solid rgba(0,0,0,0.4);
      cursor: pointer;
      position: relative;
      flex: none;
    }
    .opt-color input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .opt-label {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      border: none;
      background: none;
      outline: none;
      color: var(--ink);
      min-width: 0;
    }
    .opt-label:focus {
      background: rgba(0, 240, 255, 0.08);
      border-radius: 4px;
      padding: 2px 4px;
    }
    .opt-w {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--muted);
      flex: none;
    }
    .opt-w button {
      width: 20px;
      height: 20px;
      background: var(--panel2);
      border: 1px solid var(--line);
      border-radius: 3px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .opt-del {
      color: var(--muted);
      cursor: pointer;
      padding: 4px;
      font-size: 14px;
      flex: none;
    }
    .opt-del:hover { color: var(--danger); }

    /* PRESETS */
    .preset-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .preset-btn {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--r);
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
    }
    .preset-btn:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 12px var(--glow-soft); }
    .preset-btn b { font-size: 12.5px; }
    .preset-btn small { font-size: 10.5px; color: var(--muted); }

    /* STATS */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .kpi {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--r);
      padding: 8px 4px;
      text-align: center;
    }
    .kpi b { font-size: 16px; color: var(--accent); font-family: var(--font-mono); display: block; }
    .kpi small { font-size: 9px; color: var(--muted); }

    .podium-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .podium-fill-wrap {
      flex: 1;
      height: 14px;
      background: var(--bg2);
      border-radius: 7px;
      overflow: hidden;
    }
    .podium-fill {
      height: 100%;
      border-radius: 7px;
      transition: width 0.4s var(--ease);
    }

    /* FEED */
    .feed-box {
      margin-top: auto;
      padding: 8px 12px;
      background: var(--bg2);
      border-top: 1px solid var(--line);
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* WHEEL ARENA */
    #arena {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    #confettiCanvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 50;
      width: 100%;
      height: 100%;
    }
    .arena-head {
      position: relative;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      flex: none;
    }
    .tag {
      font-size: 10.5px;
      font-family: var(--font-mono);
      letter-spacing: 1.5px;
      color: var(--muted);
    }
    .chipst {
      display: flex;
      gap: 8px;
    }
    .stchip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: var(--panel2);
      border: 1px solid var(--line);
      border-radius: 14px;
      font-size: 11px;
      color: var(--ink);
    }
    .stchip.on {
      border-color: var(--accent);
      color: var(--accent);
      box-shadow: 0 0 8px var(--glow-soft);
    }
    .led {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ok);
      box-shadow: 0 0 6px var(--ok);
    }
    .led.busy { background: var(--warn); box-shadow: 0 0 6px var(--warn); }

    .wheel-stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      perspective: 1200px;
      overflow: hidden;
      min-height: 200px;
    }
    .wheel-stack {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s var(--ease);
    }
    .wheel-stack.clutch {
      transform: scale(1.04);
    }
    .wheel-shadow {
      position: absolute;
      inset: -6%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,0,0,0.6) 50%, transparent 72%);
      z-index: 1;
      pointer-events: none;
    }
    .wheel-tilt {
      position: relative;
      z-index: 2;
      transform-style: preserve-3d;
      transition: transform 0.1s linear;
    }
    .wheel-wrap {
      position: relative;
      border-radius: 50%;
    }
    #wheelCanvas {
      display: block;
      border-radius: 50%;
    }
    #hubWrap {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      border-radius: 50%;
    }
    #hubBtn {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle, var(--panel2) 40%, var(--bg) 95%);
      border: 3px solid var(--accent);
      box-shadow: 0 0 24px var(--glow);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      color: var(--accent);
      font-family: var(--font-display);
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s var(--ease);
    }
    #hubBtn svg { width: 22px; height: 22px; }
    #hubBtn span { font-size: 13px; letter-spacing: 1.5px; }
    #hubBtn:hover { transform: scale(1.06); box-shadow: 0 0 32px var(--glow); }
    #hubBtn.busy { pointer-events: none; transform: scale(0.96); filter: brightness(0.9); }
    #hubBtn.off { opacity: 0.3; pointer-events: none; }

    #pointer {
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      pointer-events: none;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.7));
      transition: transform 0.08s ease;
    }
    #pointer.tick {
      transform: translateX(-50%) rotate(-14deg) scale(1.1);
    }

    .arena-footer {
      position: relative;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 16px;
      background: var(--panel);
      border-top: 1px solid var(--line);
      flex: none;
    }
    .ticker {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--muted);
      overflow: hidden;
    }
    .ticker svg { width: 14px; height: 14px; color: var(--accent); flex: none; }
    #tickerTxt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .powered-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: var(--panel2);
      border: 1px solid var(--line2);
      border-radius: 16px;
      font-size: 9px;
      letter-spacing: 1px;
      font-weight: 800;
      color: var(--muted);
      flex: none;
      backdrop-filter: blur(6px);
    }
    .di-brand-chip {
      background: color-mix(in srgb, var(--accent) 20%, #070b14);
      color: var(--accent);
      border: 1px solid var(--accent);
      border-radius: 8px;
      padding: 1px 6px;
      font-size: 10.5px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .di-pulse-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--ok);
      box-shadow: 0 0 5px var(--ok);
    }

    /* MODALS */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(4, 8, 16, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal.open { display: flex; }
    .mcard {
      position: relative;
      width: 100%;
      max-width: 480px;
      background: var(--panel);
      border: 1px solid var(--line2);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.8);
      max-height: 90vh;
      overflow-y: auto;
    }
    .mclose {
      position: absolute;
      top: 14px;
      right: 14px;
    }

    /* WIN MODAL */
    .win-card {
      text-align: center;
      border-color: var(--wc, var(--accent));
      box-shadow: 0 0 60px rgba(0, 240, 255, 0.25);
    }
    .win-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      background: var(--panel2);
      border: 1px solid var(--line2);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--accent);
      margin-bottom: 12px;
    }
    #winSlang {
      font-size: 18px;
      font-weight: 800;
      color: var(--accent2);
      font-family: var(--font-display);
      margin-bottom: 8px;
    }
    #winLabel {
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      font-family: var(--font-display);
      text-shadow: 0 0 20px var(--wc, var(--accent));
      margin: 12px 0;
      word-break: break-word;
    }
    #winTime {
      font-size: 11.5px;
      color: var(--muted);
      font-family: var(--font-mono);
      margin-bottom: 20px;
    }
    .win-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* TOASTS */
    #toasts {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 120;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: var(--panel2);
      border: 1px solid var(--line2);
      border-left: 3px solid var(--accent);
      border-radius: var(--r);
      font-size: 12.5px;
      font-weight: 600;
      box-shadow: var(--shadow);
      animation: toastIn 0.3s var(--ease);
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(30px); } }

    /* RESPONSIVE */
    @media (max-width: 860px) {
      #topHud {
        height: 52px;
        padding: 0 10px;
        gap: 8px;
      }
      .wheel-params-hamburger {
        display: inline-flex;
      }
      .panel-drawer-backdrop {
        display: block;
      }
      .panel-drawer-header {
        display: flex;
      }
      #main {
        display: block;
        position: relative;
        height: calc(100% - 52px);
        overflow: hidden;
      }
      #panel {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: min(88vw, 400px) !important;
        height: 100% !important;
        z-index: 120 !important;
        box-shadow: 20px 0 60px rgba(0,0,0,0.9) !important;
        transform: translateX(-105%) !important;
        transition: transform 0.3s cubic-bezier(0.16,1,0.3,1) !important;
        display: flex !important;
      }
      #panel.drawer-open {
        transform: translateX(0) !important;
        box-shadow: 0 0 50px rgba(0, 240, 255, 0.2), 20px 0 60px rgba(0,0,0,0.9) !important;
      }
      #arena {
        display: flex !important;
        width: 100% !important;
        height: 100% !important;
      }
      .hud-group.themes {
        display: none;
      }
      .logo-txt small { display: none; }
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="bg-grid"></div>
    <div class="bg-glow"></div>

    <!-- TOP HUD -->
    <header id="topHud">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9.4" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" />
          <path d="M13.2 5.5 7.5 13h4l-1 5.5L16.5 11h-4z" fill="var(--accent)" />
        </svg>
        <div class="logo-txt">
          <b>DI SPIN</b>
          <small>ELITE · DECISION WHEEL</small>
        </div>
      </div>

      <button class="ibtn wheel-params-hamburger" id="wheelHamburgerBtn" onclick="toggleDrawer()" title="Paramètres et options de la roue">
        <span class="hamburger-lines" id="hamburgerLines"><span class="h-line l1"></span><span class="h-line l2"></span><span class="h-line l3"></span></span>
        <span style="font-size:12px">⚙️</span>
      </button>

      <div class="hud-spacer"></div>

      <div class="hud-group themes" id="themeBar">
        <span class="hud-label">THÈMES</span>
        <button class="theme-dot on" data-th="cyber" onclick="setTheme('cyber')"><i style="background:linear-gradient(135deg,#070b14,#00f0ff)"></i></button>
        <button class="theme-dot" data-th="dark" onclick="setTheme('dark')"><i style="background:linear-gradient(135deg,#000,#fff)"></i></button>
        <button class="theme-dot" data-th="light" onclick="setTheme('light')"><i style="background:linear-gradient(135deg,#fff,#0077ff)"></i></button>
        <button class="theme-dot" data-th="synthwave" onclick="setTheme('synthwave')"><i style="background:linear-gradient(135deg,#0f031e,#ff007f)"></i></button>
        <button class="theme-dot" data-th="matrix" onclick="setTheme('matrix')"><i style="background:linear-gradient(135deg,#020b05,#00ff66)"></i></button>
        <button class="theme-dot" data-th="gold" onclick="setTheme('gold')"><i style="background:linear-gradient(135deg,#0d0c0a,#ffd700)"></i></button>
      </div>

      <div class="hud-group" id="volGroup">
        <button class="ibtn" id="volBtn" onclick="toggleMute()" style="padding:0;width:24px;border:none;background:none">🔊</button>
        <input type="range" id="volSlider" min="0" max="100" value="70" oninput="setVolume(this.value)" />
      </div>

      <button class="ibtn" id="langBtn" onclick="toggleLang()">
        <span id="langTxt">FR</span>
      </button>

      <!-- Download Standalone HTML Button -->
      <button class="ibtn primary" id="exportBtn" onclick="openModal('exportModal')" title="HTML Hors-ligne (Télécharger ou copier la version autonome)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      <button class="ibtn" onclick="openModal('setModal')" title="Réglages">
        ⚙️
      </button>

      <button class="ibtn" onclick="toggleFullscreen()" title="Plein écran">
        ⛶
      </button>
    </header>

    <!-- MOBILE DRAWER BACKDROP -->
    <div class="panel-drawer-backdrop" id="drawerBackdrop" onclick="closeDrawer()"></div>

    <!-- MAIN CONTAINER -->
    <main id="main">
      <!-- CONTROL PANEL -->
      <aside id="panel">
        <div class="panel-drawer-header">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:16px">⚙️</span>
            <div>
              <b style="font-size:13px">Paramètres de la Roue</b>
              <div style="font-size:10px;color:var(--muted)">DI SPIN · Options</div>
            </div>
          </div>
          <button class="panel-drawer-close-btn" onclick="closeDrawer()">✕ Fermer</button>
        </div>

        <div class="panel-tabs">
          <button class="ptab active" onclick="switchTab('add')">Ajouter</button>
          <button class="ptab" onclick="switchTab('presets')">Presets</button>
          <button class="ptab" onclick="switchTab('list')">Liste (<span id="tabCount">0</span>)</button>
          <button class="ptab" onclick="switchTab('stats')">Stats</button>
        </div>

        <div class="panel-body" id="tabContent">
          <!-- Dynamically populated by JS -->
        </div>

        <div class="feed-box" id="feedBox">
          <span style="color:var(--accent);">⚡</span>
          <span id="feedTxt">DI SPIN ELITE prêt.</span>
        </div>
      </aside>

      <!-- WHEEL ARENA -->
      <section id="arena">
        <canvas id="confettiCanvas"></canvas>

        <div class="arena-head">
          <span class="tag">ARÈNE PRINCIPALE // WHEEL-CORE v4.1 (VANILLA)</span>
          <div class="chipst">
            <button class="stchip" id="modeChip" onclick="toggleElimMode()">
              🔄 <b id="modeChipTxt">CLASSIQUE</b>
            </button>
            <div class="stchip">
              ⚡ <b id="chipSpins">0</b>
            </div>
            <div class="stchip">
              <span class="led" id="lockLed"></span>
              <span id="lockTxt">PRÊT</span>
            </div>
            <div class="stchip">
              <b id="fpsChip">60</b> FPS
            </div>
          </div>
        </div>

        <div class="wheel-stage" id="wheelStage">
          <div class="wheel-stack" id="wheelStack">
            <div class="wheel-shadow"></div>
            <div class="wheel-tilt" id="wheelTilt">
              <div class="wheel-wrap" id="wheelWrap">
                <canvas id="wheelCanvas"></canvas>
                <div id="hubWrap">
                  <button id="hubBtn" onclick="spinWheel()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                    </svg>
                    <span>SPIN</span>
                  </button>
                </div>
              </div>
            </div>
            <div id="pointer">
              <svg width="42" height="48" viewBox="0 0 64 72" fill="none">
                <path d="M32 70 7 14c-2-6 3-11 9-9l16 6 16-6c6-2 11 3 9 9L32 70z" fill="var(--accent)" stroke="rgba(0,0,0,0.5)" stroke-width="2" />
                <circle cx="32" cy="16" r="5" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
              </svg>
            </div>
          </div>
        </div>

        <footer class="arena-footer">
          <div class="ticker">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span id="tickerTxt">Bienvenue sur DI SPIN ELITE (Version HTML Vanilla Autonome).</span>
          </div>
          <div class="powered-badge" title="Propulsé par DI">
            <span>PROPULSÉ PAR</span>
            <div class="di-brand-chip">
              <span>DI</span>
              <span class="di-pulse-dot"></span>
            </div>
          </div>
        </footer>
      </section>
    </main>

    <!-- WINNER MODAL -->
    <div class="modal" id="winModal">
      <div class="mcard win-card" id="winCard">
        <button class="ibtn mclose" onclick="closeModal('winModal')">✕</button>
        <div class="win-badge">⚡ RÉSULTAT OFFICIEL</div>
        <div id="winSlang">ON EST ENSEMBLE !</div>
        <div id="winLabel">NDOLÉ</div>
        <div id="winTime">Tirage officiel — 20:00:00</div>
        <div class="win-actions">
          <button class="btn primary" id="winSpinAgainBtn" onclick="spinAgain()">🔄 Rejouer <span style="opacity:0.6">[R]</span></button>
          <button class="btn danger" id="winRemoveBtn" onclick="removeWinnerAction()">🗑️ Retirer <span style="opacity:0.6">[S]</span></button>
          <button class="btn" onclick="closeModal('winModal')">Conserver / Fermer <span style="opacity:0.6">[Échap]</span></button>
        </div>
      </div>
    </div>

    <!-- SETTINGS MODAL -->
    <div class="modal" id="setModal">
      <div class="mcard">
        <button class="ibtn mclose" onclick="closeModal('setModal')">✕</button>
        <div class="sec-h">⚙️ Réglages Système</div>
        <div style="display:flex;flex-direction:column;gap:12px;margin:16px 0;">
          <label style="display:flex;justify-content:space-between;align-items:center;font-size:13px;cursor:pointer;">
            <span>Mode Élimination</span>
            <input type="checkbox" id="setElim" onchange="settings.elim = this.checked; saveLocal(); updateHudChips();" />
          </label>
          <label style="display:flex;justify-content:space-between;align-items:center;font-size:13px;cursor:pointer;">
            <span>Mode Éco (Batterie / Low-end)</span>
            <input type="checkbox" id="setEco" onchange="settings.eco = this.checked; saveLocal();" />
          </label>
          <label style="display:flex;justify-content:space-between;align-items:center;font-size:13px;cursor:pointer;">
            <span>Photo Finish (Ralenti dramatique)</span>
            <input type="checkbox" id="setClutch" onchange="settings.clutch = this.checked; saveLocal();" />
          </label>
          <hr style="border:none;border-top:1px solid var(--line);" />
          <button class="btn primary" onclick="closeModal('setModal'); openModal('exportModal');">📥 Télécharger ou Copier le code HTML</button>
          <button class="btn danger" onclick="purgeAllData()">⚠️ Réinitialiser toutes les données locales</button>
        </div>
      </div>
    </div>

    <!-- EXPORT MODAL -->
    <div class="modal" id="exportModal">
      <div class="mcard" style="max-width:500px;">
        <button class="ibtn mclose" onclick="closeModal('exportModal')">✕</button>
        <div class="sec-h" style="color:var(--accent);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Exporter Version HTML Autonome</span>
        </div>
        <p style="font-size:13px;line-height:1.6;color:var(--muted);margin-bottom:16px;">
          Cette version contient 100% du moteur (Vanilla JS, Web Audio API, Canvas 3D, tous vos choix et réglages actuels). Fonctionne hors-ligne sans aucun serveur !
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn primary" style="flex:1 1 200px;padding:12px;" onclick="exportSelfHtml()">
            📥 Télécharger .HTML
          </button>
          <button class="btn" style="flex:1 1 140px;padding:12px;" onclick="copySelfSource()">
            📋 Copier le code
          </button>
        </div>
      </div>
    </div>

    <div id="toasts"></div>
  </div>

  <script>
    // Embedded Data & State
    const RAW_OPTIONS = ${optionsJson};
    const RAW_PROFILES = ${profilesJson};
    const RAW_SETTINGS = ${settingsJson};
    const PRESETS = ${presetsJson};
    const THEMES = ${themesJson};
    const FX_CONFIGS = ${fxConfigsJson};
    const PALETTE = ${paletteJson};
    const STR = ${translationsJson};
    const CM_WIN = ${cmWinJson};

    let undoStack = [];

    let state = {
      lang: localStorage.getItem('gse_lang') || '${currentLang}',
      theme: localStorage.getItem('gse_theme') || '${currentTheme}',
      options: JSON.parse(localStorage.getItem('gse_opts') || JSON.stringify(RAW_OPTIONS)),
      profiles: JSON.parse(localStorage.getItem('gse_profs') || JSON.stringify(RAW_PROFILES)),
      stats: JSON.parse(localStorage.getItem('gse_stats') || '{}'),
      history: JSON.parse(localStorage.getItem('gse_hist') || '[]'),
      settings: JSON.parse(localStorage.getItem('gse_set') || JSON.stringify(RAW_SETTINGS)),
      activeTab: 'add',
      sessionSpins: 0,
      spinning: false,
      currentWinner: null
    };

    let settings = state.settings;

    // Web Audio Synthesizer
    let audioCtx = null;
    let masterGain = null;
    function getAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = settings.muted ? 0 : settings.volume;
        masterGain.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }
    function playTone(freq, dur, type='sine', gVal=0.2) {
      if (settings.muted) return;
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(gVal, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}
    }
    function playWhoosh() {
      if (settings.muted) return;
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.4);
        g.gain.setValueAtTime(0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {}
    }
    function playTick() {
      playTone(650 + Math.random() * 220, 0.035, 'square', 0.15);
    }
    function playWin() {
      [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playTone(f, 0.35, 'triangle', 0.25), i * 90));
    }
    function playClick() {
      playTone(850, 0.03, 'sine', 0.12);
    }
    function playDelete() {
      playTone(220, 0.1, 'sawtooth', 0.18);
    }

    // State Helpers & Undo
    function pushSnapshot() {
      undoStack.push(JSON.stringify(state.options));
      if (undoStack.length > 20) undoStack.shift();
    }
    function popUndo() {
      if (!undoStack.length) return;
      state.options = JSON.parse(undoStack.pop());
      saveLocal();
      renderTab();
      toast('Action annulée ↩️');
      playClick();
    }

    function saveLocal() {
      localStorage.setItem('gse_opts', JSON.stringify(state.options));
      localStorage.setItem('gse_profs', JSON.stringify(state.profiles));
      localStorage.setItem('gse_stats', JSON.stringify(state.stats));
      localStorage.setItem('gse_hist', JSON.stringify(state.history));
      localStorage.setItem('gse_set', JSON.stringify(state.settings));
      localStorage.setItem('gse_theme', state.theme);
      localStorage.setItem('gse_lang', state.lang);
      updateTabCount();
      buildLayers();
    }

    function logFeed(txt) {
      const el = document.getElementById('feedTxt');
      if (el) el.textContent = txt;
    }

    function toast(msg) {
      const el = document.createElement('div');
      el.className = 'toast';
      el.textContent = msg;
      document.getElementById('toasts').appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }

    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    // Themes & HUD
    function setTheme(th) {
      state.theme = th;
      document.documentElement.dataset.theme = th;
      document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('on', d.dataset.th === th));
      saveLocal();
      logFeed('Thème : ' + th);
      toast('Thème activé : ' + th);
    }
    function toggleLang() {
      state.lang = state.lang === 'fr' ? 'en' : 'fr';
      document.getElementById('langTxt').textContent = state.lang.toUpperCase();
      saveLocal();
      renderTab();
      toast('Langue : ' + (state.lang === 'fr' ? 'Français' : 'English'));
    }
    function setVolume(v) {
      settings.volume = v / 100;
      settings.muted = false;
      if (masterGain) masterGain.gain.value = settings.volume;
      saveLocal();
    }
    function toggleMute() {
      settings.muted = !settings.muted;
      if (masterGain) masterGain.gain.value = settings.muted ? 0 : settings.volume;
      document.getElementById('volBtn').textContent = settings.muted ? '🔇' : '🔊';
      toast(settings.muted ? 'Son coupé' : 'Son activé');
      saveLocal();
    }
    function toggleElimMode() {
      settings.elim = !settings.elim;
      updateHudChips();
      toast(settings.elim ? 'Mode Élimination activé 🎯' : 'Mode Classique 🔄');
      logFeed(settings.elim ? 'Mode élimination activé' : 'Mode classique activé');
      saveLocal();
    }
    function updateHudChips() {
      document.getElementById('modeChipTxt').textContent = settings.elim ? 'ÉLIMINATION' : 'CLASSIQUE';
      document.getElementById('modeChip').classList.toggle('on', settings.elim);
      document.getElementById('chipSpins').textContent = state.sessionSpins;
      document.getElementById('setElim').checked = settings.elim;
      document.getElementById('setEco').checked = settings.eco;
      document.getElementById('setClutch').checked = settings.clutch;
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }

    function toggleDrawer() {
      const p = document.getElementById('panel');
      const b = document.getElementById('drawerBackdrop');
      const h = document.getElementById('hamburgerLines');
      const btn = document.getElementById('wheelHamburgerBtn');
      const isOpen = p ? p.classList.toggle('drawer-open') : false;
      if (b) b.classList.toggle('open', isOpen);
      if (h) h.classList.toggle('open', isOpen);
      if (btn) btn.classList.toggle('active', isOpen);
      playClick();
    }

    function closeDrawer() {
      const p = document.getElementById('panel');
      const b = document.getElementById('drawerBackdrop');
      const h = document.getElementById('hamburgerLines');
      const btn = document.getElementById('wheelHamburgerBtn');
      if (p) p.classList.remove('drawer-open');
      if (b) b.classList.remove('open');
      if (h) h.classList.remove('open');
      if (btn) btn.classList.remove('active');
    }

    // Tabs & Panel
    function switchTab(tab) {
      state.activeTab = tab;
      document.querySelectorAll('.ptab').forEach((p, i) => {
        p.classList.toggle('active', ['add','presets','list','stats'][i] === tab);
      });
      renderTab();
    }
    function updateTabCount() {
      const active = state.options.filter(o => o.enabled).length;
      document.getElementById('tabCount').textContent = active + '/' + state.options.length;
    }

    function renderTab() {
      const c = document.getElementById('tabContent');
      updateTabCount();

      if (state.activeTab === 'add') {
        c.innerHTML = \`
          <div class="card">
            <div class="sec-h">⚡ Saisie Rapide</div>
            <div class="quick-form">
              <div class="input-wrap">
                <input type="text" id="newOptInput" placeholder="Ex. Ndolé, Poulet DG..." onkeydown="if(event.key==='Enter')addOption()" />
                <div class="weight-wrap">
                  <span>Poids</span>
                  <input type="number" id="newOptWeight" value="1" min="1" max="10" />
                </div>
              </div>
              <button class="btn primary" onclick="addOption()">Ajouter</button>
            </div>
            <div class="chips-row">
              \${['Ndolé','Poulet DG','Safou','Bissap','Makossa','Kribi','Soja','Mokolo'].map(w => \`<span class="tag-chip" onclick="quickAddChip('\${w}')">+ \${w}</span>\`).join('')}
            </div>
          </div>

          <div class="card">
            <div class="sec-h">📝 Ajout en Masse</div>
            <textarea class="bulk-textarea" id="bulkInput" placeholder="Collez plusieurs choix (un par ligne)..."></textarea>
            <button class="btn sm primary" style="width:100%;" onclick="addBulkOptions()">⚡ Importer la liste</button>
          </div>

          <div class="card">
            <div class="sec-h">💡 Actions Rapides</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn sm" onclick="shuffleOptions()">🔀 Mélanger</button>
              <button class="btn sm" onclick="toggleAll(true)">☑️ Tout cocher</button>
              <button class="btn sm" onclick="toggleAll(false)">⬜ Tout décocher</button>
              <button class="btn sm" onclick="popUndo()">↩️ Annuler</button>
              <button class="btn sm danger" onclick="clearOptions()">🗑️ Vider</button>
            </div>
          </div>

          <div class="card">
            <div class="sec-h">💾 Profils Enregistrés</div>
            <div style="display:flex;gap:6px;margin-bottom:10px;">
              <input type="text" id="profNameInput" placeholder="Nom du profil..." style="flex:1;padding:8px;background:var(--panel);border:1px solid var(--line2);border-radius:var(--r);" />
              <button class="btn sm primary" onclick="saveCurrentProfile()">Enregistrer</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              \${!state.profiles.length ? '<p style="font-size:11px;color:var(--muted)">Aucun profil enregistré.</p>' : state.profiles.map((p, i) => \`
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--panel);border:1px solid var(--line);border-radius:6px;font-size:12px;">
                  <b>\${p.name} <small style="color:var(--muted);font-weight:normal;">(\${p.options.length})</small></b>
                  <div style="display:flex;gap:4px;">
                    <button class="btn sm" onclick="loadProfile(\${i})">Charger</button>
                    <button class="btn sm danger" onclick="deleteProfile(\${i})">✕</button>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else if (state.activeTab === 'presets') {
        let h = '<div class="card"><div class="sec-h">🇨🇲 Presets & Thématiques</div><div class="preset-grid">';
        PRESETS.forEach((p, idx) => {
          h += \`<button class="preset-btn" onclick="loadPreset(\${idx})">
            <b>\${p.n.fr || p.n.en}</b>
            <small>\${p.o.length} options · \${p.d?.fr || 'Sélection'}</small>
          </button>\`;
        });
        h += '</div></div>';
        c.innerHTML = h;
      } else if (state.activeTab === 'list') {
        let h = '<div class="card"><div class="sec-h">📋 Options Actuelles</div>';
        if (!state.options.length) {
          h += '<p style="font-size:12px;color:var(--muted)">Aucune option sur la roue. Ajoutez-en depuis l\\'onglet Ajouter !</p>';
        } else {
          state.options.forEach((o, i) => {
            h += \`<div class="opt-row \${!o.enabled ? 'disabled' : ''}">
              <div class="opt-chk \${o.enabled ? 'on' : ''}" onclick="toggleOpt(\${i})">\${o.enabled ? '✓' : ''}</div>
              <div class="opt-color" style="background:\${o.color}">
                <input type="color" value="\${o.color}" onchange="changeColor(\${i}, this.value)" />
              </div>
              <input class="opt-label" value="\${o.label}" onchange="renameOpt(\${i}, this.value)" />
              <div class="opt-w">
                <button onclick="changeWeight(\${i}, -1)">-</button>
                <b>\${o.weight || 1}</b>
                <button onclick="changeWeight(\${i}, 1)">+</button>
              </div>
              <span class="opt-del" onclick="deleteOpt(\${i})">✕</span>
            </div>\`;
          });
        }
        h += '</div>';
        c.innerHTML = h;
      } else if (state.activeTab === 'stats') {
        const total = Object.values(state.stats).reduce((s, v) => s + (v.w || 0), 0);
        let h = \`
          <div class="card">
            <div class="sec-h">📊 Statistiques de Jeu</div>
            <div class="kpi-row">
              <div class="kpi"><b>\${state.sessionSpins}</b><small>Session</small></div>
              <div class="kpi"><b>\${total}</b><small>Total</small></div>
              <div class="kpi"><b>\${state.options.length}</b><small>Options</small></div>
              <div class="kpi"><b>\${state.options.filter(o=>o.enabled).length}</b><small>Actifs</small></div>
            </div>
            <div class="sec-h" style="margin-top:14px;">🏆 Palmarès des Gagnants</div>
        \`;
        const entries = Object.entries(state.stats).sort((a,b) => b[1].w - a[1].w).slice(0, 8);
        if (!entries.length) {
          h += '<p style="font-size:12px;color:var(--muted)">Aucun tirage enregistré pour le moment.</p>';
        } else {
          const maxW = Math.max(1, ...entries.map(e => e[1].w));
          entries.forEach(([label, dat]) => {
            const pct = Math.round((dat.w / maxW) * 100);
            h += \`<div class="podium-bar">
              <span style="width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;">\${label}</span>
              <div class="podium-fill-wrap"><div class="podium-fill" style="width:\${pct}%;background:\${dat.color}"></div></div>
              <b>\${dat.w}</b>
            </div>\`;
          });
          h += \`<button class="btn sm danger" style="margin-top:12px;width:100%;" onclick="clearStats()">Effacer l'historique</button>\`;
        }
        h += '</div>';
        c.innerHTML = h;
      }
    }

    // Option Operations
    function addOption() {
      const inp = document.getElementById('newOptInput');
      const wInp = document.getElementById('newOptWeight');
      if (!inp || !inp.value.trim()) return;
      pushSnapshot();
      state.options.push({
        id: Date.now() + Math.random().toString(),
        label: inp.value.trim(),
        weight: Math.max(1, Math.min(10, parseInt(wInp.value) || 1)),
        enabled: true,
        color: PALETTE[state.options.length % PALETTE.length]
      });
      logFeed('Ajout : ' + inp.value.trim());
      inp.value = '';
      saveLocal();
      renderTab();
      toast('Option ajoutée ⚡');
      playClick();
    }
    function quickAddChip(txt) {
      pushSnapshot();
      state.options.push({
        id: Date.now() + Math.random().toString(),
        label: txt,
        weight: 1,
        enabled: true,
        color: PALETTE[state.options.length % PALETTE.length]
      });
      logFeed('Ajout rapide : ' + txt);
      saveLocal();
      renderTab();
      toast('Ajouté : ' + txt);
      playClick();
    }
    function addBulkOptions() {
      const ta = document.getElementById('bulkInput');
      if (!ta || !ta.value.trim()) return;
      pushSnapshot();
      const lines = ta.value.split('\\n').map(l => l.trim()).filter(Boolean);
      lines.forEach((l, idx) => {
        state.options.push({
          id: Date.now() + '-' + idx,
          label: l,
          weight: 1,
          enabled: true,
          color: PALETTE[(state.options.length + idx) % PALETTE.length]
        });
      });
      ta.value = '';
      saveLocal();
      renderTab();
      toast(lines.length + ' options importées !');
      playClick();
    }
    function toggleOpt(i) {
      state.options[i].enabled = !state.options[i].enabled;
      saveLocal();
      renderTab();
    }
    function changeColor(i, c) {
      state.options[i].color = c;
      saveLocal();
      renderTab();
    }
    function renameOpt(i, l) {
      state.options[i].label = l;
      saveLocal();
    }
    function changeWeight(i, d) {
      state.options[i].weight = Math.max(1, Math.min(10, (state.options[i].weight || 1) + d));
      saveLocal();
      renderTab();
    }
    function deleteOpt(i) {
      pushSnapshot();
      const rem = state.options.splice(i, 1);
      logFeed('Supprimé : ' + (rem[0]?.label || ''));
      saveLocal();
      renderTab();
      toast('Option supprimée');
      playDelete();
    }
    function toggleAll(en) {
      pushSnapshot();
      state.options.forEach(o => o.enabled = en);
      saveLocal();
      renderTab();
      toast(en ? 'Tout coché' : 'Tout décoché');
    }
    function shuffleOptions() {
      pushSnapshot();
      for (let i = state.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.options[i], state.options[j]] = [state.options[j], state.options[i]];
      }
      saveLocal();
      renderTab();
      toast('Roue mélangée 🔀');
      playClick();
    }
    function clearOptions() {
      pushSnapshot();
      state.options = [];
      saveLocal();
      renderTab();
      toast('Roue vidée');
      playDelete();
    }
    function loadPreset(idx) {
      pushSnapshot();
      const p = PRESETS[idx];
      state.options = p.o.map(([lbl, col]) => ({
        id: Date.now() + Math.random().toString(),
        label: lbl,
        color: col,
        enabled: true,
        weight: 1
      }));
      saveLocal();
      renderTab();
      toast('Preset chargé : ' + (p.n.fr || p.n.en));
      logFeed('Preset chargé : ' + (p.n.fr || p.n.en));
      playWin();
    }
    function saveCurrentProfile() {
      const inp = document.getElementById('profNameInput');
      const name = inp?.value?.trim() || 'Profil ' + (state.profiles.length + 1);
      state.profiles.push({
        id: Date.now() + '',
        name,
        options: JSON.parse(JSON.stringify(state.options)),
        created: Date.now()
      });
      if (inp) inp.value = '';
      saveLocal();
      renderTab();
      toast('Profil enregistré : ' + name);
      playClick();
    }
    function loadProfile(idx) {
      pushSnapshot();
      const p = state.profiles[idx];
      if (!p) return;
      state.options = JSON.parse(JSON.stringify(p.options));
      saveLocal();
      renderTab();
      toast('Profil chargé : ' + p.name);
      playWin();
    }
    function deleteProfile(idx) {
      state.profiles.splice(idx, 1);
      saveLocal();
      renderTab();
      toast('Profil supprimé');
    }
    function clearStats() {
      state.stats = {};
      state.sessionSpins = 0;
      saveLocal();
      renderTab();
      updateHudChips();
      toast('Statistiques réinitialisées');
    }
    function purgeAllData() {
      if (confirm('Effacer toutes les données locales et réinitialiser ?')) {
        localStorage.clear();
        location.reload();
      }
    }

    // Export Self & Copy Code
    function exportSelfHtml() {
      const fullDoc = document.documentElement.outerHTML;
      const htmlContent = '<!DOCTYPE html>\\n' + fullDoc;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'di-spin-elite-standalone.html';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Fichier HTML autonome téléchargé ! 📥');
      closeModal('exportModal');
    }

    function copySelfSource() {
      const fullDoc = document.documentElement.outerHTML;
      const htmlContent = '<!DOCTYPE html>\\n' + fullDoc;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(htmlContent).then(() => {
          toast('Code source HTML copié ! ✓');
          closeModal('exportModal');
        }).catch(() => fallbackCopy(htmlContent));
      } else {
        fallbackCopy(htmlContent);
      }
    }
    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        toast('Code source HTML copié ! ✓');
        closeModal('exportModal');
      } catch (e) {
        toast('Erreur lors de la copie');
      }
      document.body.removeChild(ta);
    }

    // 3D Canvas Wheel Engine
    const RAD = Math.PI / 180;
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    let wheelSize = 380;
    let curRot = Math.random() * 360;
    let lastTickAngle = 0;

    let offLayerBot = null;
    let offLayerRot = null;
    let offLayerTop = null;

    function contrastOn(hex) {
      const n = parseInt(hex.slice(1), 16);
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      return (0.299 * r + 0.587 * g + 0.114 * b > 150) ? '#101822' : '#ffffff';
    }

    function resizeWheel() {
      const stage = document.getElementById('wheelStage');
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      wheelSize = Math.min(r.width * 0.88, r.height * 0.82);
      wheelSize = Math.max(220, Math.min(680, wheelSize));
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = wheelSize * dpr;
      canvas.height = wheelSize * dpr;
      canvas.style.width = wheelSize + 'px';
      canvas.style.height = wheelSize + 'px';

      const hub = document.getElementById('hubWrap');
      if (hub) {
        hub.style.width = (wheelSize * 0.27) + 'px';
        hub.style.height = (wheelSize * 0.27) + 'px';
      }

      const confCanvas = document.getElementById('confettiCanvas');
      if (confCanvas) {
        confCanvas.width = stage.clientWidth * dpr;
        confCanvas.height = stage.clientHeight * dpr;
      }

      buildLayers();
    }

    function buildLayers() {
      const dpr = window.devicePixelRatio || 1;
      const S = wheelSize;
      if (!S) return;
      const c = S / 2;
      const R = S / 2 - 2;
      const fx = FX_CONFIGS[state.theme] || FX_CONFIGS.cyber;

      const mk = () => {
        const cv = document.createElement('canvas');
        cv.width = S * dpr;
        cv.height = S * dpr;
        const g = cv.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        return [cv, g];
      };

      // Base bottom plate
      const [b, bg] = mk();
      offLayerBot = b;
      const mg = bg.createRadialGradient(c, c, R * 0.82, c, c, R);
      mg.addColorStop(0, fx.metalHi || '#2e6f9c');
      mg.addColorStop(1, fx.metalLo || '#0a1a2a');
      bg.beginPath();
      bg.arc(c, c, R, 0, Math.PI * 2);
      bg.fillStyle = mg;
      bg.fill();
      bg.lineWidth = 2;
      bg.strokeStyle = 'rgba(0,0,0,0.5)';
      bg.stroke();

      const active = state.options.filter(o => o.enabled && o.label);
      if (active.length < 2) {
        bg.beginPath();
        bg.arc(c, c, R * 0.86, 0, Math.PI * 2);
        bg.fillStyle = fx.empty || '#13253a';
        bg.fill();
        offLayerRot = null;
        offLayerTop = null;
        return;
      }

      const Ri = R * 0.88;

      // Rotating layer (segments + labels + pegs)
      const [rc, rg] = mk();
      offLayerRot = rc;
      const totalW = active.reduce((s, o) => s + (o.weight || 1), 0);
      let curA = 0;

      const segs = active.map(o => {
        const sweep = ((o.weight || 1) / totalW) * 360;
        const s = { o, start: curA, end: curA + sweep, mid: curA + sweep / 2 };
        curA += sweep;
        return s;
      });

      segs.forEach(s => {
        rg.beginPath();
        rg.moveTo(c, c);
        rg.arc(c, c, Ri, s.start * RAD, s.end * RAD);
        rg.closePath();
        rg.fillStyle = s.o.color;
        rg.fill();
        rg.lineWidth = 1.6;
        rg.strokeStyle = fx.segStroke || '#04121e';
        rg.stroke();
      });

      // Metallic Pegs
      const pr = Math.max(3, S * 0.011);
      segs.forEach(s => {
        const a = s.start * RAD;
        const x = c + Math.cos(a) * R * 0.94;
        const y = c + Math.sin(a) * R * 0.94;
        rg.beginPath();
        rg.arc(x, y, pr, 0, Math.PI * 2);
        rg.fillStyle = fx.peg || '#c8f6ff';
        rg.fill();
        rg.lineWidth = 1;
        rg.strokeStyle = 'rgba(0,0,0,0.55)';
        rg.stroke();
        rg.beginPath();
        rg.arc(x - pr * 0.3, y - pr * 0.3, pr * 0.28, 0, Math.PI * 2);
        rg.fillStyle = 'rgba(255,255,255,0.85)';
        rg.fill();
      });

      // Text Labels
      const fontD = getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'sans-serif';
      segs.forEach(s => {
        const sweep = s.end - s.start;
        const label = (s.o.label || '').toUpperCase();
        if (!label) return;
        let fs = Math.min(26, Math.max(11, S * 0.048));
        fs = Math.min(fs, Math.max(9, sweep * 1.05));
        rg.save();
        rg.translate(c, c);
        rg.rotate(s.mid * RAD);
        rg.font = '700 ' + fs + 'px ' + fontD;
        rg.textBaseline = 'middle';
        rg.fillStyle = contrastOn(s.o.color);
        const maxW = Ri * 0.55;
        let txt = label;
        while (rg.measureText(txt).width > maxW && txt.length > 2) {
          txt = txt.slice(0, -2);
        }
        if (txt !== label) txt = txt.trim() + '…';
        const nm = ((s.mid % 360) + 360) % 360;
        if (nm > 90 && nm < 270) {
          rg.rotate(Math.PI);
          rg.textAlign = 'left';
          rg.fillText(txt, -(Ri - 14), 0);
        } else {
          rg.textAlign = 'right';
          rg.fillText(txt, Ri - 14, 0);
        }
        rg.restore();
      });

      // Top overlay (lighting & reflections)
      const [tc, tg] = mk();
      offLayerTop = tc;
      const sh = tg.createRadialGradient(c, c, Ri * 0.4, c, c, Ri);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(1, 'rgba(0,0,0,0.32)');
      tg.beginPath();
      tg.arc(c, c, Ri, 0, Math.PI * 2);
      tg.fillStyle = sh;
      tg.fill();

      tg.save();
      tg.beginPath();
      tg.arc(c, c, Ri, 0, Math.PI * 2);
      tg.clip();
      const hl = tg.createLinearGradient(0, 0, S, S);
      hl.addColorStop(0, 'rgba(255,255,255,0.17)');
      hl.addColorStop(0.45, 'rgba(255,255,255,0)');
      tg.fillStyle = hl;
      tg.fillRect(0, 0, S, S);
      tg.restore();

      tg.beginPath();
      tg.arc(c, c, Ri * 0.31 + 6, 0, Math.PI * 2);
      tg.fillStyle = fx.metalLo || '#0a1a2a';
      tg.fill();
      tg.lineWidth = 2.5;
      tg.strokeStyle = fx.hubRing || '#00f0ff';
      tg.shadowColor = fx.hubRing || '#00f0ff';
      tg.shadowBlur = 14;
      tg.stroke();
    }

    function drawWheel() {
      const dpr = window.devicePixelRatio || 1;
      const S = wheelSize;
      const c = S / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);

      if (offLayerBot) ctx.drawImage(offLayerBot, 0, 0, S, S);

      if (offLayerRot) {
        ctx.save();
        ctx.translate(c, c);
        ctx.rotate(curRot * RAD);
        ctx.drawImage(offLayerRot, -c, -c, S, S);
        ctx.restore();
      }

      if (offLayerTop) ctx.drawImage(offLayerTop, 0, 0, S, S);
    }

    // Confetti System
    let confs = [];
    function burstConfetti(color) {
      const stage = document.getElementById('wheelStage');
      if (!stage) return;
      const cx = stage.clientWidth * 0.5;
      const cy = stage.clientHeight * 0.45;
      const cols = [color, '#00f0ff', '#ffd700', '#ffffff', '#ff007f'];
      confs = [];
      for (let i = 0; i < 120; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 3 + Math.random() * 9;
        confs.push({
          x: cx, y: cy,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 4,
          g: 0.2 + Math.random() * 0.1,
          w: 5 + Math.random() * 6,
          h: 3 + Math.random() * 5,
          c: cols[Math.floor(Math.random() * cols.length)],
          life: 1,
          decay: 0.008 + Math.random() * 0.008
        });
      }
    }

    function updateConfetti() {
      const confCanvas = document.getElementById('confettiCanvas');
      if (!confCanvas || !confs.length) return;
      const dpr = window.devicePixelRatio || 1;
      const g = confCanvas.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, confCanvas.width / dpr, confCanvas.height / dpr);

      for (let i = confs.length - 1; i >= 0; i--) {
        const p = confs[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        p.life -= p.decay;
        if (p.life <= 0) {
          confs.splice(i, 1);
          continue;
        }
        g.fillStyle = p.c;
        g.globalAlpha = p.life;
        g.fillRect(p.x, p.y, p.w, p.h);
      }
      g.globalAlpha = 1;
    }

    function spinWheel() {
      if (state.spinning) return;
      const active = state.options.filter(o => o.enabled && o.label);
      if (active.length < 2) {
        toast('Ajoutez au moins 2 options actives !');
        return;
      }

      getAudio();
      state.spinning = true;
      document.getElementById('hubBtn').classList.add('busy');
      document.getElementById('lockLed').classList.add('busy');
      document.getElementById('lockTxt').textContent = 'TIRAGE…';
      document.getElementById('wheelStack').classList.remove('clutch');
      playWhoosh();
      logFeed('Tirage en cours…');

      const totalW = active.reduce((s, o) => s + (o.weight || 1), 0);
      let rand = Math.random() * totalW;
      let winner = active[active.length - 1];
      for (const opt of active) {
        rand -= (opt.weight || 1);
        if (rand <= 0) { winner = opt; break; }
      }

      state.currentWinner = winner;

      // Calculate exact slice landing so pointer is aligned with winner at 12 o'clock (270°)
      let curSweepStart = 0;
      let winStart = 0, winEnd = 360;
      for (const opt of active) {
        const sw = ((opt.weight || 1) / totalW) * 360;
        if (opt.id === winner.id || opt.label === winner.label) {
          winStart = curSweepStart;
          winEnd = curSweepStart + sw;
          break;
        }
        curSweepStart += sw;
      }
      const sweep = winEnd - winStart;
      const m = Math.min(6, sweep * 0.12);
      const land = winStart + m + Math.random() * Math.max(0.5, sweep - 2 * m);
      const turns = 5 + Math.floor(Math.random() * 3);
      const base = curRot - (curRot % 360);
      const targetDeg = base + turns * 360 + (((270 - land) % 360 + 360) % 360);
      const fromDeg = curRot;
      const dist = targetDeg - fromDeg;
      const startT = performance.now();
      const dur = 5000;

      function anim(now) {
        const progress = Math.min(1, (now - startT) / dur);
        const ease = 1 - Math.pow(1 - progress, 4.5);
        curRot = fromDeg + dist * ease;

        if (progress > 0.8 && !document.getElementById('wheelStack').classList.contains('clutch')) {
          document.getElementById('wheelStack').classList.add('clutch');
        }

        if (Math.abs(curRot - lastTickAngle) > 22) {
          playTick();
          lastTickAngle = curRot;
          const p = document.getElementById('pointer');
          if (p) {
            p.classList.remove('tick');
            void p.offsetWidth;
            p.classList.add('tick');
          }
        }

        drawWheel();

        if (progress < 1) {
          requestAnimationFrame(anim);
        } else {
          state.spinning = false;
          state.sessionSpins++;
          document.getElementById('hubBtn').classList.remove('busy');
          document.getElementById('lockLed').classList.remove('busy');
          document.getElementById('lockTxt').textContent = 'PRÊT';
          document.getElementById('wheelStack').classList.remove('clutch');
          updateHudChips();

          // Record stats & history
          state.stats[winner.label] = state.stats[winner.label] || { w: 0, color: winner.color };
          state.stats[winner.label].w++;
          saveLocal();

          logFeed('Gagnant : ' + winner.label);

          // Show win celebration
          const slang = CM_WIN[Math.floor(Math.random() * CM_WIN.length)];
          document.getElementById('winSlang').textContent = slang;
          document.getElementById('winLabel').textContent = winner.label;
          document.getElementById('winCard').style.setProperty('--wc', winner.color);
          document.getElementById('winTime').textContent = 'Tirage officiel — ' + new Date().toLocaleTimeString();
          
          if (settings.elim) {
            document.getElementById('winRemoveBtn').textContent = '🎯 Éliminer & Tour suivant';
          } else {
            document.getElementById('winRemoveBtn').textContent = '🗑️ Retirer';
          }

          openModal('winModal');
          playWin();
          burstConfetti(winner.color);
        }
      }
      requestAnimationFrame(anim);
    }

    function spinAgain() {
      closeModal('winModal');
      setTimeout(spinWheel, 160);
    }

    function removeWinnerAction() {
      if (!state.currentWinner) {
        closeModal('winModal');
        return;
      }
      pushSnapshot();
      state.options = state.options.filter(o => o.id !== state.currentWinner.id && o.label !== state.currentWinner.label);
      saveLocal();
      renderTab();
      toast('Gagnant retiré de la roue');
      closeModal('winModal');

      if (settings.elim) {
        const remaining = state.options.filter(o => o.enabled).length;
        if (remaining >= 2) {
          setTimeout(spinWheel, 320);
        } else {
          toast('Plus assez d\\'options pour continuer le tournoi !');
        }
      }
    }

    // Main 60 FPS Render Loop
    function loop() {
      if (!state.spinning && state.options.filter(o => o.enabled).length >= 2) {
        curRot += 0.05;
        drawWheel();
      }
      updateConfetti();
      requestAnimationFrame(loop);
    }

    // Keyboard Shortcuts & Init
    window.addEventListener('resize', resizeWheel);
    window.addEventListener('keydown', (e) => {
      const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
      if (inInput) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (document.getElementById('winModal').classList.contains('open')) {
          if (settings.elim) removeWinnerAction();
          else closeModal('winModal');
        } else if (!state.spinning) {
          spinWheel();
        }
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key.toLowerCase() === 'r' && document.getElementById('winModal').classList.contains('open')) {
        spinAgain();
      } else if (e.key.toLowerCase() === 's' && document.getElementById('winModal').classList.contains('open')) {
        removeWinnerAction();
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
        closeDrawer();
      }
    });

    // Boot
    document.documentElement.dataset.theme = state.theme;
    document.getElementById('langTxt').textContent = state.lang.toUpperCase();
    document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('on', d.dataset.th === state.theme));
    updateHudChips();
    renderTab();
    resizeWheel();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}
