import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
	Alert,
	Box,
	Button,
	ButtonBase,
	CircularProgress,
	Collapse,
	Container,
	Pagination,
	Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { postApi } from '../api/services';
import type { PostArticle } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import AuthImage from './AuthImage';
import PostEditForm from './PostEditForm';

const PAGE_SIZE = 9;

const COLORS = {
	accent: '#ed6a24',
	accentDark: '#c65319',
	text: '#29251f',
	body: '#3d362f',
	muted: '#786e64',
	border: '#ece3da',
};

const headingFont = '"Bricolage Grotesque", "Be Vietnam Pro", system-ui, sans-serif';

function formatDate(value?: string): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

const getDate = (post: PostArticle) => post.createdDate || post.created;
const getAuthor = (post: PostArticle) => post.userName?.trim() || 'Shop Meal';

function estimateReadTime(content?: string): string {
	const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.ceil(words / 200))} phút đọc`;
}

function getSummary(content?: string, max = 160): string {
	const text = (content || '').replace(/\s+/g, ' ').trim();
	if (!text) return 'Bài viết chưa có nội dung.';
	return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function Meta({ post, large = false }: { post: PostArticle; large?: boolean }) {
	const date = formatDate(getDate(post));
	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				columnGap: 1.75,
				rowGap: 0.5,
				color: COLORS.muted,
				fontSize: large ? '.92rem' : '.8rem',
			}}
		>
			<Box component="span" sx={{ fontWeight: 600, color: COLORS.text }}>
				{getAuthor(post)}
			</Box>
			{date && <Box component="span">{date}</Box>}
			<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
				<AccessTimeRoundedIcon sx={{ fontSize: large ? 17 : 15 }} />
				{estimateReadTime(post.postContent)}
			</Box>
		</Box>
	);
}

/** Ảnh bài viết do file-service phục vụ và cần Bearer token nên dùng AuthImage. */
function Cover({ post }: { post: PostArticle }) {
	return <AuthImage src={post.imageUrl} alt={post.postTitle} sx={{ width: '100%', height: '100%' }} />;
}

/* ------------------------------- Nội dung bài ------------------------------- */

function ArticleBody({ post, onUpdated, onCollapse }: { post: PostArticle; onUpdated: (p: PostArticle) => void; onCollapse: () => void }) {
	const { info } = useAuth();
	const [editing, setEditing] = useState(false);
	// Chỉ chủ bài viết mới được sửa (backend cũng kiểm tra lại)
	const canEdit = !!info && post.userId === info.userId;
	const paragraphs = (post.postContent || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

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
			{paragraphs.length === 0 ? (
				<Typography sx={{ color: COLORS.muted }}>Bài viết chưa có nội dung.</Typography>
			) : (
				paragraphs.map((p, i) => (
					<Typography
						key={i}
						sx={{
							color: COLORS.body,
							fontSize: { xs: '1.02rem', md: '1.1rem' },
							lineHeight: 1.95,
							whiteSpace: 'pre-wrap',
							overflowWrap: 'anywhere',
							mb: 2.5,
						}}
					>
						{p}
					</Typography>
				))
			)}

			<Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
				<Button
					onClick={onCollapse}
					startIcon={<KeyboardArrowUpRoundedIcon />}
					variant="outlined"
					sx={{ borderColor: COLORS.border, color: COLORS.text, '&:hover': { borderColor: COLORS.accent, bgcolor: '#fff6ef' } }}
				>
					Thu gọn
				</Button>
				{canEdit && (
					<Button startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)} sx={{ color: COLORS.accentDark }}>
						Sửa bài viết
					</Button>
				)}
			</Box>
		</>
	);
}

/* ------------------------------- Thẻ bài viết ------------------------------- */

function PostCard({
					  post,
					  featured,
					  expanded,
					  onToggle,
					  onUpdated,
				  }: {
	post: PostArticle;
	featured: boolean;
	expanded: boolean;
	onToggle: () => void;
	onUpdated: (p: PostArticle) => void;
}) {
	const ref = useRef<HTMLElement>(null);
	const first = useRef(true);

	// Mở bài xong thì cuộn để đầu bài hiện lên màn hình
	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		if (expanded) {
			const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
			return () => window.clearTimeout(t);
		}
	}, [expanded]);

	const horizontal = featured && !expanded;

	return (
		<Box
			ref={ref}
			component="article"
			sx={{
				position: 'relative',
				display: 'flex',
				flexDirection: { xs: 'column', md: horizontal ? 'row' : 'column' },
				gridColumn: expanded || featured ? { md: '1 / -1' } : undefined,
				scrollMarginTop: 90,
				bgcolor: '#fff',
				border: `1px solid ${expanded ? COLORS.accent : COLORS.border}`,
				borderRadius: 3,
				overflow: 'hidden',
				transition: 'border-color .25s',
				'&:hover .post-cover': expanded ? undefined : { transform: 'scale(1.03)' },
				'&:hover .post-more': { color: COLORS.accentDark },
			}}
		>
			{/* Ảnh bìa */}
			<Box
				sx={{
					overflow: 'hidden',
					bgcolor: '#f3ece4',
					flexShrink: 0,
					width: { md: horizontal ? '52%' : 'auto' },
					aspectRatio: expanded ? { xs: '16 / 10', md: '21 / 8' } : horizontal ? { xs: '16 / 10', md: 'auto' } : '16 / 10',
					minHeight: { md: horizontal ? 340 : 0 },
				}}
			>
				<Box className="post-cover" sx={{ width: '100%', height: '100%', transition: 'transform .5s ease' }}>
					<Cover post={post} />
				</Box>
			</Box>

			<Box
				sx={{
					p: { xs: 2.5, md: horizontal ? 4 : expanded ? 5 : 2.5 },
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					minWidth: 0,
					width: '100%',
					maxWidth: expanded ? 760 : 'none',
					mx: expanded ? 'auto' : 0,
				}}
			>
				<Meta post={post} large={expanded} />

				<Typography
					component={expanded ? 'h2' : 'h3'}
					sx={{
						mt: 1.25,
						fontFamily: headingFont,
						fontWeight: 700,
						letterSpacing: '-.02em',
						lineHeight: 1.2,
						color: COLORS.text,
						fontSize: expanded ? { xs: '1.8rem', md: '2.5rem' } : horizontal ? { xs: '1.45rem', md: '2rem' } : '1.2rem',
						overflowWrap: 'anywhere',
						...(expanded
							? {}
							: { display: '-webkit-box', WebkitLineClamp: horizontal ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
					}}
				>
					{expanded ? (
						post.postTitle
					) : (
						// Bấm vào tiêu đề / cả thẻ đều mở bài; vẫn dùng được bằng bàn phím
						<ButtonBase
							onClick={onToggle}
							aria-expanded={false}
							disableRipple
							sx={{
								position: 'static', // để lớp phủ ::after bám theo thẻ thay vì dòng tiêu đề
								textAlign: 'left',
								font: 'inherit',
								color: 'inherit',
								letterSpacing: 'inherit',
								'&::after': { content: '""', position: 'absolute', inset: 0 },
								'&.Mui-focusVisible': { outline: `2px solid ${COLORS.accent}`, outlineOffset: 4, borderRadius: 1 },
							}}
						>
							{post.postTitle}
						</ButtonBase>
					)}
				</Typography>

				{/* Thu gọn: tóm tắt + nút Đọc tiếp */}
				<Collapse in={!expanded} timeout={250}>
					<Typography
						sx={{
							mt: 1.25,
							color: COLORS.muted,
							lineHeight: 1.75,
							fontSize: '.95rem',
							display: '-webkit-box',
							WebkitLineClamp: horizontal ? 4 : 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							overflowWrap: 'anywhere',
						}}
					>
						{getSummary(post.postContent, horizontal ? 260 : 160)}
					</Typography>
					<Box
						className="post-more"
						sx={{
							pt: 2,
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.5,
							color: COLORS.accent,
							fontWeight: 700,
							fontSize: '.92rem',
							transition: 'color .2s',
						}}
					>
						Đọc tiếp
						<KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />
					</Box>
				</Collapse>

				{/* Mở rộng: nội dung đầy đủ */}
				<Collapse in={expanded} timeout={350} unmountOnExit>
					<Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${COLORS.border}` }}>
						<ArticleBody post={post} onUpdated={onUpdated} onCollapse={onToggle} />
					</Box>
				</Collapse>
			</Box>
		</Box>
	);
}

