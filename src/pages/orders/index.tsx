import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import Tabs from "@/components/ui/Tabs";
import axios from "axios";
import { format } from "date-fns"; // Import date-fns format function

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
}: {
  header: string;
  data: OrderData[];
  activeTab: "Active" | "OnHold" | "Completed" | "Cancelled";
  setData: React.Dispatch<React.SetStateAction<OrderData[]>>;
}) => {
  const handleSearch = async (value: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?status=${activeTab}&clientName=${value}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDrawerOpen = (id: string) => {
    console.log("Open Drawer for Order ID:", id);
    // TODO: Implement drawer opening logic
  };

  const columns = [
    "#",
    "Customer",
    "Delivery Date",
    "Total Amount",
    "Comments",
  ];

  const columnMappings: { [key: string]: keyof OrderData } = {
    "#": "orderNumber",
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
          <h1 className="font-semibold text-gray-300 text-lg">{header}</h1>
        </div>
        <SearchBar
          type="text"
          placeholder="Search here..."
          onEnter={handleSearch}
          onChange={(value) => console.log("Input Changed:", value)}
        />
      </div>
      <PaginatedTable columns={columns}>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?status=${activeTab}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
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
