"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings, Users, Database, BarChart2, Key } from "lucide-react";

const settingsNavigation = [
  {
    name: "Admin",
    icon: Settings,
    current: true,
    children: [
      { name: "General", href: "/settings/admin/general" },
      { name: "Billing", href: "/settings/admin/billing" },
      { name: "Single Sign-On", href: "/settings/admin/sso" },
    ],
  },
  {
    name: "Team & Permissions",
    icon: Users,
    current: false,
    children: [
      { name: "Team Members", href: "/settings/team/members" },
      { name: "Groups", href: "/settings/team/groups" },
    ],
  },
  {
    name: "Knowledge Base",
    icon: Database,
    current: false,
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
    current: false,
    children: [
      { name: "Credits & Storage", href: "/settings/usage/credits" },
      { name: "Organization Chats", href: "/settings/usage/chats" },
      { name: "Workflow Runs", href: "/settings/usage/workflows" },
    ],
  },
  {
    name: "API",
    icon: Key,
    current: false,
    children: [{ name: "API Keys", href: "/settings/api/keys" }],
  },
];

export default function Component() {
  const [activeSection, setActiveSection] = useState("Admin");

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
                  onClick={() => setActiveSection(item.name)}
                  className={cn(
                    item.name === activeSection
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group w-full flex items-center pl-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon
                    className={cn(
                      item.name === activeSection
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
                {item.name === activeSection && (
                  <div className="space-y-1">
                    {item.children.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="group flex w-full items-center rounded-md py-2 pl-11 pr-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Settings Content
          </h1>
          {/* Ovdje dodajte sadržaj za svaku podstranicu */}
        </main>
      </div>
    </div>
  );
}
