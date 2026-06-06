import type { BillingClient, InvoiceParams, IssueInvoiceResult } from './types';

const BSALE_API_URL = 'https://api.bsale.cl/v1';

export class BsaleBillingClient implements BillingClient {
  private accessToken = process.env.BSALE_ACCESS_TOKEN!;
  private businessId = process.env.BSALE_BUSINESS_ID!;

  async issueInvoice(params: InvoiceParams): Promise<IssueInvoiceResult> {
    const body = {
      documentTypeId: 39, // Boleta electrónica
      officeId: 1,
      emissionDate: Math.floor(Date.now() / 1000),
      declareSii: 1,
      details: [{
        netUnitValue: Math.round(params.amountClp / 1.19),
        quantity: 1,
        description: params.description,
      }],
      client: {
        code: params.rut ?? '66666666-6', // RUT consumidor final si no hay
        city: 'Santiago',
        email: params.email,
        firstName: params.clientName,
      },
    };

    const res = await fetch(`${BSALE_API_URL}/documents.json?business_id=${this.businessId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.accessToken,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as { id: number; number: number; urlPdf: string };
    return {
      invoiceId: String(data.id),
      pdfUrl: data.urlPdf,
      number: `B-${data.number}`,
    };
  }
}
