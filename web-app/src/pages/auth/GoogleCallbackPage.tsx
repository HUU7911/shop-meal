import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { authApi } from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { parseToken } from '../../auth/jwt';
import { AuthCard } from './AuthLayout';

export default function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return; // StrictMode gọi effect 2 lần, mã code chỉ dùng được 1 lần
    called.current = true;
    const code = params.get('code');
    if (!code) {
      setError('Không nhận được mã xác thực từ Google.');
      return;
    }
    authApi
      .googleExchange(code)
      .then((res) => {
        // identity-service trả access_token của Google; nếu không phải JWT của hệ thống thì không dùng được.
        if (!parseToken(res.token)) {
          setError('Máy chủ chưa cấp phiên đăng nhập hợp lệ cho tài khoản Google. Hãy đăng nhập bằng tên đăng nhập và mật khẩu.');
          return;
        }
        loginWithToken(res.token);
        navigate('/', { replace: true });
      })
      .catch((e) => setError(getErrorMessage(e, 'Đăng nhập Google thất bại.')));
  }, [params, loginWithToken, navigate]);

  return (
    <AuthCard title="Đăng nhập Google">
      {error ? (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button component={RouterLink} to="/login">Quay lại đăng nhập</Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography>Đang xác thực…</Typography>
        </Stack>
      )}
    </AuthCard>
  );
}
