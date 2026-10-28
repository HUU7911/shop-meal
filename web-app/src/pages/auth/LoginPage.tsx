import { Alert, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { AuthCard } from './AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleRedirect = import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? `${window.location.origin}/authenticate`;
  const googleUrl = googleId
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleId)}&redirect_uri=${encodeURIComponent(
        googleRedirect,
      )}&response_type=code&scope=openid%20email%20profile`
    : '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      // identity-service: 1002 = USER_NOT_FOUND, 1006 = UNAUTHENTICATED (sai mật khẩu)
      const code = getErrorCode(err);
      setError(
        code === 1002 || code === 1006
          ? 'Sai tên đăng nhập hoặc mật khẩu.'
          : getErrorMessage(err, 'Sai tên đăng nhập hoặc mật khẩu.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Đăng nhập" subtitle="Đăng nhập để đặt món và theo dõi đơn hàng.">
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Tên đăng nhập hoặc Email" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <TextField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
        <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ alignSelf: 'flex-end' }}>
          Quên mật khẩu?
        </Link>
        {googleUrl && (
          <>
            <Divider>hoặc</Divider>
            <Button variant="outlined" href={googleUrl}>Đăng nhập bằng Google</Button>
          </>
        )}
        <Typography variant="body2" align="center">
          Chưa có tài khoản? <Link component={RouterLink} to="/register">Đăng ký</Link>
        </Typography>
      </Stack>
    </AuthCard>
  );
}
