import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi, searchApi } from '../api/services';
import type { Product, SizeOption } from '../api/types';
import CategoryCarousel from '../components/CategoryCarousel';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import ProductDialog from '../components/ProductDialog';
import { useAuth } from '../auth/AuthContext';
import { useCartActions } from '../context/CartContext';
import { useNotify } from '../context/NotifyContext';
import { getErrorMessage } from '../api/client';
import { getCategoryIcon } from '../utils/categoryIcons';
import { categoryLabel } from '../utils/format';

// Chế độ tìm kiếm (?q=): danh sách phẳng, có phân trang
const PAGE_SIZE = 12;
// Chế độ danh mục: tải toàn bộ thực đơn từ product-service rồi nhóm theo danh mục (mỗi danh mục một slide)
const CATALOG_PAGE_SIZE = 100;
const CATALOG_MAX_PAGES = 10;
const UNCATEGORIZED = '__OTHER__';
// Thứ tự hiển thị mặc định khi chưa đăng nhập (GET /product/category yêu cầu đăng nhập)
const DEFAULT_CATEGORIES = ['CAFE', 'NOODLE', 'RICE', 'MILK_TEA'];

// 4 card / hàng trên màn hình rộng, 2 card trên tablet, 1 card trên điện thoại
const gridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    xs: 'minmax(0, 1fr)',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(4, minmax(0, 1fr))',
  },
} as const;

const fold = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

interface Section {
  name: string;
  label: string;
  products: Product[];
}

