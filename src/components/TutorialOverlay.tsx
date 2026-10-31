import React, { useEffect, useRef } from 'react';
import { Lang } from '../types';
import { TUTO_STEPS, translate } from '../data/translations';

interface TutorialOverlayProps {
  isOpen: boolean;
  lang: Lang;
  stepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isOpen,
  lang,
  stepIndex,
  onNext,
  onPrev,
  onSkip,
}) => {
  const spotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const steps = TUTO_STEPS[lang] || TUTO_STEPS.fr;
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    if (!isOpen) return;

    const placeTuto = () => {
      if (!spotRef.current || !cardRef.current) return;
      const s = currentStep;
      let r: DOMRect | { left: number; top: number; width: number; height: number } | null = null;

      if (s.sel) {
        const el = document.querySelector(s.sel);
        if (el) {
          el.scrollIntoView({ block: 'nearest' });
          r = el.getBoundingClientRect();
        }
      }

      if (!r) {
        const w = Math.min(window.innerWidth * 0.72, 560);
        const h = Math.min(window.innerHeight * 0.5, 400);
        r = {
          left: window.innerWidth / 2 - w / 2,
          top: window.innerHeight / 2 - h / 2 - 30,
          width: w,
          height: h,
        };
      }

      const pad = 10;
      spotRef.current.style.left = `${r.left - pad}px`;
      spotRef.current.style.top = `${r.top - pad}px`;
      spotRef.current.style.width = `${r.width + pad * 2}px`;
      spotRef.current.style.height = `${r.height + pad * 2}px`;
      spotRef.current.style.borderRadius = `${s.sel ? 14 : 26}px`;

      const cw = Math.min(440, window.innerWidth - 24);
      cardRef.current.style.width = `${cw}px`;
      const ch = cardRef.current.offsetHeight || 200;

      let top = r.top + r.height + 20;
      if (top + ch > window.innerHeight - 10) top = r.top - ch - 20;
      if (top < 10) top = clamp(window.innerHeight / 2 - ch / 2, 10, window.innerHeight);

      const left = clamp(r.left + r.width / 2 - cw / 2, 12, Math.max(12, window.innerWidth - cw - 12));
      cardRef.current.style.top = `${top}px`;
      cardRef.current.style.left = `${left}px`;
    };

    if (cardRef.current) {
      cardRef.current.classList.remove('pop');
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add('pop');
    }

    const timer = setTimeout(placeTuto, 70);
    window.addEventListener('resize', placeTuto);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', placeTuto);
    };
  }, [isOpen, stepIndex, currentStep, lang]);

  if (!isOpen) return null;

  return (
    <div id="tuto">
      <div id="tutoSpot" ref={spotRef} />
      <div id="tutoCard" ref={cardRef}>
        <div className="t-head">
          <span className="t-step" id="tutoStep">
            {String(stepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
          <span className="t-title" id="tutoTitle">
            {currentStep.t}
          </span>
        </div>
        <p id="tutoTxt">{currentStep.x}</p>
        <div className="t-foot">
          <div id="tutoDots">
            {steps.map((_, i) => (
              <i
                key={i}
                className={i === stepIndex ? 'on' : i < stepIndex ? 'done' : ''}
              />
            ))}
          </div>
          <div className="t-btns">
            <button className="btn" id="tutoSkip" onClick={onSkip}>
              {translate(lang, 't_skip')}
            </button>
            <button
              className="btn"
              id="tutoPrev"
              style={{ visibility: stepIndex > 0 ? 'visible' : 'hidden' }}
              onClick={onPrev}
            >
              ←
            </button>
            <button className="btn primary" id="tutoNext" onClick={onNext}>
              {stepIndex === steps.length - 1
                ? translate(lang, 't_finish')
                : translate(lang, 't_next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
