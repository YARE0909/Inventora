const numberFormatter = (value: number) => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)} Cr`; // Format as Crores
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)} L`; // Format as Lakhs
  }

  // Format the number in the Indian system with commas
  return value.toLocaleString("en-IN"); // Localize for Indian numbering system
};

const numberFormatterWithoutText = (value: number) => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)} Cr`; // Format as Crores
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}`; // Format as Lakhs
  }

  // Format the number in the Indian system with commas
  return value.toLocaleString("en-IN"); // Localize for Indian numbering system
};

export { numberFormatter, numberFormatterWithoutText };