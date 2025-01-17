import { Order, OrderAdvanceDetail } from "@/utils/types/types";
import React, { useEffect } from "react";
import { format } from "date-fns";
import PaginatedTable from "@/components/ui/PaginatedTable";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import { Pencil } from "lucide-react";
import Tooltip from "@/components/ui/ToolTip";
import { useRouter } from "next/router";

const columns = [
  "Product",
  "Quantity",
  "Unit Price",
  "Total Price",
  "GST %",
  "GST Amount",
  "Total Amount",
];

const orderAdvanceDetailsColumns = [
  "Advance Amount",
  "Advance Date",
  "Advance Status",
  "Payment Reference #",
  "Comments",
];

const orderAdvanceDetailsColumnMapping: {
  [key: string]: keyof OrderAdvanceDetail;
} = {
  "Advance Amount": "orderAdvanceAmount",
  "Advance Date": "orderAdvanceDate",
  "Advance Status": "orderAdvanceStatus",
  "Payment Reference #": "orderAdvancePaymentDetails",
  Comments: "orderAdvanceComments",
};

const OrderDetailDrawer = ({
  selectedOrderDetails,
}: {
  selectedOrderDetails: Order;
}) => {
  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy"); // Format to "01-Jan-2024"
  };

  useEffect(() => {
    console.log("Selected Order Details:", selectedOrderDetails);
  }, [selectedOrderDetails]);

  const router = useRouter();

  return (
    <div className="w-full h-full">
      {/* Show order details from selectedOrder */}
      {selectedOrderDetails ? (
        <div className="w-full flex flex-col space-y-3">
          {/* Order Details */}
          <div className="w-full flex flex-col space-y-3">
            <div className="w-full flex justify-between items-center">
              <div className="w-full flex items-center justify-between">
                <div>
                  <h1 className="font-bold text-text text-lg">Order</h1>
                </div>
                <div>
                  <Tooltip tooltip="Edit Order" position="left">
                    <Pencil className="w-5 h-5" onClick={() => {
                      router.push(`/orders/edit-order/${selectedOrderDetails.id}`);
                    }} />
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="w-full rounded-md bg-background p-4 border border-border flex flex-col space-y-3">
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Order Date:
                      <span className="text-text font-bold">
                        {formatDate(
                          selectedOrderDetails.orderDate?.toString() || ""
                        )}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Delivery Date:
                      <span className="text-text font-bold">
                        {formatDate(
                          selectedOrderDetails.orderDeliveryDate?.toString() ||
                          ""
                        )}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Performa Invoice Date:
                      <span className="text-text font-bold">
                        {formatDate(
                          selectedOrderDetails.proformaInvoiceDate?.toString() ||
                          ""
                        )}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Performa Invoice:
                      <span className="text-text font-bold">
                        {selectedOrderDetails.proformaInvoice}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Order Count:
                      <span className="text-text font-bold">
                        {selectedOrderDetails.orderCount}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Order Value:
                      <span className="text-text font-bold">
                        {formatIndianCurrency(selectedOrderDetails.orderValue)}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Order Status:
                      <span className="text-text font-bold">
                        {selectedOrderDetails.orderStatus === "Active" ? (
                          <span className="text-violet-500">
                            {selectedOrderDetails.orderStatus}
                          </span>
                        ) :
                          selectedOrderDetails.orderStatus === "Completed" ? (
                            <span className="text-green-500">
                              {selectedOrderDetails.orderStatus}
                            </span>
                          ) :
                            selectedOrderDetails.orderStatus === "OnHold" ? (
                              <span className="text-blue-500">
                                {selectedOrderDetails.orderStatus}
                              </span>
                            ) :
                              (
                                <span className="text-red-500">
                                  {selectedOrderDetails.orderStatus}
                                </span>
                              )}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Comments:
                      <span className="text-text font-bold">
                        {selectedOrderDetails.orderComments}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Order Advance Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">
                Order Advance Details
              </h1>
            </div>
            {selectedOrderDetails?.orderAdvanceDetails!.length > 0 ? (
              <PaginatedTable
                columns={orderAdvanceDetailsColumns}
                loadingState={false}
              >
                {selectedOrderDetails?.orderAdvanceDetails?.map(
                  (row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border"
                    >
                      {orderAdvanceDetailsColumns.map((column) => (
                        <td key={column} className="px-4 py-2">
                          {column === "Advance Date"
                            ? formatDate(
                              row[
                              orderAdvanceDetailsColumnMapping[
                              column
                              ] as keyof OrderAdvanceDetail
                              ] as string
                            )
                            :
                            column === "Advance Amount" ? formatIndianCurrency(
                              row[
                              orderAdvanceDetailsColumnMapping[
                              column
                              ] as keyof OrderAdvanceDetail
                              ] as number) :
                              column === "Advance Status" ? (
                                row.orderAdvanceStatus === "Paid" ? (
                                  <span className="text-green-500">
                                    {row.orderAdvanceStatus}
                                  </span>
                                ) :
                                  row.orderAdvanceStatus === "Pending" ? (
                                    <span className="text-red-500">
                                      {row.orderAdvanceStatus}
                                    </span>
                                  ) :
                                    (
                                      <span className="text-blue-500">
                                        {row.orderAdvanceStatus}
                                      </span>
                                    )
                              ) :
                                (row[
                                  orderAdvanceDetailsColumnMapping[
                                  column
                                  ] as keyof OrderAdvanceDetail
                                ] as string)}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </PaginatedTable>
            ) : (
              <div className="w-full bg-background border border-border rounded-md p-4">
                <h1 className="text-center text-textAlt font-bold">No advance paid</h1>
              </div>
            )}
          </div>
          {/* Order Items */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">Order Items</h1>
            </div>
            <div className="w-full rounded-md flex flex-col space-y-3">
              <PaginatedTable columns={columns} loadingState={false}>
                {selectedOrderDetails?.orderItems!.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-foreground duration-500 cursor-pointer border-b border-b-border"
                  >
                    {columns.map((column) => (
                      <td key={column} className="px-4 py-2">
                        {column === "Product"
                          ? item.product?.name
                          : column === "Quantity"
                            ? item.quantity
                            : column === "Unit Price"
                              ? formatIndianCurrency(item.unitPrice)
                              : column === "Total Price"
                                ? formatIndianCurrency(
                                  Number(
                                    (
                                      Math.floor(
                                        item.quantity * item.unitPrice * 100
                                      ) / 100
                                    ).toFixed(2)
                                  )
                                )
                                : column === "GST %"
                                  ? `${item.product?.gstCode?.gst?.taxPercentage || 'N/A'} %`
                                  : column === "GST Amount"
                                    ? formatIndianCurrency(
                                      Number(
                                        (
                                          Math.floor(
                                            ((item.quantity *
                                              item.unitPrice *
                                              (item.product?.gstCode?.gst
                                                ?.taxPercentage ?? 0)) /
                                              100) *
                                            100
                                          ) / 100
                                        ).toFixed(2)
                                      )
                                    )
                                    : column === "Total Amount"
                                      ? formatIndianCurrency(item.totalAmount)
                                      : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </PaginatedTable>
            </div>
          </div>
          {/* Customer Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">Customer</h1>
            </div>
            <div className="w-full rounded-md bg-background p-4 border border-border flex flex-col space-y-3">
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Name:
                      <span className="text-text font-bold">
                        {selectedOrderDetails?.customer?.name}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Contact Person:
                      <span className="text-text font-bold">
                        {selectedOrderDetails?.customer?.contactPerson}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Email:
                      <span className="text-text font-bold">
                        {selectedOrderDetails?.customer?.email}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Phone:
                      <span className="text-text font-bold">
                        {selectedOrderDetails?.customer?.phone}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Billing Address:
                      <span className="text-text font-bold">
                        {selectedOrderDetails?.customer?.billingAddress}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Shipping Address:
                      <span className="text-text font-bold">
                        {selectedOrderDetails?.customer?.shippingAddress}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">No order selected</div>
      )}
    </div>
  );
};

export default OrderDetailDrawer;
