function formatDateToYYYYMMDD(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date: string){
  // Convert to Date object and then format to yyyy-mm-dd
  return new Date(date).toISOString().split('T')[0];
};

export { formatDateToYYYYMMDD, formatDate };