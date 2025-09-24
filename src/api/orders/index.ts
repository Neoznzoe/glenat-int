import { mutateJson } from '@/api/client';
import {
  type CreateOrderPayload,
  type OrderConfirmation,
  type OrderLineInput,
  type OrderLineSummary,
  type OrderPreview,
} from './types';

const VAT_RATE = 0.055;
const USE_MOCK =
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env?.VITE_USE_API_MOCK === 'string'
    ? import.meta.env.VITE_USE_API_MOCK !== 'false'
    : true;

function computeLineSummary(line: OrderLineInput): OrderLineSummary {
  const discount = line.discountRate ?? 0;
  const effectiveUnitPrice = line.unitPrice * (1 - discount);
  const lineTotal = Number((effectiveUnitPrice * line.quantity).toFixed(2));

  return {
    ...line,
    lineTotal,
  };
}

function computeTotals(lines: OrderLineInput[]): OrderPreview {
  const summaries = lines.map(computeLineSummary);
  const totalHT = Number(
    summaries.reduce((sum, current) => sum + current.lineTotal, 0).toFixed(2),
  );
  const totalTTC = Number((totalHT * (1 + VAT_RATE)).toFixed(2));

  return {
    totalHT,
    totalTTC,
    lines: summaries,
  };
}

function generateOrderId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `ORD-${Date.now()}`;
}

function createMockOrder(payload: CreateOrderPayload): OrderConfirmation {
  const preview = computeTotals(payload.lines);
  return {
    orderId: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: 'submitted',
    totalHT: preview.totalHT,
    totalTTC: preview.totalTTC,
    lines: preview.lines,
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderConfirmation> {
  if (typeof window === 'undefined' || USE_MOCK) {
    return Promise.resolve(createMockOrder(payload));
  }

  return mutateJson<OrderConfirmation, CreateOrderPayload>('/api/orders', payload, {
    method: 'POST',
  });
}

export function prepareOrderPreview(lines: OrderLineInput[]): OrderPreview {
  return computeTotals(lines);
}

export type {
  CreateOrderPayload,
  OrderConfirmation,
  OrderLineInput,
  OrderLineSummary,
  OrderPreview,
};
