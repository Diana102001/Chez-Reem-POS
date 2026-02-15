import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";

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
            <h2 className="text-2xl font-bold mb-6">Completed Orders</h2>

            {orders.length === 0 && <p className="text-gray-400">No completed orders yet.</p>}

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 flex justify-between items-start">
                        <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleString()}
                            </p>
                            <p className="text-sm">Payment: {order.payment_method}</p>
                            <div className="mt-2">
                                <p className="text-sm font-medium">Items:</p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {order.items && order.items.map((item, index) => (
                                        <li key={index}>
                                            {item.name} x {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="text-lg font-bold">${order.total}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
