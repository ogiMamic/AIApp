import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  FolderPlus,
  File,
  Globe,
  Upload,
  FolderSync,
  Database,
} from "lucide-react";

export default function DocumentManagement() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMenuOpen = (menu: string) => {
    setOpenMenu(menu);
  };

  const handleMenuClose = () => {
    setOpenMenu(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 my-4">
        <DropdownMenu
          open={openMenu === "add"}
          onOpenChange={(open) =>
            open ? handleMenuOpen("add") : handleMenuClose()
          }
        >
          <DropdownMenuTrigger asChild>
            <Button size="sm" type="button">
              Add <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New Folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <File className="mr-2 h-4 w-4" />
              <span>Blank Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Globe className="mr-2 h-4 w-4" />
              <span>Import a Website</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Documents</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderSync className="mr-2 h-4 w-4" />
              <span>Upload Folders</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openMenu === "upload"}
          onOpenChange={(open) =>
            open ? handleMenuOpen("upload") : handleMenuClose()
          }
        >
          <DropdownMenuTrigger asChild>
            <Button size="sm" type="button" variant="outline" className="bg-gray-50">
              Upload <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Documents</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderSync className="mr-2 h-4 w-4" />
              <span>Upload Folders</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openMenu === "sync"}
          onOpenChange={(open) =>
            open ? handleMenuOpen("sync") : handleMenuClose()
          }
        >
          <DropdownMenuTrigger asChild>
            <Button size="sm" type="button" variant="outline">
              Sync From Integrations <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Database className="mr-2 h-4 w-4" />
              <span>Sync from Database 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Database className="mr-2 h-4 w-4" />
              <span>Sync from Database 2</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
