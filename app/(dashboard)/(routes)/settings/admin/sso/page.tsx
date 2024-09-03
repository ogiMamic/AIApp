"use client";

import { useState } from "react";
import { KeyRound, Globe } from "lucide-react";

export default function SingleSignOnPage() {
  const [ssoEnabled, setSsoEnabled] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center mb-8 text-[#0F3443]">
        <KeyRound className="h-8 w-8 mr-3 text-[#38ef7d]" />
        Single Sign-On
      </h1>

      <div className="space-y-8">
        {/* Upgrade to Enterprise SSO */}
        <div className="bg-[#0F3443] p-6 rounded-lg shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <KeyRound className="h-6 w-6 mr-3 text-[#38ef7d]" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Upgrade to Enterprise SSO
              </h2>
              <p className="text-gray-300 mt-1">
                Use SAML Single Sign-On to require users to sign in using your
                identity provider.
              </p>
            </div>
          </div>
          <button className="bg-[#38ef7d] text-[#0F3443] px-4 py-2 rounded-md hover:bg-[#2fd072] transition duration-200">
            Contact Sales
          </button>
        </div>

        {/* Single Sign-On Toggle */}
        <div className="bg-[#0F3443] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">
            Single Sign-On
          </h2>
          <p className="text-gray-300 mb-4">
            Enable SAML Single Sign-On to require users to sign in using your
            identity provider.
          </p>
          <button
            onClick={() => setSsoEnabled(!ssoEnabled)}
            className={`${
              ssoEnabled
                ? "bg-[#38ef7d] text-[#0F3443]"
                : "bg-gray-300 text-gray-700"
            } px-4 py-2 rounded-md hover:opacity-90 transition duration-200`}
          >
            {ssoEnabled ? "Disable Single Sign-On" : "Enable Single Sign-On"}
          </button>
        </div>

        {/* Verified Domains */}
        <div className="bg-[#0F3443] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">
            Verified Domains
          </h2>
          <p className="text-gray-300 mb-4">
            Verify ownership of one more more domains to enable Single Sign-On.
            Only users with an email address from a verified domain will be able
            to sign in via SSO.
          </p>
          <button className="bg-[#38ef7d] text-[#0F3443] px-4 py-2 rounded-md hover:bg-[#2fd072] transition duration-200 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Add Verified Domain
          </button>
        </div>
      </div>
    </div>
  );
}
