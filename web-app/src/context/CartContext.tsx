import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getErrorCode, getErrorMessage } from '../api/client';
import { cartApi } from '../api/services';
import type { AddToCartRequest, Cart } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useNotify } from './NotifyContext';

interface CartState {
	cart: Cart | null;
	loading: boolean;
	count: number;
}

interface CartActions {
	refresh: () => Promise<void>;
	add: (request: AddToCartRequest) => Promise<boolean>;
	increase: (itemId: string) => Promise<void>;
	decrease: (itemId: string) => Promise<void>;
	remove: (itemId: string) => Promise<void>;
	clearAfterOrder: () => Promise<void>;
}

type CartValue = CartState & CartActions;

// Tách state và actions thành 2 context: component chỉ cần gọi hành động (vd. danh sách món)
// sẽ không bị render lại mỗi khi giỏ hàng thay đổi.
const CartStateContext = createContext<CartState | null>(null);
const CartActionsContext = createContext<CartActions | null>(null);

const normalize = (cart: Cart): Cart => ({
	...cart,
	items: [...(cart.items ?? [])].sort((a, b) => a.productName.localeCompare(b.productName, 'vi')),
});

const CART_NOT_FOUND = 1009;

export function CartProvider({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuth();
	const notify = useNotify();
	const [cart, setCart] = useState<Cart | null>(null);
	const [loading, setLoading] = useState(false);

	const refresh = useCallback(async () => {
		if (!isAuthenticated) {
			setCart(null);
			return;
		}
		setLoading(true);
		try {
			setCart(normalize(await cartApi.get()));
		} catch (e) {
			if (getErrorCode(e) === CART_NOT_FOUND) setCart(null);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const run = useCallback(
		async (action: () => Promise<Cart>): Promise<boolean> => {
			try {
				setCart(normalize(await action()));
				return true;
			} catch (e) {
				notify(getErrorMessage(e), 'error');
				return false;
			}
		},
		[notify],
	);

	const clearAfterOrder = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			let current = await cartApi.get();
			// Xoá tuần tự để tránh ghi đè lẫn nhau trên cùng một giỏ.
			// TODO: thay bằng endpoint "xoá toàn bộ giỏ" ở cart-service để chỉ cần 1 request.
			for (const item of current.items ?? []) {
				try {
					current = await cartApi.remove(item.id);
				} catch {
					/* bỏ qua món lỗi, tiếp tục xoá các món còn lại */
				}
			}
			const normalized = normalize(current);
			setCart(normalized.items.length ? normalized : null);
		} catch (e) {
			if (getErrorCode(e) === CART_NOT_FOUND) setCart(null);
		}
	}, [isAuthenticated]);

	const add = useCallback((request: AddToCartRequest) => run(() => cartApi.add(request)), [run]);
	const increase = useCallback(async (id: string) => void (await run(() => cartApi.increase(id))), [run]);
	const decrease = useCallback(async (id: string) => void (await run(() => cartApi.decrease(id))), [run]);
	const remove = useCallback(async (id: string) => void (await run(() => cartApi.remove(id))), [run]);

	const actions = useMemo<CartActions>(
		() => ({ refresh, add, increase, decrease, remove, clearAfterOrder }),
		[refresh, add, increase, decrease, remove, clearAfterOrder],
	);

	const state = useMemo<CartState>(
		() => ({
			cart,
			loading,
			count: cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
		}),
		[cart, loading],
	);

	return (
		<CartActionsContext.Provider value={actions}>
			<CartStateContext.Provider value={state}>{children}</CartStateContext.Provider>
		</CartActionsContext.Provider>
	);
}

/** Chỉ lấy các hành động (ổn định, không gây render lại khi giỏ hàng đổi). */
export function useCartActions(): CartActions {
	const ctx = useContext(CartActionsContext);
	if (!ctx) throw new Error('useCartActions must be used inside CartProvider');
	return ctx;
}

/** Chỉ lấy state của giỏ hàng. */
export function useCartState(): CartState {
	const ctx = useContext(CartStateContext);
	if (!ctx) throw new Error('useCartState must be used inside CartProvider');
	return ctx;
}

/** Tương thích ngược: state + actions. Dùng useCartActions/useCartState khi chỉ cần một phần. */
export function useCart(): CartValue {
	const state = useCartState();
	const actions = useCartActions();
	return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
