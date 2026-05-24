
export const setupNotifications = async () => {
  return true;
};

export const sendLocalNotification = async (title: string, body: string, data?: any) => {
  console.log('Notification:', title, body);
};

export const registerForPushNotifications = async (userId: string) => {
  return null;
};