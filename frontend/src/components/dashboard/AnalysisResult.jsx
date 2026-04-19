import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { historyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Copy, Star, RotateCcw, History, CheckCircle, AlertTriangle, Info, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import ScoreRing from './ScoreRing';
import styles from './AnalysisResult.module.css';

const TYPE_CONFIG = {
  clarity: { icon: '🔍', color: 'var(--blue)', label: 'Clarity' },
  tone: { icon: '🎯', color: 'var(--accent)', label: 'Tone' },
  vocabulary: { icon: '📚', color: 'var(--purple)', label: 'Vocabulary' },
  grammar: { icon: '✏️', color: 'var(--green)', label: 'Grammar' },
  conciseness: { icon: '✂️', color: 'var(--red)', label: 'Conciseness' },
  structure: { icon: '🏗️', color: 'var(--accent-2)', label: 'Structure' },
};

const IMPACT_CONFIG = {
  high: { icon: AlertTriangle, color: 'var(--red)', label: 'High Impact' },
  medium: { icon: Info, color: 'var(--accent)', label: 'Medium Impact' },
  low: { icon: CheckCircle, color: 'var(--green)', label: 'Low Impact' },
};

export default function AnalysisResult({ result, onNew, onHistory }) {
  const [copied, setCopied] = useState(false);
  const [expandedSug, setExpandedSug] = useState(0);
  const [favorited, setFavorited] = useState(result.isFavorited);
  const queryClient = useQueryClient();

  const favMutation = useMutation({
    mutationFn: () => historyAPI.toggleFavorite(result._id),
    onSuccess: (data) => {
      setFavorited(data.isFavorited);
      toast.success(data.isFavorited ? 'Saved to favorites' : 'Removed from favorites');
      queryClient.invalidateQueries(['history']);
    },
    onError: () => toast.error('Failed to update favorite')
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.improvedText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const scores = result.scores;
  const scoreEntries = [
    { key: 'clarity', label: 'Clarity', value: scores.clarity },
    { key: 'tone', label: 'Tone', value: scores.tone },
    { key: 'vocabulary', label: 'Vocabulary', value: scores.vocabulary },
  ];

  const wordDiff = result.wordCount?.original - result.wordCount?.improved;
  const wordDiffPct = result.wordCount?.original
    ? Math.abs(Math.round((wordDiff / result.wordCount.original) * 100))
    : 0;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h2 className={styles.pageTitle}>Analysis Complete</h2>
          <span className={styles.badge}>
            <TrendingUp size={12} />
            {result.tone} · {result.language.toUpperCase()}
          </span>
        </div>
        <div className={styles.topActions}>
          <button className={`${styles.iconBtn} ${favorited ? styles.favorited : ''}`} onClick={() => favMutation.mutate()} title="Favorite">
            <Star size={16} fill={favorited ? 'currentColor' : 'none'} />
          </button>
          <button className={styles.iconBtn} onClick={onHistory} title="History">
            <History size={16} />
          </button>
          <button className={styles.iconBtn} onClick={onNew} title="New Analysis">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <div className={styles.summaryCard}>
          <Info size={15} color="var(--accent)" />
          <p>{result.summary}</p>
        </div>
      )}

      {/* Scores row */}
      <div className={styles.scoresRow}>
        <div className={styles.overallScore}>
          <ScoreRing value={scores.overall} size={88} label="Overall" />
        </div>
        <div className={styles.scoreSeparator} />
        <div className={styles.subScores}>
          {scoreEntries.map(s => (
            <div key={s.key} className={styles.subScore}>
              <ScoreRing value={s.value} size={60} label={s.label} />
            </div>
          ))}
        </div>
        {wordDiff !== 0 && (
          <>
            <div className={styles.scoreSeparator} />
            <div className={styles.wordDiff}>
              <span className={styles.wordDiffNum} style={{ color: wordDiff > 0 ? 'var(--green)' : 'var(--red)' }}>
                {wordDiff > 0 ? '-' : '+'}{wordDiffPct}%
              </span>
              <span className={styles.wordDiffLabel}>
                {wordDiff > 0 ? 'More concise' : 'Expanded'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Text comparison */}
      <div className={styles.comparison}>
        <div className={styles.textBox}>
          <div className={styles.textBoxHeader}>
            <span className={styles.textBoxLabel}>Original</span>
            <span className={styles.wordCountBadge}>{result.wordCount?.original} words</span>
          </div>
          <p className={styles.originalText}>{result.originalText}</p>
        </div>

        <div className={`${styles.textBox} ${styles.improvedBox}`}>
          <div className={styles.textBoxHeader}>
            <span className={styles.textBoxLabel} style={{ color: 'var(--green)' }}>Improved</span>
            <span className={styles.wordCountBadge}>{result.wordCount?.improved} words</span>
          </div>
          <p className={styles.improvedText}>{result.improvedText}</p>
          <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className={styles.suggestionsSection}>
        <h3 className={styles.sectionTitle}>
          Why These Changes? <span className={styles.count}>{result.suggestions?.length}</span>
        </h3>
        <div className={styles.suggestions}>
          {result.suggestions?.map((sug, i) => {
            const typeConf = TYPE_CONFIG[sug.type] || TYPE_CONFIG.clarity;
            const impactConf = IMPACT_CONFIG[sug.impact] || IMPACT_CONFIG.medium;
            const ImpactIcon = impactConf.icon;
            const isOpen = expandedSug === i;

            return (
              <div key={i} className={`${styles.suggestion} ${isOpen ? styles.suggestionOpen : ''}`}>
                <button className={styles.sugHeader} onClick={() => setExpandedSug(isOpen ? -1 : i)}>
                  <div className={styles.sugLeft}>
                    <span className={styles.sugType} style={{ background: `${typeConf.color}18`, color: typeConf.color }}>
                      {typeConf.icon} {typeConf.label}
                    </span>
                    <span className={styles.sugOriginal}>"{sug.original}"</span>
                  </div>
                  <div className={styles.sugRight}>
                    <ImpactIcon size={13} color={impactConf.color} />
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {isOpen && (
                  <div className={styles.sugBody}>
                    <div className={styles.changeRow}>
                      <div className={styles.changeItem}>
                        <span className={styles.changeLabel}>Original</span>
                        <span className={styles.changeBefore}>"{sug.original}"</span>
                      </div>
                      <div className={styles.arrow}>→</div>
                      <div className={styles.changeItem}>
                        <span className={styles.changeLabel}>Improved</span>
                        <span className={styles.changeAfter}>"{sug.improved}"</span>
                      </div>
                    </div>
                    <div className={styles.explanation}>
                      <span className={styles.explanationLabel}>Why this works:</span>
                      <p>{sug.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New analysis CTA */}
      <button className={styles.newBtn} onClick={onNew}>
        <RotateCcw size={15} />
        Analyze Another Text
      </button>
    </div>
  );
}
