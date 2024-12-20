import Layout from "@/components/Layout";
import Graph from "@/components/ui/Graph";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { formatIndianCurrency } from "@/utils/formatIndianCurrency";
import Select from "@/components/ui/SelectComponent";

const GraphComponent = ({
  data,
  header,
  setYear,
  statistics,
  dataKeys,
  fillColors,
  cardsData,
  selectedYear, // Added the selectedYear prop
}: {
  data: { label: string;[key: string]: number | string }[];
  header: string;
  setYear: (value: string) => void;
  statistics: { label: string; value: number | string }[];
  dataKeys: { label: string; value: string }[];
  fillColors?: string[];
  cardsData?: { label: React.ReactNode; value: React.ReactNode }[];
  selectedYear: string; // Added selectedYear prop type
}) => {
  const years = Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => {
    const year = (2020 + i).toString();
    return { value: year, label: year };
  });

  return (
    <div className="w-full border border-border rounded-md">
      <div className="w-full flex flex-col space-y-4 p-4">
        <div className="w-full flex flex-col md:flex-row justify-between md:items-center border-b border-b-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col md:flex md:flex-row md:gap-2">
              <div className="">
                <h1 className="text-2xl text-text font-bold">{header}</h1>
              </div>
              <div className="border-r border-r-border pr-4">
                <h1 className="text-text text-2xl font-bold">{selectedYear}</h1>
              </div>
            </div>
            <div className="w-full flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              {statistics.map((item, index) => (
                <div key={index}>
                  <h1 className="text-textAlt font-bold flex flex-col md:flex md:flex-row md:items-end md:gap-1">
                    {item.label}
                    <span className="text-text text-xl"> {item.value}</span>
                  </h1>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-fit flex flex-col md:flex md:flex-row md:space-x-3 space-y-3 md:space-y-0 items-end">
            {/* Year Select Dropdown */}
            <Select
              options={years.reverse()}
              label="Select Year"
              onChange={setYear}
              showLabel={false}
            />
          </div>
        </div>

        <div className="w-full flex flex-col space-y-4">
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
              height={350}
              fillColors={fillColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [orderData, setOrderData] = useState<{
    orders: {
      count: number;
      totalValue: number;
      activeOrderTotal: number;
      onHoldOrderTotal: number;
      completedOrderTotal: number;
      cancelledOrderTotal: number;
      activeOrderCount: number;
      onHoldOrderCount: number;
      completedOrderCount: number;
      cancelledOrderCount: number;
      graphData: { label: string;[key: string]: number | string }[];
    };
  }>({
    orders: {
      count: 0,
      totalValue: 0,
      activeOrderTotal: 0,
      onHoldOrderTotal: 0,
      completedOrderTotal: 0,
      cancelledOrderTotal: 0,
      activeOrderCount: 0,
      onHoldOrderCount: 0,
      completedOrderCount: 0,
      cancelledOrderCount: 0,
      graphData: [],
    },
  });
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(), // Default to current year
  });
  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchOrderData = async (year = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/analytics/orders`,
        {
          params: { year },
        }
      );
      setOrderData(response.data);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDate = (value: string) => {
    setFilters({
      year: value,
    });
    fetchOrderData(value); // Automatically call API on year change
  };

  useEffect(() => {
    fetchOrderData(filters.year); // Load data based on selected year
  }, [filters.year]);

  return (
    <Layout header={"Dashboard"}>
      {/* Show loader while data is being fetched */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-8">
          <LoaderCircle className="animate-spin rounded-full h-5 w-5" />
        </div>
      ) : (
        <GraphComponent
          data={orderData.orders.graphData}
          dataKeys={[
            { label: "Total Order Value", value: "value" },
            { label: "Total Order Count", value: "count" },
          ]}
          header="Orders"
          setYear={handleSetDate}
          selectedYear={filters.year} // Pass selected year as a prop
          statistics={[
            { label: "Total Orders", value: orderData.orders.count },
            {
              label: "Total Order Value",
              value: formatIndianCurrency(orderData.orders.totalValue),
            },
          ]}
          cardsData={[
            {
              label: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-blue-500 font-bold flex gap-2 items-center">
                    Active
                    <span className="text-text text-2xl">
                      {orderData.orders.activeOrderCount}
                    </span>
                  </h1>
                </div>
              ),
              value: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-text font-bold text-2xl">
                    {formatIndianCurrency(orderData.orders.activeOrderTotal, {
                      decimalPlaces: 2,
                    })}
                  </h1>
                </div>
              ),
            },
            {
              label: (
                <div className="flex space-x-1 items-center">
                  <h1 className="text-orange-500 font-bold flex gap-2 items-center">
                    On Hold
                    <span className="text-text text-2xl">
                      {orderData.orders.onHoldOrderCount}
                    </span>
                  </h1>
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
                  <h1 className="text-green-500 font-bold flex gap-2 items-center">
                    Completed
                    <span className="text-text text-2xl">
                      {orderData.orders.completedOrderCount}
                    </span>
                  </h1>
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
                  <h1 className="text-red-500 font-bold flex gap-2 items-center">
                    Cancelled
                    <span className="text-text text-2xl">
                      {orderData.orders.cancelledOrderCount}
                    </span>
                  </h1>
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
          fillColors={[
            "#10b981",
            "#3788D8"
          ]}
        />
      )}
    </Layout>
  );
}