export default function MenuPage() {
  const { isAuthenticated } = useAuth();
  const { add } = useCartActions();
  const notify = useNotify();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // Từ khoá do thanh tìm kiếm đặt qua ?q=
  const q = params.get('q') ?? '';
  const searching = q.trim() !== '';
  // Danh mục (tên chính xác, vd. CAFE) do thanh danh mục đặt qua ?category=
  const category = params.get('category') ?? '';
  const page = Math.max(1, Number(params.get('page') ?? 1));

  const changePage = (value: number) => {
    const next = new URLSearchParams(params);
    if (value === 1) next.delete('page');
    else next.set('page', String(value));
    setParams(next);
  };

  // Đổi từ khoá hoặc danh mục thì về trang 1
  useEffect(() => {
    if (params.has('page') && params.get('page') !== '1') {
      const next = new URLSearchParams(params);
      next.delete('page');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  const [selected, setSelected] = useState<Product | null>(null);

  /* ------------------------------------------------------------------ */
  /* Chế độ danh mục: tải cả thực đơn từ product-service (MySQL)           */
  /* ------------------------------------------------------------------ */
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    setCatalogError(null);

    // Thứ tự danh mục theo quản trị; khách chưa đăng nhập không gọi được nên dùng thứ tự mặc định.
    // Gọi song song với trang đầu tiên thay vì chờ nhau.
    const namesPromise: Promise<string[]> = isAuthenticated
        ? productApi.categories().then((l) => l.map((c) => c.name)).catch(() => [] as string[])
        : Promise.resolve([]);

    (async () => {
      try {
        const [first, names] = await Promise.all([productApi.list(1, CATALOG_PAGE_SIZE), namesPromise]);
        if (!active) return;
        // Hiển thị ngay khi có trang đầu, các trang còn lại sẽ được nối thêm sau
        setCatalog(first.data);
        setCategoryOrder(names);
        setCatalogLoading(false);

        const lastPage = Math.min(first.totalPage, CATALOG_MAX_PAGES);
        if (lastPage > 1) {
          const rest = await Promise.all(
              Array.from({ length: lastPage - 1 }, (_, i) => productApi.list(i + 2, CATALOG_PAGE_SIZE)),
          );
          if (!active) return;
          setCatalog([...first.data, ...rest.flatMap((r) => r.data)]);
        }
      } catch (e) {
        if (!active) return;
        setCatalogError(getErrorMessage(e));
        setCatalogLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Nhóm sản phẩm theo danh mục (món thuộc nhiều danh mục sẽ xuất hiện ở từng danh mục)
  const sections = useMemo<Section[]>(() => {
    const map = new Map<string, Product[]>();
    for (const p of catalog) {
      const names = p.categories?.length ? [...new Set(p.categories.map((c) => c.name))] : [UNCATEGORIZED];
      for (const n of names) {
        const list = map.get(n);
        if (list) list.push(p);
        else map.set(n, [p]);
      }
    }
    const base = categoryOrder.length ? categoryOrder : DEFAULT_CATEGORIES;
    const extra = [...map.keys()].filter((k) => !base.includes(k) && k !== UNCATEGORIZED);
    return [...base, ...extra, UNCATEGORIZED]
        .filter((n) => map.has(n))
        .map((n) => ({
          name: n,
          label: n === UNCATEGORIZED ? 'Khác' : categoryLabel(n),
          products: map.get(n) as Product[],
        }));
  }, [catalog, categoryOrder]);

  const visibleSections = category ? sections.filter((s) => s.name === category) : sections;

  /* ------------------------------------------------------------------ */
  /* Chế độ tìm kiếm: search-service (đã đăng nhập) hoặc lọc trên trang    */
  /* ------------------------------------------------------------------ */
  const [items, setItems] = useState<Product[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!searching) return;
    let active = true;
    setSearchLoading(true);
    setSearchError(null);

    const loadList = async () => {
      // Danh sách công khai: chỉ lọc được trên trang hiện tại.
      const res = await productApi.list(page, PAGE_SIZE);
      let data = res.data;
      const kw = fold(q.trim());
      if (kw) data = data.filter((p) => fold(p.name).includes(kw));
      if (category) data = data.filter((p) => p.categories?.some((c) => c.name === category));
      return { data, totalPage: res.totalPage };
    };

    (async () => {
      try {
        if (isAuthenticated) {
          try {
            const res = await searchApi.products({
              keyword: q || undefined,
              category: category || undefined,
              sort: 'RELEVANCE',
              page: page - 1,
              size: PAGE_SIZE,
            });
            if (!active) return;
            setFallback(false);
            setItems(res.data);
            setTotalPage(Math.max(1, res.totalPage));
            return;
          } catch {
            /* search-service lỗi/chưa chạy -> dùng danh sách từ product-service */
          }
        }
        const res = await loadList();
        if (!active) return;
        setFallback(true);
        setItems(res.data);
        setTotalPage(Math.max(1, res.totalPage));
      } catch (e) {
        if (active) setSearchError(getErrorMessage(e));
      } finally {
        if (active) setSearchLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [searching, isAuthenticated, q, category, page]);

  // Ổn định identity để ProductCard (memo) không bị render lại khi MenuPage render
  const handleAdd = useCallback(
    async (p: Product, option: SizeOption) => {
      if (!isAuthenticated) {
        notify('Hãy đăng nhập để thêm món vào giỏ hàng.', 'info');
        navigate('/login', { state: { from: '/' } });
        return;
      }
      const ok = await add({
        productId: p.id,
        size: option.size,
        price: option.price,
        images: p.images?.[0],
      });
      if (ok) notify(`Đã thêm "${p.name}"${option.size ? ` (${option.size})` : ''} vào giỏ hàng.`);
    },
    [isAuthenticated, add, notify, navigate],
  );

  const skeletons = (
      <Box sx={gridSx}>
        {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={340} />
        ))}
      </Box>
  );

  const renderGrid = (list: Product[]) => (
      <Box sx={gridSx}>
        {list.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={setSelected} onAdd={handleAdd} />
        ))}
      </Box>
  );

  const renderSearch = () => {
    if (searchLoading) return skeletons;
    if (items.length === 0) {
      return <EmptyState title="Chưa có món phù hợp" description="Thử đổi từ khoá hoặc danh mục khác." />;
    }
    return (
        <>
          {renderGrid(items)}
          {totalPage > 1 && (
              <Stack alignItems="center" sx={{ mt: 4 }}>
                <Pagination count={totalPage} page={page} color="primary" onChange={(_, v) => changePage(v)} />
              </Stack>
          )}
        </>
    );
  };

  const renderCatalog = () => {
    if (catalogLoading) return skeletons;
    if (visibleSections.length === 0) {
      return (
          <EmptyState
              title="Chưa có món phù hợp"
              description={category ? 'Danh mục này chưa có món nào.' : 'Thực đơn đang được cập nhật.'}
          />
      );
    }
    // Đang xem một danh mục: tiêu đề trang đã là tên danh mục nên chỉ cần lưới sản phẩm
    if (category) return renderGrid(visibleSections[0].products);

    // Trang chủ: mỗi danh mục là một khối, bên trong là hàng card dạng slide
    return (
        <Stack spacing={4}>
          {visibleSections.map((s) => (
              <CategoryCarousel
                  key={s.name}
                  id={`cat-${s.name}`}
                  title={s.label}
                  icon={getCategoryIcon(s.name)}
                  count={s.products.length}
              >
                {s.products.map((p) => (
                    <ProductCard key={p.id} product={p} onOpen={setSelected} onAdd={handleAdd} />
                ))}
              </CategoryCarousel>
          ))}
        </Stack>
    );
  };

  const error = searching ? searchError : catalogError;

  return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          {!searching && category && (
              <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
                Tất cả danh mục
              </Button>
          )}
          <Typography variant="h4">
            {searching ? `Kết quả cho “${q}”` : category ? categoryLabel(category) : 'Thực đơn hôm nay'}
          </Typography>
        </Stack>

        {searching && fallback && !isAuthenticated && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Tìm kiếm đang áp dụng cho trang hiện tại. Đăng nhập để tìm kiếm trên toàn bộ thực đơn.
            </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {searching ? renderSearch() : renderCatalog()}

        <ProductDialog product={selected} onClose={() => setSelected(null)} onAdd={handleAdd} />
      </Box>
  );
}