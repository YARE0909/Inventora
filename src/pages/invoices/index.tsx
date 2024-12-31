import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import PaginatedTable from "@/components/ui/PaginatedTable";
import SearchBar from "@/components/ui/SearchBar";
import Tabs from "@/components/ui/Tabs";
import axios from "axios";
import { FileSpreadsheet, FilterX, Pencil, Plus } from "lucide-react";
import { exportToCSV } from "@/utils/jsonToCsv";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/ToolTip";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { Invoice } from "@/utils/types/types";
import Drawer, { DrawerHandle } from "@/components/ui/Drawer";
import InvoiceDetailDrawer from "./_components/InvoiceDetailDrawer";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import { useRouter } from "next/router";
import { formatDate } from "@/utils/dateFormatting";

const InvoiceTable = ({
  header,
  data,
  activeTab,
  setData,
  loading,
  setLoading,
}: {
  header: React.ReactNode;
  data: Invoice[];
  activeTab: "Paid" | "Pending" | "PartiallyPaid";
  setData: React.Dispatch<React.SetStateAction<Invoice[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // TODO: Implement filter by date
  const { toast } = useToast();
  const drawerRef = useRef<DrawerHandle>(null);
  const [selectedInvoiceDetails, setSelectedOrderDetails] =
    useState<Invoice | null>(null);

  const handleSearch = async (value: string) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices`,
        {
          params: {
            invoiceNumber: value,
          }
        }
      );

      setData(response.data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices?paymentStatus=${activeTab}`
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
    console.log("Open Drawer for Invoice ID:", id);
    drawerRef.current?.openDrawer();
    setSelectedOrderDetails(data.find((invoice) => invoice.id === id) || null);
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
    "Invoice #",
    "Invoice Date",
    "Invoice Amount",
    "Customer",
    "Comments",
    ""
  ];

  const columnMappings: { [key: string]: keyof Invoice } = {
    "Invoice #": "invoiceNumber",
    "Invoice Date": "invoiceDate",
    "Invoice Amount": "invoiceAmount",
    Customer: "customer",
    Comments: "invoiceComments",
  };

  const router = useRouter();

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
                handleExportToCSV(data, ["id", "createdOn"], "invoices.csv")
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
                {column === "Invoice Date"
                  ? formatDate(
                    row[columnMappings[column] as keyof Invoice] as string
                  ) : column === "Customer"
                    ? row?.customer?.name
                    : column === "Invoice Amount"
                      ? formatIndianCurrency(
                        row[columnMappings[column] as keyof Invoice] as number)
                      : column === "" ? (
                        <div>
                          <Tooltip tooltip="Edit Order" position="left">
                            <Pencil className="w-5 h-5" onClick={() => {
                              router.push(`/invoices/edit-invoice/${row.id}`);
                            }} />
                          </Tooltip>
                        </div>
                      ) : row[columnMappings[column] as keyof Invoice]?.toString()}{" "}
              </td>
            ))}
          </tr>
        ))}
      </PaginatedTable>
      <Drawer
        ref={drawerRef}
        header={`Invoice #${selectedInvoiceDetails?.invoiceNumber}`}
        size="w-full md:w-fit"
      >
        <InvoiceDetailDrawer selectedInvoiceDetails={selectedInvoiceDetails!} />
      </Drawer>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Paid" | "Pending" | "PartiallyPaid"
  >("Paid");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices?paymentStatus=${activeTab}`
        );
        setData(response.data.reverse());
        setLoading(false);
      } catch {
        toast("Something went wrong.", "top-right", "error");
      }
    };

    fetchData();
  }, [activeTab]);

  const tabs = [
    {
      label: "Paid",
      content: (
        <InvoiceTable
          header={
            <div className="w-fit flex space-x-3 items-center">
              <div>
                <h1 className="text-text flex items-center gap-2">
                  <span className="text-sm text-textAlt">
                    Total Invoice{" "}
                  </span>
                  {formatIndianCurrency(
                    data.reduce((acc, curr) => acc + curr.invoiceAmount, 0) || 0
                  )}
                </h1>
              </div>
              <div>
                <Button
                  onClick={() => {
                    router.push("/invoices/create-invoice");
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New Invoice
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
      label: "Pending",
      content: (
        <InvoiceTable
          header={
            <div className="w-fit flex space-x-3 items-center">
              <div>
                <h1 className="text-text flex items-center gap-2">
                  <span className="text-sm text-textAlt">
                    Total Invoice{" "}
                  </span>
                  {formatIndianCurrency(
                    data.reduce((acc, curr) => acc + curr.invoiceAmount, 0) || 0
                  )}
                </h1>
              </div>
              <div>
                <Button
                  onClick={() => {
                    router.push("/invoices/create-invoice");
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New Invoice
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
          <h1 className="font-extrabold text-2xl uppercase">Invoices</h1>
        </div>
      </div>
    )}>
      <Tabs tabs={tabs} setActiveTab={setActiveTab} /> {/* Pass setActiveTab */}
    </Layout>
  );
}
