import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import PaginatedTable from "@/components/ui/PaginatedTable";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import {
  Customer,
  GstCode,
  Invoice,
  Order,
  Payment,
  PaymentStatus,
  Product,
} from "@/utils/types/types";
import axios from "axios";
import { FilePlus2, Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectComponent";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import { useRouter } from "next/router";
import { formatDate } from "@/utils/dateFormatting";

const columns = [
  "Product",
  "Quantity",
  "Rate",
  "Amount",
  "GST Code",
  "GST %",
  "GST Amount",
  "Total Amount",
  "",
];

const paymentDetailColumns = [
  "Amount",
  "Payment Mode",
  "Payment Status",
  "Payment Date",
  "Payment Reference #",
  "Payment Details",
  "Comments",
  "",
]

const Index = () => {
  const [data, setData] = useState<Product[]>([]);
  const [productData, setProductData] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [customerData, setCustomerData] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [orderData, setOrderData] = useState<{
    value: string;
    label: string;
  }[]>([]);
  const [gstCodeData, setGstCodeData] = useState<{
    value: string;
    label: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    serviceId?: string;
    productId?: string;
    itemQuantity: number;
    itemRate: number;
    invoiceAmount: number;
    gstCodeId: string;
  }>();

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order>();

  const { toast } = useToast();

  const [formData, setFormData] = useState<Invoice>({
    orderId: "",
    customerId: "",
    invoiceDate: new Date(),
    invoiceAmount: 0,
    adjustedInvoiceAmount: 0,
    reconciledInvoiceAmount: 0,
    reconcileComments: "",
    discountAmount: 0,
    customerGst: "",
    invoiceComments: "",
    invoiceItems: [],
    payments: []
  });

  const [currentPaymentDetails, setCurrentPaymentDetails] = useState<
    Payment & {
      id: string;
    }
  >({
    id: "",
    paymentAmount: 0,
    paymentDate: undefined,
    paymentStatus: PaymentStatus.Pending,
    paymentReferenceId: "",
    paymentMode: "",
  });

  const router = useRouter();

  const addPaymentDetailsToTable = () => {
    if (currentPaymentDetails?.paymentAmount === 0) {
      return toast("Please enter advance amount", "top-right", "warning");
    }

    if (currentPaymentDetails?.paymentDate === undefined) {
      return toast("Please select advance date", "top-right", "warning");
    }

    if (currentPaymentDetails?.paymentStatus === undefined) {
      return toast("Please select payment status", "top-right", "warning");
    }

    if (currentPaymentDetails?.paymentReferenceId === "") {
      return toast("Please enter payment reference #", "top-right", "warning");
    }


    currentPaymentDetails.id = Math.random().toString();

    setFormData({
      ...formData,
      payments: [
        ...formData.payments || [],
        currentPaymentDetails,
      ],
    });

    console.log({ formData });
  };

  const addProductToTable = async () => {
    if (selectedProduct?.productId === "") {
      return toast("Please select product", "top-right", "warning");
    }
    if (selectedProduct?.itemQuantity === 0) {
      return toast("Please enter quantity", "top-right", "warning");
    }
    if (selectedProduct?.itemRate === 0) {
      return toast("Please enter rate", "top-right", "warning");
    }
    if (selectedProduct?.gstCodeId === "") {
      return toast("Please select GST code", "top-right", "warning");
    }

    console.log("Selected Product:", selectedProduct);
    // find product in productData array
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode?id=${selectedProduct!.gstCodeId}`
      );

      const taxPercentage = response?.data?.gst?.taxPercentage;

      setFormData({
        ...formData,
        invoiceItems: [
          ...(formData.invoiceItems || []),
          {
            productId: selectedProduct!.productId,
            itemQuantity: Number(selectedProduct!.itemQuantity),
            itemRate: selectedProduct!.itemRate,
            gstCodeId: selectedProduct!.gstCodeId,
            invoiceAmount: Number(
              (
                selectedProduct!.itemRate * selectedProduct!.itemQuantity +
                (selectedProduct!.itemRate *
                  selectedProduct!.itemQuantity *
                  taxPercentage) /
                100
              ).toFixed(2)
            ),
            gstCode: response.data,
          },
        ],
      });
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }

  };

  const removeProductFromTable = (id: string) => {
    const updatedData = formData.invoiceItems!.filter((item) => item.productId !== id);
    setFormData({
      ...formData,
      invoiceItems: updatedData,
    });
  };

  const removePaymentDetailsFromTable = (id: string) => {
    setFormData({
      ...formData,
      payments: formData.payments?.filter((payment) => payment.id !== id),
    });
  };

  const fetchProductData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products${filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((product: Product) => ({
        value: product.id,
        label: product.name.toString(),
      }));

      setProductData(data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const fetchCustomerData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers${filter ? `?name=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((customer: Customer) => ({
        value: customer.id,
        label: customer.name,
      }));

      setCustomerData(data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const fetchOrderData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders${filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((order: Order) => ({
        value: order.id,
        label: order.orderNumber,
      }));

      setOrderData(data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  }

  const fetchGstCodeData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode${filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((gstCode: GstCode) => ({
        value: gstCode.id,
        label: gstCode.code,
      }));

      setGstCodeData(data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value } = e.target;
    setSelectedProduct({
      ...selectedProduct!,
      [field]: Number(value),
    });
  };

  const handlePaymentDetailsInput = (
    value: string | number,
    field: string
  ) => {
    if (field === "paymentDate") {
      // Convert the date value to ISO format
      value = new Date(value).toISOString();
    }

    if (field === "paymentAmount") {
      value = Number(value);
    }
    setCurrentPaymentDetails({
      ...currentPaymentDetails,
      [field]: value,
    });
  };

  const handleFormInput = async (value: string, field: string) => {
    // Check if the field is a date type
    if (
      field === "invoiceDate"
    ) {
      // Convert the date value to ISO format
      value = new Date(value).toISOString();
    }

    if (field === "orderId") {
      // fetch order details
      const order = orderData.find((order) => order.value === value);
      if (order) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?id=${order.value}`
        );
        setSelectedOrderDetails(response.data);
      }
    }

    // Update the formData state with the new value
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const selectProductChange = (
    value: string,
    field: string
  ) => {
    setSelectedProduct({
      ...selectedProduct!,
      [field]: value,
    });
  };

  const submitOrder = async () => {
    // check if all fields are filled
    if (formData.customerId === "") {
      return toast("Please select a customer", "top-right", "warning");
    }

    if (formData.orderId === "") {
      return toast("Please select an order", "top-right", "warning");
    }

    if (formData.invoiceDate === undefined) {
      return toast("Please select an invoice date", "top-right", "warning");
    }

    if (formData.adjustedInvoiceAmount === 0) {
      return toast("Please enter adjusted amount", "top-right", "warning");
    }

    if (formData.reconciledInvoiceAmount === 0) {
      return toast("Please enter reconciled amount", "top-right", "warning");
    }

    if (formData.invoiceItems?.length === 0) {
      return toast("Please add invoice items", "top-right", "warning");
    }

    if (formData.payments?.length === 0) {
      return toast("Please add payment details", "top-right", "warning");
    }

    console.log({ formData });

    const dataToSend: Invoice = {
      orderId: formData.orderId,
      customerId: formData.customerId,
      invoiceDate: formData.invoiceDate,
      invoiceAmount: Number(formData.invoiceItems!
        .map(
          (item) =>
            item.itemRate * (item.itemQuantity ?? 1) +
            (item.itemRate *
              (item.itemQuantity ?? 1) *
              (item.gstCode?.gst?.taxPercentage ?? 0)) /
            100
        )
        .reduce((acc, item) => acc + item, 0)),
      adjustedInvoiceAmount: Number(formData.adjustedInvoiceAmount),
      reconciledInvoiceAmount: Number(formData.reconciledInvoiceAmount),
      reconcileComments: formData.reconcileComments,
      discountAmount: formData.discountAmount,
      customerGst: formData.customerGst,
      invoiceComments: formData.invoiceComments,
      invoiceItems: formData.invoiceItems!.map((item) => ({
        productId: item.productId,
        itemQuantity: Number(item.itemQuantity),
        itemRate: Number(item.itemRate),
        gstCodeId: item.gstCodeId,
        invoiceAmount: Number(item.invoiceAmount)
      })),
      payments: formData.payments!.map((payment) => ({
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        paymentAmount: Number(payment.paymentAmount),
        paymentReferenceId: payment.paymentReferenceId,
        paymentComments: payment.paymentComments,
        paymentStatus: payment.paymentStatus,
      })),
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices`,
        dataToSend
      );

      if (response.status === 201) {
        toast("Invoice created successfully", "top-right", "success");
        setData([]);
        setFormData({
          orderId: "",
          customerId: "",
          invoiceDate: new Date(),
          invoiceAmount: 0,
          adjustedInvoiceAmount: 0,
          reconciledInvoiceAmount: 0,
          reconcileComments: "",
          discountAmount: 0,
          customerGst: "",
          invoiceComments: "",
          invoiceItems: [],
          payments: []
        });
      }

      setTimeout(() => {
        router.push("/invoices");
      }, 1000);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchCustomerData();
    fetchOrderData();
    fetchGstCodeData();
  }, []);

  useEffect(() => {
    console.log({ data });
  }, [data]);

  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">New Invoice</h1>
        </div>
      </div>
    )}>
      <div className="w-full flex flex-col items-center">
        <div className="w-fit bg-foreground border border-border rounded-md p-4 space-y-3">
          {/* Invoice Details */}
          <div className="w-full flex flex-col space-y-3">
            <div className="w-full flex justify-between items-end z-50 bg-foreground border-b-2 border-b-border pb-3">
              <div className="flex flex-col space-y-3 mt-2">
                <h1 className="text-text font-semibold text-lg">
                  Invoice Details
                </h1>
                <div>
                  <h1 className="text-lg text-text font-semibold">
                    <span className="text-textAlt font-semibold text-sm">
                      Invoice Value{" "}
                    </span>
                    {formatIndianCurrency(
                      formData.invoiceItems!
                        .map(
                          (item) =>
                            item.itemRate * (item.itemQuantity ?? 1) +
                            (item.itemRate *
                              (item.itemQuantity ?? 1) *
                              (item.gstCode?.gst?.taxPercentage ?? 0)) /
                            100
                        )
                        .reduce((acc, item) => acc + item, 0)
                    )}
                  </h1>
                </div>
              </div>
              <div className="flex space-x-3 items-center">
                <div>
                  <Button onClick={submitOrder}>
                    <FilePlus2 className="w-5 h-5" />
                    Save Invoice
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col space-y-3">
              <div className="w-full flex flex-col md:flex md:flex-row items-end space-x-3 space-y-3 md:space-y-0">
                <div className="w-full md:max-w-80">
                  <Select
                    options={customerData}
                    label="Customer"
                    onChange={(value) => {
                      handleFormInput(value, "customerId");
                    }}
                  />
                </div>
                <div className="w-full md:max-w-80">
                  <Select
                    options={orderData}
                    label="Order"
                    onChange={(value) => {
                      handleFormInput(value, "orderId");
                    }}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="invoiceDate"
                    type="date"
                    label="Invoice Date"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "invoiceDate");
                    }}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="adjustedInvoiceAmount"
                    type="number"
                    label="Adjusted Amount"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "adjustedInvoiceAmount");
                    }}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="reconciledInvoiceAmount"
                    type="number"
                    label="Reconciled Amount"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "reconciledInvoiceAmount");
                    }}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="discountAmount"
                    type="number"
                    label="Discount Amount"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "discountAmount");
                    }}
                  />
                </div>
              </div>
              <div className="w-full flex gap-2">
                <Input
                  name="reconcileComments"
                  type="textArea"
                  label="Reconcile Comments"
                  onChange={(e) => {
                    handleFormInput(e.target.value, "reconcileComments");
                  }}
                />
                <Input
                  name="invoiceComments"
                  type="textArea"
                  label="Comments"
                  onChange={(e) => {
                    handleFormInput(e.target.value, "invoiceComments");
                  }}
                />
              </div>
            </div>
          </div>
          <hr className="border border-border" />
          {/* Invoice Items */}
          <div className="w-full flex flex-col space-y-3">
            <div className="flex flex-col space-y-3">
              <div>
                <h1 className="text-text font-semibold text-lg">
                  Invoice Item Details
                </h1>
              </div>
              <div className="w-full flex space-x-3 items-end">
                <div className="w-fit">
                  <Select
                    options={productData.filter((product) => {
                      return selectedOrderDetails?.orderItems?.find((orderItem) => orderItem.productId === product.value);
                    })}
                    label="Product"
                    onChange={(value) => {
                      selectProductChange(value, "productId");
                    }}
                  />
                </div>
                <div className="w-fit">
                  <Input
                    name="itemQuantity"
                    type="number"
                    label="Quantity"
                    onChange={(e) => {
                      handleInputChange(e, "itemQuantity");
                    }
                    }
                  />
                </div>
                <div className="w-fit">
                  <Input
                    name="itemRate"
                    type="number"
                    label="Rate"
                    onChange={(e) => {
                      handleInputChange(e, "itemRate");
                    }
                    }
                  />
                </div>
                <div className="w-fit">
                  <Select
                    options={gstCodeData}
                    label="GST Code"
                    onChange={(value) => {
                      selectProductChange(value, "gstCodeId");
                    }}
                  />
                </div>
                <div>
                  <Button onClick={addProductToTable}>
                    <Plus className="w-5 h-5" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <PaginatedTable columns={columns} loadingState={loading}>
              {formData.invoiceItems!.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-foreground duration-500 cursor-pointer border-b border-b-border"
                >
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-2">
                      {column === "GST Code" ? (
                        row.gstCode?.code ?? "N/A"
                      ) : column === "GST %" ? (
                        row.gstCode?.gst?.taxPercentage ?? "N/A"
                      ) : column === "Amount" ? (
                        formatIndianCurrency(row.itemRate * (row.itemQuantity ?? 1))
                      ) : column === "Rate" ? (
                        formatIndianCurrency(row.itemRate)
                      ) : column === "GST Amount" ? (
                        formatIndianCurrency(
                          Number(
                            (
                              Math.floor(
                                ((row.itemRate *
                                  (row.itemQuantity ?? 1) *
                                  (row.gstCode?.gst?.taxPercentage ?? 0)) /
                                  100) *
                                100
                              ) / 100
                            ).toFixed(2)
                          )
                        )
                      ) : column === "Total Amount" ? (
                        formatIndianCurrency(
                          Number(
                            (
                              Math.floor(
                                (row.itemRate * (row.itemQuantity ?? 1) +
                                  (row.itemRate *
                                    (row.itemQuantity ?? 1) *
                                    (row.gstCode?.gst?.taxPercentage ?? 0)) /
                                  100) *
                                100
                              ) / 100
                            ).toFixed(2)
                          )
                        )
                      ) : column === "" ? (
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer"
                          onClick={() => removeProductFromTable(row.productId!)}
                        />
                      ) :
                        column === "Quantity" ? (
                          row.itemQuantity
                        ) : column === "Product" ? (
                          productData.find((product) => product.value === row.productId)?.label
                        ) : null
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </PaginatedTable>
          </div>
          <hr className="border border-border" />
          {/* Payment Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="text-text font-semibold text-lg">
                Payment Details
              </h1>
            </div>
            <div className="w-full flex flex-col space-y-3 md:space-y-0 md:flex md:flex-row">
              <div className="w-full flex flex-col space-y-3">
                <div className="w-full flex flex-col space-y-3">
                  <div className="w-full flex gap-2">
                    <div className="w-full md:max-w-96">
                      <Input
                        name="paymentAmount"
                        type="number"
                        label="Payment Amount"
                        onChange={(e) => {
                          handlePaymentDetailsInput(
                            e.target.value,
                            "paymentAmount"
                          );
                        }}
                      />
                    </div>
                    <div className="w-full md:max-w-96">
                      <Input
                        name="paymentDate"
                        type="date"
                        label="Payment Date"
                        onChange={(e) => {
                          handlePaymentDetailsInput(
                            e.target.value,
                            "paymentDate"
                          );
                        }}
                      />
                    </div>
                    <div className="w-full md:max-w-96">
                      <Select
                        options={[
                          {
                            value: PaymentStatus.Pending,
                            label: "Pending",
                          },
                          {
                            value: PaymentStatus.Paid,
                            label: "Paid",
                          },
                          {
                            value: PaymentStatus.PartiallyPaid,
                            label: "Partially Paid",
                          },
                        ]}
                        label="Payment Status"
                        onChange={(value) => {
                          handlePaymentDetailsInput(
                            value,
                            "paymentStatus"
                          );
                        }}
                      />
                    </div>
                    <div className="w-full h-full md:max-w-96">
                      <Input
                        name="paymentMode"
                        type="text"
                        label="Payment Mode"
                        onChange={(e) => {
                          handlePaymentDetailsInput(
                            e.target.value,
                            "paymentMode"
                          );
                        }}
                      />
                    </div>
                    <div className="w-full h-full md:max-w-96">
                      <Input
                        name="paymentReferenceId"
                        type="text"
                        label="Reference #"
                        onChange={(e) => {
                          handlePaymentDetailsInput(
                            e.target.value,
                            "paymentReferenceId"
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full flex gap-2">
                    <div className="w-full h-full">
                      <Input
                        name="paymentDetails"
                        type="textArea"
                        label="Payment Details"
                        onChange={(e) => {
                          handlePaymentDetailsInput(
                            e.target.value,
                            "paymentDetails"
                          );
                        }}
                      />
                    </div>
                    <div className="w-full h-full">
                      <Input
                        name="paymentComments"
                        type="textArea"
                        label="Comments"
                        onChange={(e) => {
                          handlePaymentDetailsInput(
                            e.target.value,
                            "paymentComments"
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Button onClick={addPaymentDetailsToTable}>
                    <Plus className="w-5 h-5" />
                    Add Advance Details
                  </Button>
                </div>
              </div>
            </div>
            <PaginatedTable
              columns={paymentDetailColumns}
              loadingState={false}
            >
              {formData?.payments?.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border"
                >
                  {paymentDetailColumns.map((column) => (
                    <td key={column} className="px-4 py-2">
                      {column === "Advance Date" ? (
                        formatDate(
                          row.paymentDate?.toString() ?? ""
                        )
                      ) : column === "" ? (
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer"
                          onClick={() =>
                            removePaymentDetailsFromTable(row.id!)
                          }
                        />
                      ) :
                        column === "Payment Mode" ? (
                          row.paymentMode
                        ) : column === "Payment Status" ? (
                          row.paymentStatus
                        ) : column === "Payment Date" ? (
                          formatDate(
                            row.paymentDate?.toString() ?? ""
                          )
                        ) : column === "Payment Reference #" ? (
                          row.paymentReferenceId
                        ) : column === "Comments" ? (
                          row.paymentComments
                        ) : column === "Payment Details" ? (
                          row.paymentDetails
                        ) :
                          column === "Amount" ? (
                            formatIndianCurrency(row.paymentAmount)
                          ) :
                            null
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </PaginatedTable>
          </div>
          <div className="w-full flex space-x-3 items-center justify-end">
            <div>
              <Button onClick={submitOrder}>
                <FilePlus2 className="w-5 h-5" />
                Save Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
