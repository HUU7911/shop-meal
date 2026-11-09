import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	Box,
	Button,
	CircularProgress,
	Divider,
	IconButton,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AuthImage from '../components/AuthImage';
import Receipt, { dashed, ReceiptRow } from '../components/Receipt';
import RecommendedProducts from '../components/RecommendedProducts';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

// Giữ khớp với MAX_QUANTITY ở cart-service
const MAX_QUANTITY = 99;

export default function CartPage() {
	const { isAuthenticated } = useAuth();

	const { cart, loading, increase, decrease, remove } = useCart();

	const items = cart?.items ?? [];

	const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

	// Chỉ để dự phòng khi server chưa trả totalPrice
	const subtotal = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	// Tổng tiền chính thức do server tính
	const totalPrice = cart?.totalPrice ?? subtotal;

	// Chưa đăng nhập
	if (!isAuthenticated) {
		return (
			<Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
				<Paper
					elevation={0}
					sx={{
						p: { xs: 3, md: 6 },
						borderRadius: 3,
						textAlign: 'center',
					}}
				>
					<ShoppingBagOutlinedIcon
						sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
					/>

					<Typography variant="h5" fontWeight={700} gutterBottom>
						Đăng nhập để xem giỏ hàng
					</Typography>

					<Typography color="text.secondary" sx={{ mb: 3 }}>
						Vui lòng đăng nhập để quản lý giỏ hàng của bạn.
					</Typography>

					<Button component={RouterLink} to="/login" variant="contained">
						Đăng nhập
					</Button>
				</Paper>
			</Box>
		);
	}

	// Đang tải dữ liệu
	if (loading && !cart) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto', pb: 5 }}>
			{/* HEADER */}
			<Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					alignItems={{ xs: 'flex-start', sm: 'center' }}
					justifyContent="space-between"
					spacing={1}
				>
					<Stack direction="row" alignItems="center" spacing={1}>
						<Button
							component={RouterLink}
							to="/"
							startIcon={<ArrowBackIcon />}
							color="inherit"
							size="small"
							sx={{ textTransform: 'none' }}
						>
							Tiếp tục mua sắm
						</Button>

						<Typography color="text.disabled">/</Typography>

						<Typography fontWeight={600}>Giỏ hàng của bạn</Typography>
					</Stack>

					<Typography variant="body2" color="text.secondary">
						{totalQty} sản phẩm trong giỏ hàng
					</Typography>
				</Stack>
			</Paper>

			{/* MAIN CONTENT */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						md: 'minmax(0, 1fr) 350px',
						lg: 'minmax(0, 1fr) 380px',
					},
					gap: 2,
					alignItems: 'start',
				}}
			>
				{/* LEFT: PRODUCT LIST */}
				<Box>
					<Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
						<Stack
							direction="row"
							alignItems="center"
							justifyContent="space-between"
						>
							<Typography fontWeight={700}>Sản phẩm trong giỏ hàng</Typography>

							<Typography variant="body2" color="text.secondary">
								{items.length} sản phẩm
							</Typography>
						</Stack>
					</Paper>

					<Paper
						elevation={0}
						sx={{
							borderRadius: 2,
							p: { xs: 2, sm: 3 },
							minHeight: 350,
						}}
					>
						{/* EMPTY CART */}
						{items.length === 0 ? (
							<Box
								sx={{
									minHeight: 350,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									textAlign: 'center',
									py: 5,
								}}
							>
								<Box
									sx={{
										width: 110,
										height: 110,
										borderRadius: '50%',
										bgcolor: 'action.hover',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										mb: 2,
									}}
								>
									<ShoppingBagOutlinedIcon
										sx={{ fontSize: 58, color: 'text.secondary' }}
									/>
								</Box>

								<Typography variant="h6" fontWeight={700} gutterBottom>
									Giỏ hàng của bạn đang trống
								</Typography>

								<Typography
									color="text.secondary"
									variant="body2"
									sx={{ mb: 3 }}
								>
									Hãy chọn những món ăn yêu thích để bắt đầu nhé!
								</Typography>

								<Button
									component={RouterLink}
									to="/"
									variant="contained"
									size="large"
								>
									Khám phá thực đơn
								</Button>
							</Box>
						) : (
							/* PRODUCT ITEMS */
							<Stack spacing={2}>
								{items.map((item, index) => (
									<Box key={item.id}>
										{index > 0 && <Divider sx={{ mb: 2 }} />}

										<Stack
											direction="row"
											spacing={{ xs: 1.5, sm: 2 }}
											alignItems="center"
										>
											{/* PRODUCT IMAGE */}
											<AuthImage
												src={item.image}
												alt={item.productName}
												sx={{
													width: { xs: 76, sm: 100 },
													height: { xs: 76, sm: 100 },
													borderRadius: 2,
													flexShrink: 0,
													objectFit: 'cover',
												}}
											/>

											{/* PRODUCT INFO */}
											<Box sx={{ flexGrow: 1, minWidth: 0 }}>
												<Typography
													fontWeight={700}
													sx={{
														mb: 0.5,
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical',
													}}
												>
													{item.productName}
												</Typography>

												{item.size && (
													<Typography
														variant="caption"
														color="text.secondary"
														display="block"
													>
														Size: {item.size}
													</Typography>
												)}

												<Typography variant="body2" color="text.secondary">
													{formatPrice(item.price)}
												</Typography>

												{/* QUANTITY */}
												<Stack
													direction="row"
													alignItems="center"
													spacing={0.5}
													sx={{ mt: 1 }}
												>
													<IconButton
														size="small"
														aria-label="Giảm số lượng"
														onClick={() => decrease(item.id)}
														disabled={item.quantity <= 1}
														sx={{
															border: 1,
															borderColor: 'divider',
															borderRadius: 1,
														}}
													>
														<RemoveIcon fontSize="small" />
													</IconButton>

													<Typography
														sx={{
															minWidth: 32,
															textAlign: 'center',
															fontWeight: 600,
														}}
													>
														{item.quantity}
													</Typography>

													<IconButton
														size="small"
														aria-label="Tăng số lượng"
														onClick={() => increase(item.id)}
														disabled={item.quantity >= MAX_QUANTITY}
														sx={{
															border: 1,
															borderColor: 'divider',
															borderRadius: 1,
														}}
													>
														<AddIcon fontSize="small" />
													</IconButton>
												</Stack>
											</Box>

											{/* PRICE AND DELETE */}
											<Box sx={{ textAlign: 'right', flexShrink: 0 }}>
												<Typography
													fontWeight={700}
													sx={{
														fontSize: { xs: '0.85rem', sm: '1rem' },
														fontVariantNumeric: 'tabular-nums',
														mb: 1,
													}}
												>
													{formatPrice(item.price * item.quantity)}
												</Typography>

												<IconButton
													size="small"
													color="error"
													aria-label="Xóa sản phẩm"
													onClick={() => remove(item.id)}
												>
													<DeleteOutlineIcon />
												</IconButton>
											</Box>
										</Stack>
									</Box>
								))}
							</Stack>
						)}
					</Paper>
				</Box>

				{/* RIGHT: ORDER SUMMARY */}
				<Box
					sx={{
						position: { md: 'sticky' },
						top: { md: 88 },
					}}
				>
					<Receipt>
						<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
							Thông tin đơn hàng
						</Typography>

						<ReceiptRow label="Số lượng sản phẩm" value={totalQty} />

						<ReceiptRow label="Tạm tính" value={formatPrice(totalPrice)} />

						<Box sx={{ ...dashed, my: 1.5 }} />

						<ReceiptRow label="Giảm giá trực tiếp" value={formatPrice(0)} />

						<Divider sx={{ my: 2 }} />

						<ReceiptRow label="TỔNG TIỀN" value={formatPrice(totalPrice)} bold />

						<Typography variant="caption" color="text.secondary">
							(Đã bao gồm VAT nếu có)
						</Typography>

						<Button
							component={RouterLink}
							to="/checkout"
							variant="contained"
							size="large"
							fullWidth
							disabled={items.length === 0}
							sx={{
								mt: 2,
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
							}}
						>
							ĐẶT HÀNG NGAY
						</Button>

						<Button component={RouterLink} to="/" fullWidth sx={{ mt: 1 }}>
							Tiếp tục chọn món
						</Button>
					</Receipt>
				</Box>
			</Box>

			<RecommendedProducts />
		</Box>
	);
}