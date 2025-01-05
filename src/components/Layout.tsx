import React from "react";
import {
  Menu,
  ArrowLeft,
  LayoutDashboard,
  ShoppingCart,
  UsersRound,
  Percent,
  ArrowDownAZ,
  Package,
  Container,
  ReceiptIndianRupee,
  FilePlus2,
  Forklift,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggler from "./ThemeToggler";
import Image from "next/image";

const sideBarLinks = [
  {
    category: "DASHBOARD",
    links: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/",
      },
    ],
  },
  {
    category: "ORDERS",
    links: [
      {
        name: "Orders",
        icon: <ShoppingCart className="w-5 h-5" />,
        href: "/orders",
      },
      {
        name: "New Order",
        icon: <Container className="w-5 h-5" />,
        href: "/orders/create-order",
      },
    ],
  },
  {
    category: "INVOICES",
    links: [
      {
        name: "Invoices",
        icon: <ReceiptIndianRupee className="w-5 h-5" />,
        href: "/invoices",
      },
      {
        name: "New Invoice",
        icon: <FilePlus2 className="w-5 h-5" />,
        href: "/invoices/create-invoice",
      },
    ],
  },
  {
    category: "CUSTOMERS",
    links: [
      {
        name: "Customers",
        icon: <UsersRound className="w-5 h-5" />,
        href: "/customers",
      },
    ],
  },
  {
    category: "GST & GST CODES",
    links: [
      {
        name: "GST",
        icon: <Percent className="w-5 h-5" />,
        href: "/gst",
      },
      {
        name: "GST Codes",
        icon: <ArrowDownAZ className="w-5 h-5" />,
        href: "/gstCodes",
      },
    ],
  },
  {
    category: "PRODUCTS",
    links: [
      {
        name: "Products",
        icon: <Package className="w-5 h-5" />,
        href: "/products",
      },
    ],
  },
  {
    category: "SERVICES",
    links: [
      {
        name: "Services",
        icon: <Forklift className="w-5 h-5" />,
        href: "/services",
      },
    ],
  },
];

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}) => {
  const router = useRouter();

  return (
    <div
      className={`w-3/4 md:w-1/4 lg:w-1/6 h-screen bg-foreground p-4 flex flex-col justify-between gap-4 fixed top-0 bottom-0 border-r-2 border-border transition-transform duration-300 z-10 lg:z-0 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      lg:translate-x-0`}
    >
      <div className="flex flex-col space-y-3">
        <div className="w-full flex flex-col border-b-2 border-b-border pb-2">
          <div className="w-full flex gap-2 items-center justify-between">
            <div className="flex items-center justify-center gap-2 p-1">
              <Image
                src={"/logo.svg"}
                alt="Logo"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
            <button
              className="lg:hidden"
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Sidebar Content */}
        <div className="w-full flex flex-col gap-5">
          {sideBarLinks.map((category) => (
            <div key={category.category}>
              <h1 className="text-xs font-extrabold text-textAlt pl-1">
                {category.category}
              </h1>
              {category.links.map((link) => (
                <div key={link.name} className="flex flex-col">
                  <Link
                    href={link.href}
                    className={`text-sm font-semibold p-1 pl-2 mt-[2px] rounded-md cursor-pointer duration-500 flex items-center gap-1 ${router.pathname === link.href
                      ? "bg-highlight border-2 border-border"
                      : "border-2 border-transparent hover:bg-highlight hover:border-highlight"
                      }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header = ({
  onMenuClick,
  children,
}: {
  onMenuClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full h-14 border-b-2 border-b-border p-4 z-10 bg-foreground flex justify-between items-center gap-5 lg:gap-4">
      <div className="w-full flex items-center gap-1">
        <button
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        {children}
      </div>
      <div>
        <ThemeToggler />
      </div>
    </div>
  );
};

const Layout = ({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="w-full min-h-screen h-full bg-background flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} businessName="ZARAVA STUDIOS" />

      {/* Main Content */}
      <div className="w-full h-screen lg:w-5/6 ml-auto bg-background flex flex-col relative z-0 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)}>{header}</Header>

        {/* Body */}
        <div className="w-full h-full overflow-x-hidden overflow-auto p-4 relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
