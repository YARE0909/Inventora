import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import Tooltip from "@/components/ui/ToolTip";
import { exportToCSV } from "@/utils/jsonToCsv";
import { Gst, GstCode } from "@/utils/types/types";
import axios from "axios";
import { FileSpreadsheet, FilterX, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import { format } from "date-fns";
import Select from "@/components/ui/SelectComponent";

const columns = [
  "code",
  "name",
  "GST %",
  "Status",
  "Effective Start Date",
  "Effective End Date",
];

const columnMappings: { [key: string]: keyof GstCode } = {
  "GST %": "gst",
  "Effective Start Date": "effectiveStartDate",
  "Effective End Date": "effectiveEndDate",
};

const Index = () => {
  const [data, setData] = useState<GstCode[]>([]);
  const [gstData, setGstData] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  const [formData, setFormState] = useState<GstCode>({
    code: "",
    name: "",
    effectiveStartDate: new Date(),
    effectiveEndDate: new Date(),
    gstId: "",
    isActive: false,
  });

  const fetchData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode${
          filter ? `?filter=${filter}` : ""
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gst${
          filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((gst: Gst) => ({
        value: gst.id,
        label: gst.taxPercentage.toString(),
      }));

      console.log("GST Data:", data);
      setGstData(data);
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
      code: "",
      name: "",
      effectiveStartDate: new Date(),
      effectiveEndDate: new Date(),
      gstId: "",
      isActive: false,
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
    formData.gstId = value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if (formData.gstId === "") {
      toast("Please select GST%", "top-right", "warning");
      return;
    }
    try {
      console.log("Form Data:", formData);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode`,
        formData
      );
      toast("GstCode created successfully!", "top-right", "success");
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
    <Layout header="GST Codes">
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
              GST Code
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
                    ? formatDate(
                        row[columnMappings[column] as keyof GstCode] as string
                      )
                    : column === "Status"
                    ? row[columnMappings[column] as keyof GstCode]
                      ? "Active"
                      : "Inactive"
                    : column === "GST %"
                    ? row.gst?.taxPercentage ?? "N/A"
                    : (row[column as keyof GstCode] as string)}
                </td>
              ))}
            </tr>
          ))}
        </PaginatedTable>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-lg font-semibold mb-4">Add GstCode</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            required
            label="GST Code"
          />
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            label="Name"
          />
          <Input
            type="date"
            id="effectiveStartDate"
            name="effectiveStartDate"
            value={formData.effectiveStartDate}
            onChange={handleInputChange}
            required
            label="Effective Start Date"
          />
          <Input
            type="date"
            id="effectiveEndDate"
            name="effectiveEndDate"
            value={formData.effectiveEndDate}
            onChange={handleInputChange}
            required
            label="Effective End Date"
          />
          <Input
            type="checkbox"
            id="isActive"
            name="isActive"
            value={formData.isActive}
            onChange={handleInputChange}
            label="Is Active"
          />
          <Select
            options={gstData}
            label="Select GST%"
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
