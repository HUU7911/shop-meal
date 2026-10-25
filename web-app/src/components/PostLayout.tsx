
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PostArticle } from '../api/types';
import { postApi } from '../api/services';
import AuthImage from './AuthImage';
import PostEditForm from './PostEditForm';
import { useAuth } from '../auth/AuthContext';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const PAGE_SIZE = 9;

const COLORS = {
  orange: '#ed6a24',
  orangeDark: '#d95716',
  text: '#29251f',
  muted: '#786e64',
  border: '#f0e6dc',
  background: 'background.default',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80';

function formatDate(value?: string): string {
  if (!value) return 'Bài viết mới';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
  }).format(date);
}

function getDate(post: PostArticle): string | undefined {
  return post.createdDate || post.created;
}

function estimateReadTime(content?: string): string {
  const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} phút đọc`;
}

function getSummary(content?: string): string {
  const text = (content || '').replace(/\s+/g, ' ').trim();

  if (!text) return 'Khám phá những câu chuyện và chia sẻ mới nhất từ Shop Meal.';

  return text.length > 180 ? `${text.slice(0, 180).trim()}…` : text;
}

function getAuthor(post: PostArticle): string {
  return post.userName?.trim() || 'Shop Meal';
}

function ArticleImage({
  src,
  alt,
  height = '100%',
}: {
  src?: string;
  alt: string;
  height?: number | string;
}) {
  const [useFallback, setUseFallback] = useState(!src);

  useEffect(() => {
    setUseFallback(!src);
  }, [src]);

  const imgSx = {
    width: '100%',
    height,
    objectFit: 'cover' as const,
    display: 'block',
    transition: 'transform .5s ease',
  };

  // Ảnh bài viết do file-service phục vụ và cần Bearer token -> dùng AuthImage
  if (src && !useFallback) {
    return <AuthImage src={src} alt={alt} sx={imgSx} />;
  }

  return <Box component="img" src={FALLBACK_IMAGE} alt={alt} loading="lazy" sx={imgSx} />;
}

function PostFullContent({
  post,
  onUpdated,
}: {
  post: PostArticle;
  onUpdated: (p: PostArticle) => void;
}) {
  const { info } = useAuth();
  const [editing, setEditing] = useState(false);
  // Chỉ chủ bài viết mới được sửa (backend cũng kiểm tra lại)
  const canEdit = !!info && post.userId === info.userId;

  if (editing) {
    return (
      <PostEditForm
        post={post}
        onCancel={() => setEditing(false)}
        onSaved={(p) => {
          onUpdated(p);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
          color: COLORS.muted,
          fontSize: '.85rem',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
          {formatDate(getDate(post))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
          {estimateReadTime(post.postContent)}
        </Box>
        <Typography sx={{ fontSize: '.85rem' }}>Tác giả: {getAuthor(post)}</Typography>
      </Box>
      <Typography
        component="div"
        sx={{
          color: '#51473e',
          lineHeight: 2,
          fontSize: '1rem',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {post.postContent || 'Bài viết chưa có nội dung.'}
      </Typography>
      {canEdit && (
        <Button startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)} sx={{ mt: 2, textTransform: 'none', fontWeight: 700 }}>
          Sửa bài viết
        </Button>
      )}
    </>
  );
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <KeyboardArrowDownRoundedIcon
      sx={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }}
    />
  );
}

export default function PostLayout() {
  const [posts, setPosts] = useState<PostArticle[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Bài viết đang được xổ xuống (mỗi lần chỉ mở một bài)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const handleUpdated = (u: PostArticle) =>
    setPosts((list) => list.map((x) => (x.id === u.id ? { ...x, ...u } : x)));
  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  const loadPosts = useCallback(async (pageNumber: number) => {
	setLoading(true);
	setError('');

	try {
	  const result = await postApi.list(pageNumber, PAGE_SIZE);

	  setPosts(result?.data ?? []);
	  setTotalPages(Math.max(1, result?.totalPage ?? 1));
	  setTotalElements(result?.totalElements ?? 0);
	} catch (err) {
	  console.error('Không thể tải danh sách bài viết:', err);
	  setError(
		'Không thể tải bài viết. Vui lòng kiểm tra kết nối hoặc đăng nhập lại rồi thử lần nữa.',
	  );
	  setPosts([]);
	} finally {
	  setLoading(false);
	}
  }, []);

  useEffect(() => {
	void loadPosts(page);
  }, [page, loadPosts]);

  const filteredPosts = useMemo(() => {
	const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');

	if (!normalizedKeyword) return posts;

	return posts.filter((post) => {
	  const searchableText = [
		post.postTitle,
		post.postContent,
		post.userName,
	  ]
		.filter(Boolean)
		.join(' ')
		.toLocaleLowerCase('vi');

	  return searchableText.includes(normalizedKeyword);
	});
  }, [posts, keyword]);

  const featured = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  const handleSearch = (value: string) => {
	setKeyword(value);
  };

  return (
	<Box
	  sx={{
		bgcolor: 'background.default',
		minHeight: '70vh',
		pb: { xs: 6, md: 10 },
	  }}
	>
	  <Box
		sx={{
		  bgcolor: 'background.default',
		  borderBottom: 1,
		  borderColor: 'divider',
		  overflow: 'hidden',
		}}
	  >
		<Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
		  <Box sx={{ maxWidth: 760 }}>
			<Chip
			  icon={<ArticleOutlinedIcon />}
			  label="GÓC ẨM THỰC SHOP MEAL"
			  sx={{
				mb: 2.5,
				bgcolor: '#fff',
				color: COLORS.orangeDark,
				fontWeight: 800,
				border: '1px solid #f5d4bd',
				letterSpacing: '.04em',
			  }}
			/>

			<Typography
			  component="h1"
			  sx={{
				fontSize: { xs: '2.35rem', sm: '3.2rem', md: '4rem' },
				lineHeight: 1.08,
				fontWeight: 900,
				letterSpacing: '-.045em',
				color: COLORS.text,
			  }}
			>
			  Chuyện món ngon,
			  <br />
			  <Box component="span" sx={{ color: COLORS.orange }}>
				vị ngon mỗi ngày.
			  </Box>
			</Typography>

			<Typography
			  sx={{
				mt: 2.5,
				maxWidth: 590,
				color: '#74695f',
				fontSize: { xs: '1rem', md: '1.1rem' },
				lineHeight: 1.9,
			  }}
			>
			  Cùng Shop Meal khám phá những câu chuyện ẩm thực, chia sẻ hữu ích
			  và cảm hứng cho mỗi bữa ăn. Nội dung được cập nhật từ hệ thống bài
			  viết của chúng tôi.
			</Typography>

			<Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
			  <Chip
				label={`${totalElements} bài viết`}
				sx={{
				  bgcolor: '#fff',
				  color: COLORS.orangeDark,
				  fontWeight: 750,
				}}
			  />
			  <Chip
				label="Nội dung từ Shop Meal"
				variant="outlined"
				sx={{ borderColor: '#e9cbb5', color: '#806c5a' }}
			  />
			</Box>
		  </Box>
		</Container>
	  </Box>

	  <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
		<Box
		  sx={{
			display: 'flex',
			gap: 2,
			flexDirection: { xs: 'column', md: 'row' },
			alignItems: { md: 'center' },
			justifyContent: 'space-between',
			mb: 3,
		  }}
		>
		  <Box>
			<Typography
			  sx={{
				color: COLORS.orange,
				fontWeight: 800,
				fontSize: '.78rem',
				letterSpacing: '.12em',
			  }}
			>
			  ĐỌC & KHÁM PHÁ
			</Typography>

			<Typography
			  component="h2"
			  sx={{
				fontWeight: 850,
				fontSize: { xs: '1.6rem', md: '2rem' },
				color: COLORS.text,
				mt: 0.5,
			  }}
			>
			  Bài viết mới nhất
			</Typography>

			<Typography sx={{ mt: 0.5, color: COLORS.muted }}>
			  Những nội dung được đăng trên hệ thống Shop Meal
			</Typography>
		  </Box>

		  <TextField
			value={keyword}
			onChange={(event) => handleSearch(event.target.value)}
			placeholder="Tìm tiêu đề, nội dung, tác giả..."
			size="small"
			sx={{
			  width: { xs: '100%', md: 350 },
			  bgcolor: '#fff',
			  '& .MuiOutlinedInput-root': { borderRadius: 3 },
			}}
			inputProps={{ 'aria-label': 'Tìm bài viết' }}
			InputProps={{
			  startAdornment: (
				<InputAdornment position="start">
				  <SearchRoundedIcon sx={{ color: '#a39a91' }} />
				</InputAdornment>
			  ),
			  endAdornment: keyword ? (
				<InputAdornment position="end">
				  <IconButton
					size="small"
					aria-label="Xóa tìm kiếm"
					onClick={() => setKeyword('')}
				  >
					<CloseRoundedIcon fontSize="small" />
				  </IconButton>
				</InputAdornment>
			  ) : undefined,
			}}
		  />
		</Box>

		{error && (
		  <Alert
			severity="error"
			sx={{ mb: 3, borderRadius: 3 }}
			action={
			  <Button
				color="inherit"
				size="small"
				startIcon={<RefreshRoundedIcon />}
				onClick={() => void loadPosts(page)}
			  >
				Thử lại
			  </Button>
			}
		  >
			{error}
		  </Alert>
		)}

		{loading ? (
		  <Box
			sx={{
			  py: 12,
			  display: 'flex',
			  flexDirection: 'column',
			  alignItems: 'center',
			  gap: 2,
			}}
		  >
			<CircularProgress sx={{ color: COLORS.orange }} />
			<Typography sx={{ color: COLORS.muted }}>
			  Đang tải bài viết...
			</Typography>
		  </Box>
		) : !error && featured ? (
		  <>
			<Paper
			  elevation={0}
			  sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', md: '1.08fr 1fr' },
				overflow: 'hidden',
				borderRadius: 4,
				border: `1px solid ${COLORS.border}`,
				bgcolor: '#fff',
				mb: 5,
				'&:hover .featured-image': { transform: 'scale(1.04)' },
			  }}
			>
			  <Box
				sx={{
				  height: { xs: 230, sm: 320, md: 390 },
				  overflow: 'hidden',
				}}
			  >
				<Box className="featured-image" sx={{ height: '100%' }}>
				  <ArticleImage
					src={featured.imageUrl}
					alt={featured.postTitle}
				  />
				</Box>
			  </Box>

			  <Box
				sx={{
				  p: { xs: 3, md: 5 },
				  display: 'flex',
				  flexDirection: 'column',
				  alignItems: 'flex-start',
				  justifyContent: 'center',
				}}
			  >
				<Chip
				  label="BÀI VIẾT NỔI BẬT"
				  size="small"
				  sx={{
					bgcolor: '#fff0e5',
					color: COLORS.orangeDark,
					fontWeight: 800,
					mb: 2,
				  }}
				/>

				<Typography
				  sx={{ color: COLORS.orangeDark, fontWeight: 750, fontSize: '.85rem' }}
				>
				  Tác giả: {getAuthor(featured)}
				</Typography>

				<Typography
				  component="h3"
				  sx={{
					mt: 1,
					fontWeight: 850,
					lineHeight: 1.25,
					fontSize: { xs: '1.5rem', md: '2rem' },
					color: COLORS.text,
					overflowWrap: 'anywhere',
				  }}
				>
				  {featured.postTitle}
				</Typography>

				<Collapse in={expandedId !== featured.id}>
				  <Typography sx={{ mt: 1.5, color: COLORS.muted, lineHeight: 1.85 }}>
					{getSummary(featured.postContent)}
				  </Typography>
				</Collapse>

				<Box
				  sx={{
					display: 'flex',
					gap: 2,
					flexWrap: 'wrap',
					mt: 2.5,
					color: '#93877b',
					fontSize: '.82rem',
				  }}
				>
				  <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
					<CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
					{formatDate(getDate(featured))}
				  </Box>

				  <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
					<AccessTimeRoundedIcon sx={{ fontSize: 17 }} />
					{estimateReadTime(featured.postContent)}
				  </Box>
				</Box>

				<Button
				  onClick={() => toggle(featured.id)}
				  aria-expanded={expandedId === featured.id}
				  aria-controls={`post-${featured.id}`}
				  endIcon={<ToggleIcon open={expandedId === featured.id} />}
				  sx={{
					mt: 3,
					borderRadius: 2.5,
					px: 2.5,
					py: 1.15,
					bgcolor: COLORS.orange,
					color: '#fff',
					fontWeight: 750,
					textTransform: 'none',
					'&:hover': { bgcolor: COLORS.orangeDark },
				  }}
				>
				  {expandedId === featured.id ? 'Thu gọn' : 'Đọc bài viết'}
				</Button>
			  </Box>

			  <Collapse
				in={expandedId === featured.id}
				unmountOnExit
				sx={{ gridColumn: '1 / -1' }}
				id={`post-${featured.id}`}
			  >
				<Box sx={{ px: { xs: 3, md: 5 }, pb: { xs: 3, md: 4 } }}>
				  <Divider sx={{ mb: 3, borderColor: COLORS.border }} />
				  <PostFullContent post={featured} onUpdated={handleUpdated} />
				</Box>
			  </Collapse>
			</Paper>

			<Box
			  sx={{
				display: 'grid',
				gridTemplateColumns: {
				  xs: '1fr',
				  sm: 'repeat(2, minmax(0, 1fr))',
				  md: 'repeat(3, minmax(0, 1fr))',
				},
				gap: 3,
				alignItems: 'start',
			  }}
			>
			  {remainingPosts.map((post) => (
				<Paper
				  key={post.id}
				  elevation={0}
				  sx={{
					overflow: 'hidden',
					borderRadius: 3.5,
					border: `1px solid ${COLORS.border}`,
					bgcolor: '#fff',
					transition: 'transform .25s ease, box-shadow .25s ease',
					'&:hover': {
					  transform: 'translateY(-5px)',
					  boxShadow: '0 14px 35px rgba(78,49,25,.09)',
					},
					'&:hover .article-image': { transform: 'scale(1.05)' },
				  }}
				>
				  <Box sx={{ height: 205, overflow: 'hidden', position: 'relative' }}>
					<Box className="article-image" sx={{ height: '100%' }}>
					  <ArticleImage src={post.imageUrl} alt={post.postTitle} />
					</Box>

					<Chip
					  label="Ẩm thực"
					  size="small"
					  sx={{
						position: 'absolute',
						top: 14,
						left: 14,
						bgcolor: 'rgba(255,255,255,.94)',
						color: '#c65319',
						fontWeight: 750,
					  }}
					/>
				  </Box>

				  <Box sx={{ p: 2.5 }}>
					<Box
					  sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.7,
						color: '#a09589',
						fontSize: '.78rem',
						mb: 1.2,
						flexWrap: 'wrap',
					  }}
					>
					  <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
					  {formatDate(getDate(post))}
					  <Box component="span" sx={{ mx: 0.3 }}>·</Box>
					  <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
					  {estimateReadTime(post.postContent)}
					</Box>

					<Typography
					  component="h3"
					  sx={{
						fontWeight: 800,
						color: '#302a24',
						fontSize: '1.12rem',
						lineHeight: 1.45,
						minHeight: 52,
						overflowWrap: 'anywhere',
					  }}
					>
					  {post.postTitle}
					</Typography>

					<Collapse in={expandedId !== post.id}>
					  <Typography
						sx={{
						  mt: 1,
						  color: '#81766b',
						  lineHeight: 1.75,
						  fontSize: '.9rem',
						  display: '-webkit-box',
						  WebkitLineClamp: 3,
						  WebkitBoxOrient: 'vertical',
						  overflow: 'hidden',
						  minHeight: 72,
						}}
					  >
						{getSummary(post.postContent)}
					  </Typography>
					</Collapse>

					<Collapse in={expandedId === post.id} unmountOnExit id={`post-${post.id}`}>
					  <Divider sx={{ my: 1.5, borderColor: COLORS.border }} />
					  <PostFullContent post={post} onUpdated={handleUpdated} />
					</Collapse>

					<Typography
					  sx={{ mt: 1.5, color: '#a09589', fontSize: '.82rem' }}
					>
					  Tác giả: {getAuthor(post)}
					</Typography>

					<Button
					  onClick={() => toggle(post.id)}
					  aria-expanded={expandedId === post.id}
					  aria-controls={`post-${post.id}`}
					  endIcon={<ToggleIcon open={expandedId === post.id} />}
					  sx={{
						mt: 1,
						px: 0,
						color: COLORS.orange,
						fontWeight: 800,
						textTransform: 'none',
						'&:hover': {
						  bgcolor: 'transparent',
						  color: '#b94710',
						},
					  }}
					>
					  {expandedId === post.id ? 'Thu gọn' : 'Đọc tiếp'}
					</Button>
				  </Box>
				</Paper>
			  ))}
			</Box>

			{keyword.trim() && filteredPosts.length === 0 && (
			  <Paper
				elevation={0}
				sx={{
				  py: 8,
				  mt: 3,
				  textAlign: 'center',
				  border: '1px dashed #e7d8c9',
				  borderRadius: 4,
				  bgcolor: '#fff',
				}}
			  >
				<SearchRoundedIcon sx={{ fontSize: 44, color: '#d8c5b4' }} />
				<Typography sx={{ mt: 1.5, fontWeight: 800, color: '#443a31' }}>
				  Không tìm thấy bài viết
				</Typography>
				<Typography sx={{ mt: 0.5, color: '#8b7d70' }}>
				  Thử từ khóa khác nhé.
				</Typography>
				<Button
				  onClick={() => setKeyword('')}
				  sx={{ mt: 2, color: COLORS.orange, textTransform: 'none' }}
				>
				  Xóa tìm kiếm
				</Button>
			  </Paper>
			)}

			{!keyword.trim() && totalPages > 1 && (
			  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
				<Pagination
				  page={page}
				  count={totalPages}
				  color="primary"
				  onChange={(_, nextPage) => {
					setPage(nextPage);
					window.scrollTo({ top: 0, behavior: 'smooth' });
				  }}
				  sx={{
					'& .MuiPaginationItem-root.Mui-selected': {
					  bgcolor: COLORS.orange,
					  color: '#fff',
					},
					'& .MuiPaginationItem-root.Mui-selected:hover': {
					  bgcolor: COLORS.orangeDark,
					},
				  }}
				/>
			  </Box>
			)}
		  </>
		) : !error ? (
		  <Paper
			elevation={0}
			sx={{
			  py: 8,
			  textAlign: 'center',
			  border: '1px dashed #e7d8c9',
			  borderRadius: 4,
			  bgcolor: '#fff',
			}}
		  >
			<ArticleOutlinedIcon sx={{ fontSize: 44, color: '#d8c5b4' }} />
			<Typography sx={{ mt: 1.5, fontWeight: 800, color: '#443a31' }}>
			  {keyword.trim() ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
			</Typography>
			<Typography sx={{ mt: 0.5, color: '#8b7d70' }}>
			  {keyword.trim()
				? 'Thử từ khóa khác nhé.'
				: 'Các bài viết mới sẽ xuất hiện tại đây.'}
			</Typography>
			{keyword.trim() && (
			  <Button
				onClick={() => setKeyword('')}
				sx={{ mt: 2, color: COLORS.orange, textTransform: 'none' }}
			  >
				Xóa tìm kiếm
			  </Button>
			)}
		  </Paper>
		) : null}

		<Typography
		  sx={{
			textAlign: 'center',
			mt: 5,
			color: '#9a8e82',
			fontSize: '.82rem',
		  }}
		>
		  Shop Meal · Cảm hứng ngon lành cho mỗi ngày
		</Typography>
	  </Container>

	</Box>
  );
}
