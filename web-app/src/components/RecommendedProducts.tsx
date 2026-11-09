import { useEffect, useMemo, useState } from 'react';

import {
	Alert,
	Box,
	CircularProgress,
	IconButton,
	Paper,
	Stack,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from '@mui/material';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { productApi } from '../api/services';
import type { Product, SizeOption } from '../api/types';
import { useCartActions, useCartState } from '../context/CartContext';
import ProductCard from './ProductCard';
import AuthImage from './AuthImage';
import { getRateLimitInfo } from '../api/rateLimit';

const ITEMS_PER_SLIDE = 4;
const FETCH_SIZE = 24;

export default function RecommendedProducts() {
	const { cart, loading: cartLoading } = useCartState();
	const { add } = useCartActions();

	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [page, setPage] = useState(0);

	const [selectedProduct, setSelectedProduct] =
		useState<Product | null>(null);

	// Lấy danh sách món ăn từ backend
	useEffect(() => {
		let active = true;

		const fetchProducts = async () => {
			setLoading(true);
			setError('');

			try {
				const response = await productApi.list(1, FETCH_SIZE);

				if (active) {
					setProducts(response.data ?? []);
				}
			} catch (err) {
				if (active) {
					setError(
						getRateLimitInfo(err)?.message ??
						'Không thể tải danh sách món ăn đề xuất.',
					);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void fetchProducts();

		return () => {
			active = false;
		};
	}, []);

	// Loại bỏ các món đã có trong giỏ hàng
	const recommended = useMemo(() => {
		const cartProductIds = new Set(
			(cart?.items ?? []).map((item) => item.productId),
		);

		return products.filter(
			(product) => !cartProductIds.has(product.id),
		);
	}, [products, cart]);

	// Tính số slide
	const totalPages = Math.ceil(
		recommended.length / ITEMS_PER_SLIDE,
	);

	const currentPage = Math.min(
		page,
		Math.max(totalPages - 1, 0),
	);

	// Chỉ hiển thị 4 món trong một slide
	const visibleProducts = useMemo(() => {
		const start = currentPage * ITEMS_PER_SLIDE;

		return recommended.slice(
			start,
			start + ITEMS_PER_SLIDE,
		);
	}, [recommended, currentPage]);

	// Thêm món vào giỏ hàng bằng CartContext hiện tại
	const handleAdd = async (
		product: Product,
		option: SizeOption,
	) => {
		await add({
			productId: product.id,
			size: option.size,
		});
	};

	const handlePrevious = () => {
		setPage((prev) =>
			prev > 0 ? prev - 1 : totalPages - 1,
		);
	};

	const handleNext = () => {
		setPage((prev) =>
			prev < totalPages - 1 ? prev + 1 : 0,
		);
	};

	// Đang tải sản phẩm
	if (loading || cartLoading) {
		return (
			<Paper
				elevation={0}
				sx={{
					mt: 3,
					p: 3,
					borderRadius: 3,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: 150,
				}}
			>
				<CircularProgress size={28} />
			</Paper>
		);
	}

	// Lỗi tải sản phẩm
	if (error) {
		return (
			<Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
				{error}
			</Alert>
		);
	}

	// Không còn món để đề xuất
	if (recommended.length === 0) {
		return null;
	}

	return (
		<Box sx={{ mt: 3 }}>

			{/* HEADER */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 2,
					borderRadius: 2,
				}}
			>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					spacing={1}
				>
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
					>
						<FavoriteBorderRoundedIcon
							color="primary"
						/>

						<Box>
							<Typography
								variant="h6"
								fontWeight={800}
							>
								Bạn có thể thích
							</Typography>

							<Typography
								variant="caption"
								color="text.secondary"
							>
								Khám phá thêm những món ăn hấp dẫn
							</Typography>
						</Box>
					</Stack>

					{/* SLIDE CONTROLS */}
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
					>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{
								display: { xs: 'none', sm: 'block' },
								whiteSpace: 'nowrap',
							}}
						>
							{currentPage + 1}/{totalPages}
						</Typography>

						<IconButton
							size="small"
							onClick={handlePrevious}
							disabled={totalPages <= 1}
							aria-label="Món trước"
							sx={{
								border: 1,
								borderColor: 'divider',
							}}
						>
							<ChevronLeftRoundedIcon />
						</IconButton>

						<IconButton
							size="small"
							onClick={handleNext}
							disabled={totalPages <= 1}
							aria-label="Món tiếp theo"
							sx={{
								border: 1,
								borderColor: 'divider',
							}}
						>
							<ChevronRightRoundedIcon />
						</IconButton>
					</Stack>
				</Stack>
			</Paper>

			{/* PRODUCT SLIDE */}
			<Paper
				elevation={0}
				sx={{
					p: { xs: 1.5, sm: 2 },
					borderRadius: 2,
				}}
			>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: 'repeat(2, minmax(0, 1fr))',
							sm: 'repeat(4, minmax(0, 1fr))',
						},
						gap: { xs: 1.5, sm: 2 },
						alignItems: 'stretch',
					}}
				>
					{visibleProducts.map((product) => (
						<Box key={product.id} sx={{ minWidth: 0 }}>
							<ProductCard
								product={product}
								onOpen={setSelectedProduct}
								onAdd={handleAdd}
							/>
						</Box>
					))}
				</Box>

				{/* SLIDE INDICATORS */}
				{totalPages > 1 && (
					<Stack
						direction="row"
						justifyContent="center"
						alignItems="center"
						spacing={0.8}
						sx={{ mt: 2.5 }}
					>
						{Array.from(
							{ length: totalPages },
							(_, index) => (
								<Box
									key={index}
									onClick={() => setPage(index)}
									sx={{
										width: currentPage === index ? 22 : 7,
										height: 7,
										borderRadius: 10,
										bgcolor:
											currentPage === index
												? 'primary.main'
												: 'action.disabledBackground',
										cursor: 'pointer',
										transition: 'all .25s',
									}}
								/>
							),
						)}
					</Stack>
				)}
			</Paper>

			{/* PRODUCT DETAIL DIALOG */}
			<Dialog
				open={Boolean(selectedProduct)}
				onClose={() => setSelectedProduct(null)}
				fullWidth
				maxWidth="sm"
			>
				{selectedProduct && (
					<>
						<DialogTitle fontWeight={800}>
							{selectedProduct.name}
						</DialogTitle>

						<DialogContent>
							<AuthImage
								src={selectedProduct.images?.[0]}
								alt={selectedProduct.name}
								sx={{
									width: '100%',
									maxHeight: 300,
									objectFit: 'cover',
									borderRadius: 2,
									mb: 2,
								}}
							/>

							<Typography
								color="text.secondary"
								variant="body2"
								sx={{ mb: 1 }}
							>
								{selectedProduct.categories
									?.map((category) => category.name)
									.join(' · ')}
							</Typography>

							<Typography variant="body1">
								{selectedProduct.description ||
									'Món ăn hấp dẫn đang chờ bạn khám phá.'}
							</Typography>
						</DialogContent>

						<DialogActions sx={{ p: 2 }}>
							<Button
								onClick={() => setSelectedProduct(null)}
								color="inherit"
							>
								Đóng
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</Box>
	);
}
