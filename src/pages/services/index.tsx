import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PaginatedTable from "@/components/ui/PaginatedTable";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import Tooltip from "@/components/ui/ToolTip";
import { exportToCSV } from "@/utils/jsonToCsv";
import { Service } from "@/utils/types/types";
import axios from "axios";
import { FileSpreadsheet, FilterX, Pencil, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import SearchBar from "@/components/ui/SearchBar";
import { formatDate } from "@/utils/dateFormatting";
import Select from "@/components/ui/SelectComponent";

const columns = ["Name", "Effective Start Date", "Effective End Date", "Active", ""];

const ServicesPage = () => {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gstData, setGstData] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const { toast } = useToast();

  const [formData, setFormState] = useState<Service>({
    name: "",
    effectiveStartDate: "",
    effectiveEndDate: "",
    isActive: true,
    gstCodeId: "",
  });

  const [editFormData, setEditFormState] = useState<Service>({
    id: "",
    name: "",
    effectiveStartDate: "",
    effectiveEndDate: "",
    isActive: true,
    gstCodeId: "",
  });

  const fetchData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/services${filter ? `?name=${filter}` : ""}`
      );
      setData(response.data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const fetchGstCodeData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode`
      );
      setGstData(response.data.map((gst: { id: string; code: string }) => ({ value: gst.id, label: gst.code })));
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const handleSearch = async (value: string) => fetchData(value);

  const clearFilters = async () => fetchData();

  const handleOpenModal = () => {
    fetchGstCodeData();
    setIsModalOpen(true)
  };

  const handleOpenEditModal = async (service: Service) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/services?id=${service.id}`);
    const data = response.data;

    setEditFormState({
      id: data.id,
      name: data.name,
      effectiveStartDate: formatDate(data.effectiveStartDate),
      effectiveEndDate: formatDate(data.effectiveEndDate),
      isActive: data.isActive,
      gstCodeId: data.gstCodeId,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState({
      name: "",
      effectiveStartDate: "",
      effectiveEndDate: "",
      isActive: true,
      gstCodeId: "",
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormState({
      id: "",
      name: "",
      effectiveStartDate: "",
      effectiveEndDate: "",
      isActive: true,
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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gstCodeId) {
      toast("Please select a GST Code.", "top-right", "error");
      return;
    }
    if (formData.effectiveStartDate === undefined) {
      toast("Please select a start date.", "top-right", "error");
      return;
    }
    if (formData.effectiveEndDate === undefined) {
      toast("Please select an end date.", "top-right", "error");
      return;
    }
    if (formData.name === "") {
      toast("Please enter a name.", "top-right", "error");
      return;
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/services`, formData);
      toast("Service created successfully!", "top-right", "success");
      fetchData();
      setFormState({
        name: "",
        effectiveStartDate: "",
        effectiveEndDate: "",
        isActive: true,
        gstCodeId: "",
      });
      handleCloseModal();
    } catch {
      toast("Failed to create service.", "top-right", "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/api/services`, editFormData);
      toast("Service updated successfully!", "top-right", "success");
      fetchData();
      setEditFormState({
        id: "",
        name: "",
        effectiveStartDate: "",
        effectiveEndDate: "",
        isActive: true,
        gstCodeId: "",
      });
      handleCloseEditModal();
    } catch {
      toast("Failed to update service.", "top-right", "error");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/services?id=${id}`);
      toast("Service deleted successfully!", "top-right", "success");
      fetchData();
      handleCloseEditModal();
    } catch {
      toast("Failed to delete service.", "top-right", "error");
    }
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout header={
      <div className="w-full flex justify-between items-center">
        <h1 className="font-extrabold text-2xl uppercase">Services</h1>
      </div>
    }>
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
                  handleExportToCSV(data, ["id", "createdOn"], "services.csv")
                }
              >
                <FileSpreadsheet className="w-5 h-5" />
              </Button>
            </Tooltip>
          </div>
          <div className="w-full md:w-fit">
            <Button onClick={handleOpenModal}>
              <Plus className="w-5 h-5" /> Add Service
            </Button>
          </div>
        </div>
        <PaginatedTable columns={columns} loadingState={loading}>
          {data.map((service) => (
            <tr key={service.id} className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border">
              <td className="px-4 py-2">{service.name}</td>
              <td className="px-4 py-2">{formatDate(service.effectiveStartDate!.toString())}</td>
              <td className="px-4 py-2">{formatDate(service.effectiveEndDate!.toString())}</td>
              <td className="px-4 py-2">{service.isActive ? "Yes" : "No"}</td>
              <td className="px-4 py-2">
                <Tooltip tooltip="Edit">
                  <Pencil className="w-5 h-5" onClick={() => handleOpenEditModal(service)} />
                </Tooltip>
              </td>
            </tr>
          ))}
        </PaginatedTable>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-lg font-semibold">Add Service</h2>
        <form onSubmit={handleSubmit}>
          <Input name="name" label="Name" value={formData.name} onChange={handleInputChange} required />
          <Input
            name="effectiveStartDate"
            label="Effective Start Date"
            type="date"
            value={formData.effectiveStartDate}
            onChange={handleInputChange}
            required
          />
          <Input
            name="effectiveEndDate"
            label="Effective End Date"
            type="date"
            value={formData.effectiveEndDate}
            onChange={handleInputChange}
            required
          />
          <Input
            name="isActive"
            label="Active"
            type="checkbox"
            value={formData.isActive}
            onChange={handleInputChange}
          />
          <Select
            options={gstData}
            label="GST%"
            onChange={(value) => setFormState((prev) => ({ ...prev, gstCodeId: value }))}
          />
          <div className="flex justify-end mt-4">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
        <h2 className="text-lg font-semibold">Edit Service</h2>
        <form onSubmit={handleEditSubmit}>
          <Input
            name="name"
            label="Name"
            value={editFormData.name}
            onChange={handleEditInputChange}
            required
          />
          <Input
            name="effectiveStartDate"
            id="effectiveStartDate"
            label="Effective Start Date"
            type="date"
            value={editFormData.effectiveStartDate}
            onChange={handleEditInputChange}
            required
          />
          <Input
            name="effectiveEndDate"
            id="effectiveEndDate"
            label="Effective End Date"
            type="date"
            value={editFormData.effectiveEndDate}
            onChange={handleEditInputChange}
            required
          />
          <Input
            name="isActive"
            label="Active"
            type="checkbox"
            value={editFormData.isActive}
            onChange={handleEditInputChange}
          />
          <div className="flex justify-between mt-4">
            <Button type="submit">Save</Button>
            <Button onClick={() =>
              handleDeleteService(editFormData.id!)
            }>Delete</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

export default ServicesPage;