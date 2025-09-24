export interface OrderLineInput {
  ean: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
}

export interface CreateOrderPayload {
  accountId: string;
  contactEmail?: string;
  requestedShipDate?: string;
  notes?: string;
  lines: OrderLineInput[];
}

export interface OrderLineSummary extends OrderLineInput {
  lineTotal: number;
}

export interface OrderConfirmation {
  orderId: string;
  createdAt: string;
  status: 'draft' | 'submitted';
  totalHT: number;
  totalTTC: number;
  lines: OrderLineSummary[];
}

export interface OrderPreview {
  totalHT: number;
  totalTTC: number;
  lines: OrderLineSummary[];
}
