
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BoltIcon from '@mui/icons-material/Bolt';
import PlaceIcon from '@mui/icons-material/Place';
import RemoveIcon from '@mui/icons-material/Remove';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
	Alert,
	Box,
	Button,
	ButtonBase,
	Chip,
	CircularProgress,
	IconButton,
	Skeleton,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { productApi } from '../api/services';
import type { Product } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import AuthImage from '../components/AuthImage';
import EmptyState from '../components/EmptyState';
import ProductPosts from '../components/ProductPosts';
import RecommendedProducts from '../components/RecommendedProducts';
import { useCartActions } from '../context/CartContext';
import { useNotify } from '../context/NotifyContext';
import {
	categoryLabel,
	formatPrice,
	getSizeOptions,
	PRODUCT_TYPE_LABEL,
} from '../utils/format';

const MIN_QUANTITY = 1;
// cart-service chưa nhận số lượng nên "Thêm vào giỏ" gọi lần lượt N request; giữ giới hạn nhỏ.
const MAX_QUANTITY = 10;

export default function ProductDetailPage() {
	const { id = '' } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const { add } = useCartActions();
	const notify = useNotify();

	// Bấm từ card thì đã có sẵn món trong router state -> hiển thị ngay, không cần tải lại
	const passed = (location.state as { product?: Product } | null)?.product;
	const [product, setProduct] = useState<Product | null>(
		passed?.id === id ? passed : null,
	);
	const [loading, setLoading] = useState(!product);
	const [error, setError] = useState<string | null>(null);

	const [selectedIdx, setSelectedIdx] = useState(0);
	const [quantity, setQuantity] = useState(MIN_QUANTITY);
	const [imageIdx, setImageIdx] = useState(0);
	const [adding, setAdding] = useState(false);

	useEffect(() => {
		if (product?.id === id) return;

		let active = true;

		setLoading(true);
		setError(null);
		setProduct(null);

		productApi
			.get(id)
			.then((p) => active && setProduct(p))
			.catch((e) => active && setError(getErrorMessage(e)))
			.finally(() => active && setLoading(false));

		return () => {
			active = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// Sang món khác thì về trạng thái ban đầu và cuộn lên đầu trang
	useEffect(() => {
		setSelectedIdx(0);
		setQuantity(MIN_QUANTITY);
		setImageIdx(0);
		window.scrollTo(0, 0);
	}, [id]);

	const options = useMemo(
		() => (product ? getSizeOptions(product) : []),
		[product],
	);

	const selected = options[selectedIdx] ?? options[0];

	const goBack = () =>
		location.key !== 'default' ? navigate(-1) : navigate('/');

	const requireLogin = () => {
		if (isAuthenticated) return true;

		notify('Hãy đăng nhập để đặt món.', 'info');
		navigate('/login', { state: { from: location.pathname } });

		return false;
	};

	const handleAdd = async () => {
		if (!product || !selected || !requireLogin()) return;

		setAdding(true);

		try {
			const ok = await add({
				productId: product.id,
				size: selected.size,
				quantity,
			});

			if (!ok) return;

			notify(
				`Đã thêm ${quantity} "${product.name}"${selected.size ? ` (${selected.size})` : ''
				} vào giỏ hàng.`,
			);
		} finally {
			setAdding(false);
		}
	};
	// Chuyển thẳng sang trang đặt hàng, truyền thông tin món đã chọn
	const handleBuyNow = () => {
		if (!product || !selected || !requireLogin()) return;
		navigate('/checkout', {
			state: {
				product,
				option: selected,
				quantity,
				buyNow: true,
			},
		});
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: 'grid',
					gap: 4,
					gridTemplateColumns: {
						xs: '1fr',
						md: '1fr 1fr',
					},
				}}
			>
				<Skeleton
					variant="rounded"
					sx={{ aspectRatio: '4 / 3', height: 'auto' }}
				/>

				<Stack spacing={2}>
					<Skeleton variant="text" height={48} width="70%" />
					<Skeleton variant="text" height={36} width="30%" />
					<Skeleton variant="rounded" height={120} />
				</Stack>
			</Box>
		);
	}

	if (error) {
		return (
			<Stack spacing={2} alignItems="flex-start">
				<Alert severity="error">{error}</Alert>

				<Button startIcon={<ArrowBackIcon />} onClick={goBack}>
					Quay lại
				</Button>
			</Stack>
		);
	}

	if (!product) {
		return (
			<EmptyState
				title="Không tìm thấy món"
				description="Món này không tồn tại hoặc đã ngừng bán."
				actionLabel="Xem thực đơn"
				actionTo="/"
			/>
		);
	}

	const images = product.images ?? [];
	const total = (selected?.price ?? 0) * quantity;

	return (
		<Box>
			<Button
				size="small"
				startIcon={<ArrowBackIcon />}
				onClick={goBack}
				sx={{ mb: 2 }}
			>
				Quay lại
			</Button>

			<Box
				sx={{
					display: 'grid',
					gap: { xs: 3, md: 5 },
					gridTemplateColumns: {
						xs: 'minmax(0, 1fr)',
						md: 'repeat(2, minmax(0, 1fr))',
					},
					alignItems: 'start',
				}}
			>
				{/* Ảnh sản phẩm */}
				<Box>
					<Box
						sx={{
							width: '100%',
							aspectRatio: '4 / 3',
							borderRadius: 3,
							overflow: 'hidden',
							bgcolor: 'action.hover',
						}}
					>
						<AuthImage
							src={images[imageIdx]}
							alt={product.name}
							priority
							sx={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					</Box>

					{images.length > 1 && (
						<Stack
							direction="row"
							spacing={1}
							sx={{ mt: 1.5, overflowX: 'auto' }}
						>
							{images.map((src, i) => (
								<ButtonBase
									key={`${src}-${i}`}
									onClick={() => setImageIdx(i)}
									aria-label={`Xem ảnh ${i + 1}`}
									aria-pressed={i === imageIdx}
									sx={{
										flex: '0 0 auto',
										width: 72,
										height: 72,
										borderRadius: 2,
										overflow: 'hidden',
										border: 2,
										borderColor:
											i === imageIdx
												? 'primary.main'
												: 'transparent',
									}}
								>
									<AuthImage
										src={src}
										alt={`${product.name} ${i + 1}`}
										sx={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
								</ButtonBase>
							))}
						</Stack>
					)}
				</Box>

				{/* Thông tin và mua hàng */}
				<Stack spacing={2.5}>
					<Box>
						<Typography
							variant="h4"
							sx={{
								fontWeight: 800,
								overflowWrap: 'anywhere',
							}}
						>
							{product.name}
						</Typography>

						<Stack
							direction="row"
							spacing={1}
							flexWrap="wrap"
							useFlexGap
							sx={{ mt: 1 }}
						>
							<Chip
								size="small"
								label={
									PRODUCT_TYPE_LABEL[product.type] ??
									product.type
								}
							/>

							{product.categories?.map((c) => (
								<Chip
									key={c.name}
									size="small"
									variant="outlined"
									label={categoryLabel(c.name)}
								/>
							))}
						</Stack>
					</Box>

					<Typography
						variant="h4"
						color="primary"
						sx={{
							fontWeight: 800,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						{formatPrice(selected?.price)}
					</Typography>

					{/* Chọn size */}
					{options.length > 1 && (
						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Chọn size
							</Typography>

							<ToggleButtonGroup
								exclusive
								size="small"
								color="primary"
								value={selectedIdx}
								onChange={(_, v: number | null) =>
									v !== null && setSelectedIdx(v)
								}
								aria-label="Chọn size"
								sx={{ flexWrap: 'wrap' }}
							>
								{options.map((o, i) => (
									<ToggleButton
										key={`${o.size}-${i}`}
										value={i}
										sx={{
											textTransform: 'none',
											px: 2,
										}}
									>
										{o.size} · {formatPrice(o.price)}
									</ToggleButton>
								))}
							</ToggleButtonGroup>
						</Box>
					)}

					{product.description && (
						<Typography variant="body1">
							{product.description}
						</Typography>
					)}

					{/* Thời gian và địa điểm */}
					<Box
						sx={{
							color: 'text.secondary',
							display: 'grid',
							gap: 0.5,
						}}
					>
						{product.timeWork && (
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<ScheduleIcon fontSize="small" />
								<Typography variant="body2">
									{product.timeWork}
								</Typography>
							</Stack>
						)}

						{product.position && (
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<PlaceIcon fontSize="small" />
								<Typography variant="body2">
									{product.position}
								</Typography>
							</Stack>
						)}
					</Box>

					{/* Số lượng */}
					<Box>
						<Typography variant="subtitle2" sx={{ mb: 1 }}>
							Số lượng
						</Typography>

						<Stack
							direction="row"
							alignItems="center"
							sx={{
								display: 'inline-flex',
								border: 1,
								borderColor: 'divider',
								borderRadius: 6,
							}}
						>
							<IconButton
								aria-label="Giảm số lượng"
								onClick={() =>
									setQuantity((q) =>
										Math.max(MIN_QUANTITY, q - 1),
									)
								}
								disabled={quantity <= MIN_QUANTITY || adding}
							>
								<RemoveIcon />
							</IconButton>

							<Typography
								aria-live="polite"
								sx={{
									minWidth: 40,
									textAlign: 'center',
									fontWeight: 700,
									fontVariantNumeric: 'tabular-nums',
								}}
							>
								{quantity}
							</Typography>

							<IconButton
								aria-label="Tăng số lượng"
								onClick={() =>
									setQuantity((q) =>
										Math.min(MAX_QUANTITY, q + 1),
									)
								}
								disabled={quantity >= MAX_QUANTITY || adding}
							>
								<AddIcon />
							</IconButton>
						</Stack>
					</Box>

					{/* Tạm tính */}
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="baseline"
					>
						<Typography color="text.secondary">
							Tạm tính
						</Typography>

						<Typography
							variant="h5"
							sx={{
								fontWeight: 800,
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{formatPrice(total)}
						</Typography>
					</Stack>

					{/* Nút thao tác */}
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={1.5}
					>
						<Button
							fullWidth
							size="large"
							variant="outlined"
							startIcon={
								adding ? (
									<CircularProgress
										size={18}
										color="inherit"
									/>
								) : (
									<AddShoppingCartIcon />
								)
							}
							disabled={!selected || adding}
							onClick={handleAdd}
							sx={{
								borderRadius: 6,
								fontWeight: 700,
							}}
						>
							Thêm vào giỏ
						</Button>

						<Button
							fullWidth
							size="large"
							variant="contained"
							disableElevation
							startIcon={<BoltIcon />}
							disabled={!selected || adding}
							onClick={handleBuyNow}
							sx={{
								borderRadius: 6,
								fontWeight: 700,
							}}
						>
							Mua ngay
						</Button>
					</Stack>
				</Stack>
			</Box>

			{/* Sản phẩm gợi ý */}
			<RecommendedProducts />

			{/* Bài viết gắn với món */}
			<Box sx={{ maxWidth: 800 }}>
				<ProductPosts productId={product.id} />
			</Box>
		</Box>
	);
}
