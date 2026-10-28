import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorMessage, getErrorStatus } from '../../api/client';
import { authApi } from '../../api/services';
import { useNotify } from '../../context/NotifyContext';

const steps = ['Email', 'Mã OTP', 'Mật khẩu mới'];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const notify = useNotify();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');

    try {
      await fn();
    } catch (err) {
      setError(
          getErrorStatus(err) === 401
              ? 'Máy chủ đang từ chối yêu cầu khi chưa đăng nhập. Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.'
              : getErrorMessage(err, 'Đã xảy ra lỗi. Vui lòng thử lại.'),
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 0) {
      void run(async () => {
        await authApi.forgotPassword(email.trim());
        setStep(1);
      });
      return;
    }

    if (step === 1) {
      if (!/^\d{6}$/.test(otp)) {
        setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
        return;
      }

      void run(async () => {
        const res = await authApi.verifyOtp(email.trim(), otp.trim());
        setResetToken(res.resetToken);
        setStep(2);
      });
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    void run(async () => {
      await authApi.resetPassword(resetToken, password);
      notify('Đã đặt lại mật khẩu. Hãy đăng nhập lại.');
      navigate('/login', { replace: true });
    });
  };

  const goBack = () => {
    setError('');
    setStep((current) => Math.max(0, current - 1));
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 54,
      borderRadius: '12px',
      bgcolor: '#FCFDFB',
      '& fieldset': { borderColor: '#E0E8E1' },
      '&:hover fieldset': { borderColor: '#83B99A' },
      '&.Mui-focused fieldset': {
        borderColor: '#13864F',
        borderWidth: 1.5,
      },
    },
    '& .MuiInputBase-input': {
      fontSize: 14,
    },
    '& .MuiInputBase-input::placeholder': {
      color: '#A3ADA5',
      opacity: 1,
    },
  };

  return (
      <Box
          sx={{
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            py: { xs: 1, sm: 2, md: 3 },
          }}
      >
        <Paper
            component="section"
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 620,
              minWidth: 0,
              boxSizing: 'border-box',
              overflow: 'hidden',
              borderRadius: { xs: 3, sm: 5 },
              border: '1px solid rgba(30, 80, 50, 0.08)',
              bgcolor: '#FFFFFF',
              boxShadow: '0 20px 65px rgba(42, 66, 43, 0.09)',
            }}
        >
          <Box
              sx={{
                height: 6,
                background:
                    'linear-gradient(90deg, #087443 0%, #15965B 65%, #F47B20 100%)',
              }}
          />

          <Box sx={{ px: { xs: 2.5, sm: 5, md: 6 }, py: { xs: 3, sm: 5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3.5 }}>
              <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '15px',
                    bgcolor: '#EAF6ED',
                    color: '#10834F',
                  }}
              >
                <LockResetRoundedIcon sx={{ fontSize: 29 }} />
              </Box>

              <Box>
                <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#13864F',
                      letterSpacing: 1.2,
                    }}
                >
                  SHOP MEAL
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#87938A', mt: 0.3 }}>
                  Bảo vệ tài khoản của bạn
                </Typography>
              </Box>
            </Stack>

            <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 27, sm: 34 },
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  lineHeight: 1.3,
                  color: '#172D25',
                }}
            >
              {step === 0
                  ? 'Quên mật khẩu?'
                  : step === 1
                      ? 'Xác minh email'
                      : 'Tạo mật khẩu mới'}
            </Typography>

            <Typography
                sx={{
                  mt: 1.2,
                  mb: 3.5,
                  fontSize: 14,
                  color: '#78847D',
                  lineHeight: 1.8,
                }}
            >
              {step === 0
                  ? 'Đừng lo lắng! Hãy nhập email đã đăng ký để bắt đầu khôi phục tài khoản.'
                  : step === 1
                      ? 'Nhập mã OTP được gửi đến email của bạn để xác minh danh tính.'
                      : 'Hãy chọn mật khẩu mới an toàn để tiếp tục sử dụng Shop Meal.'}
            </Typography>

            <Stepper
                activeStep={step}
                alternativeLabel
                sx={{
                  mb: 4,
                  mx: { xs: -1, sm: 0 },
                  '& .MuiStepLabel-label': {
                    mt: 1,
                    fontSize: { xs: 10, sm: 12 },
                    fontWeight: 600,
                    color: '#89958C',
                  },
                  '& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed': {
                    color: '#13864F',
                    fontWeight: 800,
                  },
                  '& .MuiStepIcon-root': {
                    color: '#E1EAE2',
                  },
                  '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': {
                    color: '#13864F',
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: '#E1EAE2',
                    borderTopWidth: 2,
                  },
                }}
            >
              {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 3, borderColor: '#E8EEE8' }} />

            <Stack component="form" spacing={2.5} onSubmit={submit}>
              {error && (
                  <Alert
                      severity="error"
                      onClose={() => setError('')}
                      sx={{ borderRadius: 2.5 }}
                  >
                    {error}
                  </Alert>
              )}

              {step === 0 && (
                  <>
                    <Box
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          borderRadius: 3,
                          bgcolor: '#F2F8F2',
                          border: '1px solid #E7F0E7',
                        }}
                    >
                      <EmailOutlinedIcon sx={{ color: '#13864F', mt: 0.2 }} />
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#30483B' }}>
                          Khôi phục qua email
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 12, color: '#78847D', lineHeight: 1.7 }}>
                          Chúng tôi sẽ hướng dẫn bạn xác minh tài khoản trước khi đổi mật khẩu.
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography
                          component="label"
                          htmlFor="forgot-email"
                          sx={{ display: 'block', mb: 0.9, fontSize: 13, fontWeight: 700, color: '#30483B' }}
                      >
                        Email đã đăng ký
                      </Typography>
                      <TextField
                          id="forgot-email"
                          fullWidth
                          type="email"
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                          autoComplete="email"
                          sx={fieldSx}
                          slotProps={{
                            htmlInput: { maxLength: 254 },
                            input: {
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailOutlinedIcon sx={{ color: '#91A095' }} />
                                  </InputAdornment>
                              ),
                            },
                          }}
                      />
                    </Box>
                  </>
              )}

              {step === 1 && (
                  <>
                    <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          borderRadius: '20px',
                          bgcolor: '#EAF6ED',
                          color: '#13864F',
                        }}
                    >
                      <MarkEmailReadOutlinedIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Alert severity="info" sx={{ borderRadius: 2.5, fontSize: 13 }}>
                      Nếu email tồn tại, mã OTP 6 số đã được gửi tới <strong>{email}</strong>.
                    </Alert>

                    <Box>
                      <Typography
                          component="label"
                          htmlFor="forgot-otp"
                          sx={{ display: 'block', mb: 0.9, fontSize: 13, fontWeight: 700, color: '#30483B' }}
                      >
                        Mã xác minh OTP
                      </Typography>
                      <TextField
                          id="forgot-otp"
                          fullWidth
                          placeholder="Nhập 6 chữ số"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          autoFocus
                          sx={{
                            ...fieldSx,
                            '& input': {
                              textAlign: 'center',
                              letterSpacing: { xs: 8, sm: 12 },
                              fontSize: '22px !important',
                              fontWeight: 800,
                            },
                          }}
                          slotProps={{
                            htmlInput: {
                              inputMode: 'numeric',
                              maxLength: 6,
                              pattern: '\\d{6}',
                              title: 'Mã OTP gồm 6 chữ số',
                            },
                          }}
                      />
                    </Box>
                  </>
              )}

              {step === 2 && (
                  <>
                    <Box>
                      <Typography
                          component="label"
                          htmlFor="new-password"
                          sx={{ display: 'block', mb: 0.9, fontSize: 13, fontWeight: 700, color: '#30483B' }}
                      >
                        Mật khẩu mới
                      </Typography>
                      <TextField
                          id="new-password"
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ít nhất 8 ký tự"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoFocus
                          autoComplete="new-password"
                          sx={fieldSx}
                          slotProps={{
                            htmlInput: { minLength: 8, maxLength: 100 },
                            input: {
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon sx={{ color: '#91A095' }} />
                                  </InputAdornment>
                              ),
                              endAdornment: (
                                  <InputAdornment position="end">
                                    <Button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        sx={{ minWidth: 0, color: '#6E8173', textTransform: 'none', fontSize: 12 }}
                                    >
                                      {showPassword ? 'Ẩn' : 'Hiện'}
                                    </Button>
                                  </InputAdornment>
                              ),
                            },
                          }}
                      />
                    </Box>

                    <Box>
                      <Typography
                          component="label"
                          htmlFor="confirm-new-password"
                          sx={{ display: 'block', mb: 0.9, fontSize: 13, fontWeight: 700, color: '#30483B' }}
                      >
                        Xác nhận mật khẩu mới
                      </Typography>
                      <TextField
                          id="confirm-new-password"
                          fullWidth
                          type="password"
                          placeholder="Nhập lại mật khẩu mới"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          error={Boolean(confirmPassword) && password !== confirmPassword}
                          helperText={
                            confirmPassword && password !== confirmPassword
                                ? 'Mật khẩu xác nhận không khớp.'
                                : ' '
                          }
                          sx={fieldSx}
                          slotProps={{
                            htmlInput: { minLength: 8, maxLength: 100 },
                          }}
                      />
                    </Box>
                  </>
              )}

              <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={
                      busy ||
                      (step === 1 && otp.length !== 6) ||
                      (step === 2 &&
                          (password.length < 8 || password !== confirmPassword))
                  }
                  endIcon={!busy && <ArrowForwardRoundedIcon />}
                  sx={{
                    minHeight: 54,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    background: 'linear-gradient(110deg, #15965B, #087443)',
                    boxShadow: '0 9px 22px rgba(13, 132, 76, 0.19)',
                    '&:hover': {
                      background: 'linear-gradient(110deg, #10834F, #065F36)',
                      boxShadow: '0 12px 25px rgba(13, 132, 76, 0.25)',
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-disabled': {
                      color: '#FFFFFF',
                      bgcolor: '#80B99A',
                    },
                    transition: 'all 180ms ease',
                  }}
              >
                {busy
                    ? 'Đang xử lý…'
                    : step === 0
                        ? 'Gửi mã OTP'
                        : step === 1
                            ? 'Xác nhận mã OTP'
                            : 'Đặt lại mật khẩu'}
              </Button>

              {step > 0 && (
                  <Button
                      type="button"
                      variant="text"
                      disabled={busy}
                      onClick={goBack}
                      startIcon={<ArrowBackRoundedIcon />}
                      sx={{
                        alignSelf: 'center',
                        textTransform: 'none',
                        color: '#617467',
                        fontWeight: 700,
                      }}
                  >
                    Quay lại bước trước
                  </Button>
              )}

              <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#78847D', pt: 0.5 }}>
                Nhớ mật khẩu rồi?{' '}
                <Link
                    component={RouterLink}
                    to="/login"
                    underline="none"
                    sx={{
                      color: '#13864F',
                      fontWeight: 800,
                      '&:hover': { color: '#075F36', textDecoration: 'underline' },
                    }}
                >
                  Đăng nhập
                </Link>
              </Typography>
            </Stack>

            <Typography
                sx={{
                  mt: 3.5,
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#9AA49C',
                }}
            >
              © {new Date().getFullYear()} Shop Meal · Món ngon mỗi ngày
            </Typography>
          </Box>
        </Paper>
      </Box>
  );
}
