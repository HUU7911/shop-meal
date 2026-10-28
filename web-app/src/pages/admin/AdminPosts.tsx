import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { postApi, productApi } from '../../api/services';
import type { PostArticle, PostForProduct, Product } from '../../api/types';
import AuthImage from '../../components/AuthImage';
import { useNotify } from '../../context/NotifyContext';

const TITLE_MIN = 5;
const TITLE_MAX = 180;
const CONTENT_MIN = 20;
const MAX_IMAGE_MB = 10; // khớp spring.servlet.multipart.max-file-size của post-service

function fmtDate(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('vi-VN');
}

/** Đăng bài viết — chỉ ADMIN (route được bọc bởi RequireAdmin). */
export default function AdminPosts() {
  const [tab, setTab] = useState<'general' | 'product'>('general');
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Đăng bài viết</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Bài viết chung hiển thị ở trang chủ; bài viết về món hiển thị bên dưới thông tin chi tiết của món đó.
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab value="general" label="Bài viết chung (có ảnh)" />
        <Tab value="product" label="Bài viết về món ăn" />
      </Tabs>
      {tab === 'general' ? <GeneralPostForm /> : <ProductPostForm />}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Bài viết chung: tiêu đề + nội dung + ảnh (multipart)               */
/* ------------------------------------------------------------------ */
function GeneralPostForm() {
  const notify = useNotify();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<PostArticle[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const words = useMemo(() => (content.trim() ? content.trim().split(/\s+/).length : 0), [content]);

  // Tạo/thu hồi URL xem trước của ảnh đã chọn
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const loadRecent = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await postApi.list(1, 5);
      setRecent(res?.data ?? []);
    } catch {
      setRecent([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const pickFile = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh (JPG, PNG, WEBP…).');
    } else if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Ảnh tối đa ${MAX_IMAGE_MB}MB.`);
    } else {
      setError('');
      setFile(f);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const reset = () => {
    setTitle('');
    setContent('');
    setFile(null);
    setError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (t.length < TITLE_MIN) return setError(`Tiêu đề cần có ít nhất ${TITLE_MIN} ký tự.`);
    if (c.length < CONTENT_MIN) return setError(`Nội dung cần có ít nhất ${CONTENT_MIN} ký tự.`);
    if (!file) return setError('Vui lòng chọn ảnh cho bài viết.');
    setBusy(true);
    setError('');
    try {
      await postApi.create({ postTitle: t, postContent: c }, file);
      notify('Đã đăng bài viết.');
      reset();
      await loadRecent();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đăng bài viết. Vui lòng thử lại.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(300px, 1fr)' },
        gap: 3,
        alignItems: 'start',
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack component="form" spacing={2.5} onSubmit={submit}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
            helperText={`${title.length}/${TITLE_MAX} ký tự`}
          />

          {/* Ảnh bài viết */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Ảnh bài viết <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            {preview ? (
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <Box component="img" src={preview} alt="Ảnh bài viết" sx={{ display: 'block', width: '100%', maxHeight: 320, objectFit: 'cover' }} />
                <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <Button size="small" variant="contained" color="inherit" onClick={() => fileRef.current?.click()} disabled={busy}>
                    Đổi ảnh
                  </Button>
                  <IconButton
                    size="small"
                    aria-label="Xoá ảnh"
                    onClick={() => setFile(null)}
                    disabled={busy}
                    sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="caption" sx={{ display: 'block', p: 1, color: 'text.secondary' }}>
                  {file?.name} · {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                sx={{ py: 4, borderStyle: 'dashed', flexDirection: 'column', gap: 0.5 }}
              >
                <AddPhotoAlternateIcon color="primary" fontSize="large" />
                <span>Chọn ảnh từ máy</span>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG, WEBP… tối đa {MAX_IMAGE_MB}MB
                </Typography>
              </Button>
            )}
          </Box>

          <TextField
            label="Nội dung"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            minRows={10}
            maxRows={24}
            placeholder="Viết nội dung bài viết tại đây…"
            helperText={`Tối thiểu ${CONTENT_MIN} ký tự · ${words} từ`}
          />

          <Divider />

          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
            <Button variant="outlined" color="inherit" startIcon={<RestartAltIcon />} onClick={reset} disabled={busy}>
              Làm mới
            </Button>
            <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />} disabled={busy}>
              {busy ? 'Đang đăng…' : 'Đăng bài viết'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <VisibilityOutlinedIcon color="primary" />
            <Typography fontWeight={700}>Xem trước</Typography>
          </Stack>
          <Box sx={{ borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default', overflow: 'hidden' }}>
            {preview && <Box component="img" src={preview} alt="" sx={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }} />}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                {title.trim() || 'Tiêu đề bài viết'}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                color={content.trim() ? 'text.primary' : 'text.secondary'}
                sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.8 }}
              >
                {content.trim() || 'Nội dung bạn nhập sẽ hiển thị tại đây…'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <ArticleOutlinedIcon color="primary" />
            <Typography fontWeight={700}>Bài viết gần đây</Typography>
          </Stack>
          {loadingList ? (
            <Typography color="text.secondary" variant="body2">Đang tải…</Typography>
          ) : recent.length === 0 ? (
            <Typography color="text.secondary" variant="body2">Chưa có bài viết nào.</Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1.25}>
              {recent.map((p) => (
                <Stack key={p.id} direction="row" spacing={1.5} alignItems="center">
                  <AuthImage src={p.imageUrl} alt={p.postTitle} sx={{ width: 56, height: 56, borderRadius: 1.5, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{p.postTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.userName || 'Shop Meal'} · {fmtDate(p.createdDate || p.created)}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Bài viết về món ăn: chọn món + tiêu đề + nội dung                  */
/* ------------------------------------------------------------------ */
function ProductPostForm() {
  const notify = useNotify();
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState<PostForProduct[]>([]);

  const loadPosts = useCallback(async () => {
    try {
      setPosts((await postApi.listForProduct()).slice(-8).reverse());
    } catch {
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    productApi
      .list(1, 100)
      .then((res) => setProducts(res?.data ?? []))
      .catch((e) => setError(getErrorMessage(e)));
    void loadPosts();
  }, [loadPosts]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (!product) return setError('Vui lòng chọn món ăn.');
    if (t.length < TITLE_MIN) return setError(`Tiêu đề cần có ít nhất ${TITLE_MIN} ký tự.`);
    if (c.length < CONTENT_MIN) return setError(`Nội dung cần có ít nhất ${CONTENT_MIN} ký tự.`);
    setBusy(true);
    setError('');
    try {
      await postApi.createForProduct(product.id, { postTitle: t, postContent: c });
      notify(`Đã đăng bài viết cho món “${product.name}”.`);
      setTitle('');
      setContent('');
      await loadPosts();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đăng bài viết. Vui lòng thử lại.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(300px, 1fr)' },
        gap: 3,
        alignItems: 'start',
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack component="form" spacing={2.5} onSubmit={submit}>
          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={products}
            value={product}
            onChange={(_, v) => setProduct(v)}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            noOptionsText="Không có món nào"
            renderInput={(params) => <TextField {...params} label="Món ăn" required />}
          />

          <TextField
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
            helperText={`${title.length}/${TITLE_MAX} ký tự`}
          />

          <TextField
            label="Nội dung"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            minRows={8}
            maxRows={20}
            helperText={`Tối thiểu ${CONTENT_MIN} ký tự`}
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />} disabled={busy}>
              {busy ? 'Đang đăng…' : 'Đăng bài cho món'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <ArticleOutlinedIcon color="primary" />
          <Typography fontWeight={700}>Bài viết món ăn gần đây</Typography>
        </Stack>
        {posts.length === 0 ? (
          <Typography color="text.secondary" variant="body2">Chưa có bài viết nào.</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={1.25}>
            {posts.map((p) => (
              <Box key={p.id}>
                <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{p.postTitle}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.productName || 'Món ăn'} · {fmtDate(p.createdDate)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
