"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { KnowledgeDocument } from "../page"

export const createColumns = (
  onDelete: (id: string) => void
): ColumnDef<KnowledgeDocument>[] => [
    {
        id: "select",
        header: ({ table }: { table: any }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }: { row: any }) => (
          <div className="px-1">
            <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
          </div>
        ),
      },
      { id: "name", header: "Name", accessorKey: "name" },
      { id: "description", header: "Description", accessorKey: "description" },
      { id: "anweisungen", header: "Anweisungen", accessorKey: "anweisungen" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const document = row.original;
          return (
            <Button
              onClick={() => onDelete(document.id)}
              variant="destructive"
              size="sm"
            >
              Delete
            </Button>
          );
        },
      },
  ]
