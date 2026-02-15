// src/components/layout/Navbar.jsx
import { useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/":
                return "Dashboard";
            case "/orders":
                return "Orders";
            case "/products":
                return "Products";
            default:
                return "POS System";
        }
    };

    return (
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b">
            {/* Page Title */}
            <h2 className="text-lg font-semibold text-gray-800">
                {getPageTitle()}
            </h2>

            {/* User Section */}
            <div className="flex items-center gap-4">
                <span className="text-gray-600">Admin</span>

                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    A
                </div>
            </div>
        </div>
    );
};

export default Navbar;
