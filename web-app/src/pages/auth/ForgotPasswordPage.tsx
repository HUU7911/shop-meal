import { Alert, Button, Link, Step, StepLabel, Stepper, Stack, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorMessage, getErrorStatus } from '../../api/client';
import { authApi } from '../../api/services';
import { useNotify } from '../../context/NotifyContext';
import { AuthCard } from './AuthLayout';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const notify = useNotify();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      // Gateway và identity-service hiện chưa mở công khai 3 endpoint quên mật khẩu -> khách nhận 401.
      setError(
        getErrorStatus(err) === 401
          ? 'Máy chủ đang từ chối yêu cầu này khi chưa đăng nhập. Hãy liên hệ quản trị viên để đặt lại mật khẩu.'
          : getErrorMessage(err),
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0)
      void run(async () => {
        await authApi.forgotPassword(email.trim());
        setStep(1);
      });
    else if (step === 1)
      void run(async () => {
        const res = await authApi.verifyOtp(email.trim(), otp.trim());
        setResetToken(res.resetToken);
        setStep(2);
      });
    else
      void run(async () => {
        await authApi.resetPassword(resetToken, password);
        notify('Đã đặt lại mật khẩu. Hãy đăng nhập lại.');
        navigate('/login', { replace: true });
      });
  };

  return (
    <AuthCard title="Quên mật khẩu">
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {['Email', 'Mã OTP', 'Mật khẩu mới'].map((l) => (
          <Step key={l}><StepLabel>{l}</StepLabel></Step>
        ))}
      </Stepper>
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        {step === 0 && (
          <TextField label="Email đã đăng ký" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        )}
        {step === 1 && (
          <>
            <Alert severity="info">Nếu email tồn tại, mã OTP 6 số đã được gửi tới {email}.</Alert>
            <TextField
              label="Mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6, pattern: '\\d{6}', title: 'Mã OTP gồm 6 chữ số' } }}
            />
          </>
        )}
        {step === 2 && (
          <TextField
            label="Mật khẩu mới (ít nhất 8 ký tự)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            slotProps={{ htmlInput: { minLength: 8, maxLength: 100 } }}
          />
        )}
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {step === 0 ? 'Gửi mã OTP' : step === 1 ? 'Xác nhận mã' : 'Đặt lại mật khẩu'}
        </Button>
        <Link component={RouterLink} to="/login" variant="body2" align="center">Quay lại đăng nhập</Link>
      </Stack>
    </AuthCard>
  );
}
