"use client";

import React, { useEffect, useState } from "react";
import { Document, columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Document[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // Add more sample data or fetch from an actual API
  ];
}

export default function DemoPage() {
  const [data, setData] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getData();
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    setData((prevData) => prevData.filter((d) => d.id !== id));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} onDelete={handleDelete} />
    </div>
  );
}
