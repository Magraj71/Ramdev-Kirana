// utils/format.ts
export const formatCurrency = (amount: number | undefined | null): string => {
  const safeAmount = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(safeAmount);
};

export const safeToFixed = (num: number | undefined | null, decimals: number = 2): string => {
  const safeNum = typeof num === 'number' ? num : 0;
  return safeNum.toFixed(decimals);
};

export const calculateTotal = (items: any[]): number => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const price = item.finalPrice || item.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
};