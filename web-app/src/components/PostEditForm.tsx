import SaveIcon from '@mui/icons-material/Save';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { postApi } from '../api/services';
import type { PostArticle } from '../api/types';
import { useNotify } from '../context/NotifyContext';

const TITLE_MIN = 5;
const TITLE_MAX = 180;
const CONTENT_MIN = 20;

interface Props {
  post: PostArticle;
  onSaved: (updated: PostArticle) => void;
  onCancel: () => void;
}

export default function PostEditForm({ post, onSaved, onCancel }: Props) {
  const notify = useNotify();
  const [title, setTitle] = useState(post.postTitle ?? '');
  const [content, setContent] = useState(post.postContent ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (t.length < TITLE_MIN) return setError(`Tiêu đề cần có ít nhất ${TITLE_MIN} ký tự.`);
    if (c.length < CONTENT_MIN) return setError(`Nội dung cần có ít nhất ${CONTENT_MIN} ký tự.`);
    setBusy(true);
    setError('');
    try {
      const saved = await postApi.update(post.id, { postTitle: t, postContent: c, imageUrl: post.imageUrl });
      notify('Đã cập nhật bài viết.');
      onSaved({
        ...post,
        ...saved,
        postTitle: saved?.postTitle ?? t,
        postContent: saved?.postContent ?? c,
        imageUrl: saved?.imageUrl ?? post.imageUrl,
        created: saved?.created ?? post.created,
        userName: saved?.userName ?? post.userName,
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật bài viết. Vui lòng thử lại.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={submit} sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Tiêu đề"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        size="small"
        slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
        helperText={`${title.length}/${TITLE_MAX} ký tự`}
      />
      <TextField
        label="Nội dung"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        multiline
        minRows={6}
        maxRows={20}
        helperText={`Tối thiểu ${CONTENT_MIN} ký tự`}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={busy} color="inherit">
          Huỷ
        </Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={busy}>
          {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
        </Button>
      </Stack>
    </Stack>
  );
}
