import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";
import { ListOrdered } from "lucide-react";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("Failed to load orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div className="p-6 text-center">Loading orders...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow h-full overflow-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Completed Orders</h2>

            {orders.length === 0 && <p className="text-gray-400">No completed orders yet.</p>}

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-2xl p-5 flex justify-between items-start hover:shadow-md transition-shadow bg-white">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <ListOrdered size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Order #{order.id}</p>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {order.items && order.items.map((item, index) => (
                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
                                            {item.name} <span className="text-brand-primary">x{item.quantity}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-xl font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 font-mono-numbers">
                            ${order.total}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
