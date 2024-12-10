import { json2csv } from "json-2-csv";

// Function to remove specified fields from the data
export const removeFields = (data: any[], fieldsToRemove: string[]) => {
  return data.map((item) => {
    let filteredItem = { ...item };
    fieldsToRemove.forEach((field) => delete filteredItem[field]);
    return filteredItem;
  });
};

// Function to convert data to CSV with specific fields removed
export const exportToCSV = async (data: any[], fieldsToRemove: string[]) => {
  try {
    // Remove unwanted fields from the data
    const filteredData = removeFields(data, fieldsToRemove);

    // Convert filtered data to CSV format using json2csv
    const csv = json2csv(filteredData);

    // Create a Blob with the CSV data and trigger the download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "orders.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error during CSV export:", error);
  }
};
