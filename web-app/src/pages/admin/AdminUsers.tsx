
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, MenuItem, Paper, Pagination, Select, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { userApi } from '../../api/services';
import type { User } from '../../api/types';
import { useNotify } from '../../context/NotifyContext';

const empty = { username: '', password: '', firstName: '', lastName: '', email: '', birthday: '' };

export default function AdminUsers() {
  const notify = useNotify();

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async () => {
    try {
      setError('');

      const response = await userApi.list(page, size);

      setUsers(response.data ?? []);
      setTotalPages(response.totalPage ?? 0);
    } catch (e) {
      setError(getErrorMessage(e));
      setUsers([]);
    }
  }, [page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      await userApi.createStaff({ ...form, birthday: form.birthday || null });

      notify('Đã tạo tài khoản nhân viên.');
      setForm(empty);
      setOpen(false);

      if (page !== 1) {
        setPage(1);
      } else {
        await load();
      }
    } catch (err) {
      setFormError(
        getErrorCode(err) === 1004
          ? 'Tên đăng nhập đã tồn tại.'
          : getErrorMessage(err)
      );
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Người dùng</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpen(true)}>
          Tạo nhân viên
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.username}</TableCell>
                <TableCell>{[u.lastName, u.firstName].filter(Boolean).join(' ')}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.roles?.map((r) => (
                    <Chip key={r.name} size="small" label={r.name} sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {error ? 'Không thể tải danh sách người dùng.' : 'Chưa có người dùng.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">Số lượng mỗi trang:</Typography>
          <Select
            size="small"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((value) => (
              <MenuItem key={value} value={value}>{value}</MenuItem>
            ))}
          </Select>
        </Stack>

        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={create}>
          <DialogTitle>Tạo tài khoản nhân viên</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}

              <Stack direction="row" spacing={2}>
                <TextField label="Họ" value={form.lastName} onChange={set('lastName')} required />
                <TextField label="Tên" value={form.firstName} onChange={set('firstName')} required />
              </Stack>

              <TextField label="Tên đăng nhập" value={form.username} onChange={set('username')} required />
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} required />
              <TextField label="Mật khẩu" type="password" value={form.password} onChange={set('password')} required />
              <TextField
                label="Ngày sinh"
                type="date"
                value={form.birthday}
                onChange={set('birthday')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Huỷ</Button>
            <Button type="submit" variant="contained">Tạo tài khoản</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
