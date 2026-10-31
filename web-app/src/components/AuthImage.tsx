import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Box, SxProps, Theme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { acquireImage, peekImage } from '../utils/authImageCache';

const API_ORIGIN = new URL(
    API_BASE_URL,
    window.location.href,
).origin;

// Bắt đầu tải ảnh khi nó còn cách viewport tối đa ngần này
const PRELOAD_MARGIN = '300px';

function needsAuth(src: string): boolean {
    try {
        return new URL(src, window.location.href).origin === API_ORIGIN;
    } catch {
        return false;
    }
}

export async function fetchImageFile(
    src: string,
    token: string | null,
): Promise<File> {
    const response = await fetch(
        src,
        token && needsAuth(src)
            ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            : undefined,
    );

    if (!response.ok) {
        throw new Error(`Image loading failed: ${response.status}`);
    }

    const blob = await response.blob();

    const name = decodeURIComponent(
        src.split('?')[0].split('/').pop() || 'image',
    );

    return new File(
        [blob],
        name,
        {
            type: blob.type || 'application/octet-stream',
        },
    );
}

interface Props {
    src?: string;
    alt: string;
    sx?: SxProps<Theme>;
    fit?: 'cover' | 'contain';
    priority?: boolean;
    width?: number | string;
    height?: number | string;
}

export default function AuthImage({
                                      src,
                                      alt,
                                      sx,
                                      fit = 'cover',
                                      priority = false,
                                      width,
                                      height,
                                  }: Props) {
    const { token } = useAuth();
    // Chỉ cần biết có đăng nhập hay không: token đổi (refresh) KHÔNG được làm tải lại ảnh.
    const authed = !!token;
    const tokenRef = useRef(token);
    tokenRef.current = token;

    const viaFetch = !!src && authed && needsAuth(src);

    const holderRef = useRef<HTMLElement | null>(null);
    const [near, setNear] = useState(priority);
    const [url, setUrl] = useState<string>();
    const [failed, setFailed] = useState(false);

    // Chỉ tải ảnh có xác thực khi nó gần vào viewport (ảnh public dùng loading="lazy" gốc của trình duyệt)
    useEffect(() => {
        if (!viaFetch || near) return;

        const el = holderRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setNear(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setNear(true);
                    observer.disconnect();
                }
            },
            { rootMargin: PRELOAD_MARGIN },
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, [viaFetch, near, src]);

    useEffect(() => {
        setFailed(false);

        if (!src) {
            setUrl(undefined);
            return;
        }

        // Ảnh public: dùng URL trực tiếp.
        if (!viaFetch) {
            setUrl(src);
            return;
        }

        // Đã có trong cache thì hiển thị ngay; chưa có và chưa gần viewport thì chờ.
        const cached = peekImage(src);
        setUrl(cached);
        if (!near && !cached) return;

        let active = true;
        const lease = acquireImage(src, tokenRef.current ?? '', priority);

        lease.promise
            .then((objectUrl) => {
                if (active) setUrl(objectUrl);
            })
            .catch((error) => {
                if (!active) return;
                console.error('Cannot load authenticated image:', error);
                setFailed(true);
            });

        return () => {
            active = false;
            lease.release();
        };
    }, [src, viaFetch, near, priority]);

    const fallback = !src || failed || !url;

    if (fallback) {
        return (
            <Box
                ref={holderRef}
                role="img"
                aria-label={alt}
                sx={[
                    {
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'action.hover',
                        color: 'text.disabled',
                        width,
                        height,
                        overflow: 'hidden',
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                <RestaurantIcon />
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={url}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            // React 18 chưa hỗ trợ prop `fetchPriority`, phải truyền thuộc tính HTML viết thường
            {...({ fetchpriority: priority ? 'high' : 'auto' } as object)}
            decoding="async"
            onError={() => setFailed(true)}
            sx={[
                {
                    objectFit: fit,
                    display: 'block',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        />
    );
}