/* --------------------------------- Trang chính -------------------------------- */

export default function PostLayout() {
	const [posts, setPosts] = useState<PostArticle[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	// Mỗi lần chỉ xổ một bài
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleUpdated = (u: PostArticle) =>
		setPosts((list) => list.map((x) => (x.id === u.id ? { ...x, ...u } : x)));

	const loadPosts = useCallback(async (pageNumber: number) => {
		setLoading(true);
		setError('');
		try {
			const result = await postApi.list(pageNumber, PAGE_SIZE);
			setPosts(result?.data ?? []);
			setTotalPages(Math.max(1, result?.totalPage ?? 1));
		} catch (err) {
			console.error('Không thể tải danh sách bài viết:', err);
			setError('Không thể tải bài viết. Vui lòng kiểm tra kết nối hoặc đăng nhập lại rồi thử lần nữa.');
			setPosts([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		setExpandedId(null);
		void loadPosts(page);
	}, [page, loadPosts]);

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '70vh', py: { xs: 3, md: 5 } }}>
			<Container maxWidth="lg">
				<Typography
					component="h1"
					sx={{
						fontFamily: headingFont,
						fontWeight: 700,
						letterSpacing: '-.025em',
						fontSize: { xs: '1.8rem', md: '2.3rem' },
						color: COLORS.text,
						mb: { xs: 2.5, md: 4 },
					}}
				>
					Bài viết mới nhất
				</Typography>

				{error && (
					<Alert
						severity="error"
						sx={{ mb: 3, borderRadius: 3 }}
						action={
							<Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={() => void loadPosts(page)}>
								Thử lại
							</Button>
						}
					>
						{error}
					</Alert>
				)}

				{loading ? (
					<Box sx={{ py: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
						<CircularProgress sx={{ color: COLORS.accent }} />
						<Typography sx={{ color: COLORS.muted }}>Đang tải bài viết...</Typography>
					</Box>
				) : posts.length > 0 ? (
					<>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
								gridAutoFlow: 'row dense',
								alignItems: 'start',
								gap: 3,
							}}
						>
							{posts.map((post, i) => (
								<PostCard
									key={post.id}
									post={post}
									featured={i === 0}
									expanded={expandedId === post.id}
									onToggle={() => setExpandedId((cur) => (cur === post.id ? null : post.id))}
									onUpdated={handleUpdated}
								/>
							))}
						</Box>

						{totalPages > 1 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
								<Pagination
									page={page}
									count={totalPages}
									onChange={(_, next) => {
										setPage(next);
										window.scrollTo({ top: 0, behavior: 'smooth' });
									}}
									sx={{
										'& .MuiPaginationItem-root.Mui-selected': { bgcolor: COLORS.accent, color: '#fff' },
										'& .MuiPaginationItem-root.Mui-selected:hover': { bgcolor: COLORS.accentDark },
									}}
								/>
							</Box>
						)}
					</>
				) : !error ? (
					<Box sx={{ py: 8, textAlign: 'center', border: '1px dashed #e0d2c4', borderRadius: 3, bgcolor: '#fff' }}>
						<ArticleOutlinedIcon sx={{ fontSize: 44, color: '#d8c5b4' }} />
						<Typography sx={{ mt: 1.5, fontWeight: 700, color: COLORS.text }}>Chưa có bài viết nào</Typography>
						<Typography sx={{ mt: 0.5, color: COLORS.muted }}>Các bài viết mới sẽ xuất hiện tại đây.</Typography>
					</Box>
				) : null}
			</Container>
		</Box>
	);
}