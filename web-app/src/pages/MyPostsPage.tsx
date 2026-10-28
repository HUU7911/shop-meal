import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Alert, Box, Button, Collapse, Pagination, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { postApi } from '../api/services';
import type { PostArticle } from '../api/types';
import AuthImage from '../components/AuthImage';
import EmptyState from '../components/EmptyState';
import PostEditForm from '../components/PostEditForm';

const PAGE_SIZE = 5;

function fmtDate(p: PostArticle) {
  const v = p.createdDate || p.created;
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('vi-VN');
}

/** Bài viết của chính người dùng — xem và sửa (PUT /post/update/my-post/{id}). */
export default function MyPostsPage() {
  const [posts, setPosts] = useState<PostArticle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await postApi.myPosts(p, PAGE_SIZE);
      setPosts(res?.data ?? []);
      setTotalPage(Math.max(res?.totalPage ?? 1, 1));
    } catch (e) {
      setPosts([]);
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setEditingId(null);
    void load(page);
  }, [page, load]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Bài viết của tôi</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={110} />)}
        </Stack>
      ) : posts.length === 0 && !error ? (
        <EmptyState title="Bạn chưa có bài viết nào" />
      ) : (
        <Stack spacing={2}>
          {posts.map((p) => {
            const editing = editingId === p.id;
            return (
              <Paper key={p.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <AuthImage
                    src={p.imageUrl}
                    alt={p.postTitle}
                    sx={{ width: { xs: '100%', sm: 140 }, height: { xs: 160, sm: 100 }, borderRadius: 2, flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{p.postTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">{fmtDate(p)}</Typography>

                    <Collapse in={!editing}>
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
                      <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditingId(p.id)} sx={{ mt: 1 }}>
                        Sửa bài
                      </Button>
                    </Collapse>

                    <Collapse in={editing} unmountOnExit>
                      <PostEditForm
                        post={p}
                        onCancel={() => setEditingId(null)}
                        onSaved={(u) => {
                          setPosts((list) => list.map((x) => (x.id === u.id ? u : x)));
                          setEditingId(null);
                        }}
                      />
                    </Collapse>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
          {totalPage > 1 && (
            <Stack alignItems="center" sx={{ pt: 1 }}>
              <Pagination count={totalPage} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
}
