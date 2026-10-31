/**
 * Script de capture automatisée Playwright pour DI SPIN ELITE.
 * 
 * Utilisation :
 * 1. npm install -D playwright
 * 2. npx playwright install chromium
 * 3. node scripts/capture-screenshots.mjs
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');

if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('🚀 Démarrage du serveur local Vite...');
  const viteProcess = spawn('npx', ['vite', '--port', '3000'], { stdio: 'pipe' });

  // Attendre 2 secondes que Vite démarre
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log('🌐 Lancement du navigateur Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Capture Retina haute résolution
  });
  const page = await context.newPage();

  try {
    console.log('📸 1. Capture de l\'écran d\'accueil...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-accueil.png'), fullPage: false });
    console.log('✅ Écran d\'accueil capturé : docs/screenshots/01-accueil.png');

    console.log('📸 2. Capture de la roue en pleine rotation (Spin)...');
    const spinButton = await page.$('button#spinButton, #spinButton, .spin-btn, button:has-text("TOURNER")');
    if (spinButton) {
      await spinButton.click();
      // Attendre 1.2 seconde pendant la rotation
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-roue-spin.png'), fullPage: false });
      console.log('✅ Rotation de la roue capturée : docs/screenshots/02-roue-spin.png');
    }

    console.log('📸 3. Attente et capture de la modale de victoire...');
    // Attendre la fin du tour (~5 secondes) et l'apparition de la modale de victoire
    await page.waitForTimeout(4500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-victoire-modal.png'), fullPage: false });
    console.log('✅ Modale de victoire capturée : docs/screenshots/03-victoire-modal.png');

  } catch (err) {
    console.error('Erreur lors de la capture :', err);
  } finally {
    await browser.close();
    viteProcess.kill();
    console.log('🎉 Terminé ! Toutes les captures sont disponibles dans docs/screenshots/');
  }
}

capture();
