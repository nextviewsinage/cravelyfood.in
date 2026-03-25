import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const RANK_MEDAL = ['🥇', '🥈', '🥉'];
const RANK_BG    = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Badges() {
  const { isLoggedIn } = useAuth();
  const [myBadges, setMyBadges]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab]               = useState('badges');

  useEffect(() => {
    if (isLoggedIn) api.get('badges/mine/').then(r => setMyBadges(r.data)).catch(() => {});
    api.get('leaderboard/').then(r => setLeaderboard(r.data)).catch(() => {});
  }, [isLoggedIn]);

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="static-hero">
        <h1>🏆 Achievements</h1>
        <p>Earn badges, climb the leaderboard and show off your foodie status!</p>
      </div>

      <div className="badges-wrap">

        {/* Tabs */}
        <div className="badges-tabs">
          {[['badges', '🏅 My Badges'], ['leaderboard', '🏆 Leaderboard']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`badges-tab-btn ${tab === key ? 'active' : ''}`}
            >{label}</button>
          ))}
        </div>

        {/* ── MY BADGES ── */}
        {tab === 'badges' && (
          <>
            {!isLoggedIn ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔐</div>
                <h2>Login to see your badges</h2>
                <Link to="/login" className="btn-primary">Login Now</Link>
              </div>
            ) : !myBadges ? (
              <div className="loading-container"><div className="spinner" /></div>
            ) : (
              <>
                {/* Progress banner */}
                <div className="badges-progress-banner">
                  <div>
                    <div className="badges-progress-title">
                      {myBadges.earned_count} / {myBadges.total_badges} Badges Earned
                    </div>
                    <div className="badges-progress-sub">Keep ordering to unlock more!</div>
                    {/* Progress bar */}
                    <div className="badges-progress-bar-wrap">
                      <div
                        className="badges-progress-bar-fill"
                        style={{ width: `${(myBadges.earned_count / myBadges.total_badges) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="badges-progress-icon">🏅</div>
                </div>

                {/* Earned badges */}
                {myBadges.earned.length > 0 && (
                  <>
                    <div className="badges-section-label earned">✅ Earned</div>
                    <div className="badges-grid">
                      {myBadges.earned.map(ub => (
                        <div key={ub.id} className="badge-card earned">
                          <div className="badge-icon">{ub.badge.icon}</div>
                          <div className="badge-name">{ub.badge.name}</div>
                          <div className="badge-desc">{ub.badge.description}</div>
                          <div className="badge-points">+{ub.badge.points_reward} pts</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Locked badges */}
                {myBadges.locked.length > 0 && (
                  <>
                    <div className="badges-section-label locked">🔒 Locked</div>
                    <div className="badges-grid">
                      {myBadges.locked.map(b => (
                        <div key={b.badge_type} className="badge-card locked">
                          <div className="badge-icon locked-icon">{b.icon}</div>
                          <div className="badge-name">{b.name}</div>
                          <div className="badge-desc">{b.description}</div>
                          <div className="badge-lock-tag">🔒 Locked</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── LEADERBOARD ── */}
        {tab === 'leaderboard' && (
          <div className="leaderboard-card">
            {leaderboard.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏆</div>
                <h2>No data yet</h2>
                <p>Be the first to climb the leaderboard!</p>
              </div>
            ) : leaderboard.map((entry, i) => (
              <div key={entry.rank} className={`leaderboard-row ${i === 0 ? 'top' : ''}`}>
                <div
                  className="leaderboard-rank"
                  style={{ background: i < 3 ? RANK_BG[i] : 'var(--border)' }}
                >
                  {i < 3 ? RANK_MEDAL[i] : entry.rank}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{entry.username}</div>
                  <div className="leaderboard-meta">{entry.level} • {entry.badges} badges</div>
                </div>
                <div className="leaderboard-points">{entry.points} pts</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
