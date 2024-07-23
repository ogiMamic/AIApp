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
    // ...
  ];
}

export default async function DemoPage() {
  const [data, setData] = useState<Document[]>([]);

  React.useEffect(() => {
    getData().then((data) => setData(data));
  }, []);

  const handleDelete = (id: string) => {
    setData((prevData) => prevData.filter((d) => d.id !== id));
  };

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} onDelete={handleDelete} />
    </div>
  );
}
