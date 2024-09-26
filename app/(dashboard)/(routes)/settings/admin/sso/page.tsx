// "use client";

// import { useState } from "react";
// import { KeyRound, Globe } from "lucide-react";

// export default function SingleSignOnPage() {
//   const [ssoEnabled, setSsoEnabled] = useState(false);

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <h1 className="text-3xl font-bold flex items-center mb-8 text-[#0F3443]">
//         <KeyRound className="h-8 w-8 mr-3 text-[#38ef7d]" />
//         Single Sign-On
//       </h1>

//       <div className="space-y-8">
//         {/* Upgrade to Enterprise SSO */}
//         <div className="bg-[#0F3443] p-6 rounded-lg shadow-md flex justify-between items-center">
//           <div className="flex items-center">
//             <KeyRound className="h-6 w-6 mr-3 text-[#38ef7d]" />
//             <div>
//               <h2 className="text-xl font-semibold text-white">
//                 Upgrade to Enterprise SSO
//               </h2>
//               <p className="text-gray-300 mt-1">
//                 Use SAML Single Sign-On to require users to sign in using your
//                 identity provider.
//               </p>
//             </div>
//           </div>
//           <button className="bg-[#38ef7d] text-[#0F3443] px-4 py-2 rounded-md hover:bg-[#2fd072] transition duration-200">
//             Contact Sales
//           </button>
//         </div>

//         {/* Single Sign-On Toggle */}
//         <div className="bg-[#0F3443] p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold text-white mb-2">
//             Single Sign-On
//           </h2>
//           <p className="text-gray-300 mb-4">
//             Enable SAML Single Sign-On to require users to sign in using your
//             identity provider.
//           </p>
//           <button
//             onClick={() => setSsoEnabled(!ssoEnabled)}
//             className={`${
//               ssoEnabled
//                 ? "bg-[#38ef7d] text-[#0F3443]"
//                 : "bg-gray-300 text-gray-700"
//             } px-4 py-2 rounded-md hover:opacity-90 transition duration-200`}
//           >
//             {ssoEnabled ? "Disable Single Sign-On" : "Enable Single Sign-On"}
//           </button>
//         </div>

//         {/* Verified Domains */}
//         <div className="bg-[#0F3443] p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold text-white mb-2">
//             Verified Domains
//           </h2>
//           <p className="text-gray-300 mb-4">
//             Verify ownership of one more more domains to enable Single Sign-On.
//             Only users with an email address from a verified domain will be able
//             to sign in via SSO.
//           </p>
//           <button className="bg-[#38ef7d] text-[#0F3443] px-4 py-2 rounded-md hover:bg-[#2fd072] transition duration-200 flex items-center">
//             <Globe className="h-5 w-5 mr-2" />
//             Add Verified Domain
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";

