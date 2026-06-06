export interface InvoiceParams {
  clientName: string;
  email: string;
  rut?: string;
  amountClp: number;
  description: string;
  plan: string;
}

export interface IssueInvoiceResult {
  invoiceId: string;
  pdfUrl: string;
  number: string;
}

export interface BillingClient {
  issueInvoice(params: InvoiceParams): Promise<IssueInvoiceResult>;
}
