import { useEffect, useRef } from 'react';
import type { OrderStatus } from '../api/types';
import { getSocketInstance } from '../socket/socket';

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
}

export interface OrderCreatedEvent {
  orderId?: string;
  orderCode?: string;
}

interface UseOrderSocketOptions {
  enabled?: boolean;
  onStatusChanged?: (event: OrderStatusEvent) => void;
  onOrderCreated?: (event: OrderCreatedEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useOrderSocket({
                                 enabled = true,
                                 onStatusChanged,
                                 onOrderCreated,
                                 onConnect,
                                 onDisconnect,
                                 onError,
                               }: UseOrderSocketOptions) {
  const callbacksRef = useRef({
    onStatusChanged,
    onOrderCreated,
    onConnect,
    onDisconnect,
    onError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onStatusChanged,
      onOrderCreated,
      onConnect,
      onDisconnect,
      onError,
    };
  }, [
    onStatusChanged,
    onOrderCreated,
    onConnect,
    onDisconnect,
    onError,
  ]);

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    let client: Awaited<
        ReturnType<typeof getSocketInstance>
    > | null = null;

    const handleStatusChanged = (event: OrderStatusEvent) => {
      callbacksRef.current.onStatusChanged?.(event);
    };

    const handleOrderCreated = (event: OrderCreatedEvent) => {
      callbacksRef.current.onOrderCreated?.(event);
    };

    const handleConnect = () => {
      callbacksRef.current.onConnect?.();
    };

    const handleDisconnect = () => {
      callbacksRef.current.onDisconnect?.();
    };

    const handleConnectError = (error: Error) => {
      callbacksRef.current.onError?.(error);
    };

    getSocketInstance()
        .then((socket) => {
          if (!active) return;

          client = socket;

          socket.on('order:status_changed', handleStatusChanged);
          socket.on('order:created', handleOrderCreated);
          socket.on('connect', handleConnect);
          socket.on('disconnect', handleDisconnect);
          socket.on('connect_error', handleConnectError);
        })
        .catch((error: Error) => {
          if (active) {
            callbacksRef.current.onError?.(error);
          }
        });

    return () => {
      active = false;

      if (!client) return;

      client.off('order:status_changed', handleStatusChanged);
      client.off('order:created', handleOrderCreated);
      client.off('connect', handleConnect);
      client.off('disconnect', handleDisconnect);
      client.off('connect_error', handleConnectError);
    };
  }, [enabled]);
}
