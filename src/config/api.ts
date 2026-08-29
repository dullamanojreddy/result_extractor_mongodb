let envApiUrl = import.meta.env.VITE_API_URL || '';

// Automatically fix legacy URL without -1 to active instance
if (envApiUrl === 'https://result-extractor-mongodb.onrender.com' || envApiUrl === 'http://result-extractor-mongodb.onrender.com') {
  envApiUrl = 'https://result-extractor-mongodb-1.onrender.com';
}

const API_URL = envApiUrl || 
  (typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? (window.location.port === '5173' ? 'http://localhost:3000' : '')
        : (window.location.hostname.endsWith('onrender.com') ? '' : 'https://result-extractor-mongodb-1.onrender.com'))
    : 'https://result-extractor-mongodb-1.onrender.com');

export default API_URL;
