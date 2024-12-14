import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import PaginatedTable from "@/components/ui/PaginatedTable";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { Customer, Order, OrderStatus, Product } from "@/utils/types/types";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectComponent";

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

const columnMapping: {
  [key: string]: string;
} = {
  Product: "name",
  Quantity: "quantity",
  "Unit Price": "price",
  Amount: "amount",
  "GST Code": "gstCode",
  "GST %": "gst",
  "GST Amount": "gstAmount",
  "Total Amount": "totalAmount",
};

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
  });

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
      // add product to data array
      setData([
        ...data,
        {
          ...product,
        },
      ]);
    } catch (error) {
      console.log("Error:", error);
      toast("Something went wrong.", "top-right", "error");
    }
  };

  const removeProductFromTable = (id: string) => {
    const updatedData = data.filter((item) => item.id !== id);
    setData(updatedData);
  };

  const fetchProductData = async (filter?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products${
          filter ? `?filter=${filter}` : ""
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers${
          filter ? `?name=${filter}` : ""
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

  const handleFormInput = (value: string, field: string) => {
    // Check if the field is a date type
    if (
      field === "orderDate" ||
      field === "proformaInvoiceDate" ||
      field === "orderDeliveryDate"
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

    if (data.length === 0) {
      return toast("Please add products to order", "top-right", "warning");
    }
    const orderItems = data.map((item) => ({
      productId: item.id!,
      quantity: item.quantity!,
      unitPrice: item.price,
      totalAmount:
        Math.floor(
          (item.price * (item.quantity ?? 1) +
            (item.price *
              (item.quantity ?? 1) *
              (item.gstCode?.gst?.taxPercentage ?? 0)) /
              100) *
            100
        ) / 100,
    }));

    formData.orderItems = orderItems;
    formData.orderCount = orderItems.length;
    formData.orderValue = orderItems.reduce(
      (acc, item) => acc + item.totalAmount,
      0
    );

    const dataToSend: Order = {
      ...formData,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`,
        dataToSend
      );

      if (response.status === 201) {
        toast("Order created successfully", "top-right", "success");
        setData([]);
        setFormData({
          customerId: "",
          orderDate: new Date(),
          proformaInvoice: "",
          proformaInvoiceDate: new Date(),
          orderValue: 0,
          orderCount: 0,
          orderDeliveryDate: new Date(),
          orderStatus: OrderStatus.Active,
          orderComments: "",
          orderItems: [],
        });
      }
    } catch {
      toast("Something went wrong.", "top-right", "error");
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchCustomerData();
  }, []);

  useEffect(() => {
    console.log({ data });
  }, [data]);

  return (
    <Layout header="Create Order">
      <div className="w-full flex flex-col items-center">
        <div className="w-full md:max-w-screen-lg bg-foreground rounded-md p-4 space-y-3">
          <div className="w-full flex flex-col space-y-3">
            <div className="w-full flex justify-between items-center">
              <div>
                <h1 className="text-text font-semibold text-lg">
                  Order Details
                </h1>
              </div>
              <div className="flex space-x-3 items-center">
                <div>
                  <h1 className="text-text font-medium">
                    Grand Total: &#8377;{" "}
                    {data
                      .map(
                        (item) =>
                          item.price * (item.quantity ?? 1) +
                          (item.price *
                            (item.quantity ?? 1) *
                            (item.gstCode?.gst?.taxPercentage ?? 0)) /
                            100
                      )
                      .reduce((acc, item) => acc + item, 0)}
                  </h1>
                </div>
                <div>
                  <Button onClick={submitOrder}>Create Order</Button>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col space-y-3">
              <div className="w-full flex flex-col md:flex md:flex-row items-end space-x-3 space-y-3 md:space-y-0">
                <div className="w-full md:max-w-80">
                  <Select
                    options={customerData}
                    label="Select Customer"
                    onChange={(value) => {
                      handleFormInput(value, "customerId");
                    }}
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
                  />
                </div>
                <div className="w-full md:max-w-52">
                  <Input
                    name="proformaInvoice"
                    type="text"
                    label="Performa Invoice"
                    onChange={(e) => {
                      handleFormInput(e.target.value, "proformaInvoice");
                    }}
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
                />
              </div>
            </div>
          </div>
          <hr className="border border-border" />
          <div>
            <div>
              <h1 className="text-text font-semibold text-lg">Order Items</h1>
            </div>
            <div className="w-full flex space-x-3 items-end">
              <div className="w-full md:max-w-80">
                <Select
                  options={productData}
                  label="Select Product"
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
            {data.map((row, index) => (
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
                      `₹ ${row.price * (row.quantity ?? 1)}`
                    ) : column === "Unit Price" ? (
                      `₹ ${row.price}`
                    ) : column === "GST Amount" ? (
                      `₹ ${(
                        Math.floor(
                          ((row.price *
                            (row.quantity ?? 1) *
                            (row.gstCode?.gst?.taxPercentage ?? 0)) /
                            100) *
                            100
                        ) / 100
                      ).toFixed(2)}`
                    ) : column === "Total Amount" ? (
                      `₹ ${(
                        Math.floor(
                          (row.price * (row.quantity ?? 1) +
                            (row.price *
                              (row.quantity ?? 1) *
                              (row.gstCode?.gst?.taxPercentage ?? 0)) /
                              100) *
                            100
                        ) / 100
                      ).toFixed(2)}`
                    ) : column === "" ? (
                      <Trash2
                        className="w-5 h-5 text-red-500 cursor-pointer"
                        onClick={() => removeProductFromTable(row.id!)}
                      />
                    ) : (
                      (row[columnMapping[column] as keyof Product] as string)
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
