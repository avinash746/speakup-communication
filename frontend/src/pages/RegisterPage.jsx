import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Globe } from 'lucide-react';
import styles from './AuthPage.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' }, { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' }, { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' }, { code: 'pt', label: 'Portuguese' },
  { code: 'ja', label: 'Japanese' }, { code: 'ko', label: 'Korean' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', preferredLanguage: 'en' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to SpeakUp 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <Zap size={22} color="var(--accent)" />
          <span className={styles.brand}>SpeakUp</span>
        </div>

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Start improving your communication today</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <div className={styles.inputWrap}>
              <User size={15} className={styles.inputIcon} />
              <input type="text" placeholder="Alex Johnson" value={form.name} onChange={set('name')} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Preferred Language</label>
            <div className={styles.inputWrap}>
              <Globe size={15} className={styles.inputIcon} />
              <select value={form.preferredLanguage} onChange={set('preferredLanguage')}>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
