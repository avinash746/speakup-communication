import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, Star, Trash2, Filter, BarChart2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ScoreRing from '../components/dashboard/ScoreRing';
import styles from './HistoryPage.module.css';

const TONES = ['', 'professional', 'casual', 'academic', 'persuasive', 'empathetic', 'neutral'];

export default function HistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tone, setTone] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['history', page, debouncedSearch, tone, favOnly],
    queryFn: () => historyAPI.getAll({
      page, limit: 8, search: debouncedSearch || undefined,
      tone: tone || undefined, favorited: favOnly || undefined
    }),
    keepPreviousData: true
  });

  const { data: statsData } = useQuery({
    queryKey: ['historyStats'],
    queryFn: historyAPI.getStats
  });

  const favMutation = useMutation({
    mutationFn: historyAPI.toggleFavorite,
    onSuccess: () => queryClient.invalidateQueries(['history'])
  });

  const deleteMutation = useMutation({
    mutationFn: historyAPI.delete,
    onSuccess: () => {
      toast.success('Deleted');
      queryClient.invalidateQueries(['history']);
    },
    onError: () => toast.error('Delete failed')
  });

  const analyses = data?.analyses || [];
  const pagination = data?.pagination || {};
  const stats = statsData?.stats;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>History</h1>
        {stats?.totalAnalyses > 0 && (
          <div className={styles.statCards}>
            <div className={styles.statCard}>
              <BarChart2 size={14} color="var(--accent)" />
              <span>{stats.totalAnalyses}</span>
              <span className={styles.statLabel}>Analyses</span>
            </div>
            <div className={styles.statCard}>
              <Star size={14} color="var(--accent)" />
              <span>{Math.round(stats.avgOverall || 0)}</span>
              <span className={styles.statLabel}>Avg Score</span>
            </div>
            <div className={styles.statCard}>
              <Clock size={14} color="var(--accent)" />
              <span>{(stats.totalWords || 0).toLocaleString()}</span>
              <span className={styles.statLabel}>Words</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search analyses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter size={14} color="var(--text-dim)" />
          <select value={tone} onChange={e => { setTone(e.target.value); setPage(1); }} className={styles.filterSelect}>
            {TONES.map(t => <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All Tones'}</option>)}
          </select>
        </div>
        <button className={`${styles.favFilter} ${favOnly ? styles.favFilterActive : ''}`} onClick={() => { setFavOnly(p => !p); setPage(1); }}>
          <Star size={14} fill={favOnly ? 'currentColor' : 'none'} />
          Favorites
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className={styles.skeletonList}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={`${styles.skeletonCard} skeleton`} />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <p>No analyses found</p>
          <span>Try adjusting your filters or analyze some text first</span>
        </div>
      ) : (
        <div className={styles.list}>
          {analyses.map(a => (
            <div key={a._id} className={styles.card} onClick={() => navigate(`/history/${a._id}`)}>
              <div className={styles.cardLeft}>
                <ScoreRing value={a.scores?.overall || 0} size={52} label="Score" />
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardText}>
                  {a.originalText?.slice(0, 120)}{a.originalText?.length > 120 ? '…' : ''}
                </p>
                <div className={styles.cardMeta}>
                  <span className={styles.metaTag}>{a.tone}</span>
                  <span className={styles.metaTag}>{a.language?.toUpperCase()}</span>
                  <span className={styles.metaDate}>{formatDate(a.createdAt)}</span>
                </div>
              </div>
              <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                <button
                  className={`${styles.actionBtn} ${a.isFavorited ? styles.actionFav : ''}`}
                  onClick={() => favMutation.mutate(a._id)}
                  title="Favorite"
                >
                  <Star size={15} fill={a.isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionDelete}`}
                  onClick={() => {
                    if (window.confirm('Delete this analysis?')) deleteMutation.mutate(a._id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>{page} / {pagination.pages}</span>
          <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
