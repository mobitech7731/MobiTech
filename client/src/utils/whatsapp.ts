import { CartItem } from '../store/cartStore';
import { formatPrice } from './formatCurrency';

/**
 * Normalizes a WhatsApp phone number by stripping special characters
 * and adding the country code (+91) if a 10-digit number was provided.
 */
export function getSanitizedWhatsAppNumber(rawNumber?: string): string {
  const numberToClean = rawNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '';
  if (!numberToClean || numberToClean === 'REPLACE_WITH_BUSINESS_NUMBER' || numberToClean === 'REPLACE_WITH_NUMBER') {
    return '';
  }
  let digits = numberToClean.replace(/[^0-9]/g, '');
  if (!digits) return '';
  // If number starts with 0 and is 11 digits (e.g. 09876543210), strip the leading 0
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // Default to India country code (+91) for standard 10-digit mobile numbers
  return digits.length === 10 ? `91${digits}` : digits;
}

export function createWhatsAppOrderMessage(
  orderNumber: string,
  items: CartItem[], 
  subtotal: number, 
  customerName: string, 
  customerPhone: string, 
  customerNote?: string
): string {
  let message = `Hello Mobitech,\n\nI'd like to place an order.\n\n`;
  message += `Order: ${orderNumber}\n\nItems:\n`;
  
  items.forEach((item) => {
    message += `- ${item.product.name} x ${item.quantity}\n`;
  });
  
  message += `\nSubtotal: ${formatPrice(subtotal)}\n\n`;
  message += `Customer:\nName: ${customerName}\nPhone: ${customerPhone}\n`;
  
  if (customerNote) {
    message += `\nNote:\n${customerNote}\n`;
  }
  
  message += `\nPlease confirm my order.`;
  
  return message;
}

export function createWhatsAppOrderUrl(
  orderNumber: string,
  items: CartItem[], 
  subtotal: number, 
  customerName: string, 
  customerPhone: string, 
  customerNote: string | undefined,
  destinationPhoneNumber?: string
): string {
  const cleanNumber = getSanitizedWhatsAppNumber(destinationPhoneNumber);
  const message = createWhatsAppOrderMessage(orderNumber, items, subtotal, customerName, customerPhone, customerNote);
  const encodedMessage = encodeURIComponent(message);
  
  return cleanNumber ? `https://wa.me/${cleanNumber}?text=${encodedMessage}` : '';
}

export function createWhatsAppInquiryUrl(
  productName: string,
  price: number,
  destinationPhoneNumber?: string
): string {
  const cleanNumber = getSanitizedWhatsAppNumber(destinationPhoneNumber);
  if (!cleanNumber) return '';
  const message = `Hello Mobitech,\n\nI am interested in purchasing "${productName}" (${formatPrice(price)}).\n\nIs this product currently available?`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
