"use client";

import { useState } from "react";
import { Users, Clock, ChevronDown, MoreVertical } from "lucide-react";

const teamMembers = [
  {
    name: "Ognjen Mamic",
    email: "ognjendesigner@gmail.com",
    joinedAt: "6 months ago",
    role: "Admin",
    groups: [],
  },
];

export default function TeamMembersPage() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center text-gray-800">
          <Users className="h-8 w-8 mr-3 text-gray-600" />
          Team Members
        </h1>
        <div className="flex items-center">
          <span className="text-gray-600 mr-4">1 / 5 seats used</span>
          <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition duration-200 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Invite Team Members
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "active"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("active")}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Active Members
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "pending"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <Clock className="h-5 w-5 inline mr-2" />
            Pending Invitations (0)
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm uppercase">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Groups</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-6 py-4">
                  <div className="text-gray-900">{member.name}</div>
                  <div className="text-gray-500 text-sm">{member.email}</div>
                  <div className="text-gray-400 text-xs flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Joined {member.joinedAt}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Admin</option>
                      <option>Member</option>
                      <option>Viewer</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select groups (Optional)</option>
                      <option>Group 1</option>
                      <option>Group 2</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
