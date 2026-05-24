import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

export const payWithPayPal = async (amount: number, description: string): Promise<boolean> => {
  try {
    const paypalUrl = `https://www.paypal.me/goappsv/${amount.toFixed(2)}`;

    const result = await WebBrowser.openBrowserAsync(paypalUrl);

    if (result.type === 'cancel') {
      return false;
    }

    return new Promise((resolve) => {
      Alert.alert(
        '¿Completaste el pago?',
        `¿Confirmás que pagaste $${amount.toFixed(2)} por tu viaje GO?`,
        [
          { text: 'No', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Sí, pagué ✅', onPress: () => resolve(true) },
        ]
      );
    });
  } catch (error) {
    Alert.alert('Error', 'No se pudo abrir PayPal. Puedes pagar en efectivo.');
    return false;
  }
};

export const getPaymentMethods = () => [
  { id: 'cash', label: 'Efectivo', sub: 'Pago directo al conductor', icon: '💵' },
  { id: 'paypal', label: 'PayPal', sub: 'paypal.me/goappsv', icon: '🔵' },
];