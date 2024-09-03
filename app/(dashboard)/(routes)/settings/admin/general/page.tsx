"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

export default function AdminGeneralSettingsPage() {
  const [organizationName, setOrganizationName] = useState("ogi");
  const [organizationDescription, setOrganizationDescription] = useState(
    "UX/UI Design, Software Development, Digital Marketing"
  );
  const [discoverability, setDiscoverability] = useState("invite_only");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center mb-8 text-gray-800">
        <Settings className="h-8 w-8 mr-3 text-indigo-600" />
        General Settings
      </h1>

      <div className="space-y-12">
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Basic</h2>
          <p className="text-sm text-gray-500 mb-6">
            Information about your organization.
          </p>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="org-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="org-name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="org-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Organization Description
              </label>
              <textarea
                id="org-description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                value={organizationDescription}
                onChange={(e) => setOrganizationDescription(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Give an overview of what your business does, to help the AI
                understand your business better. A couple of sentences is ideal.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Organization Discoverability
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Help your teammates find your company when signing up with Cassidy
            for the first time.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="open-org"
                  name="discoverability"
                  type="radio"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 transition duration-150 ease-in-out"
                  value="open"
                  checked={discoverability === "open"}
                  onChange={() => setDiscoverability("open")}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="open-org" className="font-medium text-gray-700">
                  Open Organization
                </label>
                <p className="text-gray-500">
                  Your organization is discoverable and joinable to anyone
                  signing up only with domains you specify.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="admin-approval"
                  name="discoverability"
                  type="radio"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 transition duration-150 ease-in-out"
                  value="admin_approval"
                  checked={discoverability === "admin_approval"}
                  onChange={() => setDiscoverability("admin_approval")}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="admin-approval"
                  className="font-medium text-gray-700"
                >
                  Admin Approval
                </label>
                <p className="text-gray-500">
                  Your organization is discoverable by anyone signing up with
                  domains you specify, but they request to join this
                  organization. You will receive an email notification allowing
                  you to authorize user access.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="invite-only"
                  name="discoverability"
                  type="radio"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 transition duration-150 ease-in-out"
                  value="invite_only"
                  checked={discoverability === "invite_only"}
                  onChange={() => setDiscoverability("invite_only")}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="invite-only"
                  className="font-medium text-gray-700"
                >
                  Invite Only
                </label>
                <p className="text-gray-500">
                  Your organization will not be discoverable. New users must be
                  invited by an administrator.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
