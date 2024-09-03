"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  Users,
  Database,
  BarChart2,
  Key,
  ChevronDown,
} from "lucide-react";

const settingsNavigation = [
  {
    name: "Admin",
    icon: Settings,
    children: [
      { name: "General", href: "/settings/admin/general" },
      { name: "Billing", href: "/settings/admin/billing" },
      { name: "Single Sign-On", href: "/settings/admin/sso" },
    ],
  },
  {
    name: "Team & Permissions",
    icon: Users,
    children: [
      { name: "Team Members", href: "/settings/team/members" },
      { name: "Groups", href: "/settings/team/groups" },
    ],
  },
  {
    name: "Knowledge Base",
    icon: Database,
    children: [
      {
        name: "Verification & Review",
        href: "/settings/knowledge/verification",
      },
    ],
  },
  {
    name: "Usage",
    icon: BarChart2,
    children: [
      { name: "Credits & Storage", href: "/settings/usage/credits" },
      { name: "Organization Chats", href: "/settings/usage/chats" },
      { name: "Workflow Runs", href: "/settings/usage/workflows" },
    ],
  },
  {
    name: "API",
    icon: Key,
    children: [{ name: "API Keys", href: "/settings/api/keys" }],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const currentSection = settingsNavigation.find((section) =>
      section.children.some((item) => item.href === pathname)
    );
    if (currentSection) {
      setActiveSection(currentSection.name);
    }
  }, [pathname]);

  return (
    <div className="flex h-full bg-gray-100">
      <div className="flex w-64 flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Organization Settings
            </h2>
          </div>
          <nav
            className="mt-5 flex-1 space-y-1 bg-white px-2"
            aria-label="Sidebar"
          >
            {settingsNavigation.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === item.name ? "" : item.name
                    )
                  }
                  className={cn(
                    item.name === activeSection
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group w-full flex items-center justify-between pl-2 pr-1 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={cn(
                        item.name === activeSection
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150 ease-in-out"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform duration-150 ease-in-out",
                      item.name === activeSection ? "transform rotate-180" : ""
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "space-y-1 overflow-hidden transition-all duration-300 py-1 ease-in-out",
                    item.name === activeSection ? "max-h-96" : "max-h-0"
                  )}
                >
                  {item.children.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={cn(
                        "group flex w-full items-center rounded-md py-2 pl-11 pr-2 text-sm font-medium transition-colors duration-150 ease-in-out",
                        pathname === subItem.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
