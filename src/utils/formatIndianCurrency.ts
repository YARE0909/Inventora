type FormatIndianCurrencyOptions = {
  decimalPlaces?: number; // Number of decimal places to retain, defaults to 2
};

const formatIndianCurrency = (
  amountStr: number | undefined,
  options: FormatIndianCurrencyOptions = {}
): string => {
  const { decimalPlaces = 2 } = options;

  const amount = Number(amountStr);

  if (amount === undefined || amount === null) return "₹ 0.00";

  // Ensure the amount has exactly the specified decimal places
  const fixedAmount = amount.toFixed(decimalPlaces);

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = fixedAmount.split(".");

  // Handle the last three digits separately
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  // If there are other digits, add a comma before the last three digits
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }

  // Format the remaining part using regex for the Indian numbering system
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  // Construct the final result with exactly the specified decimal places
  const result = `${formattedInteger}.${decimalPart}`;

  return `₹ ${result}`;
};

export default formatIndianCurrency;
