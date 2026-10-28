import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { productApi } from '../../api/services';
import type { Category, PageResponse, Product, ProductType } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import AuthImage, { fetchImageFile } from '../../components/AuthImage';
import { useNotify } from '../../context/NotifyContext';
import { formatPriceRange, getSizeOptions, PRODUCT_TYPE_LABEL } from '../../utils/format';

/** Một dòng size + giá trong form; backend nhận thành hai mảng song song `size[]` và `price[]`. */
interface VariantRow {
  size: string;
  price: string;
}

const emptyVariant = (): VariantRow => ({ size: '', price: '' });

const emptyForm = { name: '', type: 'FOOD' as ProductType, position: '', timeWork: '', categories: [] as string[] };

/**
 * Thêm hoặc sửa món. Khi sửa (có `product`):
 * - product-service luôn thay ảnh bằng file gửi lên, nên nếu không chọn ảnh mới thì tải lại ảnh cũ và gửi lại.
 * - FoodUpdateRequest ghi đè mọi trường, nên luôn gửi đủ các trường.
 */
function FoodDialog({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const notify = useNotify();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = !!product;

  useEffect(() => {
    if (!open) return;
    productApi.categories().then(setCategories).catch(() => undefined);
    setError('');
    setFile(null);
    setForm(
      product
        ? {
            name: product.name,
            type: product.type,
            position: product.position ?? '',
            timeWork: product.timeWork ?? '',
            categories: product.categories?.map((c) => c.name) ?? [],
          }
        : emptyForm,
    );
    const existing = product ? getSizeOptions(product) : [];
    setVariants(
      existing.length ? existing.map((o) => ({ size: o.size, price: String(o.price) })) : [emptyVariant()],
    );
  }, [open, product]);

  const updateVariant = (index: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const addVariant = () => setVariants((rows) => [...rows, emptyVariant()]);
  const removeVariant = (index: number) => setVariants((rows) => rows.filter((_, i) => i !== index));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing && !file) {
      setError('Hãy chọn ảnh món ăn.');
      return;
    }

    // Kiểm tra danh sách size/giá trước khi gửi
    const rows = variants.map((v) => ({ size: v.size.trim(), price: v.price.trim() }));
    if (rows.length === 0) {
      setError('Hãy thêm ít nhất một size và giá.');
      return;
    }
    if (rows.some((r) => !r.size)) {
      setError('Tên size không được để trống.');
      return;
    }
    if (rows.some((r) => r.price === '' || !Number.isFinite(Number(r.price)) || Number(r.price) < 0)) {
      setError('Giá của mỗi size phải là số không âm.');
      return;
    }
    if (new Set(rows.map((r) => r.size.toLowerCase())).size !== rows.length) {
      setError('Các size không được trùng tên.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        size: rows.map((r) => r.size),
        price: rows.map((r) => Number(r.price)),
        type: form.type,
        position: form.position.trim() || undefined,
        timeWork: form.timeWork.trim() || undefined,
        categories: form.categories,
      };
      if (product) {
        let image = file;
        if (!image) {
          const current = product.images?.[0];
          if (!current) {
            setError('Món này chưa có ảnh, hãy chọn một ảnh mới.');
            return;
          }
          try {
            image = await fetchImageFile(current, token);
          } catch {
            setError('Không tải được ảnh hiện tại. Hãy chọn một ảnh mới để lưu.');
            return;
          }
        }
        await productApi.updateFood(product.id, payload, image);
        notify('Đã cập nhật món.');
      } else {
        await productApi.createFood(payload, file as File);
        notify('Đã thêm món mới.');
      }
      onSaved();
      onClose();
    } catch (err) {
      // product-service: 1004 = PRODUCT_EXIST (message gốc ghi nhầm "User not exist")
      setError(getErrorCode(err) === 1004 ? 'Đã có món trùng tên này.' : getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{editing ? 'Sửa món' : 'Thêm món mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Tên món" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Size và giá</Typography>
              <Stack spacing={1.5}>
                {variants.map((v, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Size"
                      size="small"
                      value={v.size}
                      onChange={(e) => updateVariant(i, { size: e.target.value })}
                      placeholder="S, M, L..."
                      required
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Giá (₫)"
                      size="small"
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariant(i, { price: e.target.value })}
                      required
                      slotProps={{ htmlInput: { min: 0 } }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      aria-label="Xoá size"
                      onClick={() => removeVariant(i)}
                      disabled={variants.length <= 1}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Box>
                  <Button size="small" startIcon={<AddIcon />} onClick={addVariant}>Thêm size</Button>
                </Box>
              </Stack>
            </Box>
            <FormControl size="small">
              <InputLabel id="t">Loại</InputLabel>
              <Select labelId="t" label="Loại" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}>
                <MenuItem value="FOOD">{PRODUCT_TYPE_LABEL.FOOD}</MenuItem>
                <MenuItem value="DRINK">{PRODUCT_TYPE_LABEL.DRINK}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="c">Danh mục</InputLabel>
              <Select
                labelId="c"
                label="Danh mục"
                multiple
                value={form.categories}
                onChange={(e) => setForm({ ...form, categories: e.target.value as string[] })}
                renderValue={(v) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {v.map((x) => <Chip key={x} size="small" label={x} />)}
                  </Box>
                )}
              >
                {categories.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Giờ bán" value={form.timeWork} onChange={(e) => setForm({ ...form, timeWork: e.target.value })} />
            <TextField label="Vị trí / quầy" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            <Button variant="outlined" component="label">
              {file ? file.name : editing ? 'Chọn ảnh mới (không bắt buộc)' : 'Chọn ảnh món'}
              <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Huỷ</Button>
          <Button type="submit" variant="contained" disabled={busy}>{editing ? 'Lưu thay đổi' : 'Thêm món'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function AdminProducts() {
  const notify = useNotify();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageResponse<Product> | null>(null);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await productApi.list(page, 10));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async () => {
    if (!toDelete) return;
    try {
      await productApi.deleteFood(toDelete.id);
      notify('Đã xoá món.');
      setToDelete(null);
      await load();
    } catch (e) {
      notify(getErrorMessage(e), 'error');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Món ăn</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>Thêm món</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên món</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Size</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell><AuthImage src={p.images?.[0]} alt={p.name} sx={{ width: 48, height: 48, borderRadius: 1 }} /></TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{PRODUCT_TYPE_LABEL[p.type] ?? p.type}</TableCell>
                <TableCell>{p.categories?.map((c) => c.name).join(', ')}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {getSizeOptions(p).map((o, i) => (
                      <Chip key={`${o.size}-${i}`} size="small" variant="outlined" label={o.size || '—'} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="right">{formatPriceRange(getSizeOptions(p))}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="Sửa món" onClick={() => { setEditing(p); setDialogOpen(true); }}><EditOutlinedIcon /></IconButton>
                  <IconButton aria-label="Xoá món" onClick={() => setToDelete(p)}><DeleteOutlineIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data && data.data.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">Chưa có món nào.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPage > 1 && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination count={data.totalPage} page={page} color="primary" onChange={(_, v) => setPage(v)} />
        </Stack>
      )}

      <FoodDialog open={dialogOpen} product={editing} onClose={() => setDialogOpen(false)} onSaved={load} />

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Xoá “{toDelete?.name}”?</DialogTitle>
        <DialogContent><DialogContentText>Món sẽ biến mất khỏi thực đơn và kết quả tìm kiếm.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Giữ lại</Button>
          <Button color="error" onClick={remove}>Xoá món</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
