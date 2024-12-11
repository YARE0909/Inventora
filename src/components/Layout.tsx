import React from "react";
import {
  Menu,
  ArrowLeft,
  LayoutDashboard,
  BringToFront,
  ShoppingCart,
  PackagePlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggler from "./ThemeToggler";

const sideBarLinks = [
  {
    category: "DASHBOARD",
    links: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: "/",
      },
    ],
  },
  {
    category: "ORDERS",
    links: [
      {
        name: "Orders",
        icon: <ShoppingCart className="w-4 h-4" />,
        href: "/orders",
      },
      {
        name: "Create Order",
        icon: <PackagePlus className="w-4 h-4" />,
        href: "/create-order",
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
}) => {
  const router = useRouter();

  return (
    <div
      className={`w-3/4 md:w-1/4 lg:w-1/6 h-screen bg-foreground p-4 flex flex-col gap-7 fixed top-0 bottom-0 border-r border-border transition-transform duration-300 z-20 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      lg:translate-x-0`}
    >
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <BringToFront className="h-5 w-5" />
          <h1 className="text-xl font-extrabold">Inventora</h1>
        </div>
        <button
          className="lg:hidden"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>
      {/* Sidebar Content */}
      <div className="w-full flex flex-col gap-5">
        {sideBarLinks.map((category) => (
          <div key={category.category}>
            <h1 className="text-xs font-bold text-textAlt pl-1">
              {category.category}
            </h1>
            {category.links.map((link) => (
              <div key={link.name} className="flex flex-col">
                <Link
                  href={link.href}
                  className={`text-sm p-1 pl-2 mt-[2px] rounded-md cursor-pointer duration-500 flex items-center gap-1 ${
                    router.pathname === link.href
                      ? "bg-highlight border border-border"
                      : "hover:bg-highlight border border-transparent hover:border hover:border-border"
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
    <div className="w-full h-14 border-b border-b-border p-4 z-10 bg-background flex justify-between items-center gap-5 lg:gap-0">
      <div className="flex items-center gap-1">
        <button
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-xl">{children}</h1>
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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
