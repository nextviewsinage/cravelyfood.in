import { useState, useRef } from 'react';

export default function VoiceSearch({ onResult }) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const toggle = () => {
    if (!SpeechRecognition) {
      alert('Voice search is not supported in your browser. Please use Chrome.');
      return;
    }

    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'en-IN';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };

    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);

    recogRef.current = recog;
    recog.start();
    setListening(true);
  };

  return (
    <button
      onClick={toggle}
      title={listening ? 'Stop listening' : 'Voice search'}
      style={{
        background: listening ? '#ff5200' : 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '0 14px',
        color: listening ? '#fff' : '#888',
        transition: 'all 0.2s',
        borderRadius: 0,
        animation: listening ? 'pulse 1s infinite' : 'none',
      }}
    >
      🎙️
    </button>
  );
}
