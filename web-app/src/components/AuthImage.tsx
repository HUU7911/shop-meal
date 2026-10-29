import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Box, SxProps, Theme } from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const API_ORIGIN = new URL(API_BASE_URL, window.location.href).origin;

function needsAuth(src: string): boolean {
  try {
    return new URL(src, window.location.href).origin === API_ORIGIN;
  } catch {
    return false;
  }
}

const cache = new Map<string, Promise<string>>();

function loadBlob(src: string, token: string): Promise<string> {
  let p = cache.get(src);
  if (!p) {
    p = fetch(src, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.blob();
        })
        .then((b) => URL.createObjectURL(b));
    p.catch(() => cache.delete(src));
    cache.set(src, p);
  }
  return p;
}

export async function fetchImageFile(src: string, token: string | null): Promise<File> {
  const res = await fetch(src, token && needsAuth(src) ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) throw new Error(String(res.status));
  const blob = await res.blob();
  const name = decodeURIComponent(src.split('?')[0].split('/').pop() || 'image');
  return new File([blob], name, { type: blob.type || 'application/octet-stream' });
}

interface Props {
  src?: string;
  alt: string;
  sx?: SxProps<Theme>;
  fit?: 'cover' | 'contain';
}

export default function AuthImage({ src, alt, sx, fit = 'cover' }: Props) {
  const { token } = useAuth();
  const [url, setUrl] = useState<string | undefined>(src && (!token || !needsAuth(src)) ? src : undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setUrl(undefined);
    if (!src) return;
    if (!token || !needsAuth(src)) {
      setUrl(src);
      return;
    }
    let active = true;
    loadBlob(src, token)
        .then((u) => active && setUrl(u))
        .catch(() => active && setUrl(src));
    return () => {
      active = false;
    };
  }, [src, token]);

  if (!src || failed || !url) {
    return (
        <Box
            role="img"
            aria-label={alt}
            sx={[
              { display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'text.disabled' },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
          <RestaurantIcon />
        </Box>
    );
  }

  return (
      <Box
          component="img"
          src={url}
          alt={alt}
          onError={() => setFailed(true)}
          sx={[{ objectFit: fit, display: 'block' }, ...(Array.isArray(sx) ? sx : [sx])]}
      />
  );
}