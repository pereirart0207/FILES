const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const SERVICE_ID = 'service_8alb9hx';
const TEMPLATE_ID = 'template_0piqhqk';
const PUBLIC_KEY = 'TskBK5RXNYz0HAAyt';

/**
 * Envía la factura vía EmailJS usando `fetch` y estructura personalizada
 * @param {Object} invoiceData - Datos de la factura y el cliente
 */
export async function sendInvoiceByEmail(invoiceData) {
  if (!invoiceData?.clientEmail || !invoiceData.items?.length) {
    throw new Error('Faltan datos esenciales: cliente o productos.');
  }

  const templateParams = {
    // Encabezado
    order_id: invoiceData.orderId || 'N/A',
    invoice_date: invoiceData.invoiceDate || new Date().toLocaleDateString(),
    type: invoiceData.type || 'Documento',
    
    // Cliente
    to_name: invoiceData.clientName || 'Cliente',
    client_email: invoiceData.clientEmail,
    email: invoiceData.clientEmail,
    client_address: invoiceData.clientAddress || '',
    client_phone: invoiceData.clientPhone || '',
    client_cif: invoiceData.clientCIF || '',

    // Vendedor
    seller_name: invoiceData.sellerName || '',
    seller_email: invoiceData.sellerEmail || '',
    seller_address: invoiceData.sellerAddress || '',
    seller_phone: invoiceData.sellerPhone || '',
    seller_cif: invoiceData.sellerCIF || '',

    // Costos
    subtotal: invoiceData.cost?.subtotal?.toFixed(2) || '0.00',
    shipping: invoiceData.cost?.shipping?.toFixed(2) || '0.00',
    tax: invoiceData.cost?.tax?.toFixed(2) || '0.00',
    grand_total: invoiceData.cost?.total?.toFixed(2) || '0.00',

    // Productos
    orders: invoiceData.items.map(item => ({
      name: item.description || 'Artículo',
      units: item.quantity || 0,
      price: (item.unitPrice || 0).toFixed(2),
      total: ((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)
    }))
  };

  const payload = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: templateParams
  };

  try {
    const res = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    console.log('✅ Correo enviado correctamente:', text);
    return text;
  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
    throw err;
  }
}
