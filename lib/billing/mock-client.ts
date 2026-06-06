import type { BillingClient, InvoiceParams, IssueInvoiceResult } from './types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let counter = 1;

export class MockBillingClient implements BillingClient {
  async issueInvoice(params: InvoiceParams): Promise<IssueInvoiceResult> {
    await delay(800);
    const num = String(counter++).padStart(4, '0');
    const invoiceId = `mock_inv_${num}`;
    console.log(`[MOCK BILLING] Emitiendo boleta B-${num} para ${params.email} — $${params.amountClp.toLocaleString('es-CL')} — Plan ${params.plan}`);
    return {
      invoiceId,
      pdfUrl: `/api/billing/mock-invoice?id=${invoiceId}`,
      number: `B-${num}`,
    };
  }
}
