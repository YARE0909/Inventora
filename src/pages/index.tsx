import Layout from "@/components/Layout";
import Graph from "@/components/ui/Graph";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { FilterX, Search, LoaderCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/ToolTip";
import { formatIndianCurrency } from "@/utils/formatIndianCurrency";

const GraphComponent = ({
  data,
  header,
  setDate,
  applyFilter,
  clearFilter,
  statistics,
  dataKeys,
  fillColors,
  cardsData,
}: {
  data: { label: string; [key: string]: number | string }[];
  header: string;
  setDate: (name: string, value: string) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  statistics: { label: string; value: number | string }[];
  dataKeys: {
    label: string;
    value: string;
  }[];
  fillColors: string[];
  cardsData?: { label: React.ReactNode; value: React.ReactNode }[];
}) => {
  return (
    <div className="w-full border border-border rounded-md">
      <div className="w-full flex flex-col space-y-4 p-4">
        <div className="w-full flex flex-col md:flex-row justify-between md:items-center border-b border-b-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="border-r border-r-border pr-4">
              <h1 className="text-2xl text-text font-bold">{header}</h1>
            </div>
            <div className="w-full flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              {statistics.map((item, index) => (
                <div key={index}>
                  <h1 className="text-textAlt font-bold">
                    {item.label}:
                    <span className="text-text text-xl"> {item.value}</span>
                  </h1>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-fit flex flex-col md:flex md:flex-row md:space-x-3 space-y-3 md:space-y-0 items-end">
            <Input
              name="startDate"
              id="startDate"
              placeholder="Select Date"
              type="date"
              label="Start Date"
              onChange={(e) => setDate("startDate", e.target.value)}
            />
            <Input
              name="endDate"
              id="endDate"
              placeholder="Select Date"
              type="date"
              label="End Date"
              onChange={(e) => setDate("endDate", e.target.value)}
            />
            <div className="w-fit flex justify-end space-x-3">
              <Tooltip tooltip="Search">
                <Button onClick={applyFilter}>
                  <Search className="w-5 h-5" />
                  <span className="md:hidden">Search</span>
                </Button>
              </Tooltip>
              <Tooltip tooltip="Clear Filters">
                <Button onClick={clearFilter}>
                  <FilterX className="w-5 h-5" />
                  <span className="md:hidden">Clear Filters</span>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div>
          <div className="w-full flex flex-col md:flex md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            {cardsData?.map((item, index) => (
              <div
                key={index}
                className="w-full bg-background p-4 rounded-md border border-border"
              >
                {item.label}
                {item.value}
              </div>
            ))}
          </div>
          <div>
            <Graph
              data={data}
              graphType="bar"
              dataKeys={dataKeys}
              height={300}
              fillColors={fillColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [orderData, setOrderData] = useState({
    orders: {
      count: 0,
      totalValue: 0,
      activeOrderTotal: 0,
      onHoldOrderTotal: 0,
      completedOrderTotal: 0,
      cancelledOrderTotal: 0,
      graphData: [],
    },
  });
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchOrderData = async (startDate = "", endDate = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/analytics/orders`,
        {
          params: { startDate, endDate },
        }
      );
      setOrderData(response.data);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDate = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilter = () => {
    if (!filters.startDate || !filters.endDate) {
      return toast("Please select both dates.", "top-right", "warning");
    }
    fetchOrderData(filters.startDate, filters.endDate);
  };

  const clearFilter = () => {
    setFilters({ startDate: "", endDate: "" });
    fetchOrderData();
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  return (
    <Layout header={"Dashboard"}>
      {/* Show loader while data is being fetched */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-8">
          <LoaderCircle className="animate-spin rounded-full h-5 w-5"></LoaderCircle>
        </div>
      ) : (
        <GraphComponent
          data={orderData.orders.graphData}
          dataKeys={[
            { label: "Active", value: "active" },
            { label: "On Hold", value: "onHold" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          fillColors={["#3b82f6", "#f97316 ", "#10b981", "#ef4444"]}
          header="Orders"
          setDate={handleSetDate}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
          statistics={[
            { label: "Total Orders", value: orderData.orders.count },
            {
              label: "Total Revenue",
              value: formatIndianCurrency(orderData.orders.totalValue),
            },
          ]}
          cardsData={[
            {
              label: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-blue-500 font-bold">Active</h1>
                </div>
              ),
              value: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-text font-bold text-2xl">
                    {formatIndianCurrency(orderData.orders.activeOrderTotal)}
                  </h1>
                </div>
              ),
            },
            {
              label: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-orange-500 font-bold">On Hold</h1>
                </div>
              ),
              value: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-text font-bold text-2xl">
                    {formatIndianCurrency(orderData.orders.onHoldOrderTotal)}
                  </h1>
                </div>
              ),
            },
            {
              label: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-green-500 font-bold">Completed</h1>
                </div>
              ),
              value: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-text font-bold text-2xl">
                    {formatIndianCurrency(orderData.orders.completedOrderTotal)}
                  </h1>
                </div>
              ),
            },
            {
              label: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-red-500 font-bold">Cancelled</h1>
                </div>
              ),
              value: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-text font-bold text-2xl">
                    {formatIndianCurrency(orderData.orders.cancelledOrderTotal)}
                  </h1>
                </div>
              ),
            },
          ]}
        />
      )}
    </Layout>
  );
}
