import { json2csv } from "json-2-csv";

// Define a generic type for the data objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataItem = { [key: string]: any };

// Function to remove specified fields from the data
export const removeFields = <T extends DataItem>(
  data: T[],
  fieldsToRemove: string[]
): T[] => {
  return data.map((item) => {
    const filteredItem = { ...item };
    fieldsToRemove.forEach((field) => delete filteredItem[field]);
    return filteredItem;
  });
};

// Function to convert data to CSV with specific fields removed
export const exportToCSV = async <T extends DataItem>(
  data: T[],
  fieldsToRemove: string[],
  fileName = "data.csv"
): Promise<void> => {
  try {
    // Remove unwanted fields from the data
    const filteredData = removeFields(data, fieldsToRemove);

    // Convert filtered data to CSV format using json2csv
    const csv = await json2csv(filteredData);

    // Create a Blob with the CSV data and trigger the download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error during CSV export:", error);
  }
};
