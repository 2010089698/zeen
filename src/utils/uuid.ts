export const generateId = (): string => {
  const random = Math.random().toString(36).substring(2, 10);
  return `${Date.now().toString(36)}-${random}`;
};
