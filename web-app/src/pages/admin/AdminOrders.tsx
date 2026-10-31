
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
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
	Typography,
} from '@mui/material';

import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../api/client';
import { orderApi } from '../../api/services';
import type {
	Order,
	OrderStatus,
	PageResponse,
} from '../../api/types';

import OrderStatusChip from '../../components/OrderStatusChip';
import { dashed, ReceiptRow } from '../../components/Receipt';
import { useNotify } from '../../context/NotifyContext';

import {
	formatDateTime,
	formatPrice,
	NEXT_STATUSES,
	ORDER_STATUS_LABEL,
	PAYMENT_METHOD_LABEL,
} from '../../utils/format';

import {
	useOrderSocket,
	type OrderStatusEvent,
	type OrderCreatedEvent,
} from '../../hooks/useOrderSocket';

export default function AdminOrders() {
	const notify = useNotify();

	const [status, setStatus] = useState<OrderStatus | ''>('');
	const [page, setPage] = useState(1);
	const [data, setData] = useState<PageResponse<Order> | null>(null);
	const [error, setError] = useState('');
	const [detail, setDetail] = useState<Order | null>(null);

	// Tải danh sách đơn hàng
	const load = useCallback(async () => {
		try {
			setError('');

			const result = await orderApi.adminList(
				page,
				10,
				status || undefined,
			);

			setData(result);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [page, status]);

	useEffect(() => {
		void load();
	}, [load]);

	// Xử lý khi trạng thái đơn hàng thay đổi
	const handleStatusChanged = useCallback(
		(event: OrderStatusEvent) => {
			setData((current) => {
				if (!current) return current;

				return {
					...current,
					data: current.data.map((order) =>
						order.id === event.orderId
							? {
								...order,
								status: event.status,
							}
							: order,
					),
				};
			});

			// Đồng bộ lại danh sách từ server
			void load();
		},
		[load],
	);

	// Xử lý khi có đơn hàng mới
	const handleOrderCreated = useCallback(
		(event: OrderCreatedEvent) => {
			notify(
				event.orderCode
					? `Có đơn hàng mới: ${event.orderCode}`
					: 'Có đơn hàng mới!',
				'info',
			);

			void load();
		},
		[load, notify],
	);

	// Đăng ký Socket.IO listener
	useOrderSocket({
		enabled: true,
		onStatusChanged: handleStatusChanged,
		onOrderCreated: handleOrderCreated,
	});

	// Xử lý xác nhận thanh toán và cập nhật trạng thái
	const act = async (
		fn: () => Promise<Order>,
		okMsg: string,
	) => {
		try {
			const updated = await fn();

			notify(okMsg);

			setDetail(updated);

			await load();
		} catch (e) {
			notify(getErrorMessage(e), 'error');
		}
	};

	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 2 }}
			>
				<Typography variant="h5">
					Đơn hàng
				</Typography>

				<FormControl sx={{ minWidth: 200 }} size="small">
					<InputLabel id="st">
						Trạng thái
					</InputLabel>

					<Select
						labelId="st"
						label="Trạng thái"
						value={status}
						onChange={(e) => {
							setStatus(e.target.value as OrderStatus | '');
							setPage(1);
						}}
					>
						<MenuItem value="">
							Tất cả
						</MenuItem>

						{(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map(
							(s) => (
								<MenuItem key={s} value={s}>
									{ORDER_STATUS_LABEL[s]}
								</MenuItem>
							),
						)}
					</Select>
				</FormControl>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<TableContainer component={Paper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Mã đơn</TableCell>
							<TableCell>Thời gian</TableCell>
							<TableCell>Người nhận</TableCell>
							<TableCell align="right">
								Tổng tiền
							</TableCell>
							<TableCell>Thanh toán</TableCell>
							<TableCell>Trạng thái</TableCell>
							<TableCell />
						</TableRow>
					</TableHead>

					<TableBody>
						{data?.data.map((o) => (
							<TableRow key={o.id} hover>
								<TableCell>
									#{o.orderCode}
								</TableCell>

								<TableCell>
									{formatDateTime(o.createdAt)}
								</TableCell>

								<TableCell>
									{o.receiverName}
									<br />
									<Typography
										variant="caption"
										color="text.secondary"
									>
										{o.phone}
									</Typography>
								</TableCell>

								<TableCell align="right">
									{formatPrice(o.totalAmount)}
								</TableCell>

								<TableCell>
									{o.paymentMethod} ·{' '}
									{o.paymentStatus === 'PAID'
										? 'Đã trả'
										: 'Chưa trả'}
								</TableCell>

								<TableCell>
									<OrderStatusChip status={o.status} />
								</TableCell>

								<TableCell align="right">
									<Button
										size="small"
										onClick={() => setDetail(o)}
									>
										Chi tiết
									</Button>
								</TableCell>
							</TableRow>
						))}

						{data && data.data.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} align="center">
									Không có đơn hàng.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{data && data.totalPage > 1 && (
				<Stack alignItems="center" sx={{ mt: 2 }}>
					<Pagination
						count={data.totalPage}
						page={page}
						color="primary"
						onChange={(_, value) => setPage(value)}
					/>
				</Stack>
			)}

			<Dialog
				open={!!detail}
				onClose={() => setDetail(null)}
				maxWidth="sm"
				fullWidth
			>
				{detail && (
					<>
						<DialogTitle>
							Đơn #{detail.orderCode}{' '}
							<OrderStatusChip status={detail.status} />
						</DialogTitle>

						<DialogContent>
							{detail.items.map((item) => (
								<ReceiptRow
									key={item.id}
									label={`${item.quantity} × ${item.productName}`}
									value={formatPrice(item.subTotal)}
								/>
							))}

							<Box sx={dashed} />

							<ReceiptRow
								label="Tổng cộng"
								value={formatPrice(detail.totalAmount)}
								bold
							/>

							<Box sx={dashed} />

							<Typography fontWeight={600}>
								{detail.receiverName} · {detail.phone}
							</Typography>

							<Typography variant="body2">
								{detail.address}
							</Typography>

							{detail.note && (
								<Typography
									variant="body2"
									color="text.secondary"
								>
									Ghi chú: {detail.note}
								</Typography>
							)}

							<Typography variant="body2" sx={{ mt: 1 }}>
								{PAYMENT_METHOD_LABEL[detail.paymentMethod]}
								{' — '}
								{detail.paymentStatus === 'PAID'
									? 'đã thanh toán'
									: 'chưa thanh toán'}
							</Typography>
						</DialogContent>

						<DialogActions
							sx={{
								flexWrap: 'wrap',
								gap: 1,
								px: 3,
								pb: 2,
							}}
						>
							{detail.paymentMethod === 'PAYOS' &&
								detail.paymentStatus === 'UNPAID' &&
								detail.status !== 'CANCELLED' && (
									<Button
										onClick={() =>
											act(
												() =>
													orderApi.adminConfirmPayment(
														detail.id,
													),
												'Đã xác nhận thanh toán.',
											)
										}
									>
										Xác nhận đã thanh toán
									</Button>
								)}

							{NEXT_STATUSES[detail.status].map((next) => (
								<Button
									key={next}
									variant={
										next === 'CANCELLED'
											? 'outlined'
											: 'contained'
									}
									color={
										next === 'CANCELLED'
											? 'error'
											: 'primary'
									}
									onClick={() =>
										act(
											() =>
												orderApi.adminUpdateStatus(
													detail.id,
													next,
												),
											`Đã chuyển sang “${ORDER_STATUS_LABEL[next]}”.`,
										)
									}
								>
									{next === 'CANCELLED'
										? 'Huỷ đơn'
										: `Chuyển: ${ORDER_STATUS_LABEL[next]}`}
								</Button>
							))}

							<Button onClick={() => setDetail(null)}>
								Đóng
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</Box>
	);
}
