import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import Tabs from "@/components/ui/Tabs";
import axios from "axios";
import { format } from "date-fns";
import { FileSpreadsheet, FilterX, Plus } from "lucide-react";
import { exportToCSV } from "@/utils/jsonToCsv";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/ToolTip";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { Order } from "@/utils/types/types";
import Drawer, { DrawerHandle } from "@/components/ui/Drawer";
import OrderDetailDrawer from "./_components/OrderDetailDrawer";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import { useRouter } from "next/router";

const OrderTable = ({
  header,
  data,
  activeTab,
  setData,
  loading,
  setLoading,
}: {
  header: React.ReactNode;
  data: Order[];
  activeTab: "Active" | "OnHold" | "Completed" | "Cancelled";
  setData: React.Dispatch<React.SetStateAction<Order[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // TODO: Implement filter by date
  const { toast } = useToast();
  const drawerRef = useRef<DrawerHandle>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<Order | null>(null);

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
    } catch {
      toast("Something went wrong.", "top-right", "error");
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    const filterMapping: Record<string, string> = {
      Active: "Active",
      "On Hold": "OnHold",
      Completed: "Completed",
      Cancelled: "Cancelled",
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?status=${filterMapping[activeTab]}`
      );
      setData(response.data);
      setLoading(false);
      toast("Filters cleared successfully!", "top-right", "success");
    } catch {
      toast("Something went wrong.", "top-right", "error");
      setLoading(false);
    }
  };

  const handleDrawerOpen = (id: string) => {
    console.log("Open Drawer for Order ID:", id);
    drawerRef.current?.openDrawer();
    setSelectedOrderDetails(data.find((order) => order.id === id) || null);
  };

  const handleExportToCSV = (
    // eslint-disable-next-line
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

  const columns = [
    "Order #",
    "Order Date",
    "Order Amount",
    "Customer",
    "Delivery Date",
    "Comments",
  ];

  const columnMappings: { [key: string]: keyof Order } = {
    "Order #": "orderNumber",
    "Order Date": "orderDate",
    "Order Amount": "orderValue",
    Customer: "customer",
    "Delivery Date": "orderDeliveryDate",
    Comments: "orderComments",
  };

  // Helper function to format the delivery date
  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy"); // Format to "01-Jan-2024"
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex flex-row-reverse justify-between items-center">
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
                handleExportToCSV(data, ["id", "createdOn"], "orders.csv")
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
            className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border"
            onClick={() => row.id && handleDrawerOpen(row.id)}
          >
            {columns.map((column) => (
              <td key={column} className="px-4 py-2">
                {column === "Delivery Date" || column === "Order Date"
                  ? formatDate(
                    row[columnMappings[column] as keyof Order] as string
                  )
                  : column === "Customer"
                    ? row?.customer?.name
                    : column === "Total Amount"
                      ? formatIndianCurrency(
                        row[columnMappings[column] as keyof Order] as number
                      )
                      : row[columnMappings[column] as keyof Order]?.toString()}{" "}
              </td>
            ))}
          </tr>
        ))}
      </PaginatedTable>
      <Drawer
        ref={drawerRef}
        header={`Order #${selectedOrderDetails?.orderNumber}`}
        size="w-full md:w-fit"
      >
        <OrderDetailDrawer selectedOrderDetails={selectedOrderDetails!} />
      </Drawer>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Active" | "OnHold" | "Completed" | "Cancelled"
  >("Active");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const filterMapping: Record<string, string> = {
        Active: "Active",
        "On Hold": "OnHold",
        Completed: "Completed",
        Cancelled: "Cancelled",
      };
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?status=${filterMapping[activeTab]}`
        );
        setData(response.data);
        setLoading(false);
      } catch {
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
          header={
            <div className="w-fit flex space-x-3 items-center">
              <div>
                <h1 className="text-text flex items-center gap-2">
                  <span className="text-sm text-textAlt">
                    Total Orders Amount{" "}
                  </span>
                  {formatIndianCurrency(
                    data.reduce((acc, curr) => acc + curr.orderValue, 0) || 0
                  )}
                </h1>
              </div>
              <div>
                <Button
                  onClick={() => {
                    router.push("/orders/create-order");
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New Order
                </Button>
              </div>
            </div>
          }
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
          header={
            <div className="w-fit flex space-x-3 items-center">
              <div>
                <h1 className="text-text flex items-center gap-2">
                  <span className="text-sm text-textAlt">
                    Total Orders Amount{" "}
                  </span>
                  {formatIndianCurrency(
                    data.reduce((acc, curr) => acc + curr.orderValue, 0) || 0
                  )}
                </h1>
              </div>
              <div>
                <Button
                  onClick={() => {
                    router.push("/orders/create-order");
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New Order
                </Button>
              </div>
            </div>
          }
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
          header={
            <div className="w-fit flex space-x-3 items-center">
              <div>
                <h1 className="text-text flex items-center gap-2">
                  <span className="text-sm text-textAlt">
                    Total Orders Amount{" "}
                  </span>
                  {formatIndianCurrency(
                    data.reduce((acc, curr) => acc + curr.orderValue, 0) || 0
                  )}
                </h1>
              </div>
              <div>
                <Button
                  onClick={() => {
                    router.push("/orders/create-order");
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New Order
                </Button>
              </div>
            </div>
          }
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
          header={
            <div className="w-fit flex space-x-3 items-center">
              <div>
                <h1 className="text-text flex items-center gap-2">
                  <span className="text-sm text-textAlt">
                    Total Orders Amount{" "}
                  </span>
                  {formatIndianCurrency(
                    data.reduce((acc, curr) => acc + curr.orderValue, 0) || 0
                  )}
                </h1>
              </div>
              <div>
                <Button
                  onClick={() => {
                    router.push("/orders/create-order");
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New Order
                </Button>
              </div>
            </div>
          }
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
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">Orders</h1>
        </div>
      </div>
    )}>
      <Tabs tabs={tabs} setActiveTab={setActiveTab} /> {/* Pass setActiveTab */}
    </Layout>
  );
}
