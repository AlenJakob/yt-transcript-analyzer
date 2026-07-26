'use client';

import * as React from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { extractYouTubeVideoId } from '@/lib/youtube';

interface UrlInputFormProps {
  onFetchTranscript: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

const SAMPLE_VIDEOS = [
  { label: 'Wprowadzenie do AI', url: 'https://www.youtube.com/watch?v=aircAruvnKk' },
  { label: 'Shorts przykładowy', url: 'https://www.youtube.com/shorts/30G51X35090' },
];

export default function UrlInputForm({ onFetchTranscript, isLoading, error }: UrlInputFormProps) {
  const [inputUrl, setInputUrl] = React.useState('');
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setValidationError('Wprowadź link do filmu YouTube.');
      return;
    }

    const videoId = extractYouTubeVideoId(trimmed);
    if (!videoId) {
      setValidationError('Nieprawidłowy format linku. Wklej link w postaci np. https://www.youtube.com/watch?v=...');
      return;
    }

    onFetchTranscript(trimmed);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
    setValidationError(null);
    onFetchTranscript(sampleUrl);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        mb: 4,
        background: 'linear-gradient(145deg, #121824 0%, #0e131d 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <YouTubeIcon sx={{ color: '#ef4444', fontSize: 28 }} /> Analizuj transkrypcję z YouTube
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Wklej dowolny link z YouTube (`watch`, `youtu.be`, `shorts`), aby natychmiast wyciągnąć napis i przejść do analizy AI.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'stretch' }}>
          <TextField
            fullWidth
            placeholder="Wklej adres URL filmu (np. https://www.youtube.com/watch?v=...)"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={isLoading}
            error={Boolean(validationError)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af', fontSize: 22 }} />
                  </InputAdornment>
                ),
                endAdornment: inputUrl ? (
                  <InputAdornment position="end">
                    <CancelIcon
                      sx={{ color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}
                      onClick={() => setInputUrl('')}
                    />
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !inputUrl.trim()}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{
              minWidth: { sm: '200px' },
              height: '56px',
              fontSize: '1rem',
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            {isLoading ? 'Pobieranie...' : 'Pobierz tekst'}
          </Button>
        </Stack>
      </form>

      {validationError && (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          {validationError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Przykładowe linki */}
      <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Szybki test:
        </Typography>
        {SAMPLE_VIDEOS.map((sample, idx) => (
          <Chip
            key={idx}
            label={sample.label}
            size="small"
            onClick={() => handleSelectSample(sample.url)}
            disabled={isLoading}
            clickable
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' },
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}
