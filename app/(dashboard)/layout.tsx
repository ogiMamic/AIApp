import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DashboardLayout = async({
    children
}: {
    children: React.ReactNode;
}) => {
    const { userId } = await auth();
    if (!userId) {
        // If the user is not authenticated, redirect to the sign-in page
        redirect('/sign-in')
      }

    return(
        <div className="flex-1 h-full relative">
            <div className="hidden h-full md:flex md:w-72
            md:flex-col md:fixed md:inset-y-0 z-[80]
            bg-gray-900">
                <Sidebar />
            <div>
                Hello Sidebar
            </div>
            </div>
            <main className="md:pl-72">
                <Navbar />
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;