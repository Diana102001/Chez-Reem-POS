import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    LogOut,
    UtensilsCrossed,
    Layers
} from "lucide-react";

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const [isExpanded, setIsExpanded] = useState(false);

    const menuItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Order", path: "/order", icon: ShoppingCart },
        { name: "All Orders", path: "/orders", icon: History },
        { name: "Products", path: "/products", icon: Package },
        { name: "Categories", path: "/categories", icon: Layers },
    ];

    return (
        <div
            className={`flex flex-col h-screen bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out z-50 overflow-x-hidden flex-shrink-0 ${isExpanded ? 'w-56' : 'w-16'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center px-3 border-b border-border overflow-hidden">
                <div className="flex items-center gap-3 min-w-max">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <UtensilsCrossed className="text-primary-foreground w-6 h-6" />
                    </div>
                    <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 invisible w-0'}`}>
                        <h1 className="text-base font-bold text-foreground tracking-tight leading-none whitespace-nowrap">Chez Reem</h1>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">POS System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2.5 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden font-sans">
                <p className={`px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'}`}>
                    Main Menu
                </p>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                            `flex items-center rounded-xl transition-all duration-200 group relative ${isExpanded ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5'
                            } ${isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                    >
                        <item.icon className={`flex-shrink-0 ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}`} />
                        <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 invisible w-0'}`}>
                            {item.name}
                        </span>

                        {/* Tooltip for collapsed state */}
                        {!isExpanded && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 invisible group-hover:visible pointer-events-none transition-all whitespace-nowrap z-50 shadow-lg">
                                {item.name}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-3 border-t border-border bg-muted/50">
                <div className={`flex items-center transition-all duration-300 mb-4 ${isExpanded ? 'px-1 gap-3' : 'justify-center'}`}>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-sm flex-shrink-0 shadow-sm">
                        AD
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}>
                        <p className="text-xs font-bold text-foreground truncate">Admin User</p>
                        <p className="text-[10px] text-muted-foreground truncate font-medium">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className={`flex items-center justify-center transition-all duration-300 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive hover:text-white group relative ${isExpanded ? 'w-full py-2.5 px-3 gap-2' : 'w-10 h-10 mx-auto'
                        }`}
                >
                    <LogOut className={`flex-shrink-0 ${isExpanded ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span className={`font-bold text-xs whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 invisible w-0'}`}>
                        Sign Out
                    </span>

                    {!isExpanded && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-destructive text-white text-xs rounded opacity-0 group-hover:opacity-100 invisible group-hover:visible pointer-events-none transition-all whitespace-nowrap z-50 shadow-lg">
                            Sign Out
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
