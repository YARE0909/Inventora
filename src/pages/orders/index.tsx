import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import Tabs from "@/components/ui/Tabs";
import axios from "axios";
import { format } from "date-fns";
import { FileSpreadsheet, FilterX } from "lucide-react";
import { exportToCSV } from "@/utils/jsonToCsv";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/ToolTip";
import { useToast } from "@/components/ui/Toast/ToastProvider";

// Define a type for the data structure
type OrderData = {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  contactPerson: string;
  proformaInvoice: string;
  proformaInvoiceDate: string;
  orderValue: number;
  orderCount: number;
  orderDeliveryDate: string;
  orderStatus: "Active" | "OnHold" | "Completed" | "Cancelled";
  orderComments: string;
  createdBy: number;
  createdOn: string;
  modifiedBy: number | null;
  modifiedOn: string | null;
};

const OrderTable = ({
  header,
  data,
  activeTab,
  setData,
  loading,
  setLoading,
}: {
  header: string;
  data: OrderData[];
  activeTab: "Active" | "OnHold" | "Completed" | "Cancelled";
  setData: React.Dispatch<React.SetStateAction<OrderData[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // TODO: Implement filter by date
  const { toast } = useToast();

  const handleSearch = async (value: string) => {
    try {
      setLoading(true);

      const isOrderId = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6}$/.test(value);

      const queryParams: Record<string, string> = { status: activeTab };

      if (isOrderId) {
        queryParams.orderNumber = value;
      } else {
        queryParams.clientName = value;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`,
        { params: queryParams }
      );

      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast("Something went wrong.", "top-right", "error");
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?status=${activeTab}`
      );
      setData(response.data);
      setLoading(false);
      toast("Filters cleared successfully!", "top-right", "success");
    } catch (error) {
      toast("Something went wrong.", "top-right", "error");
      setLoading(false);
    }
  };

  const handleDrawerOpen = (id: string) => {
    console.log("Open Drawer for Order ID:", id);
    // TODO: Implement drawer opening logic
  };

  const handleExportToCSV = (data: any, filters: string[]) => {
    try {
      exportToCSV(data, filters);
      toast("Exported to CSV successfully!", "top-right", "success");
    } catch (error) {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const columns = [
    "Order #",
    "Customer",
    "Delivery Date",
    "Total Amount",
    "Comments",
  ];

  const columnMappings: { [key: string]: keyof OrderData } = {
    "Order #": "orderNumber",
    Customer: "customerName",
    "Delivery Date": "orderDeliveryDate",
    "Total Amount": "orderValue",
    Comments: "orderComments",
  };

  // Helper function to format the delivery date
  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy"); // Format to "01-Jan-2024"
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex justify-between items-center">
        <div className="hidden md:block">
          <h1 className="font-semibold text-textAlt text-lg">{header}</h1>
        </div>
        <div className="w-full md:w-fit flex flex-row items-center gap-1">
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
                handleExportToCSV(data, [
                  "id",
                  "createdBy",
                  "createdOn",
                  "modifiedBy",
                  "modifiedOn",
                ])
              }
            >
              <FileSpreadsheet className="w-5 h-5" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <PaginatedTable columns={columns} loadingState={loading}>
        {data.map((row, index) => (
          <tr
            key={index}
            className="hover:bg-foreground duration-500 cursor-pointer"
            onClick={() => handleDrawerOpen(row.id)}
          >
            {columns.map((column) => (
              <td key={column} className="px-4 py-2">
                {column === "Delivery Date"
                  ? formatDate(
                      row[columnMappings[column] as keyof OrderData] as string
                    )
                  : row[columnMappings[column] as keyof OrderData]}{" "}
              </td>
            ))}
          </tr>
        ))}
      </PaginatedTable>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState<OrderData[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Active" | "OnHold" | "Completed" | "Cancelled"
  >("Active");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?status=${activeTab}`
        );
        setData(response.data);
        setLoading(false);
      } catch (error) {
        toast("Something went wrong.", "top-right", "error");
      }
    };

    fetchData();
  }, [activeTab]);

  const tabs = [
    {
      label: "Active",
      content: (
        <OrderTable
          header="Active Orders"
          data={data}
          activeTab={activeTab}
          setData={setData}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      label: "On Hold",
      content: (
        <OrderTable
          header="Orders On Hold"
          data={data}
          activeTab={activeTab}
          setData={setData}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      label: "Completed",
      content: (
        <OrderTable
          header="Completed Orders"
          data={data}
          activeTab={activeTab}
          setData={setData}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      label: "Cancelled",
      content: (
        <OrderTable
          header="Cancelled Orders"
          data={data}
          activeTab={activeTab}
          setData={setData}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
  ];

  return (
    <Layout header={"Orders"}>
      <Tabs tabs={tabs} setActiveTab={setActiveTab} /> {/* Pass setActiveTab */}
    </Layout>
  );
}
