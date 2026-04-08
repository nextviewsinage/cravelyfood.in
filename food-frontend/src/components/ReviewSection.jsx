import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/api';
import BACKEND from '../config';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => onChange(s)}
          style={{ fontSize: '1.5rem', cursor: 'pointer', color: s <= value ? '#ff5200' : '#ddd', transition: 'color 0.15s' }}
        >★</span>
      ))}
    </div>
  );
}

export default function ReviewSection({ foodItemId, restaurantId }) {
  const { isLoggedIn } = useAuth();
  const { notify } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = () => {
    const params = foodItemId ? `?food_item=${foodItemId}` : `?restaurant=${restaurantId}`;
    api.get(`reviews/${params}`).then((r) => setReviews(r.data)).catch(() => {});
  };

  useEffect(() => { fetchReviews(); }, [foodItemId, restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('rating', rating);
      fd.append('comment', comment);
      if (foodItemId) fd.append('food_item', foodItemId);
      if (restaurantId) fd.append('restaurant', restaurantId);
      images.forEach((img) => fd.append('uploaded_images', img));

      await api.post('reviews/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setComment(''); setImages([]); setRating(5); setShowForm(false);
      notify('✅ Review submitted!');
      fetchReviews();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (reviewId, type) => {
    if (!isLoggedIn) { notify('Login to react to reviews', 'info'); return; }
    try {
      const res = await api.post(`reviews/${reviewId}/${type}/`);
      setReviews((prev) => prev.map((r) =>
        r.id === reviewId
          ? { ...r, like_count: res.data.like_count, dislike_count: res.data.dislike_count,
              user_liked: type === 'like' ? res.data.liked : false,
              user_disliked: type === 'dislike' ? res.data.disliked : false }
          : r
      ));
    } catch {}
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ marginTop: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            ⭐ Reviews {avgRating && <span style={{ color: '#ff5200' }}>{avgRating}</span>}
            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: 6 }}>({reviews.length})</span>
          </h3>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#ff5200', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {showForm ? 'Cancel' : '+ Write Review'}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              style={{ width: '100%', borderRadius: 8, border: '1px solid #e8e8e8', padding: '10px 12px', fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>📷 Add Photos (optional)</label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              style={{ fontSize: '0.85rem' }}
            />
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting} style={{ background: '#ff5200', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa', fontSize: '0.9rem' }}>
          No reviews yet. Be the first to review!
        </div>
      )}

      {reviews.map((r) => (
        <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ff5200', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                {r.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.username}</div>
                <div style={{ color: '#ff5200', fontSize: '0.85rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
              {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {r.comment && <p style={{ margin: '10px 0 8px', fontSize: '0.88rem', color: '#444', lineHeight: 1.5 }}>{r.comment}</p>}

          {/* Review Images */}
          {r.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {r.images.map((img) => (
                <img
                  key={img.id}
                  src={img.image.startsWith('http') ? img.image : `${BACKEND}${img.image}`}
                  alt="review"
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => window.open(img.image.startsWith('http') ? img.image : `${BACKEND}${img.image}`, '_blank')}
                />
              ))}
            </div>
          )}

          {/* Like / Dislike */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleReaction(r.id, 'like')}
              style={{ background: r.user_liked ? '#fff5f0' : '#f8f8f8', border: `1px solid ${r.user_liked ? '#ff5200' : '#e8e8e8'}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: r.user_liked ? '#ff5200' : '#666' }}
            >
              👍 {r.like_count}
            </button>
            <button
              onClick={() => handleReaction(r.id, 'dislike')}
              style={{ background: r.user_disliked ? '#fff0f0' : '#f8f8f8', border: `1px solid ${r.user_disliked ? '#e23744' : '#e8e8e8'}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: r.user_disliked ? '#e23744' : '#666' }}
            >
              👎 {r.dislike_count}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
