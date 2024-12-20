type FormatIndianCurrencyOptions = {
  decimalPlaces?: number; // Number of decimal places to retain, defaults to 2
};

const formatIndianCurrency = (
  amount: number,
  options: FormatIndianCurrencyOptions = {}
): string => {
  const { decimalPlaces = 2 } = options;

  // Convert the amount to a string
  const x = amount.toString();

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart = ""] = x.split(".");

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

  // Construct the final result, ensuring that decimal part is included only if it's not empty
  const result =
    decimalPlaces > 0 && decimalPart !== ""
      ? `${formattedInteger}.${decimalPart.padEnd(decimalPlaces, "0")}`
      : formattedInteger;

  return `₹ ${result}`;
};

export default formatIndianCurrency;
