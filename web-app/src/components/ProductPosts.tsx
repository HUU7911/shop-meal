import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, Button, Collapse, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { postApi } from '../api/services';
import type { PostForProduct } from '../api/types';
import { useAuth } from '../auth/AuthContext';

function fmtDate(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
}

/** Danh sách bài viết gắn với một món, đặt bên dưới thông tin chi tiết món. Ẩn nếu chưa có bài. */
export default function ProductPosts({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostForProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOpenId(null);
    setPosts([]);
    // post-service yêu cầu đăng nhập cho /getPostForProduct
    if (!isAuthenticated) return;
    let active = true;
    setLoading(true);
    postApi
      .listForProduct(productId)
      .then((list) => {
        if (!active) return;
        // mới nhất lên đầu
        setPosts([...list].sort((a, b) => (b.createdDate ?? '').localeCompare(a.createdDate ?? '')));
      })
      .catch(() => active && setPosts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId, isAuthenticated]);

  if (!isAuthenticated) return null;
  if (!loading && posts.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <ArticleOutlinedIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          Bài viết về món này
        </Typography>
      </Stack>

      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {posts.map((p) => {
            const open = openId === p.id;
            return (
              <Box key={p.id} sx={{ p: 1.5, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
                  {p.postTitle}
                </Typography>
                {fmtDate(p.createdDate) && (
                  <Typography variant="caption" color="text.secondary">
                    {fmtDate(p.createdDate)}
                  </Typography>
                )}

                <Collapse in={!open}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.75,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.postContent}
                  </Typography>
                </Collapse>
                <Collapse in={open} unmountOnExit>
                  <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.8 }}>
                    {p.postContent}
                  </Typography>
                </Collapse>

                <Button
                  size="small"
                  onClick={() => setOpenId(open ? null : p.id)}
                  aria-expanded={open}
                  endIcon={
                    <KeyboardArrowDownRoundedIcon
                      sx={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }}
                    />
                  }
                  sx={{ mt: 0.5, px: 0.5 }}
                >
                  {open ? 'Thu gọn' : 'Đọc tiếp'}
                </Button>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
