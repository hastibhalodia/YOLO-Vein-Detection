import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, CssBaseline, Card, CardContent, CardActions, LinearProgress, IconButton, Grid, Paper, Slider, Stack, Chip, ImageList, ImageListItem } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const API_BASE = (process.env.REACT_APP_API_BASE as string) || '/api'; // nginx proxy in prod

type HistoryItem = { id: string; name: string; resultUrl: string; createdAt: number };

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vein-ui-theme');
    return saved ? saved === 'dark' : false;
  });
  const [confidence, setConfidence] = useState<number>(() => {
    const saved = localStorage.getItem('vein-ui-thresh');
    return saved ? Number(saved) : 0.25;
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const raw = localStorage.getItem('vein-ui-history');
    return raw ? JSON.parse(raw) : [];
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#2e7d32' },
      background: darkMode ? {} : { default: '#f4f8fb' }
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
  }), [darkMode]);

  useEffect(() => localStorage.setItem('vein-ui-thresh', String(confidence)), [confidence]);
  useEffect(() => localStorage.setItem('vein-ui-history', JSON.stringify(history.slice(0, 24))), [history]);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('vein-ui-theme', next ? 'dark' : 'light');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResultImg(null);
      setError(null);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setSelectedFile(f);
      setResultImg(null);
      setError(null);
    }
  };

  const startCamera = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setError('Unable to access camera: ' + (err.message || ''));
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.95));
    if (!blob) return;
    const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
    setSelectedFile(file);
    setResultImg(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResultImg(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('conf', String(confidence)); // optional backend usage
    try {
      let response = await fetch(`${API_BASE}/predict`, { method: 'POST', body: formData });
      if (!response.ok) {
        response = await fetch('http://localhost:8000/predict', { method: 'POST', body: formData });
      }
      if (!response.ok) throw new Error('Failed to get prediction');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultImg(url);
      const id = crypto.randomUUID();
      setHistory(prev => [{ id, name: selectedFile.name, resultUrl: url, createdAt: Date.now() }, ...prev].slice(0, 24));
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImg) return;
    const a = document.createElement('a');
    a.href = resultImg;
    a.download = 'vein-detection.jpg';
    a.click();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        background: darkMode
          ? 'radial-gradient(1200px 800px at 10% -10%, rgba(25,118,210,0.25), transparent), radial-gradient(1000px 700px at 110% 110%, rgba(46,125,50,0.25), transparent)'
          : 'linear-gradient(180deg, #e8f2ff 0%, #f4f8fb 30%, #ffffff 100%)'
      }}>
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)', borderBottom: theme.palette.mode === 'light' ? '1px solid #e9eef5' : '1px solid rgba(255,255,255,0.08)' }}>
          <Toolbar>
            <MedicalServicesIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Doctoral Vein Detection</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mr: 2 }}>
              <Chip label={`Conf: ${(confidence * 100).toFixed(0)}%`} size="small" />
            </Stack>
            <IconButton color="inherit" onClick={handleThemeToggle} aria-label="toggle theme">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 6 }}>
                {loading && <LinearProgress color="primary" />}
                <CardContent>
                  <Typography variant="overline" color="primary">Detection</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Upload or Capture</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Drag & drop an image, browse a file, or use your camera. Adjust confidence to control detection strictness.
                  </Typography>

                  <Paper
                    variant="outlined"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mt: 2, p: 4, textAlign: 'center', borderStyle: 'dashed', cursor: 'pointer', bgcolor: 'action.hover' }}
                  >
                    <CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography sx={{ mt: 1 }}>{selectedFile ? selectedFile.name : 'Drop image here or click to browse'}</Typography>
                    <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={handleFileChange} />
                  </Paper>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <Button startIcon={<CameraAltIcon />} variant="outlined" onClick={startCamera}>Enable Camera</Button>
                    <Button variant="outlined" onClick={captureFromCamera}>Capture Frame</Button>
                    <Button variant="outlined" color="inherit" onClick={stopCamera}>Stop Camera</Button>
                  </Stack>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary">Confidence threshold</Typography>
                    <Slider value={confidence} onChange={(_, v) => setConfidence(v as number)} step={0.05} min={0.1} max={0.9} valueLabelDisplay="auto" />
                  </Box>

                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={!selectedFile || loading}>
                      {loading ? 'Processing…' : 'Upload & Detect'}
                    </Button>
                    <Button variant="outlined" color="inherit" onClick={() => { setSelectedFile(null); setResultImg(null); setError(null); }} disabled={loading}>
                      Reset
                    </Button>
                  </Box>

                  {error && (<Typography sx={{ mt: 2 }} color="error">{error}</Typography>)}

                  <Box sx={{ mt: 2, display: streamRef.current ? 'block' : 'none' }}>
                    <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} muted playsInline />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 6, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="overline" color="primary">Result</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Detection Preview</Typography>
                  {!resultImg && (
                    <Typography variant="body2" color="text.secondary">No result yet. Upload or capture to see annotated veins.</Typography>
                  )}
                  {resultImg && (
                    <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <img src={resultImg} alt="Detection Result" style={{ width: '100%', display: 'block' }} />
                    </Box>
                  )}
                </CardContent>
                {resultImg && (
                  <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HistoryIcon fontSize="small" />
                      <Typography variant="caption">Saved to session history</Typography>
                    </Stack>
                    <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handleDownload}>Download</Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 5 }}>
            <Typography variant="overline" color="primary">Session History</Typography>
            {history.length === 0 && (
              <Typography variant="body2" color="text.secondary">No detections yet.</Typography>
            )}
            {history.length > 0 && (
              <ImageList cols={Math.min(4, Math.max(2, Math.floor(window.innerWidth / 300)))} gap={12} sx={{ mt: 1 }}>
                {history.map(item => (
                  <ImageListItem key={item.id} onClick={() => setResultImg(item.resultUrl)} sx={{ cursor: 'pointer' }}>
                    <img src={item.resultUrl} alt={item.name} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
            <Typography variant="caption">For clinical research preview only. Not a medical device.</Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
