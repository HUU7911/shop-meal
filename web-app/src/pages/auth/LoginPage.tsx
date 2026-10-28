import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import LunchDiningRoundedIcon from '@mui/icons-material/LunchDiningRounded';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const foodImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleRedirect =
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ??
      `${window.location.origin}/authenticate`;

  const googleUrl = googleId
      ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          googleId,
      )}&redirect_uri=${encodeURIComponent(
          googleRedirect,
      )}&response_type=code&scope=openid%20email%20profile`
      : '';

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
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
      <Box
          sx={{
            minHeight: '100vh',
            boxSizing: 'border-box',
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            bgcolor: '#FBF9F2',
            backgroundImage:
                'radial-gradient(ellipse at 5% 10%, rgba(232, 244, 218, 0.85), transparent 32%), radial-gradient(ellipse at 95% 90%, rgba(255, 229, 201, 0.8), transparent 30%)',
          }}
      >
        <Box
            sx={{
              position: 'absolute',
              width: 280,
              height: 280,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.35)',
              top: -140,
              right: -80,
              pointerEvents: 'none',
            }}
        />

        <Box
            sx={{
              width: '100%',
              maxWidth: 1120,
              position: 'relative',
              zIndex: 1,
            }}
        >
          <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: { xs: 3, md: 4 }, px: { xs: 0, sm: 1 } }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '15px',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #14945B, #087443)',
                    boxShadow: '0 7px 18px rgba(15, 132, 78, 0.2)',
                  }}
              >
                <RestaurantMenuRoundedIcon sx={{ fontSize: 29 }} />
              </Box>

              <Box>
                <Typography
                    sx={{
                      fontSize: { xs: 22, sm: 27 },
                      fontWeight: 900,
                      letterSpacing: '-1px',
                      lineHeight: 1.15,
                      color: '#087443',
                    }}
                >
                  Shop <Box component="span" sx={{ color: '#F47B20' }}>Meal</Box>
                </Typography>
                <Typography
                    sx={{
                      fontSize: 12,
                      color: '#65746A',
                      fontWeight: 500,
                      letterSpacing: 0.2,
                    }}
                >
                  Món ngon mỗi ngày
                </Typography>
              </Box>
            </Stack>

            <Stack
                direction="row"
                alignItems="center"
                spacing={0.7}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <Typography
                  sx={{
                    fontSize: 13,
                    color: '#37644E',
                    fontWeight: 600,
                  }}
              >
                Ăn ngon · Sống khỏe · Cùng Shop Meal
              </Typography>
              <FavoriteBorderRoundedIcon
                  sx={{ fontSize: 19, color: '#F47B20' }}
              />
            </Stack>
          </Stack>

          <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
                bgcolor: '#FFFFFF',
                borderRadius: { xs: 4, md: 6 },
                overflow: 'hidden',
                border: '1px solid rgba(30, 80, 50, 0.07)',
                boxShadow: '0 24px 75px rgba(42, 66, 43, 0.11)',
              }}
          >
            <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 270, sm: 340, md: 660 },
                  display: { xs: 'none', sm: 'flex' },
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  p: { sm: 4, md: 5 },
                  color: '#FFFFFF',
                  backgroundImage: `linear-gradient(180deg, rgba(13, 61, 39, 0.12) 0%, rgba(8, 54, 35, 0.42) 46%, rgba(5, 43, 28, 0.94) 100%), url("${foodImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
            >
              <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(135deg, rgba(20, 148, 91, 0.12), transparent 55%)',
                    pointerEvents: 'none',
                  }}
              />

              <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ position: 'relative', zIndex: 1 }}
              >
                <Box
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 38,
                      height: 38,
                      borderRadius: 2.5,
                      bgcolor: '#FFFFFF',
                      color: '#10834F',
                    }}
                >
                  <RestaurantMenuRoundedIcon />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
                  Shop Meal
                </Typography>
              </Stack>

              <Box sx={{ position: 'relative', zIndex: 1, mt: 8 }}>
                <Box
                    sx={{
                      width: 52,
                      height: 4,
                      borderRadius: 3,
                      bgcolor: '#F9A23B',
                      mb: 2.5,
                    }}
                />

                <Typography
                    sx={{
                      fontSize: { sm: 34, md: 43 },
                      fontWeight: 900,
                      lineHeight: 1.2,
                      letterSpacing: '-1.2px',
                      maxWidth: 390,
                    }}
                >
                  Món ngon
                  <br />
                  <Box component="span" sx={{ color: '#FFC46A' }}>
                    gần bạn.
                  </Box>
                </Typography>

                <Typography
                    sx={{
                      mt: 2,
                      fontSize: 14,
                      lineHeight: 1.9,
                      color: 'rgba(255,255,255,0.86)',
                      maxWidth: 340,
                    }}
                >
                  Khám phá những món ăn hấp dẫn, đồ uống tươi ngon và câu chuyện
                  ẩm thực thú vị mỗi ngày.
                </Typography>

                <Stack spacing={2.2} sx={{ mt: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1.6}>
                    <Box
                        sx={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.14)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                    >
                      <LunchDiningRoundedIcon sx={{ color: '#FFD28B' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        Đa dạng món ăn
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
                        Lựa chọn phù hợp cho mỗi ngày
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1.6}>
                    <Box
                        sx={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.14)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                    >
                      <VerifiedRoundedIcon sx={{ color: '#B9F0C9' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        Chất lượng mỗi ngày
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
                        Trải nghiệm đặt món thuận tiện
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1.6}>
                    <Box
                        sx={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.14)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                    >
                      <LocalShippingRoundedIcon sx={{ color: '#FFD28B' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        Đặt món thật dễ dàng
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
                        Theo dõi đơn hàng thuận tiện
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              <Typography
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    mt: 5,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                  }}
              >
                Món ngon cho cuộc sống tốt hơn.
              </Typography>
            </Box>

            <Box
                sx={{
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2.5, sm: 4, md: 6 },
                }}
            >
              <Box sx={{ width: '100%', maxWidth: 430 }}>
                <Box sx={{ mb: 3.5 }}>
                  <Box
                      sx={{
                        display: { xs: 'grid', sm: 'none' },
                        placeItems: 'center',
                        width: 54,
                        height: 54,
                        borderRadius: 3.5,
                        bgcolor: '#EAF6ED',
                        color: '#10834F',
                        mb: 2,
                      }}
                  >
                    <RestaurantMenuRoundedIcon sx={{ fontSize: 30 }} />
                  </Box>

                  <Typography
                      component="h1"
                      sx={{
                        fontSize: { xs: 29, sm: 35 },
                        fontWeight: 900,
                        letterSpacing: '-1.1px',
                        color: '#172D25',
                        lineHeight: 1.25,
                      }}
                  >
                    Chào mừng trở lại!
                  </Typography>

                  <Typography
                      sx={{
                        mt: 1.2,
                        color: '#78847D',
                        fontSize: 14,
                        lineHeight: 1.8,
                      }}
                  >
                    Đăng nhập để đặt món và theo dõi đơn hàng của bạn.
                  </Typography>
                </Box>

                <Stack component="form" spacing={2.3} onSubmit={submit}>
                  {error && (
                      <Alert
                          severity="error"
                          onClose={() => setError('')}
                          sx={{ borderRadius: 2.5 }}
                      >
                        {error}
                      </Alert>
                  )}

                  <Box>
                    <Typography
                        component="label"
                        htmlFor="login-username"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#30483B',
                        }}
                    >
                      Tên đăng nhập hoặc Email
                    </Typography>

                    <TextField
                        id="login-username"
                        fullWidth
                        placeholder="Nhập tên đăng nhập hoặc email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                        autoComplete="username"
                        inputProps={{ maxLength: 254 }}
                        InputProps={{
                          startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutlineRoundedIcon sx={{ color: '#91A095' }} />
                              </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            minHeight: 54,
                            borderRadius: 2.8,
                            bgcolor: '#FCFDFB',
                            '& fieldset': { borderColor: '#E0E8E1' },
                            '&:hover fieldset': { borderColor: '#83B99A' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#13864F',
                              borderWidth: 1.5,
                            },
                          },
                          '& input': { fontSize: 13, py: 1.8 },
                          '& input::placeholder': { color: '#A3ADA5', opacity: 1 },
                        }}
                    />
                  </Box>

                  <Box>
                    <Typography
                        component="label"
                        htmlFor="login-password"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#30483B',
                        }}
                    >
                      Mật khẩu
                    </Typography>

                    <TextField
                        id="login-password"
                        fullWidth
                        placeholder="Nhập mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        InputProps={{
                          startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlinedIcon sx={{ color: '#91A095' }} />
                              </InputAdornment>
                          ),
                          endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    edge="end"
                                    size="small"
                                >
                                  {showPassword ? (
                                      <VisibilityOffRoundedIcon />
                                  ) : (
                                      <VisibilityRoundedIcon />
                                  )}
                                </IconButton>
                              </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            minHeight: 54,
                            borderRadius: 2.8,
                            bgcolor: '#FCFDFB',
                            '& fieldset': { borderColor: '#E0E8E1' },
                            '&:hover fieldset': { borderColor: '#83B99A' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#13864F',
                              borderWidth: 1.5,
                            },
                          },
                          '& input': { fontSize: 13, py: 1.8 },
                          '& input::placeholder': { color: '#A3ADA5', opacity: 1 },
                        }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.2 }}>
                      <Link
                          component={RouterLink}
                          to="/forgot-password"
                          underline="none"
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#13864F',
                            '&:hover': { color: '#08663A', textDecoration: 'underline' },
                          }}
                      >
                        Quên mật khẩu?
                      </Link>
                    </Box>
                  </Box>

                  <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={busy}
                      endIcon={!busy && <ArrowForwardRoundedIcon />}
                      sx={{
                        minHeight: 54,
                        mt: 0.5,
                        borderRadius: 2.8,
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
                    {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
                  </Button>

                  {googleUrl && (
                      <>
                        <Divider
                            sx={{
                              color: '#96A098',
                              fontSize: 12,
                              '&::before, &::after': { borderColor: '#E7ECE7' },
                            }}
                        >
                          hoặc tiếp tục với
                        </Divider>

                        <Button
                            variant="outlined"
                            href={googleUrl}
                            fullWidth
                            sx={{
                              minHeight: 52,
                              borderRadius: 2.8,
                              borderColor: '#DFE7E0',
                              color: '#35483C',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: 13,
                              bgcolor: '#FFFFFF',
                              '&:hover': {
                                borderColor: '#13864F',
                                bgcolor: '#F5FAF5',
                              },
                            }}
                        >
                          <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 23,
                                height: 23,
                                mr: 1.2,
                                fontSize: 21,
                                fontWeight: 900,
                                fontFamily: 'Arial, sans-serif',
                                background:
                                    'conic-gradient(from -45deg, #4285F4 0deg 90deg, #34A853 90deg 180deg, #FBBC05 180deg 245deg, #EA4335 245deg 310deg, #4285F4 310deg)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                          >
                            G
                          </Box>
                          Đăng nhập bằng Google
                        </Button>
                      </>
                  )}

                  <Box
                      sx={{
                        mt: 0.5,
                        p: { xs: 2, sm: 2.3 },
                        borderRadius: 3,
                        textAlign: 'center',
                        bgcolor: '#F2F8F2',
                        border: '1px solid #E9F2E9',
                      }}
                  >
                    <Typography sx={{ fontSize: 13, color: '#6D7B70' }}>
                      Chưa có tài khoản?
                    </Typography>

                    <Link
                        component={RouterLink}
                        to="/register"
                        underline="none"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.6,
                          mt: 0.8,
                          color: '#10834F',
                          fontSize: 14,
                          fontWeight: 800,
                          '&:hover': { color: '#075F36' },
                        }}
                    >
                      Tạo tài khoản ngay
                      <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
                    </Link>
                  </Box>
                </Stack>

                <Typography
                    sx={{
                      mt: 3,
                      textAlign: 'center',
                      fontSize: 11,
                      color: '#9AA49C',
                      lineHeight: 1.8,
                    }}
                >
                  © {new Date().getFullYear()} Shop Meal · Món ngon mỗi ngày
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
              sx={{
                mt: 2.5,
                textAlign: 'center',
                color: '#819084',
                fontSize: 12,
                display: { xs: 'none', sm: 'block' },
              }}
          >
            Ăn ngon hơn, sống khỏe hơn cùng Shop Meal.
          </Typography>
        </Box>
      </Box>
  );
}
