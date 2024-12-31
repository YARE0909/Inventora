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
import { Service } from "@prisma/client";

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

const servicesColumns = [
  "Service",
  "Quantity",
  "Rate",
  "Amount",
  "GST Code",
  "GST %",
  "GST Amount",
  "Total Amount",
  "",
]

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
  const router = useRouter();

  const invoiceId = router.query.id as string;

  const [data, setData] = useState<Product[]>([]);
  const [productData, setProductData] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [serviceData, setServiceData] = useState<
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
  const [currentProductDetails, setCurrentProductDetails] = useState<{
    productId: string;
    itemQuantity: number;
    itemRate: number;
    gstCodeId: string;
  }>({
    productId: "",
    itemQuantity: 0,
    itemRate: 0,
    gstCodeId: "",
  });
  const [currentServiceDetails, setCurrentServiceDetails] = useState<{
    serviceId: string;
    itemQuantity: number;
    itemRate: number;
    gstCodeId: string;
    invoiceAmount: number;
  }>({
    serviceId: "",
    itemQuantity: 0,
    itemRate: 0,
    gstCodeId: "",
    invoiceAmount: 0,
  });
  const [loading, setLoading] = useState(false);

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

  const handleAddProduct = async () => {
    try {
      if (currentProductDetails.productId === "") {
        return toast("Please select a product", "top-right", "warning");
      }

      if (currentProductDetails.itemQuantity === 0) {
        return toast("Please enter item quantity", "top-right", "warning");
      }

      if (currentProductDetails.itemRate === 0) {
        return toast("Please enter item rate", "top-right", "warning");
      }

      if (currentProductDetails.gstCodeId === "") {
        return toast("Please select a GST code", "top-right", "warning");
      }

      // get GSTCode details
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode?id=${currentProductDetails.gstCodeId}`
      );

      const gstCode = response.data;

      setFormData({
        ...formData!,
        invoiceItems: [
          ...formData?.invoiceItems || [],
          {
            productId: currentProductDetails.productId,
            itemQuantity: currentProductDetails.itemQuantity,
            itemRate: currentProductDetails.itemRate,
            gstCodeId: currentProductDetails.gstCodeId,
            gstCode,
          },
        ],
      });

      setCurrentProductDetails({
        productId: "",
        itemQuantity: 0,
        itemRate: 0,
        gstCodeId: "",
      });
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  }

  const handleAddService = async () => {
    try {
      if (currentServiceDetails.serviceId === "") {
        return toast("Please select a product", "top-right", "warning");
      }

      if (currentServiceDetails.itemQuantity === 0) {
        return toast("Please enter item quantity", "top-right", "warning");
      }

      if (currentServiceDetails.itemRate === 0) {
        return toast("Please enter item rate", "top-right", "warning");
      }

      if (currentServiceDetails.gstCodeId === "") {
        return toast("Please select a GST code", "top-right", "warning");
      }

      // get GSTCode details
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/services?id=${currentServiceDetails.serviceId}`
      );

      const gstCodeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gstCode?id=${currentServiceDetails.gstCodeId}`
      );

      const gstCode = gstCodeResponse.data;

      const product = response.data;

      setFormData({
        ...formData!,
        invoiceItems: [
          ...formData?.invoiceItems || [],
          {
            serviceId: currentServiceDetails.serviceId,
            itemQuantity: currentServiceDetails.itemQuantity,
            itemRate: currentServiceDetails.itemRate,
            gstCodeId: gstCode.code,
            gstCode,
            product,
          },
        ],
      });

      setCurrentServiceDetails({
        serviceId: "",
        itemQuantity: 0,
        itemRate: 0,
        gstCodeId: "",
        invoiceAmount: 0,
      });
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  }


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

  const removeProductFromTable = (id: string) => {
    const updatedData = formData.invoiceItems!.filter((item) => item.productId !== id);
    setFormData({
      ...formData,
      invoiceItems: updatedData,
    });
  };

  const removeServiceFromTable = (id: string) => {
    const updatedData = formData?.invoiceItems!.filter((item) => item.serviceId !== id);
    setFormData({
      ...formData!,
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

  const fetchInvoiceData = async (id?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices?id=${id}`
      );

      const data = response.data;

      setFormData({
        orderId: data.orderId,
        customerId: data.customerId,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        invoiceAmount: data.invoiceAmount,
        adjustedInvoiceAmount: data.adjustedInvoiceAmount,
        reconciledInvoiceAmount: data.reconciledInvoiceAmount,
        reconcileComments: data.reconcileComments,
        discountAmount: data.discountAmount,
        customerGst: data.customerGst,
        invoiceComments: data.invoiceComments,
        invoiceItems: data.invoiceItems,
        payments: data.payments
      });
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  }

  const fetchServiceData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/services${filter ? `?filter=${filter}` : ""
        }`
      );
      // map over response.data and assign id to value and taxPercentage to label
      const data = response.data.map((service: Service) => ({
        value: service.id,
        label: service.name.toString(),
      }));

      setServiceData(data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
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
    // Update the formData state with the new value
    setFormData({
      ...formData,
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

    const customerData = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers?id=${formData.customerId}`
    );

    const customer: Customer = customerData.data;

    const dataToSend: Invoice = {
      id: invoiceId,
      orderId: formData.orderId,
      customerId: formData.customerId,
      invoiceDate: formData.invoiceDate,
      invoiceAmount: Number(
        formData.invoiceItems!.map((item) =>
          item.itemRate * (item.itemQuantity ?? 1) +
          (item.itemRate * (item.itemQuantity ?? 1) * (item.product?.gstCode?.gst?.taxPercentage ?? 0)) / 100
        )
          .reduce((acc, item) => acc + item, 0)
      ),
      adjustedInvoiceAmount: Number(formData.adjustedInvoiceAmount),
      reconciledInvoiceAmount: Number(formData.reconciledInvoiceAmount),
      reconcileComments: formData.reconcileComments,
      discountAmount: formData.discountAmount,
      customerGst: customer.customerGST,
      invoiceComments: formData.invoiceComments,
      invoiceItems: formData?.invoiceItems!.map((item) => ({
        ...(item.productId ? { productId: item.productId } : { serviceId: item.serviceId }),
        itemQuantity: Number(item.itemQuantity),
        itemRate: Number(item.itemRate),
        gstCodeId: item?.gstCode?.id as string,
        invoiceAmount: Number(
          formData.invoiceItems!.map((item) =>
            item.itemRate * (item.itemQuantity ?? 1) +
            (item.itemRate * (item.itemQuantity ?? 1) * (item?.gstCode?.gst?.taxPercentage ?? 0)) / 100
          )
            .reduce((acc, item) => acc + item, 0)
        )
      })),
      payments: formData?.payments!.length > 0 ? formData.payments!.map((payment) => ({
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        paymentAmount: Number(payment.paymentAmount),
        paymentReferenceId: payment.paymentReferenceId,
        paymentComments: payment.paymentComments,
        paymentStatus: payment.paymentStatus,
      })) : [],
    };

    try {
      const response = await axios.put(
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
    fetchServiceData();
    fetchInvoiceData(invoiceId);
  }, [invoiceId]);

  useEffect(() => {
    console.log({ data });
  }, [data]);

  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">Invoice # {formData.invoiceNumber}</h1>
        </div>
      </div>
    )}>
      <div className="w-full flex flex-col items-center">
        <div className="w-fit bg-foreground border border-border rounded-md p-4 flex flex-col space-y-3">
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
                      Number(
                        formData.invoiceItems!.map((item) =>
                          item.itemRate * (item.itemQuantity ?? 1) +
                          (item.itemRate * (item.itemQuantity ?? 1) * (item.product?.gstCode?.gst?.taxPercentage ?? 0)) / 100
                        )
                          .reduce((acc, item) => acc + item, 0)
                      )
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
                    value={formData.customerId}
                    disabled={true}
                  />
                </div>
                <div className="w-full md:max-w-80">
                  <Select
                    options={orderData}
                    label="Order"
                    value={formData.orderId}
                    disabled={true}
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
                    value={formatDate(formData.invoiceDate?.toString() ?? "")}
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
                    value={formData.discountAmount}
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
                    value={formData.adjustedInvoiceAmount}
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
                    value={formData.reconciledInvoiceAmount}
                  />
                </div>
              </div>
              <div className="w-full flex gap-2">
                <Input
                  name="invoiceComments"
                  type="textArea"
                  label="Comments"
                  onChange={(e) => {
                    handleFormInput(e.target.value, "invoiceComments");
                  }}
                  value={formData.invoiceComments}
                />
                <Input
                  name="reconcileComments"
                  type="textArea"
                  label="Reconcile Comments"
                  onChange={(e) => {
                    handleFormInput(e.target.value, "reconcileComments");
                  }}
                  value={formData.reconcileComments}
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
            </div>
            <div className="w-full flex items-end gap-2">
              <div className="w-full md:max-w-80">
                <Select
                  options={productData}
                  label="Product"
                  onChange={(value) => {
                    const product = productData.find((product) => product.value === value);
                    if (product) {
                      setCurrentProductDetails({
                        ...currentProductDetails,
                        productId: product.value,
                      });
                    }
                  }}
                  value={currentProductDetails.productId}
                />
              </div>
              <div className="w-full md:max-w-52">
                <Input
                  name="itemQuantity"
                  type="number"
                  label="Quantity"
                  onChange={(e) => {
                    setCurrentProductDetails({
                      ...currentProductDetails,
                      itemQuantity: Number(e.target.value),
                    });
                  }}
                  value={currentProductDetails.itemQuantity}
                />
              </div>
              <div className="w-full md:max-w-52">
                <Input
                  name="itemRate"
                  type="number"
                  label="Rate"
                  onChange={(e) => {
                    setCurrentProductDetails({
                      ...currentProductDetails,
                      itemRate: Number(e.target.value),
                    });
                  }}
                  value={currentProductDetails.itemRate}
                />
              </div>
              <div className="w-full md:max-w-52">
                <Select
                  options={gstCodeData}
                  label="GST Code"
                  onChange={(value) => {
                    setCurrentProductDetails({
                      ...currentProductDetails,
                      gstCodeId: value,
                    });
                  }}
                  value={currentProductDetails.gstCodeId}
                />
              </div>
              <div>
                <Button
                  onClick={handleAddProduct}
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </Button>
              </div>
            </div>
            <PaginatedTable columns={columns} loadingState={loading}>
              {formData?.invoiceItems!.filter(item => item.productId !== "" && !item.serviceId).map((row, index) => (
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
                        formatIndianCurrency(row?.itemRate * (row?.itemQuantity ?? 1))
                      ) : column === "Rate" ? (
                        <div className="w-24">
                          <Input
                            name="itemRate"
                            type="number"
                            value={row.itemRate}
                            onChange={(e) => {
                              setFormData({
                                ...formData!,
                                invoiceItems: formData?.invoiceItems?.map((item) => {
                                  if (item.id === row.id) {
                                    item.itemRate = Number(e.target.value);
                                  }
                                  return item;
                                })
                              });
                            }}
                          />
                        </div>
                      ) : column === "GST Amount" ? (
                        formatIndianCurrency(
                          Number(
                            (
                              Math.floor(
                                ((row?.itemRate *
                                  (row?.itemQuantity ?? 1) *
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
                                (row?.itemRate * (row?.itemQuantity ?? 1) +
                                  (row?.itemRate *
                                    (row?.itemQuantity ?? 1) *
                                    (row?.gstCode?.gst?.taxPercentage ?? 0)) /
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
                          <div className="w-16">

                            <Input
                              name="itemQuantity"
                              type="number"
                              value={row?.itemQuantity}
                              onChange={(e) => {
                                setFormData({
                                  ...formData!,
                                  invoiceItems: formData?.invoiceItems?.map((item) => {
                                    if (item.id === row.id) {
                                      item.itemQuantity = Number(e.target.value);
                                    }
                                    return item;
                                  })
                                });
                              }}
                            />
                          </div>
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
          {/* Services */}
          <div className="w-full flex flex-col space-y-3">
            <div className="flex flex-col space-y-3">
              <div>
                <h1 className="text-text font-semibold text-lg">
                  Services
                </h1>
              </div>
            </div>
            <div className="w-full flex items-end gap-2">
              <div className="w-full md:max-w-80">
                <Select
                  options={serviceData}
                  label="Service"
                  onChange={(value) => {
                    setCurrentServiceDetails({
                      ...currentServiceDetails,
                      serviceId: value,
                    });
                  }}
                  value={currentServiceDetails.serviceId}
                />
              </div>
              <div className="w-full md:max-w-52">
                <Input
                  name="itemQuantity"
                  type="number"
                  label="Quantity"
                  onChange={(e) => {
                    setCurrentServiceDetails({
                      ...currentServiceDetails,
                      itemQuantity: Number(e.target.value),
                    });
                  }}
                  value={currentServiceDetails.itemQuantity}
                />
              </div>
              <div className="w-full md:max-w-52">
                <Input
                  name="itemRate"
                  type="number"
                  label="Rate"
                  onChange={(e) => {
                    setCurrentServiceDetails({
                      ...currentServiceDetails,
                      itemRate: Number(e.target.value),
                    });
                  }}
                  value={currentServiceDetails.itemRate}
                />
              </div>
              <div className="w-full md:max-w-52">
                <Select
                  options={gstCodeData}
                  label="GST Code"
                  onChange={(value) => {
                    setCurrentServiceDetails({
                      ...currentServiceDetails,
                      gstCodeId: value,
                    });
                  }}
                  value={currentServiceDetails.gstCodeId}
                />
              </div>
              <div>
                <Button
                  onClick={handleAddService}
                >
                  <Plus className="w-5 h-5" />
                  Add Service
                </Button>
              </div>
            </div>
            <PaginatedTable columns={servicesColumns} loadingState={loading}>
              {formData?.invoiceItems!.filter(item => item.serviceId !== "" && !item.productId).map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-foreground duration-500 cursor-pointer border-b border-b-border"
                >
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-2">
                      {column === "GST Code" ? (
                        row?.gstCode?.code ?? "N/A"
                      ) : column === "GST %" ? (
                        row?.gstCode?.gst?.taxPercentage ?? "N/A"
                      ) : column === "Amount" ? (
                        formatIndianCurrency(row?.itemRate * (row?.itemQuantity ?? 1))
                      ) : column === "Rate" ? (
                        <div className="w-24">
                          <Input
                            name="itemRate"
                            type="number"
                            value={row.itemRate}
                            onChange={(e) => {
                              setFormData({
                                ...formData!,
                                invoiceItems: formData?.invoiceItems?.map((item) => {
                                  if (item.serviceId === row.serviceId) {
                                    item.itemRate = Number(e.target.value);
                                  }
                                  return item;
                                })
                              });
                            }}
                          />
                        </div>
                      ) : column === "GST Amount" ? (
                        formatIndianCurrency(
                          Number(
                            (
                              Math.floor(
                                ((row?.itemRate *
                                  (row?.itemQuantity ?? 1) *
                                  (row.product?.gstCode?.gst?.taxPercentage ?? 0)) /
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
                                (row?.itemRate * (row?.itemQuantity ?? 1) +
                                  (row?.itemRate *
                                    (row?.itemQuantity ?? 1) *
                                    (row.product?.gstCode?.gst?.taxPercentage ?? 0)) /
                                  100) *
                                100
                              ) / 100
                            ).toFixed(2)
                          )
                        )
                      ) : column === "" ? (
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer"
                          onClick={() => removeServiceFromTable(row.serviceId!)}
                        />
                      ) :
                        column === "Quantity" ? (
                          <div className="w-16">
                            <Input
                              name="itemQuantity"
                              type="number"
                              value={row?.itemQuantity}
                              onChange={(e) => {
                                setFormData({
                                  ...formData!,
                                  invoiceItems: formData?.invoiceItems?.map((item) => {
                                    if (item.serviceId === row.serviceId) {
                                      item.itemQuantity = Number(e.target.value);
                                    }
                                    return item;
                                  })
                                });
                              }}
                            />
                          </div>
                        ) : serviceData.find((service) => service.value === row.serviceId)?.label

                      }
                    </td>
                  ))}
                </tr>
              ))}
            </PaginatedTable>
          </div>
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
                  <div className="w-full flex items-end gap-2">
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
                    <div>
                      <Button onClick={addPaymentDetailsToTable}>
                        <Plus className="w-5 h-5" />
                        Add Payment
                      </Button>
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
