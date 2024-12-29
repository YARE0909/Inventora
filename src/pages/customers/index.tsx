import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import Tooltip from "@/components/ui/ToolTip";
import { exportToCSV } from "@/utils/jsonToCsv";
import { Customer } from "@/utils/types/types";
import axios from "axios";
import { FileSpreadsheet, FilterX, LoaderCircle, Pencil, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import ClickToCopy from "@/components/ui/ClickToCopy";

const columns = [
  "Customer",
  "Contact Person",
  "Email",
  "Phone",
  "Billing Address",
  "Shipping Address",
  ""
];

const columnMappings: { [key: string]: keyof Customer } = {
  Customer: "name",
  "Contact Person": "contactPerson",
  Email: "email",
  Phone: "phone",
  "Billing Address": "billingAddress",
  "Shipping Address": "shippingAddress",
};

const Index = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { toast } = useToast();

  const [formData, setFormState] = useState<Customer>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const [editFormData, setEditFormState] = useState<Customer>({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const handleEditCustomer = async (id: string | undefined) => {
    try {
      setIsEditModalOpen(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers?filter=${id}`
      );
      setEditFormState(response.data);
    } catch {
      toast("Something went wrong.", "top-right", "error");

    }
  }

  const fetchData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers${filter ? `?filter=${filter}` : ""
        }`
      );
      setData(response.data);
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
      contactPerson: "",
      email: "",
      phone: "",
      billingAddress: "",
      shippingAddress: "",
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormState({
      id: "",
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      billingAddress: "",
      shippingAddress: "",
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers`,
        formData
      );
      toast("Customer created successfully!", "top-right", "success");
      fetchData();
      handleCloseModal();
    } catch {
      toast("Failed to create customer.", "top-right", "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers`,
        editFormData
      );
      toast("Customer updated successfully!", "top-right", "success");
      fetchData();
      handleCloseEditModal();
    } catch {
      toast("Failed to update customer.", "top-right", "error");
    }
  }

  const handleDeleteCustomer = async (id: string | undefined) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers?id=${id}`
      );
      toast("Customer deleted successfully!", "top-right", "success");
      fetchData();
      handleCloseEditModal();
    } catch {
      toast("Failed to delete customer.", "top-right", "error");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">Customers</h1>
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
              Customer
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
                <td
                  key={column}
                  className={`px-4 py-2 ${column === "Billing Address" ||
                    column === "Shipping Address"
                    ? "max-w-28"
                    : ""
                    }`}
                >
                  {column === "Billing Address" ||
                    column === "Shipping Address" ? (
                    // truncate the address if it's too long
                    <ClickToCopy toolTipPosition="top">
                      {row[columnMappings[column] as keyof Customer] as string}
                    </ClickToCopy>
                  ) :
                    column === "" ? (
                      <Tooltip tooltip="Edit">
                        <Pencil className="w-4 h-4" onClick={() => handleEditCustomer(row.id)} />
                      </Tooltip>
                    ) :
                      (
                        (row[columnMappings[column] as keyof Customer] as string)
                      )}
                </td>
              ))}
            </tr>
          ))}
        </PaginatedTable>
      </div>
      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-lg font-semibold mb-4">ADD CUSTOMER</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            label="Customer"
          />
          <Input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            required
            label="Contact Person"
          />
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            label="Email"
          />
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            label="Phone"
          />
          <Input
            type="text"
            id="billingAddress"
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleInputChange}
            required
            label="Billing Address"
          />
          <Input
            type="text"
            id="shippingAddress"
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleInputChange}
            required
            label="Shipping Address"
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
        <h2 className="text-lg font-semibold mb-4">EDIT CUSTOMER</h2>
        {editFormData.id ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              id="name"
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              required
              label="Customer"
            />
            <Input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={editFormData.contactPerson}
              onChange={handleEditInputChange}
              required
              label="Contact Person"
            />
            <Input
              type="email"
              id="email"
              name="email"
              value={editFormData.email}
              onChange={handleEditInputChange}
              required
              label="Email"
            />
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditInputChange}
              required
              label="Phone"
            />
            <Input
              type="text"
              id="billingAddress"
              name="billingAddress"
              value={editFormData.billingAddress}
              onChange={handleEditInputChange}
              required
              label="Billing Address"
            />
            <Input
              type="text"
              id="shippingAddress"
              name="shippingAddress"
              value={editFormData.shippingAddress}
              onChange={handleEditInputChange}
              required
              label="Shipping Address"
            />
            <hr className="border border-border" />
            <div className="w-full flex space-x-3">
              <Button type="submit">Save</Button>
              <Button onClick={() => handleDeleteCustomer(editFormData.id)} classname="text-red-500 border-red-500 bg-red-500/20 hover:bg-background">Delete</Button>
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
