import React from 'react';
import { Lang } from '../types';
import { translate } from '../data/translations';

interface SaveConflictModalProps {
  isOpen: boolean;
  lang: Lang;
  existingName: string;
  suggestedSuffixName: string;
  onReplace: () => void;
  onUseSuffix: () => void;
  onCancel: () => void;
}

export const SaveConflictModal: React.FC<SaveConflictModalProps> = ({
  isOpen,
  lang,
  existingName,
  suggestedSuffixName,
  onReplace,
  onUseSuffix,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal open" role="dialog" aria-modal="true" onClick={(e) => {
      if ((e.target as HTMLElement).classList.contains('modal')) onCancel();
    }}>
      <div className="mcard">
        <div className="sec-h" style={{ marginBottom: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>{translate(lang, 'cf_title')}</span>
        </div>
        <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
          {translate(lang, 'cf_text', { x: existingName })}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn primary" id="cfReplace" style={{ flex: 1 }} onClick={onReplace}>
            <span>{translate(lang, 'cf_replace')}</span>
          </button>
          <button className="btn" id="cfSuffix" style={{ flex: 1 }} onClick={onUseSuffix}>
            <span>{translate(lang, 'cf_suffix', { x: suggestedSuffixName })}</span>
          </button>
          <button className="btn danger" id="cfCancel" onClick={onCancel}>
            {translate(lang, 'cf_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
