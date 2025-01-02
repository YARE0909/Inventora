import Layout from "@/components/Layout";
import Graph from "@/components/ui/Graph";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import Select from "@/components/ui/SelectComponent";

const GraphComponent = ({
  data,
  header,
  statistics,
  dataKeys,
  fillColors,
  cardsData,
  selectedYear,
}: {
  data: { label: string;[key: string]: number | string }[];
  header: string;
  statistics: { label: string; value: number | string }[];
  dataKeys: { label: string; value: string }[];
  fillColors?: string[];
  cardsData?: { label: React.ReactNode; value: React.ReactNode }[];
  selectedYear: string;
}) => {
  return (
    <div className="w-full rounded-md bg-foreground">
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
          <div className="border border-border rounded-md">
            <Graph
              data={data}
              graphType="bar"
              dataKeys={dataKeys}
              height={400}
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
  const [invoiceData, setInvoiceData] = useState<{
    invoices: {
      count: number;
      totalValue: number;
      pendingInvoiceTotal: number;
      pendingInvoiceCount: number;
      partiallyPaidInvoiceTotal: number;
      partiallyPaidInvoiceCount: number;
      paidInvoiceTotal: number;
      paidInvoiceCount: number;
      graphData: { label: string;[key: string]: number | string }[];
    };
  }>({
    invoices: {
      count: 0,
      totalValue: 0,
      pendingInvoiceTotal: 0,
      pendingInvoiceCount: 0,
      partiallyPaidInvoiceTotal: 0,
      partiallyPaidInvoiceCount: 0,
      paidInvoiceTotal: 0,
      paidInvoiceCount: 0,
      graphData: [],
    },
  });

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
  });
  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const years = Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => {
    const year = (2020 + i).toString();
    return { value: year, label: year };
  });


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

  const fetchInvoiceData = async (year = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/analytics/invoices`,
        {
          params: { year },
        }
      );
      setInvoiceData(response.data);
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
    fetchOrderData(value);
    fetchInvoiceData(value);
  };

  useEffect(() => {
    fetchOrderData(filters.year);
    fetchInvoiceData(filters.year);
  }, [filters.year]);

  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">Dashboard</h1>
        </div>
        <div className="w-full md:w-32 flex flex-col md:flex md:flex-row md:space-x-3 space-y-3 md:space-y-0 items-end">
          {/* Year Select Dropdown */}
          <Select
            options={years.reverse()}
            label="Select Year"
            onChange={handleSetDate}
            showLabel={false}
          />
        </div>
      </div>
    )}>
      {/* Show loader while data is being fetched */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-8">
          <LoaderCircle className="animate-spin rounded-full h-5 w-5" />
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <GraphComponent
            data={orderData.orders.graphData}
            dataKeys={[
              { label: "Order Count", value: "count" },
              { label: "Order Value", value: "value" },
            ]}
            header="Orders"
            selectedYear={filters.year} // Pass selected year as a prop
            statistics={[
              { label: "Orders", value: orderData.orders.count },
              {
                label: "Order Value",
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
              "#3788D8",
              "#10b981"
            ]}
          />
          <GraphComponent
            data={invoiceData.invoices.graphData}
            dataKeys={[
              { label: "Invoice Count", value: "count" },
              { label: "Invoice Value", value: "value" },
            ]}
            header="Invoices"
            selectedYear={filters.year} // Pass selected year as a prop
            statistics={[
              { label: "Invoices", value: invoiceData.invoices.count },
              {
                label: "Invoices Value",
                value: formatIndianCurrency(invoiceData.invoices.totalValue),
              },
            ]}
            cardsData={[
              {
                label: (
                  <div className="flex space-x-1 items-center">
                    <h1 className="text-green-500 font-bold flex gap-2 items-center">
                      Paid
                      <span className="text-text text-2xl">
                        {invoiceData.invoices.paidInvoiceCount}
                      </span>
                    </h1>
                  </div>
                ),
                value: (
                  <div className="flex space-x-1 items-center">
                    <h1 className="text-text font-bold text-2xl">
                      {formatIndianCurrency(invoiceData.invoices.paidInvoiceTotal, {
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
                      Pending
                      <span className="text-text text-2xl">
                        {invoiceData.invoices.pendingInvoiceCount}
                      </span>
                    </h1>
                  </div>
                ),
                value: (
                  <div className="flex space-x-1 items-center">
                    <h1 className="text-text font-bold text-2xl">
                      {formatIndianCurrency(invoiceData.invoices.pendingInvoiceTotal)}
                    </h1>
                  </div>
                ),
              },
              {
                label: (
                  <div className="flex space-x-1 items-center">
                    <h1 className="text-blue-500 font-bold flex gap-2 items-center">
                      Partially Paid
                      <span className="text-text text-2xl">
                        {invoiceData.invoices.partiallyPaidInvoiceCount}
                      </span>
                    </h1>
                  </div>
                ),
                value: (
                  <div className="flex space-x-1 items-center">
                    <h1 className="text-text font-bold text-2xl">
                      {formatIndianCurrency(invoiceData.invoices.partiallyPaidInvoiceTotal)}
                    </h1>
                  </div>
                ),
              },
            ]}
            fillColors={[
              "#FF4DE4",
              "#8b5cf6"
            ]}
          />
        </div>
      )}
    </Layout>
  );
}
