import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await getOrders();
            setOrders(data);
        };

        fetchOrders();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6">Completed Orders</h2>

            {orders.length === 0 && <p className="text-gray-400">No completed orders yet.</p>}

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 flex justify-between">
                        <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                            <p className="text-sm">Payment: {order.payment_method}</p>
                            <ul className="text-sm mt-2">
                                {order.items.map((item, index) => (
                                    <li key={index}>{item.name} x {item.quantity}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-lg font-bold">${order.total}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
