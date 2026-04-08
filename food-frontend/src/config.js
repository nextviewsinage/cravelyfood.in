const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000'
  : (process.env.REACT_APP_API_URL || 'https://cravelyfood-in.onrender.com');

export default BACKEND;
