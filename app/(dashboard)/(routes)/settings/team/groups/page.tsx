"use client";

import { useState, useRef, useEffect } from "react";
import {
  Users,
  Plus,
  HelpCircle,
  Settings,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Group {
  id: number;
  name: string;
  members: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "Test", members: 0 },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleCreateGroup = () => {
    setIsDialogOpen(true);
  };

  const handleSaveGroup = () => {
    if (newGroupName) {
      setGroups([
        ...groups,
        { id: groups.length + 1, name: newGroupName, members: 0 },
      ]);
      setNewGroupName("");
      setIsDialogOpen(false);
    }
  };

  const handleRenameGroup = (id: number, newName: string) => {
    if (newName) {
      setGroups(
        groups.map((group) =>
          group.id === id ? { ...group, name: newName } : group
        )
      );
    }
    setOpenDropdown(null);
  };

  const handleDeleteGroup = (id: number) => {
    setGroups(groups.filter((group) => group.id !== id));
    setOpenDropdown(null);
  };

  const toggleDropdown = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    if (openDropdown === id) {
      setOpenDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setOpenDropdown(id);
    }
  };

  const handleConfigurePermissions = (group: Group) => {
    setSelectedGroup(group);
    setPermissionsDialogOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-800 mr-2">Groups</h1>
          <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
        </div>
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No groups yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{group.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.members} Members
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleConfigurePermissions(group)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure Permissions
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => toggleDropdown(e, group.id)}
                      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openDropdown !== null && (
        <div
          ref={dropdownRef}
          className="fixed mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              onClick={() => {
                const newName = prompt(
                  "Enter new name",
                  groups.find((g) => g.id === openDropdown)?.name
                );
                if (newName) handleRenameGroup(openDropdown, newName);
              }}
              className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              <Pencil
                className="mr-3 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Rename Group
            </button>
            <button
              onClick={() => handleDeleteGroup(openDropdown)}
              className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              <Trash2
                className="mr-3 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Delete
            </button>
          </div>
        </div>
      )}

      {isDialogOpen && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsDialogOpen(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Create New Group
                    </h3>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveGroup}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Permissions: {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Edit/Add to Knowledge Base
                  </h3>
                  <p className="text-sm text-gray-500">
                    Allows users to edit and add to the knowledge base (Only
                    where they have access).
                  </p>
                </div>
                <Switch id="knowledge-base-permission" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Edit/Create Assistants
                  </h3>
                  <p className="text-sm text-gray-500">
                    Allows users to edit assistants they have access to and
                    create new assistants.
                  </p>
                </div>
                <Switch id="assistants-permission" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Edit/Create Workflows
                  </h3>
                  <p className="text-sm text-gray-500">
                    Allows users to edit workflows they have access to and
                    create new workflows.
                  </p>
                </div>
                <Switch id="workflows-permission" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
