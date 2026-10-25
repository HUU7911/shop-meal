import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { authApi } from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { useNotify } from '../../context/NotifyContext';
import { AuthCard } from './AuthLayout';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm: '',
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await authApi.register({
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        birthday: form.birthday || null,
      });
      await login(form.username.trim(), form.password);
      notify('Tạo tài khoản thành công. Chào mừng bạn!');
      navigate('/', { replace: true });
    } catch (err) {
      // identity-service: 1004 = USER_EXIST (message gốc của backend ghi nhầm "User not exist")
      setError(
        getErrorCode(err) === 1004
          ? 'Tên đăng nhập đã tồn tại. Hãy chọn tên khác.'
          : getErrorMessage(err, 'Không tạo được tài khoản. Vui lòng thử lại.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Tạo tài khoản">
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction="row" spacing={2}>
          <TextField label="Họ" value={form.lastName} onChange={set('lastName')} required />
          <TextField label="Tên" value={form.firstName} onChange={set('firstName')} required />
        </Stack>
        <TextField label="Tên đăng nhập" value={form.username} onChange={set('username')} required />
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} required />
        <TextField
          label="Ngày sinh"
          type="date"
          value={form.birthday}
          onChange={set('birthday')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField label="Mật khẩu" type="password" value={form.password} onChange={set('password')} required />
        <TextField label="Nhập lại mật khẩu" type="password" value={form.confirm} onChange={set('confirm')} required />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? 'Đang tạo…' : 'Đăng ký'}
        </Button>
        <Typography variant="body2" align="center">
          Đã có tài khoản? <Link component={RouterLink} to="/login">Đăng nhập</Link>
        </Typography>
      </Stack>
    </AuthCard>
  );
}
