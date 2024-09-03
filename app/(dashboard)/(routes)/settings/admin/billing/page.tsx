"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  Briefcase,
  Globe,
  UserCog,
  Brain,
  LayoutDashboard,
  RefreshCw,
  PuzzleIcon,
  Workflow,
} from "lucide-react";

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold flex items-center mb-8 text-gray-800">
        <Star className="h-8 w-8 mr-3 text-indigo-600" />
        Choose a Plan
      </h1>

      <div className="flex justify-center items-center mb-8">
        <span
          className={`mr-3 ${
            isAnnual ? "text-gray-500" : "text-gray-900 font-semibold"
          }`}
        >
          Monthly
        </span>
        <button
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isAnnual ? "bg-indigo-600" : "bg-gray-200"
          }`}
          onClick={() => setIsAnnual(!isAnnual)}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isAnnual ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`ml-3 ${
            isAnnual ? "text-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          Annual <span className="text-indigo-600 font-normal">Save 15%!</span>
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Starter Plan */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Starter</h2>
          <p className="text-gray-600 mb-6">Best for small teams</p>
          <div className="text-4xl font-bold mb-6">
            $149{" "}
            <span className="text-xl font-normal text-gray-500">/month</span>
          </div>
          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200">
            Buy Plan
          </button>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center text-gray-600">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              15K Credits / month
            </li>
            <li className="flex items-center text-gray-600">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              50K Knowledge Base Pages
            </li>
            <li className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Up to 5 Seats
            </li>
          </ul>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Enterprise</h2>
          <p className="text-gray-600 mb-6">
            Best for larger companies and custom plans
          </p>
          <div className="text-4xl font-bold mb-6">Custom</div>
          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200">
            Contact Us
          </button>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center text-gray-600">
              <CheckCircle2 className="h-5 w-5 mr-2 text-indigo-600" />
              White Glove Setup and Onboarding
            </li>
            <li className="flex items-center text-gray-600">
              <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
              Advanced Permission Controls
            </li>
            <li className="flex items-center text-gray-600">
              <Globe className="h-5 w-5 mr-2 text-indigo-600" />
              Single Sign-On (SSO) Capability
            </li>
            <li className="flex items-center text-gray-600">
              <Brain className="h-5 w-5 mr-2 text-indigo-600" />
              Personalized AI Training Sessions
            </li>
            <li className="flex items-center text-gray-600">
              <UserCog className="h-5 w-5 mr-2 text-indigo-600" />
              Dedicated AI Implementation Expert
            </li>
            <li className="flex items-center text-gray-600">
              <LayoutDashboard className="h-5 w-5 mr-2 text-indigo-600" />
              Admin Dashboard
            </li>
            <li className="flex items-center text-gray-600">
              <RefreshCw className="h-5 w-5 mr-2 text-indigo-600" />
              Real Time Syncing With External Connectors (Google Drive,
              SharePoint, etc.)
            </li>
            <li className="flex items-center text-gray-600">
              <PuzzleIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Custom Integrations
            </li>
            <li className="flex items-center text-gray-600">
              <Workflow className="h-5 w-5 mr-2 text-indigo-600" />
              Workflow Deployments
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
