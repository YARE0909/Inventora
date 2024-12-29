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
import { FileSpreadsheet, FilterX, LoaderCircle, Pencil, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectComponent";
import { formatDate } from "@/utils/dateFormatting";

const columns = [
  "code",
  "name",
  "GST %",
  "Status",
  "Effective Start Date",
  "Effective End Date",
  ""
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { toast } = useToast();

  const [formData, setFormState] = useState<GstCode>({
    code: "",
    name: "",
    effectiveStartDate: new Date(),
    effectiveEndDate: new Date(),
    gstId: "",
    isActive: false,
  });

  const [editFormData, setEditFormState] = useState<GstCode>({
    id: "",
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode${filter ? `?filter=${filter}` : ""
        }`
      );
      setData(response.data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const fetchGstCodeData = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode?id=${id}`
      );
      setEditFormState({
        id: response.data.id,
        code: response.data.code,
        name: response.data.name,
        effectiveStartDate: formatDate(response.data.effectiveStartDate),
        effectiveEndDate: formatDate(response.data.effectiveEndDate),
        gstId: response.data.gstId,
        isActive: response.data.isActive,
      });
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const fetchGSTData = async (filter?: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gst${filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((gst: Gst) => ({
        value: gst.id,
        label: gst.taxPercentage.toString(),
      }));

      console.log("GST Data:", data);
      setGstData(data);
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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormState({
      id: "",
      code: "",
      name: "",
      effectiveStartDate: new Date(),
      effectiveEndDate: new Date(),
      gstId: "",
      isActive: false,
    });
  };

  const handleEditGstCode = async (id: string | undefined) => {
    fetchGstCodeData(id!);
    setIsEditModalOpen(true);
  }

  const handleChange = (value: string) => {
    console.log("Selected value:", value);
    formData.gstId = value;
  };

  const handleEditChange = (value: string) => {
    console.log("Selected value:", value);
    editFormData.gstId = value;
  };

  const handleDeleteGstCode = async (id: string | undefined) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode?id=${id}`);
      toast("GstCode deleted successfully!", "top-right", "success");
      fetchData();
      handleCloseEditModal();
    } catch {
      toast("This GST code is linked to products", "top-right", "error");
    }
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editFormData.gstId === "") {
      toast("Please select GST%", "top-right", "warning");
      return;
    }
    try {
      console.log("Edit Form Data:", editFormData);
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode`,
        editFormData
      );
      toast("GstCode updated successfully!", "top-right", "success");
      fetchData();
      handleCloseEditModal();
    } catch {
      toast("Failed to update gstCode.", "top-right", "error");
    }
  }

  useEffect(() => {
    fetchData();
    fetchGSTData();
  }, []);

  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">GST Codes</h1>
        </div>
      </div>
    )}>
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
                      ? row.isActive ? "Active" : "Inactive"
                      : column === "GST %"
                        ? row.gst?.taxPercentage ?? "N/A"
                        : column === "" ? (
                          <Tooltip tooltip="Edit">
                            <Pencil className="w-4 h-4" onClick={() => handleEditGstCode(row.id)} />
                          </Tooltip>
                        ) : (row[column as keyof GstCode] as string)}
                </td>
              ))}
            </tr>
          ))}
        </PaginatedTable>
      </div>
      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-lg font-semibold mb-4">ADD GST CODE</h2>
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
            label="GST%"
            onChange={handleChange}
          />

          <hr className="border border-border" />
          <div className="w-full flex space-x-3">
            <Button type="submit">Save</Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
        <h2 className="text-lg font-semibold mb-4">ADD GST CODE</h2>
        {editFormData.id ? (

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              id="code"
              name="code"
              value={editFormData.code}
              onChange={handleEditInputChange}
              required
              label="GST Code"
            />
            <Input
              type="text"
              id="name"
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              required
              label="Name"
            />
            <Input
              type="date"
              id="effectiveStartDate"
              name="effectiveStartDate"
              value={editFormData.effectiveStartDate}
              onChange={handleEditInputChange}
              required
              label="Effective Start Date"
            />
            <Input
              type="date"
              id="effectiveEndDate"
              name="effectiveEndDate"
              value={editFormData.effectiveEndDate}
              onChange={handleEditInputChange}
              required
              label="Effective End Date"
            />
            <Input
              type="checkbox"
              id="isActive"
              name="isActive"
              value={editFormData.isActive}
              onChange={handleEditInputChange}
              label="Is Active"
            />
            <Select
              options={gstData}
              label="GST%"
              onChange={handleEditChange}
              value={editFormData.gstId}
            />

            <hr className="border border-border" />
            <div className="w-full flex space-x-3">
              <Button type="submit">Save</Button>
              <Button classname="text-red-500 border-red-500 bg-red-500/20 hover:bg-background" onClick={() => handleDeleteGstCode(editFormData.id)}>Delete</Button>
            </div>
          </form>
        ) : (
          <div className="w-full h-96 flex items-center justify-center">
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Index;
