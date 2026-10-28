import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { authApi } from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { useNotify } from '../../context/NotifyContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set =
      (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
        setForm((current) => ({
          ...current,
          [key]: e.target.value,
        }));
        if (error) setError('');
      };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
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
      setError(
          getErrorCode(err) === 1004
              ? 'Tên đăng nhập đã tồn tại. Hãy chọn tên khác.'
              : getErrorMessage(
                  err,
                  'Không tạo được tài khoản. Vui lòng thử lại.',
              ),
      );
    } finally {
      setBusy(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 54,
      borderRadius: '12px',
      bgcolor: '#FCFDFB',
      '& fieldset': {
        borderColor: '#E0E8E1',
      },
      '&:hover fieldset': {
        borderColor: '#83B99A',
      },
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

  const labelSx = {
    display: 'block',
    mb: 0.9,
    fontSize: 13,
    fontWeight: 700,
    color: '#30483B',
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
              maxWidth: 680,
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
                background: 'linear-gradient(90deg, #087443 0%, #15965B 65%, #F47B20 100%)',
              }}
          />

          <Box
              sx={{
                px: { xs: 2.5, sm: 5, md: 6 },
                py: { xs: 3, sm: 4.5, md: 5 },
              }}
          >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 3.5 }}
            >
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
                <PersonOutlineRoundedIcon sx={{ fontSize: 29 }} />
              </Box>

              <Box>
                <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#13864F',
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                    }}
                >
                  SHOP MEAL
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#87938A', mt: 0.3 }}>
                  Món ngon mỗi ngày
                </Typography>
              </Box>
            </Stack>

            <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 28, sm: 34 },
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  lineHeight: 1.25,
                  color: '#172D25',
                }}
            >
              Tạo tài khoản
              <Box component="span" sx={{ color: '#F47B20' }}>
                {' '}Shop Meal
              </Box>
            </Typography>

            <Typography
                sx={{
                  mt: 1.2,
                  mb: 3.5,
                  fontSize: 14,
                  color: '#78847D',
                  lineHeight: 1.8,
                  maxWidth: 470,
                }}
            >
              Tham gia cùng Shop Meal để khám phá món ngon và trải nghiệm đặt món
              tiện lợi mỗi ngày.
            </Typography>

            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  p: 1.7,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: '#F2F8F2',
                  border: '1px solid #E7F0E7',
                }}
            >
              <CheckCircleOutlineRoundedIcon
                  sx={{ color: '#13864F', fontSize: 21 }}
              />
              <Typography sx={{ fontSize: 12, color: '#52695A', lineHeight: 1.7 }}>
                Điền thông tin bên dưới để tạo tài khoản mới.
              </Typography>
            </Stack>

            <Stack component="form" spacing={2.4} onSubmit={submit}>
              {error && (
                  <Alert
                      severity="error"
                      onClose={() => setError('')}
                      sx={{ borderRadius: 2.5 }}
                  >
                    {error}
                  </Alert>
              )}

              <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#30483B',
                  }}
              >
                Thông tin cá nhân
              </Typography>

              <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 2,
                  }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="label" htmlFor="register-last-name" sx={labelSx}>
                    Họ
                  </Typography>
                  <TextField
                      id="register-last-name"
                      fullWidth
                      placeholder="Nhập họ"
                      value={form.lastName}
                      onChange={set('lastName')}
                      required
                      autoComplete="family-name"
                      inputProps={{ maxLength: 100 }}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                              <BadgeOutlinedIcon sx={{ color: '#91A095' }} />
                            </InputAdornment>
                        ),
                      }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography component="label" htmlFor="register-first-name" sx={labelSx}>
                    Tên
                  </Typography>
                  <TextField
                      id="register-first-name"
                      fullWidth
                      placeholder="Nhập tên"
                      value={form.firstName}
                      onChange={set('firstName')}
                      required
                      autoComplete="given-name"
                      inputProps={{ maxLength: 100 }}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineRoundedIcon sx={{ color: '#91A095' }} />
                            </InputAdornment>
                        ),
                      }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography component="label" htmlFor="register-username" sx={labelSx}>
                  Tên đăng nhập
                </Typography>
                <TextField
                    id="register-username"
                    fullWidth
                    placeholder="Tạo tên đăng nhập"
                    value={form.username}
                    onChange={set('username')}
                    required
                    autoComplete="username"
                    inputProps={{ maxLength: 100 }}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRoundedIcon sx={{ color: '#91A095' }} />
                          </InputAdornment>
                      ),
                    }}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="register-email" sx={labelSx}>
                  Email
                </Typography>
                <TextField
                    id="register-email"
                    fullWidth
                    type="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                    autoComplete="email"
                    inputProps={{ maxLength: 254 }}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: '#91A095' }} />
                          </InputAdornment>
                      ),
                    }}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="register-birthday" sx={labelSx}>
                  Ngày sinh <Box component="span" sx={{ color: '#9AA49C', fontWeight: 400 }}>(không bắt buộc)</Box>
                </Typography>
                <TextField
                    id="register-birthday"
                    fullWidth
                    type="date"
                    value={form.birthday}
                    onChange={set('birthday')}
                    autoComplete="bday"
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: {
                        max: new Date().toISOString().slice(0, 10),
                      },
                    }}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthRoundedIcon sx={{ color: '#91A095' }} />
                          </InputAdornment>
                      ),
                    }}
                />
              </Box>

              <Divider sx={{ borderColor: '#E8EEE8', my: 0.5 }} />

              <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#30483B',
                  }}
              >
                Thiết lập mật khẩu
              </Typography>

              <Box>
                <Typography component="label" htmlFor="register-password" sx={labelSx}>
                  Mật khẩu
                </Typography>
                <TextField
                    id="register-password"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tạo mật khẩu"
                    value={form.password}
                    onChange={set('password')}
                    required
                    autoComplete="new-password"
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: '#91A095' }} />
                          </InputAdornment>
                      ),
                      endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                                type="button"
                                edge="end"
                                size="small"
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                            </IconButton>
                          </InputAdornment>
                      ),
                    }}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="register-confirm-password" sx={labelSx}>
                  Nhập lại mật khẩu
                </Typography>
                <TextField
                    id="register-confirm-password"
                    fullWidth
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirm}
                    onChange={set('confirm')}
                    required
                    autoComplete="new-password"
                    error={Boolean(form.confirm) && form.password !== form.confirm}
                    helperText={
                      form.confirm && form.password !== form.confirm
                          ? 'Mật khẩu nhập lại chưa khớp.'
                          : ' '
                    }
                    sx={{
                      ...fieldSx,
                      '& .MuiFormHelperText-root': {
                        mx: 0.5,
                        mb: -1,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: '#91A095' }} />
                          </InputAdornment>
                      ),
                      endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                                type="button"
                                edge="end"
                                size="small"
                                aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                onClick={() => setShowConfirm((prev) => !prev)}
                            >
                              {showConfirm ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                            </IconButton>
                          </InputAdornment>
                      ),
                    }}
                />
              </Box>

              <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={busy}
                  endIcon={!busy && <ArrowForwardRoundedIcon />}
                  sx={{
                    minHeight: 54,
                    mt: 0.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: 15,
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
                {busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
              </Button>

              <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#78847D',
                    fontSize: 13,
                    pt: 0.5,
                  }}
              >
                Đã có tài khoản?{' '}
                <Link
                    component={RouterLink}
                    to="/login"
                    underline="none"
                    sx={{
                      fontWeight: 800,
                      color: '#13864F',
                      '&:hover': {
                        color: '#075F36',
                        textDecoration: 'underline',
                      },
                    }}
                >
                  Đăng nhập ngay
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
  );
}
