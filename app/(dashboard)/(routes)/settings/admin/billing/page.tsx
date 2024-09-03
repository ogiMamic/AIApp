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
      <h1 className="text-3xl font-bold flex items-center mb-8 text-[#0F3443]">
        <Star className="h-8 w-8 mr-3 text-[#38ef7d]" />
        Choose a Plan
      </h1>

      <div className="flex justify-center items-center mb-8">
        <span
          className={`mr-3 ${
            isAnnual ? "text-gray-400" : "text-[#0F3443] font-semibold"
          }`}
        >
          Monthly
        </span>
        <button
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#38ef7d] focus:ring-offset-2 ${
            isAnnual ? "bg-[#38ef7d]" : "bg-gray-200"
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
            isAnnual ? "text-[#0F3443] font-semibold" : "text-[#0F3443]"
          }`}
        >
          Annual{" "}
          <span className="text-[#0F3443] ml-4 font-normal">Save 15%!</span>
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Starter Plan */}
        <div className="bg-[#0F3443] p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-white">Starter</h2>
          <p className="text-gray-300 mb-6">Best for small teams</p>
          <div className="text-4xl font-bold mb-6 text-white">
            $149{" "}
            <span className="text-xl font-normal text-gray-300">/month</span>
          </div>
          <button className="w-full bg-[#38ef7d] text-[#0F3443] py-2 px-4 rounded-md hover:bg-[#2fd072] transition duration-200">
            Buy Plan
          </button>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center text-gray-300">
              <MessageSquare className="h-5 w-5 mr-2 text-[#38ef7d]" />
              15K Credits / month
            </li>
            <li className="flex items-center text-gray-300">
              <FileText className="h-5 w-5 mr-2 text-[#38ef7d]" />
              50K Knowledge Base Pages
            </li>
            <li className="flex items-center text-gray-300">
              <Users className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Up to 5 Seats
            </li>
          </ul>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-[#0F3443] p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-white">Enterprise</h2>
          <p className="text-gray-300 mb-6">
            Best for larger companies and custom plans
          </p>
          <div className="text-4xl font-bold mb-6 text-white">Custom</div>
          <button className="w-full bg-[#38ef7d] text-[#0F3443] py-2 px-4 rounded-md hover:bg-[#2fd072] transition duration-200">
            Contact Us
          </button>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center text-gray-300">
              <CheckCircle2 className="h-5 w-5 mr-2 text-[#38ef7d]" />
              White Glove Setup and Onboarding
            </li>
            <li className="flex items-center text-gray-300">
              <Briefcase className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Advanced Permission Controls
            </li>
            <li className="flex items-center text-gray-300">
              <Globe className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Single Sign-On (SSO) Capability
            </li>
            <li className="flex items-center text-gray-300">
              <Brain className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Personalized AI Training Sessions
            </li>
            <li className="flex items-center text-gray-300">
              <UserCog className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Dedicated AI Implementation Expert
            </li>
            <li className="flex items-center text-gray-300">
              <LayoutDashboard className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Admin Dashboard
            </li>
            <li className="flex items-center text-gray-300">
              <RefreshCw className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Real Time Syncing With External Connectors (Google Drive,
              SharePoint, etc.)
            </li>
            <li className="flex items-center text-gray-300">
              <PuzzleIcon className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Custom Integrations
            </li>
            <li className="flex items-center text-gray-300">
              <Workflow className="h-5 w-5 mr-2 text-[#38ef7d]" />
              Workflow Deployments
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
