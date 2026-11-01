import { tokenStore } from '../api/client';

/**
 * Cache ảnh cần Bearer token (tải bằng fetch -> blob -> object URL).
 *
 * - Key theo URL ảnh (không theo token): refresh token không làm tải lại toàn bộ ảnh.
 * - Có đếm tham chiếu (refs): ảnh đang hiển thị không bao giờ bị revoke.
 * - Chỉ các ảnh "rảnh" (refs = 0) mới bị đẩy ra theo LRU khi vượt MAX_IDLE.
 */

const MAX_IDLE = 150;

interface Entry {
    promise: Promise<string>;
    objectUrl?: string;
    refs: number;
}

const cache = new Map<string, Entry>();

function trim() {
    let idle = 0;
    for (const e of cache.values()) if (e.refs === 0 && e.objectUrl) idle++;
    if (idle <= MAX_IDLE) return;

    // Map giữ thứ tự chèn -> phần tử đầu là ít dùng gần đây nhất
    for (const [key, e] of cache) {
        if (idle <= MAX_IDLE) break;
        if (e.refs === 0 && e.objectUrl) {
            URL.revokeObjectURL(e.objectUrl);
            cache.delete(key);
            idle--;
        }
    }
}

function createEntry(src: string, token: string, priority: boolean): Entry {
    const entry: Entry = { promise: Promise.resolve(''), refs: 0 };

    entry.promise = fetch(src, {
        // Lấy token mới nhất tại thời điểm gọi (có thể vừa được refresh)
        headers: { Authorization: `Bearer ${tokenStore.get() ?? token}` },
        priority: priority ? 'high' : 'auto',
    })
        .then((response) => {
            if (!response.ok) throw new Error(`Image loading failed: ${response.status}`);
            return response.blob();
        })
        .then((blob) => {
            entry.objectUrl = URL.createObjectURL(blob);
            return entry.objectUrl;
        })
        .catch((error) => {
            if (cache.get(src) === entry) cache.delete(src);
            throw error;
        });

    return entry;
}

export interface ImageLease {
    promise: Promise<string>;
    /** Báo đã dùng xong. Gọi nhiều lần vẫn an toàn. */
    release: () => void;
}

/** Lấy ảnh (từ cache hoặc tải mới) và giữ nó khỏi bị thu hồi cho tới khi release(). */
export function acquireImage(src: string, token: string, priority = false): ImageLease {
    let entry = cache.get(src);
    if (!entry) {
        entry = createEntry(src, token, priority);
        cache.set(src, entry);
    } else {
        // LRU: đưa lên cuối Map
        cache.delete(src);
        cache.set(src, entry);
    }

    entry.refs++;
    const held = entry;
    let released = false;

    return {
        promise: held.promise,
        release: () => {
            if (released) return;
            released = true;
            held.refs--;
            trim();
        },
    };
}

/** URL đã có sẵn trong cache (nếu đã tải xong), dùng để hiển thị ngay không nhấp nháy. */
export function peekImage(src: string): string | undefined {
    return cache.get(src)?.objectUrl;
}

/** Xoá toàn bộ cache, gọi khi đăng xuất để không giữ ảnh của người dùng cũ. */
export function clearImageCache() {
    for (const e of cache.values()) {
        if (e.objectUrl) URL.revokeObjectURL(e.objectUrl);
    }
    cache.clear();
}
