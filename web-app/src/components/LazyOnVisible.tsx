import { Box } from '@mui/material';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface Props {
  children: ReactNode;
  /** Bắt đầu render khi khối còn cách viewport tối đa ngần này. */
  rootMargin?: string;
  /** Chiều cao giữ chỗ trước khi render, để thanh cuộn/footer không nhảy. */
  minHeight?: number;
}

/**
 * Chỉ mount children (và các request/ảnh bên trong) khi người dùng cuộn gần tới.
 * Dùng cho phần nằm dưới màn hình đầu như danh sách bài viết.
 */
export default function LazyOnVisible({ children, rootMargin = '400px', minHeight = 400 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [show, rootMargin]);

  return (
    <Box ref={ref} sx={show ? undefined : { minHeight }}>
      {show ? children : null}
    </Box>
  );
}
