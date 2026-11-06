import axios from 'axios';

const GATEWAY_RATE_LIMIT_CODE = 1429;
const ACCOUNT_LOCK_CODE = 429;

export interface RateLimitInfo {
  retryAfterSeconds?: number;
  message: string;
}

interface ErrorBody {
  code?: number;
  message?: string;
  results?: { retryAfterSeconds?: number };
}

function toPositiveNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function formatWaitTime(seconds: number): string {
  if (seconds < 60) return `${seconds} giây`;
  return `${Math.ceil(seconds / 60)} phút`;
}

export function getRateLimitInfo(error: unknown): RateLimitInfo | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) {
    return null;
  }

  const body = error.response.data as ErrorBody | undefined;

  if (body?.code === GATEWAY_RATE_LIMIT_CODE) {
    const retryAfterSeconds =
      toPositiveNumber(body.results?.retryAfterSeconds) ??
      toPositiveNumber(error.response.headers?.['retry-after']);

    return {
      retryAfterSeconds,
      message: retryAfterSeconds
        ? `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${formatWaitTime(retryAfterSeconds)}.`
        : 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
    };
  }

  if (body?.code === ACCOUNT_LOCK_CODE) {
    const retryAfterSeconds = toPositiveNumber(body.results?.retryAfterSeconds);

    return {
      retryAfterSeconds,
      message: retryAfterSeconds
        ? `Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${formatWaitTime(retryAfterSeconds)}.`
        : 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ít phút.',
    };
  }

  return null;
}