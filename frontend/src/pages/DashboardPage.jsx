import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { analysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import AnalysisResult from '../components/dashboard/AnalysisResult';
import ScoreRing from '../components/dashboard/ScoreRing';
import styles from './DashboardPage.module.css';

const TONES = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'academic', label: 'Academic', emoji: '🎓' },
  { value: 'persuasive', label: 'Persuasive', emoji: '💡' },
  { value: 'empathetic', label: 'Empathetic', emoji: '🤝' },
  { value: 'neutral', label: 'Neutral', emoji: '⚖️' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
  { code: 'hi', label: 'हिंदी' }, { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' }, { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' },
];

const MAX_CHARS = 5000;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'en');
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: () => analysisAPI.analyze({ text: text.trim(), tone, language }),
    onSuccess: (data) => {
      setResult(data.analysis);
      toast.success('Analysis complete!');
    },
    onError: (err) => {
      toast.error(err.message || 'Analysis failed. Please try again.');
    }
  });

  const handleAnalyze = () => {
    if (text.trim().length < 10) return toast.error('Please enter at least 10 characters');
    mutation.mutate();
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setText('');
  };

  if (result) {
    return <AnalysisResult result={result} onNew={handleNewAnalysis} onHistory={() => navigate('/history')} />;
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Good {getTimeOfDay()}, <span className={styles.name}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className={styles.sub}>Paste your text below and let AI refine your communication</p>
        </div>
        {user?.stats?.totalAnalyses > 0 && (
          <div className={styles.statsRow}>
            <ScoreRing value={Math.round(user.stats.avgClarityScore)} size={56} label="Avg Score" />
          </div>
        )}
      </div>

      {/* Config row */}
      <div className={styles.configRow}>
        <div className={styles.configGroup}>
          <label className={styles.configLabel}>Tone</label>
          <div className={styles.toneGrid}>
            {TONES.map(t => (
              <button
                key={t.value}
                className={`${styles.toneBtn} ${tone === t.value ? styles.toneBtnActive : ''}`}
                onClick={() => setTone(t.value)}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.configGroup}>
          <label className={styles.configLabel}>Language</label>
          <div className={styles.selectWrap}>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={styles.select}>
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.selectIcon} />
          </div>
        </div>
      </div>

      {/* Text area */}
      <div className={styles.textareaWrap}>
        <textarea
          className={styles.textarea}
          placeholder="Paste or type your text here…&#10;&#10;e.g., an email draft, a cover letter, a message to a colleague, a speech opening, or any communication you'd like to improve."
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
          rows={10}
        />
        <div className={styles.textareaFooter}>
          <span className={`${styles.charCount} ${text.length > MAX_CHARS * 0.9 ? styles.charWarn : ''}`}>
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
          <button
            className={styles.analyzeBtn}
            onClick={handleAnalyze}
            disabled={mutation.isPending || text.trim().length < 10}
          >
            {mutation.isPending ? (
              <>
                <span className={styles.spinner} />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Analyze & Improve</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      {text.length === 0 && (
        <div className={styles.tips}>
          <Zap size={14} color="var(--accent)" />
          <span>Try: emails, cover letters, social posts, essays, pitches, or any text you want to sound better</span>
        </div>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