interface MenuItem {
  icon: keyof typeof Icons;
  label: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: "Layout",
    label: "Layout",
    subItems: [
      { icon: "FileText", label: "Pages" },
      {
        icon: "Navigation",
        label: "Navigation",
        subItems: [
          { icon: "Layout", label: "Overview" },
          { icon: "Navigation", label: "Default" },
        ],
      },
      { icon: "FileText", label: "Templates" },
      { icon: "Calendar", label: "Events" },
    ],
  },
  {
    icon: "Database",
    label: "Data",
    subItems: [
      {
        icon: "Table",
        label: "Data Model",
        subItems: [
          { icon: "Layout", label: "Overview" },
          {
            icon: "Database",
            label: "Default",
            subItems: [
              { icon: "Database", label: "Datasources" },
              {
                icon: "Layers",
                label: "Datastructures",
                subItems: [
                  { icon: "Box", label: "Dataobjects" },
                  { icon: "List", label: "Enums" },
                  {
                    icon: "Table",
                    label: "Relational",
                    subItems: [
                      { icon: "Table", label: "Container Tables" },
                      { icon: "LayoutDashboard", label: "Container Views" },
                      { icon: "FileSpreadsheet", label: "Container Excel" },
                      { icon: "FileCsv", label: "Container CSV" },
                      { icon: "Calendar", label: "Container Datatime" },
                      {
                        icon: "TableProperties",
                        label: "Container Enumtables",
                      },
                      { icon: "Rss", label: "Container Web-Feed" },
                    ],
                  },
                  {
                    icon: "Box",
                    label: "Object",
                    subItems: [
                      { icon: "FileJson", label: "Container Json" },
                      { icon: "FileCode", label: "Container XML" },
                      { icon: "BoxSelect", label: "Container Object View" },
                    ],
                  },
                  {
                    icon: "Cube",
                    label: "Multidimensional",
                    subItems: [
                      { icon: "Box", label: "Container Dimension" },
                      { icon: "Cube", label: "Container Cube" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        icon: "GitBranch",
        label: "Workflow",
        subItems: [
          { icon: "Users", label: "Client" },
          { icon: "Cog", label: "Service" },
          { icon: "Wand2", label: "Wizard" },
        ],
      },
      { icon: "Clock", label: "Scheduler" },
      { icon: "Image", label: "Mediasources" },
      {
        icon: "Link",
        label: "Connector",
        subItems: [{ icon: "Layout", label: "Overview" }],
      },
      { icon: "Variable", label: "Global Variables" },
      { icon: "Code", label: "Custom REST" },
      { icon: "FileOutput", label: "Output Templates" },
      { icon: "Library", label: "ScriptLibrary" },
      { icon: "Bot", label: "Agent" },
      { icon: "Hash", label: "Number Ranges" },
    ],
  },
  {
    icon: "Users",
    label: "User Management",
    subItems: [
      { icon: "User", label: "User" },
      { icon: "Users", label: "Groups" },
      {
        icon: "Shield",
        label: "Roles",
        subItems: [
          { icon: "Layout", label: "Overview" },
          { icon: "UserCheck", label: "Initial Admin" },
          { icon: "User", label: "User" },
        ],
      },
      { icon: "Key", label: "Provider" },
    ],
  },
  {
    icon: "Palette",
    label: "Corporate Identity",
    subItems: [
      { icon: "Brush", label: "Themes" },
      { icon: "Icons", label: "Icons" },
      { icon: "Type", label: "Fonts" },
      { icon: "Variable", label: "CSS Variable" },
      { icon: "FileCode", label: "CSS Classes" },
      { icon: "Sliders", label: "Control Styles" },
      { icon: "PieChart", label: "Chart Palette" },
      { icon: "AppWindow", label: "App Builder" },
      { icon: "Tags", label: "Meta Tags" },
    ],
  },
  {
    icon: "Settings",
    label: "Settings",
    subItems: [
      { icon: "Cog", label: "General" },
      { icon: "ArrowRightCircle", label: "System Pass Through" },
      { icon: "Mail", label: "Email" },
      { icon: "Globe", label: "Languages" },
      { icon: "Languages", label: "Translations" },
      { icon: "Clock", label: "Dynamic Time" },
    ],
  },
  {
    icon: "HelpCircle",
    label: "About",
    subItems: [
      { icon: "ScrollText", label: "Logs" },
      {
        icon: "Activity",
        label: "Jobs",
        subItems: [
          { icon: "ScrollText", label: "Logs" },
          { icon: "ListOrdered", label: "Queue" },
        ],
      },
      {
        icon: "Layout",
        label: "Overview",
        subItems: [
          { icon: "Package", label: "Capsule Overview" },
          { icon: "GitBranch", label: "ChangeLog Overview" },
          { icon: "GitCommit", label: "Versioning Overview" },
        ],
      },
      { icon: "Info", label: "Info" },
    ],
  },
];

const MenuItem: React.FC<{ item: MenuItem; depth?: number }> = ({
  item,
  depth = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const IconComponent = Icons[item.icon];

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200
                    ${
                      depth === 0
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    }
                    ${isOpen ? "bg-gray-700" : ""}`}
        style={{ paddingLeft: `${(depth + 1) * 1}rem` }}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">{item.label}</span>
        {hasSubItems &&
          (isOpen ? (
            <Icons.ChevronDown className="w-4 h-4" />
          ) : (
            <Icons.ChevronRight className="w-4 h-4" />
          ))}
      </button>
      {isOpen && hasSubItems && (
        <div className="ml-4">
          {item.subItems!.map((subItem, index) => (
            <MenuItem key={index} item={subItem} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdvancedSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <Icons.Menu className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-5">
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </nav>
      </div>
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
        <p className="mt-4 text-gray-600">
          Select an option from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
