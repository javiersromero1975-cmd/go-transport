import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

const PAYPAL_CLIENT_ID = 'AX5WA8fPLd34lHDv5HU4Jf2zgYexjh7rEQ3tMiy2uSKCH86kW0aBWwSWDBj1lRRUJ2tLDyDpalA5n28r';
const PAYPAL_BASE_URL = 'https://www.sandbox.paypal.com';

export const payWithPayPal = async (amount: number, description: string): Promise<boolean> => {
  try {
    const returnUrl = 'goapp://payment/success';
    const cancelUrl = 'goapp://payment/cancel';

    const paypalUrl = `${PAYPAL_BASE_URL}/cgi-bin/webscr?cmd=_xclick&business=sb-business@goapp.sv&amount=${amount.toFixed(2)}&currency_code=USD&item_name=${encodeURIComponent(description)}&return=${encodeURIComponent(returnUrl)}&cancel_return=${encodeURIComponent(cancelUrl)}`;

    const result = await WebBrowser.openBrowserAsync(paypalUrl);

    if (result.type === 'cancel') {
      return false;
    }

    return true;
  } catch (error) {
    Alert.alert('Error', 'No se pudo abrir PayPal. Intenta de nuevo.');
    return false;
  }
};

export const getPaymentMethods = () => [
  { id: 'cash', label: 'Efectivo', sub: 'Pago directo al conductor', icon: '💵' },
  { id: 'paypal', label: 'PayPal', sub: 'Pago seguro con PayPal', icon: '🔵' },
  { id: 'card', label: 'Tarjeta de crédito/débito', sub: 'Visa, Mastercard', icon: '💳' },
];