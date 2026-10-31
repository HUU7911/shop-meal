import type { Socket } from 'socket.io-client';

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8099';

let socket: Socket | null = null;
let socketPromise: Promise<Socket> | null = null;

export function getSocketInstance(): Promise<Socket> {
    if (socket) {
        return Promise.resolve(socket);
    }

    if (!socketPromise) {
        socketPromise = import('socket.io-client')
            .then(({ io }) => {
                if (!socket) {
                    socket = io(SOCKET_URL, {
                        autoConnect: false,
                        transports: ['websocket', 'polling'],
                    });
                }

                return socket;
            })
            .catch((error) => {
                socketPromise = null;
                throw error;
            });
    }

    return socketPromise;
}

/**
 * Kết nối socket bằng token hiện tại. Nếu socket đã kết nối hoặc đang kết nối thì giữ nguyên.
 * Token được truyền qua query để tương thích với server hiện tại.
 */
export async function connectSocket(accessToken: string): Promise<void> {
    const client = await getSocketInstance();

    client.io.opts.query = { token: accessToken };

    if (!client.active) {
        client.connect();
    }
}

/**
 * Cập nhật token cho các lần kết nối lại sau này (vd. sau khi refresh token)
 * mà KHÔNG ngắt kết nối đang chạy, tránh mất sự kiện đơn hàng.
 */
export async function updateSocketToken(accessToken: string): Promise<void> {
    if (!socket) return;
    socket.io.opts.query = { token: accessToken };
}

export async function disconnectSocket(): Promise<void> {
    // Ngắt cả khi đang kết nối dở (socket.connected chưa true)
    socket?.disconnect();
}
