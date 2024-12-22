import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import PaginatedTable from "@/components/ui/PaginatedTable";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import {
  Customer,
  Order,
  OrderAdvanceDetail,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
} from "@/utils/types/types";
import axios from "axios";
import { PackagePlus, Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectComponent";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { formatDateToYYYYMMDD } from "@/utils/dateFormatting";

const columns = [
  "Product",
  "Quantity",
  "Unit Price",
  "Amount",
  "GST Code",
  "GST %",
  "GST Amount",
  "Total Amount",
  "",
];

const orderAdvanceDetailsColumns = [
  "Advance Amount",
  "Advance Date",
  "Advance Status",
  "Payment Reference #",
  "Comments",
  "",
];

const orderAdvanceDetailsColumnMapping: {
  [key: string]: keyof OrderAdvanceDetail;
} = {
  "Advance Amount": "orderAdvanceAmount",
  "Advance Date": "orderAdvanceDate",
  "Advance Status": "orderAdvanceStatus",
  "Payment Reference #": "orderAdvancePaymentDetails",
  Comments: "orderAdvanceComments",
};

const Index = () => {
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
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    quantity: number;
  }>();

  const { toast } = useToast();

  const [formData, setFormData] = useState<Order>({
    customerId: "",
    orderDate: undefined,
    proformaInvoice: "",
    proformaInvoiceDate: undefined,
    orderValue: 0,
    orderCount: 0,
    orderDeliveryDate: undefined,
    orderStatus: OrderStatus.Active,
    orderComments: "",
    orderItems: [],
    orderAdvanceDetails: [],
  });

  const [currentOrderAdvanceDetails, setCurrentOrderAdvanceDetails] = useState<
    OrderAdvanceDetail & {
      id: string;
    }
  >({
    id: "",
    orderAdvanceAmount: 0,
    orderAdvanceDate: undefined,
    orderAdvancePaymentDetails: "",
    orderAdvanceStatus: undefined,
  });

  const router = useRouter();

  const fetchOrderData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders${filter ? `?id=${filter}` : ""
        }`
      );
      setFormData(response.data);
      console.log(response.data);
      setLoading(false);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  }

  const addOrderAdvanceDetailsToTable = () => {
    if (currentOrderAdvanceDetails?.orderAdvanceAmount === 0) {
      return toast("Please enter advance amount", "top-right", "warning");
    }

    if (currentOrderAdvanceDetails?.orderAdvanceDate === undefined) {
      return toast("Please select advance date", "top-right", "warning");
    }

    if (currentOrderAdvanceDetails?.orderAdvancePaymentDetails === "") {
      return toast("Please enter payment details", "top-right", "warning");
    }

    if (currentOrderAdvanceDetails?.orderAdvanceStatus === undefined) {
      return toast("Please select payment status", "top-right", "warning");
    }

    currentOrderAdvanceDetails.id = Math.random().toString();

    setFormData({
      ...formData,
      orderAdvanceDetails: [
        ...formData.orderAdvanceDetails!,
        currentOrderAdvanceDetails,
      ],
    });

    console.log({ formData });
  };

  const addProductToTable = async () => {
    if (selectedProduct?.productId === "") {
      return toast("Please select product", "top-right", "warning");
    }
    if (selectedProduct?.quantity === 0) {
      return toast("Please enter quantity", "top-right", "warning");
    }

    console.log("Selected Product:", selectedProduct);
    // find product in productData array
    try {
      const productResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?id=${selectedProduct?.productId}`
      );

      const product = productResponse.data;
      product.quantity = selectedProduct?.quantity;

      const OrderItem: OrderItem = {
        productId: product.id!,
        quantity: product.quantity!,
        unitPrice: product.price,
        totalAmount:
          Math.floor(
            (product.price * (product.quantity ?? 1) +
              (product.price *
                (product.quantity ?? 1) *
                (product.gstCode?.gst?.taxPercentage ?? 0)) /
              100) *
            100
          ) / 100,
        product
      }

      setFormData({
        ...formData,
        orderItems: [
          ...formData.orderItems!,
          OrderItem
        ],
      });
    } catch (error) {
      console.log("Error:", error);
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const removeProductFromTable = (id: string) => {
    const updatedData = formData.orderItems!.filter((item) => item.id !== id);
    setFormData({
      ...formData,
      orderItems: updatedData,
    });
  };

  const removeOrderAdvanceDetailsFromTable = (id: string) => {
    const updatedData = formData.orderAdvanceDetails?.filter(
      (item) => item.id !== id
    );
    setFormData({
      ...formData,
      orderAdvanceDetails: updatedData,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSelectedProduct({
      ...selectedProduct!,
      quantity: Number(value),
    });
  };

  const handleOrderAdvanceDetailsInput = (
    value: string | number,
    field: string
  ) => {
    if (field === "orderAdvanceDate") {
      // Convert the date value to ISO format
      value = new Date(value).toISOString();
    }

    if (field === "orderAdvanceAmount") {
      value = Number(value);
    }
    setCurrentOrderAdvanceDetails({
      ...currentOrderAdvanceDetails,
      [field]: value,
    });
  };

  const handleFormInput = (value: string, field: string) => {
    // Check if the field is a date type
    if (
      field === "orderDate" ||
      field === "proformaInvoiceDate" ||
      field === "orderDeliveryDate" ||
      field === "orderAdvanceDate"
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

  const selectProductChange = (
    value: string,
    field: "productId" | "quantity"
  ) => {
    setSelectedProduct({
      productId: field === "productId" ? value : "",
      quantity: field === "quantity" ? Number(value) : 0,
    });
  };

  const submitOrder = async () => {
    // check if all fields are filled

    console.log({ formData });

    if (formData.customerId === "") {
      return toast("Please select customer", "top-right", "warning");
    }

    if (formData.orderDate === undefined) {
      return toast("Please select order date", "top-right", "warning");
    }

    if (formData.proformaInvoice === "") {
      return toast("Please enter proforma invoice", "top-right", "warning");
    }

    if (formData.proformaInvoiceDate === undefined) {
      return toast(
        "Please select proforma invoice date",
        "top-right",
        "warning"
      );
    }

    if (formData.orderDeliveryDate === undefined) {
      return toast("Please select delivery date", "top-right", "warning");
    }

    if (formData.orderItems!.length === 0) {
      return toast("Please add products to order", "top-right", "warning");
    }

    formData.orderCount = formData.orderItems!.length;
    formData.orderValue = formData.orderItems!.reduce(
      (acc, item) => acc + item.totalAmount!,
      0
    );

    const dataOrderItemsToSend: OrderItem[] = formData.orderItems!.map((order) => {
      return {
        id: order.id,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        totalAmount: order.totalAmount,
      }
    })

    const dataToSend: Order = {
      id: formData.id,
      orderDate: formData.orderDate,
      proformaInvoice: formData.proformaInvoice,
      proformaInvoiceDate: formData.proformaInvoiceDate,
      orderValue: formData.orderValue,
      orderCount: formData.orderCount,
      orderDeliveryDate: formData.orderDeliveryDate,
      orderStatus: formData.orderStatus,
      orderComments: formData.orderComments,
      orderItems: dataOrderItemsToSend,
    };

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`,
        dataToSend
      );

      if (response.status === 201) {
        toast("Order created successfully", "top-right", "success");
        setFormData({
          customerId: "",
          orderDate: undefined,
          proformaInvoice: "",
          proformaInvoiceDate: undefined,
          orderValue: 0,
          orderCount: 0,
          orderDeliveryDate: undefined,
          orderStatus: OrderStatus.Active,
          orderComments: "",
          orderItems: [],
          orderAdvanceDetails: [],
        });
      }

      setTimeout(() => {
        router.push("/orders");
      }, 1000);
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy"); // Format to "01-Jan-2024"
  };

  useEffect(() => {
    fetchProductData();
    fetchCustomerData();
    fetchOrderData(router.query.id as string);
  }, [router.query.id]);

  useEffect(() => {
    console.log({ formData });
  }, [formData]);

  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">Edit Order #{formData.orderNumber}</h1>
        </div>
      </div>
    )}>
      <div className="w-full flex flex-col items-center">
        <div className="w-fit bg-foreground rounded-md p-4 space-y-3">
          {/* Order Details */}
          <div className="w-full flex flex-col space-y-3">
            <div className="w-full flex justify-between items-end sticky top-0 z-50 bg-foreground border-b-2 border-b-border pb-3">
              <div className="flex flex-col space-y-3 mt-2">
                <h1 className="text-text font-semibold text-lg">
                  Order Details
                </h1>
                <div>
                  <h1 className="text-lg text-text font-semibold">
                    <span className="text-textAlt font-semibold text-sm">
                      Order Value{" "}
                    </span>
                    {
                      formData.orderItems?.reduce(
                        (acc, item) => acc + item.totalAmount,
                        0
                      ) || 0

                    }
                  </h1>
                </div>
              </div>
              <div className="flex space-x-3 items-center">
                <div>
                  <Button onClick={submitOrder}>
                    <PackagePlus className="w-5 h-5" />
                    Save Order
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
                    value={formData.customerId}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="orderDate"
                    type="date"
                    label="Order Date"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "orderDate");
                    }}
                    value={formatDateToYYYYMMDD((formData.orderDate ? formData.orderDate : "").toString())}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="proformaInvoice"
                    type="text"
                    label="Performa Invoice/PO #"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "proformaInvoice");
                    }}
                    value={formData.proformaInvoice}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="proformaInvoiceDate"
                    type="date"
                    label="Performa Invoice Date"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "proformaInvoiceDate");
                    }}
                    value={formatDateToYYYYMMDD((formData.proformaInvoiceDate ? formData.proformaInvoiceDate : "").toString())}
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="orderDeliveryDate"
                    type="date"
                    label="Delivery Date"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "orderDeliveryDate");
                    }}
                    value={formatDateToYYYYMMDD((formData.orderDeliveryDate ? formData.orderDeliveryDate : "").toString())}
                  />
                </div>
              </div>
              <div className="w-full md:max-w-96">
                <Input
                  name="orderComments"
                  type="textArea"
                  label="Comments"
                  onChange={(e) => {
                    handleFormInput(e.target.value, "orderComments");
                  }}
                  value={formData.orderComments}
                />
              </div>
            </div>
          </div>
          <hr className="border border-border" />
          {/* Order Advance Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="text-text font-semibold text-lg">
                Order Advance Details
              </h1>
            </div>
            <div className="w-full flex flex-col space-y-3 md:space-y-0 md:flex md:flex-row">
              <div className="w-full flex flex-col space-y-3">
                <div className="w-full flex flex-col md:flex md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <div className="w-full md:max-w-96">
                    <Input
                      name="orderAdvanceAmount"
                      type="number"
                      label="Order Amount"
                      onChange={(e) => {
                        handleOrderAdvanceDetailsInput(
                          e.target.value,
                          "orderAdvanceAmount"
                        );
                      }}
                    />
                  </div>
                  <div className="w-full md:max-w-96">
                    <Input
                      name="orderAdvanceDate"
                      type="date"
                      label="Advance Date"
                      onChange={(e) => {
                        handleOrderAdvanceDetailsInput(
                          e.target.value,
                          "orderAdvanceDate"
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
                      label="Advance Status"
                      onChange={(value) => {
                        handleOrderAdvanceDetailsInput(
                          value,
                          "orderAdvanceStatus"
                        );
                      }}
                    />
                  </div>
                  <div className="w-full h-full md:max-w-96">
                    <Input
                      name="orderAdvancePaymentDetails"
                      type="text"
                      label="Payment Reference #"
                      onChange={(e) => {
                        handleOrderAdvanceDetailsInput(
                          e.target.value,
                          "orderAdvancePaymentDetails"
                        );
                      }}
                    />
                  </div>
                  <div className="w-full h-full md:max-w-96">
                    <Input
                      name="orderAdvanceComments"
                      type="text"
                      label="Comments"
                      onChange={(e) => {
                        handleOrderAdvanceDetailsInput(
                          e.target.value,
                          "orderAdvanceComments"
                        );
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Button onClick={addOrderAdvanceDetailsToTable}>
                    <Plus className="w-5 h-5" />
                    Add Advance Details
                  </Button>
                </div>
              </div>
            </div>
            <PaginatedTable
              columns={orderAdvanceDetailsColumns}
              loadingState={false}
            >
              {formData?.orderAdvanceDetails?.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border"
                >
                  {orderAdvanceDetailsColumns.map((column) => (
                    <td key={column} className="px-4 py-2">
                      {column === "Advance Date" ? (
                        formatDate(
                          row[
                          orderAdvanceDetailsColumnMapping[
                          column
                          ] as keyof OrderAdvanceDetail
                          ] as string
                        )
                      ) : column === "" ? (
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer"
                          onClick={() =>
                            removeOrderAdvanceDetailsFromTable(row.id!)
                          }
                        />
                      ) : (
                        (row[
                          orderAdvanceDetailsColumnMapping[
                          column
                          ] as keyof OrderAdvanceDetail
                        ] as string)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </PaginatedTable>
          </div>
          <hr className="border border-border" />
          {/* Order Items */}
          <div className="flex flex-col space-y-3">
            <div>
              <h1 className="text-text font-semibold text-lg">
                Order Item Details
              </h1>
            </div>
            <div className="w-full flex space-x-3 items-end">
              <div className="w-full md:max-w-80">
                <Select
                  options={productData}
                  label="Product"
                  onChange={(value) => {
                    selectProductChange(value, "productId");
                  }}
                />
              </div>
              <div className="w-fit">
                <Input
                  name="quantity"
                  type="number"
                  label="Quantity"
                  onChange={handleInputChange}
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
            {formData?.orderItems?.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-foreground duration-500 cursor-pointer border-b border-b-border"
              >
                {columns.map((column) => (
                  <td key={column} className="px-4 py-2">
                    {column === "GST Code" ? (
                      row.product?.gstCode?.code ?? "N/A"
                    ) : column === "GST %" ? (
                      row.product?.gstCode?.gst?.taxPercentage ?? "N/A"
                    ) : column === "Amount" ? (
                      formatIndianCurrency(row.unitPrice! * (row.quantity ?? 1))
                    ) : column === "Unit Price" ? (
                      formatIndianCurrency(row.unitPrice!)
                    ) : column === "GST Amount" ? (
                      formatIndianCurrency(
                        Number(
                          (
                            Math.floor(
                              ((row.unitPrice! *
                                (row.quantity ?? 1) *
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
                              (row.unitPrice! * (row.quantity ?? 1) +
                                (row.unitPrice! *
                                  (row.quantity ?? 1) *
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
                        onClick={() => removeProductFromTable(row.id!)}
                      />
                    ) :
                      column === "Quantity" ? (
                        row.quantity
                      ) :
                        (
                          row.product?.name
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </PaginatedTable>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
