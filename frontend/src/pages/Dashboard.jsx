import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { getOrders } from "../services/orderService";
import { LayoutDashboard, ShoppingCart, Package, ListOrdered, UtensilsCrossed } from "lucide-react";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStockItems: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [products, orders] = await Promise.all([
                    getProducts(),
                    getOrders()
                ]);

                const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
                const lowStock = products.filter(p => p.quantity < 5);

                setStats({
                    totalSales,
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    lowStockItems: lowStock
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Revenue</h3>
                    <p className="text-3xl font-black text-gray-900 mt-2">
                        ${stats.totalSales.toFixed(2)}
                    </p>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <ShoppingCart size={80} className="text-primary" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Orders</h3>
                    <p className="text-3xl font-black text-gray-900 mt-2">
                        {stats.totalOrders}
                    </p>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <ListOrdered size={80} className="text-secondary" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Products</h3>
                    <p className="text-3xl font-black text-gray-900 mt-2">
                        {stats.totalProducts}
                    </p>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <UtensilsCrossed size={80} className="text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="text-primary w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">Low Stock Alerts</h2>
                </div>
                {stats.lowStockItems.length === 0 ? (
                    <p className="text-brand-secondary font-medium">All products are well stocked.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-xs text-gray-400 uppercase tracking-widest">
                                    <th className="py-3 font-bold">Product Name</th>
                                    <th className="py-3 font-bold">Current Quantity</th>
                                    <th className="py-3 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.lowStockItems.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 font-bold text-foreground">{item.name}</td>
                                        <td className="py-4 text-primary font-black font-mono-numbers">{item.quantity}</td>
                                        <td className="py-4">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                Critically Low
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
