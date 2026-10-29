import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha, Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { Children, ElementType, isValidElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    /** Dùng cho id tiêu đề (aria-labelledby). */
    id: string;
    /** Tên danh mục, hiện trên "thẻ" tiêu đề ở giữa phía trên. */
    title: string;
    icon?: ElementType;
    /** Số món, hiện nhỏ cạnh tên danh mục. */
    count?: number;
    /** Mỗi phần tử con là một slide (thường là ProductCard). */
    children: ReactNode;
}

const GAP = 16;

// Chiều rộng mỗi slide để thấy n slide cùng lúc. n lẻ (vd. 1.15) chừa một phần slide kế tiếp cho thấy có thể kéo.
const slideBasis = (n: number) => `calc((100% - ${((n - 1) * GAP).toFixed(2)}px) / ${n})`;

/**
 * Khối một danh mục: khung bo tròn nền gradient, thẻ tiêu đề treo ở giữa mép trên,
 * bên trong là hàng slide card cuộn ngang (CSS scroll-snap) với nút trước/sau.
 */
export default function CategoryCarousel({ id, title, icon: Icon, count, children }: Props) {
    const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const trackRef = useRef<HTMLDivElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const slides = Children.toArray(children);

    const update = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanPrev(el.scrollLeft > 4);
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    // Tính lại trạng thái nút khi đổi kích thước hoặc số slide
    useEffect(() => {
        update();
        const el = trackRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [update, slides.length]);

    const scrollPage = (dir: 1 | -1) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    const arrowSx = {
        position: 'absolute',
        top: '42%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: 44,
        height: 44,
        bgcolor: '#fff',
        color: 'text.primary',
        boxShadow: '0 4px 14px rgba(0,0,0,.18)',
        '&:hover': { bgcolor: '#fff', color: 'primary.main' },
        // điện thoại: vuốt tay, không cần nút
        display: { xs: 'none', sm: 'flex' },
    } as const;

    return (
        <Box
            component="section"
            aria-labelledby={id}
            sx={(t) => ({
                borderRadius: '24px',
                border: `1.5px solid ${alpha(t.palette.primary.main, 0.4)}`,
                background: `linear-gradient(135deg, ${alpha(t.palette.secondary.main, 0.18)} 0%, ${alpha(
                    t.palette.primary.main,
                    0.08,
                )} 50%, ${alpha(t.palette.primary.main, 0.2)} 100%)`,
                pb: 0.5,
                px: { xs: 1.5, sm: 2.5 },
            })}
        >
            {/* Thẻ tiêu đề treo ở mép trên, nằm giữa */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-1.5px', mb: 1.5 }}>
                <Box
                    sx={(t) => ({
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: { xs: 3, sm: 5 },
                        py: 1,
                        borderRadius: '0 0 24px 24px',
                        color: '#fff',
                        background: `linear-gradient(90deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
                        boxShadow: '0 4px 12px rgba(14,74,55,.25)',
                    })}
                >
                    {Icon && <Icon sx={{ fontSize: 24 }} />}
                    <Typography
                        id={id}
                        component="h2"
                        sx={{
                            fontFamily: 'inherit',
                            fontWeight: 800,
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            letterSpacing: '.04em',
                            textTransform: 'uppercase',
                            lineHeight: 1.4,
                        }}
                    >
                        {title}
                    </Typography>
                    {typeof count === 'number' && (
                        <Typography component="span" sx={{ fontSize: '.8rem', fontWeight: 600, opacity: 0.8 }}>
                            {count} món
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box sx={{ position: 'relative' }}>
                <Box
                    ref={trackRef}
                    onScroll={update}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label={title}
                    tabIndex={0}
                    sx={{
                        display: 'flex',
                        gap: `${GAP}px`,
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        scrollPaddingInline: '4px',
                        overscrollBehaviorX: 'contain',
                        // chừa chỗ cho hiệu ứng nâng card và bóng đổ (overflow-x làm cắt theo chiều dọc)
                        pt: 1,
                        pb: 4,
                        px: '4px',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: 2 },
                    }}
                >
                    {slides.map((child, i) => (
                        <Box
                            key={isValidElement(child) && child.key != null ? child.key : i}
                            sx={{
                                flex: '0 0 auto',
                                flexBasis: { xs: slideBasis(1.15), sm: slideBasis(2.2), md: slideBasis(4) },
                                minWidth: 0,
                                scrollSnapAlign: 'start',
                                display: 'flex',
                                flexDirection: 'column',
                                // card trong slide luôn cao bằng nhau
                                '& > *': { flexGrow: 1 },
                            }}
                        >
                            {child}
                        </Box>
                    ))}
                </Box>

                {canPrev && (
                    <IconButton aria-label={`${title}: trước`} onClick={() => scrollPage(-1)} sx={{ ...arrowSx, left: -6 }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
                {canNext && (
                    <IconButton aria-label={`${title}: sau`} onClick={() => scrollPage(1)} sx={{ ...arrowSx, right: -6 }}>
                        <ChevronRightIcon />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
}