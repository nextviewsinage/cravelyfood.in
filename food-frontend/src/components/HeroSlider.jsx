import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import BACKEND from '../config';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&h=500&fit=crop',
];

function getSlideImage(slide, index) {
  if (slide.image_url) {
    return slide.image_url.startsWith('http')
      ? slide.image_url
      : `${BACKEND}${slide.image_url}`;
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState('left'); // 'left' | 'right'
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('slides/').then(r => {
      const data = Array.isArray(r.data) ? r.data : (r.data.results || []);
      if (data.length > 0) setSlides(data);
    }).catch(() => {
      setSlides([
        { id: 1, title: 'Get 20% Off Your First Order!', subtitle: 'Use code WELCOME20 at checkout. Min order ₹299', slide_type: 'image', link: '/restaurants', button_text: 'Order Now' },
        { id: 2, title: 'Flash Deals Every Hour ⚡', subtitle: 'Up to 50% off on selected items. Limited time only!', slide_type: 'image', link: '/', button_text: 'Grab Deal' },
        { id: 3, title: 'Free Delivery This Weekend 🛵', subtitle: 'On all orders above ₹199. No code needed!', slide_type: 'image', link: '/restaurants', button_text: 'Explore Menu' },
      ]);
    });
  }, []);

  const goTo = useCallback((nextIndex, dir = 'left') => {
    if (animating || slides.length === 0) return;
    setDirection(dir);
    setPrev(current);
    setAnimating(true);
    setCurrent(nextIndex);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 420);
  }, [animating, current, slides.length]);

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length, 'left');
  }, [current, slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'right');
  }, [current, slides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (slides.length === 0) return;
    const currentSlide = slides[current];
    if (paused || currentSlide?.slide_type === 'video') return;
    timerRef.current = setTimeout(() => goNext(), 4000);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, slides, goNext]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const prevSlide = prev !== null ? slides[prev] : null;
  const isVideo = slide.slide_type === 'video';
  const videoSrc = slide.video_file_url
    ? (slide.video_file_url.startsWith('http') ? slide.video_file_url : `${BACKEND}${slide.video_file_url}`)
    : slide.video_url || '';

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Outgoing slide */}
      {animating && prevSlide && (
        <div className={`slider-slide slider-slide-out-${direction}`}>
          <div className="slider-image" style={{ backgroundImage: `url(${getSlideImage(prevSlide, prev)})` }} />
          <div className="slider-overlay" />
        </div>
      )}

      {/* Incoming / current slide */}
      <div className={`slider-slide ${animating ? `slider-slide-in-${direction}` : 'slider-slide-active'}`}>
        {isVideo ? (
          <video
            ref={videoRef}
            key={slide.id}
            className="slider-video"
            src={videoSrc}
            autoPlay muted playsInline
            onEnded={goNext}
          />
        ) : (
          <div className="slider-image" style={{ backgroundImage: `url(${getSlideImage(slide, current)})` }} />
        )}
        <div className="slider-overlay" />
        <div className="slider-content">
          {slide.title && <h2 className="slider-title">{slide.title}</h2>}
          {slide.subtitle && <p className="slider-subtitle">{slide.subtitle}</p>}
          {slide.button_text && (
            <button className="slider-btn" onClick={() => slide.link && navigate(slide.link)}>
              {slide.button_text} →
            </button>
          )}
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button className="slider-arrow slider-arrow-left" onClick={goPrev} aria-label="Previous slide">‹</button>
          <button className="slider-arrow slider-arrow-right" onClick={goNext} aria-label="Next slide">›</button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="slider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i, i > current ? 'left' : 'right')}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}


    </div>
  );
}
