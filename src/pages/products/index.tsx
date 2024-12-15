import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import Tooltip from "@/components/ui/ToolTip";
import { exportToCSV } from "@/utils/jsonToCsv";
import { GstCode, Product } from "@/utils/types/types";
import axios from "axios";
import { FileSpreadsheet, FilterX, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import { format } from "date-fns";
import Select from "@/components/ui/SelectComponent";
import { formatIndianCurrency } from "@/utils/formatIndianCurrency";

const columns = ["name", "description", "price", "GST Code"];

const Index = () => {
  const [data, setData] = useState<Product[]>([]);
  const [gstCodeData, setGstCodeData] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  const [formData, setFormState] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    gstCodeId: "",
  });

  const fetchData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products${
          filter ? `?name=${filter}` : ""
        }`
      );
      setData(response.data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const fetchGSTData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode${
          filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((gst: GstCode) => ({
        value: gst.id,
        label: gst.code.toString(),
      }));

      console.log("GST Data:", data);
      setGstCodeData(data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const handleSearch = async (value: string) => fetchData(value);

  const clearFilters = async () => fetchData();

  const handleDrawerOpen = (id?: string) => {
    console.log("Open drawer for customer with id: ", id);
  };

  const handleExportToCSV = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    filters: string[],
    fileName: string
  ) => {
    try {
      exportToCSV(data, filters, fileName);
      toast("Exported to CSV successfully!", "top-right", "success");
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState({
      name: "",
      description: "",
      price: 0,
      gstCodeId: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChange = (value: string) => {
    console.log("Selected value:", value);
    formData.gstCodeId = value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if (formData.gstCodeId === "") {
      toast("Please select GST ID", "top-right", "warning");
      return;
    }
    try {
      console.log("Form Data:", formData);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
        formData
      );
      toast("Product created successfully!", "top-right", "success");
      fetchData();
      handleCloseModal();
    } catch {
      toast("Failed to create customer.", "top-right", "error");
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy"); // Format to "01-Jan-2024"
  };

  useEffect(() => {
    fetchData();
    fetchGSTData();
  }, []);

  return (
    <Layout header="Products">
      <div className="w-full flex flex-col space-y-3 bg-foreground p-4 rounded-md">
        <div className="w-full flex flex-col space-y-1 md:flex md:flex-row justify-between items-center">
          <div className="w-full md:w-fit flex flex-row items-center space-x-1">
            <SearchBar
              type="text"
              placeholder="Search here..."
              onEnter={handleSearch}
              onChange={(value) => console.log("Input Changed:", value)}
            />
            <Tooltip tooltip="Clear Filters">
              <Button onClick={clearFilters}>
                <FilterX className="w-5 h-5" />
              </Button>
            </Tooltip>
            <Tooltip tooltip="Export To CSV">
              <Button
                onClick={() =>
                  handleExportToCSV(data, ["id", "createdOn"], "customers.csv")
                }
              >
                <FileSpreadsheet className="w-5 h-5" />
              </Button>
            </Tooltip>
          </div>
          <div className="w-full md:w-fit">
            <Button onClick={handleOpenModal}>
              <Plus className="w-5 h-5" />
              Product
            </Button>
          </div>
        </div>
        <PaginatedTable columns={columns} loadingState={loading}>
          {data.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border"
              onClick={() => handleDrawerOpen(row.id)}
            >
              {columns.map((column) => (
                <td key={column} className="px-4 py-2">
                  {column === "Effective Start Date" ||
                  column === "Effective End Date"
                    ? formatDate(row[column as keyof Product] as string)
                    : column === "Status"
                    ? row[column as keyof Product]
                      ? "Active"
                      : "Inactive"
                    : column === "GST Code"
                    ? row.gstCode?.code ?? "N/A"
                    : column === "price"
                    ? formatIndianCurrency(
                        row[column as keyof Product] as number
                      )
                    : (row[column as keyof Product] as string)}
                </td>
              ))}
            </tr>
          ))}
        </PaginatedTable>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-lg font-semibold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            label="Product Name"
          />
          <Input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            label="Product Description"
          />
          <Input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            label="Price"
          />
          <Select
            options={gstCodeData}
            label="Select GST Code"
            onChange={handleChange}
          />

          <hr className="border border-border" />
          <div className="w-full">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Index;
