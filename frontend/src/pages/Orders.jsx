import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { ListOrdered, CheckCircle2, Clock, XCircle, ArrowRightCircle, Edit2, CreditCard } from "lucide-react";
import PaymentModal from "../components/payment/PaymentModal";
import Loader from "../components/common/Loader";

const Orders = () => {
    const navigate = useNavigate();
    const { loadCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderForPayment, setOrderForPayment] = useState(null);
    const [filter, setFilter] = useState('active');

    const STATUS_MAP = {
        in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-600", icon: Clock },
        ready: { label: "Ready", color: "bg-yellow-100 text-yellow-600", icon: ArrowRightCircle },
        paid: { label: "Paid", color: "bg-green-100 text-green-600", icon: CheckCircle2 },
        cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600", icon: XCircle },
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return order.status === 'in_progress' || order.status === 'ready';
        return order.status === filter;
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = (order) => {
        // Load items with names into cart
        const itemsWithNames = order.items.map(item => ({
            ...item,
            name: item.product_name || "Product" // We might need the backend to return names
        }));
        loadCart(itemsWithNames);
        setOrderForPayment(order);
        setIsPaymentOpen(true);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status.");
        }
    };

    if (loading) return <Loader text="Retrieving Orders" />;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col h-screen overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Orders</h2>
                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                    {[
                        { id: 'active', label: 'Active' },
                        { id: 'paid', label: 'Paid' },
                        { id: 'cancelled', label: 'Cancelled' },
                        { id: 'all', label: 'All' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                                ${filter === tab.id
                                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 && <p className="text-gray-400 py-10 text-center font-bold">No {filter} orders found.</p>}

            <div className="flex-1 overflow-auto space-y-4 pr-2">
                {filteredOrders.map((order) => {
                    const status = STATUS_MAP[order.status] || STATUS_MAP.in_progress;
                    const StatusIcon = status.icon;

                    return (
                        <div key={order.id} className="border border-gray-100 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition-shadow bg-white">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                    <ListOrdered size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-bold text-gray-900">Order #{order.id}</p>
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                            <StatusIcon size={12} />
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                    <p className="mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight line-clamp-1 max-w-[400px]">
                                        {order.items && order.items.map(item => item.product_name || item.name || "Product").join(", ")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="text-xl font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 font-mono-numbers">
                                    {parseFloat(order.total).toFixed(2)}€
                                </div>

                                {/* Status Actions */}
                                <div className="flex gap-2">
                                    {order.status === 'in_progress' && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/order/${order.id}`)}
                                                className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                                            >
                                                <Edit2 size={12} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'ready')}
                                                className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors"
                                            >
                                                Mark Ready
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => handlePayClick(order)}
                                            className="px-4 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-2"
                                        >
                                            <CreditCard size={12} />
                                            Pay Now
                                        </button>
                                    )}
                                    {(order.status === 'in_progress' || order.status === 'ready') && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                            className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isPaymentOpen && (
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => {
                        setIsPaymentOpen(false);
                        setOrderForPayment(null);
                        fetchOrders();
                    }}
                    orderId={orderForPayment?.id}
                />
            )}
        </div>
    );
};

export default Orders;
