export const formatAED = (amount: number) =>
  new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);

export const getPaymentAmountError = (amount: number, outstanding: number): string | null => {
  if (!amount || amount <= 0) {
    return 'Please enter a valid payment amount.';
  }
  if (amount > outstanding) {
    return `Payment amount exceeds the outstanding balance. Maximum payable amount is ${formatAED(outstanding)}.`;
  }
  return null;
};

export const getApiErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return error?.message || fallback;
};
