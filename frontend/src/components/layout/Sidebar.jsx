// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const menuItems = [
        { name: "Dashboard", path: "/" },
        { name: "Orders", path: "/orders" },
        { name: "Products", path: "/products" },
        { name: "New Order", path: "/order" },
    ];

    return (
        <div className="w-64 bg-white shadow-md flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b">
                <h1 className="text-xl font-bold text-gray-800">
                    🍽 POS System
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg transition ${isActive
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
                <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
