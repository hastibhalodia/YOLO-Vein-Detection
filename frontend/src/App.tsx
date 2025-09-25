import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResultImg(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResultImg(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to get prediction.');
      }
      const blob = await response.blob();
      setResultImg(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>YOLO Vein Detection</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={!selectedFile || loading}>
          {loading ? 'Processing...' : 'Upload & Detect'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resultImg && (
        <div>
          <h2>Detection Result:</h2>
          <img src={resultImg} alt="Detection Result" style={{ maxWidth: '100%', marginTop: 16 }} />
        </div>
      )}
    </div>
  );
}

export default App;
