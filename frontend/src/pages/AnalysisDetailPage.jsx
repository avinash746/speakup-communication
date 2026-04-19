import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analysisAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import AnalysisResult from '../components/dashboard/AnalysisResult';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisAPI.getById(id)
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: i === 0 ? 120 : 80, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
        <p>Analysis not found or access denied.</p>
        <button onClick={() => navigate('/history')} style={{
          marginTop: 16, padding: '10px 20px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          <ArrowLeft size={15} /> Back to History
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        onClick={() => navigate('/history')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'none', color: 'var(--text-muted)', fontSize: 14,
          padding: '6px 0', width: 'fit-content', transition: 'color 0.2s'
        }}
      >
        <ArrowLeft size={15} /> Back to History
      </button>

      <AnalysisResult
        result={data.analysis}
        onNew={() => navigate('/dashboard')}
        onHistory={() => navigate('/history')}
      />
    </div>
  );
}
