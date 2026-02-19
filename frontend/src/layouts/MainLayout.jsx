// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 overflow-hidden p-6 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
