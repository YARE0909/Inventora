import { Invoice, Payment } from "@/utils/types/types";
import React, { useEffect } from "react";
import { format } from "date-fns";
import PaginatedTable from "@/components/ui/PaginatedTable";
import formatIndianCurrency from "@/utils/formatIndianCurrency";

const invoiceItemsColumns = [
  "Product",
  "Quantity",
  "Item Rate",
  "GST Code",
  "GST %",
  "GST Amount",
  "Invoice Amount",
];

const serviceItemsColumns = [
  "Service",
  "Quantity",
  "Item Rate",
  "GST %",
  "GST Code",
  "GST Amount",
  "Invoice Amount",
];

const paymentDetailsColumns = [
  "Payment Amount",
  "Status",
  "Payment Date",
  "Payment Mode",
  "Payment Reference #",
  "Comments",
];

const paymentDetailsColumnMapping: {
  [key: string]: keyof Payment;
} = {
  "Payment Amount": "paymentAmount",
  "Status": "paymentStatus",
  "Payment Date": "paymentDate",
  "Payment Mode": "paymentMode",
  "Payment Reference #": "paymentReferenceId",
  Comments: "paymentComments",
};

const InvoiceDetailDrawer = ({
  selectedInvoiceDetails,
}: {
  selectedInvoiceDetails: Invoice;
}) => {
  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy"); // Format to "01-Jan-2024"
  };

  useEffect(() => {
    console.log("Selected Order Details:", selectedInvoiceDetails);
  }, [selectedInvoiceDetails]);

  return (
    <div className="w-full h-full">
      {/* Show order details from selectedOrder */}
      {selectedInvoiceDetails ? (
        <div className="w-full flex flex-col space-y-3">
          {/* Order Details */}
          <div className="w-full flex flex-col space-y-3">
            <div className="w-full flex justify-between items-center">
              <div>
                <h1 className="font-bold text-text text-lg">Invoice Details</h1>
              </div>
            </div>
            <div className="w-full rounded-md bg-background p-4 border border-border flex flex-col space-y-3">
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Invoice Date:
                      <span className="text-text font-bold">
                        {formatDate(
                          selectedInvoiceDetails.invoiceDate?.toString() || ""
                        )}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Invoice Amount:
                      <span className="text-text font-bold">
                        {formatIndianCurrency(
                          Number(selectedInvoiceDetails?.invoiceAmount?.toString())
                        )}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Adjusted Invoice Amount:
                      <span className="text-text font-bold">
                        {formatIndianCurrency(
                          Number(selectedInvoiceDetails?.adjustedInvoiceAmount?.toString())
                        )}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Reconciled Invoice Amount:
                      <span className="text-text font-bold">
                        {formatIndianCurrency(
                          Number(selectedInvoiceDetails?.reconciledInvoiceAmount?.toString())
                        )}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Discount Amount:
                      <span className="text-text font-bold">
                        {formatIndianCurrency(
                          Number(selectedInvoiceDetails?.discountAmount?.toString())
                        )}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Reconcile Comments:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails.reconcileComments}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Comments:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails.invoiceComments}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Invoice Item Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">Order Items</h1>
            </div>
            <div className="w-full rounded-md flex flex-col space-y-3">
              <PaginatedTable columns={invoiceItemsColumns} loadingState={false}>
                {selectedInvoiceDetails?.invoiceItems!.filter((item) => item.productId).map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-foreground duration-500 cursor-pointer border-b border-b-border"
                  >
                    {invoiceItemsColumns.map((column) => (
                      <td key={column} className="px-4 py-2">
                        {
                          column === "Product" ? (
                            item?.product?.name
                          ) : column === "Quantity" ? (
                            item?.itemQuantity
                          ) : column === "Item Rate" ? (
                            formatIndianCurrency(item?.itemRate)
                          ) : column === "Invoice Amount" ? (
                            formatIndianCurrency(item?.invoiceAmount)
                          ) : column === "GST Code" ? (
                            item?.gstCode?.code
                          ) : column === "GST %" ? (
                            `${item?.gstCode?.gst?.taxPercentage} %`
                          ) : column === "GST Amount" ? (
                            formatIndianCurrency(item?.gstCode?.gst?.taxPercentage)
                          ) : null
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </PaginatedTable>
            </div>
          </div>
          {/* Invoice Service Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">Services</h1>
            </div>
            <div className="w-full rounded-md flex flex-col space-y-3">
              <PaginatedTable columns={serviceItemsColumns} loadingState={false}>
                {selectedInvoiceDetails?.invoiceItems!.filter((item) => item.serviceId).map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-foreground duration-500 cursor-pointer border-b border-b-border"
                  >
                    {invoiceItemsColumns.map((column) => (
                      <td key={column} className="px-4 py-2">
                        {
                          column === "Quantity" ? (
                            item?.itemQuantity
                          ) : column === "Item Rate" ? (
                            formatIndianCurrency(item?.itemRate)
                          ) : column === "Invoice Amount" ? (
                            formatIndianCurrency(item?.invoiceAmount)
                          ) : column === "GST Code" ? (
                            item?.gstCode?.code
                          ) : column === "GST %" ? (
                            `${item?.gstCode?.gst?.taxPercentage} %`
                          ) : column === "GST Amount" ? (
                            formatIndianCurrency(item?.gstCode?.gst?.taxPercentage)
                          ) : item?.service?.name

                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </PaginatedTable>
            </div>
          </div>
          {/* Payment Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">
                Payments
              </h1>
            </div>
            {selectedInvoiceDetails?.invoiceItems!.length > 0 ? (
              <PaginatedTable
                columns={paymentDetailsColumns}
                loadingState={false}
              >
                {selectedInvoiceDetails?.payments?.map(
                  (row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-highlight duration-500 cursor-pointer border-b border-b-border"
                    >
                      {paymentDetailsColumns.map((column) => (
                        <td key={column} className="px-4 py-2">
                          {column === "Payment Date" ? (
                            formatDate(
                              row[paymentDetailsColumnMapping[column] as keyof Payment] as string)
                          ) :
                            column === "Payment Amount" ? (
                              formatIndianCurrency(row[paymentDetailsColumnMapping[column] as keyof Payment] as number))
                              :
                              column === "Status" ? (
                                row.paymentStatus === "Paid" ? (
                                  <span className="text-green-500 font-semibold">
                                    Paid
                                  </span>
                                ) : row.paymentStatus === "PartiallyPaid" ? (
                                  <span className="text-yellow-500 font-semibold">
                                    Partially Paid
                                  </span>
                                ) : (
                                  <span className="text-red-500 font-semibold">
                                    Pending
                                  </span>
                                )
                              ) :
                                (row[paymentDetailsColumnMapping[column] as keyof Payment] as string)}
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
          {/* Customer Details */}
          <div className="w-full flex flex-col space-y-3">
            <div>
              <h1 className="font-bold text-text text-lg">Customer Details</h1>
            </div>
            <div className="w-full rounded-md bg-background p-4 border border-border flex flex-col space-y-3">
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Name:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails?.customer?.name}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Contact Person:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails?.customer?.contactPerson}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Email:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails?.customer?.email}
                      </span>
                    </h1>
                  </div>
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Phone:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails?.customer?.phone}
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col md:flex md:flex-row md:justify-between border-b border-b-border pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Billing Address:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails?.customer?.billingAddress}
                      </span>
                    </h1>
                  </div>
                  {selectedInvoiceDetails?.customer?.customerGST && (
                    <div>
                      <h1 className="font-semibold text-textAlt flex items-center gap-2">
                        Customer GST:
                        <span className="text-text font-bold">
                          {selectedInvoiceDetails?.customer?.customerGST}
                        </span>
                      </h1>
                    </div>
                  )}
                </div>
                <div className="flex flex-col pb-2">
                  <div>
                    <h1 className="font-semibold text-textAlt flex items-center gap-2">
                      Shipping Address:
                      <span className="text-text font-bold">
                        {selectedInvoiceDetails?.customer?.shippingAddress}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">No Invoice selected</div>
      )}
    </div>
  );
};

export default InvoiceDetailDrawer;
