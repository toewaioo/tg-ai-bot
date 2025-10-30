// IMPORTANT: This is a mock in-memory implementation.
// For a production application, you should use a persistent database like Vercel KV, Postgres, or another database solution.

type Subscriptions = Record<number, { subscriptions: string[] }>;

// Using a simple object as an in-memory store.
const subscriptions: Subscriptions = {};

export const addSubscription = (chatId: number, coin: string): void => {
  if (!subscriptions[chatId]) {
    subscriptions[chatId] = { subscriptions: [] };
  }
  const userSubscriptions = subscriptions[chatId].subscriptions;
  const upperCaseCoin = coin.toUpperCase();
  if (!userSubscriptions.includes(upperCaseCoin)) {
    userSubscriptions.push(upperCaseCoin);
  }
};

export const removeSubscription = (chatId: number, coin: string): void => {
  if (subscriptions[chatId]) {
    const upperCaseCoin = coin.toUpperCase();
    subscriptions[chatId].subscriptions = subscriptions[
      chatId
    ].subscriptions.filter((c) => c !== upperCaseCoin);
  }
};

export const getSubscriptions = (chatId: number): string[] => {
  return subscriptions[chatId]?.subscriptions || [];
};

export const getAllSubscriptions = (): Subscriptions => {
  return subscriptions;
};

export const getAllUniqueCoins = (): string[] => {
  const allCoins = Object.values(subscriptions).flatMap(
    (s) => s.subscriptions
  );
  return [...new Set(allCoins)];
};
