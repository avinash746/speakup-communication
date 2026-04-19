import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, History, LogOut, Menu, X, Zap, User } from 'lucide-react';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Analyze' },
    { to: '/history', icon: History, label: 'History' },
  ];

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Zap size={18} color="var(--accent)" />
            <span>SpeakUp</span>
          </div>
          <button className={styles.closeBtn} onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              <User size={14} />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userStat}>{user?.stats?.totalAnalyses || 0} analyses</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className={styles.logo} style={{ fontSize: 16 }}>
            <Zap size={16} color="var(--accent)" />
            <span>SpeakUp</span>
          </div>
          <div style={{ width: 36 }} />
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
