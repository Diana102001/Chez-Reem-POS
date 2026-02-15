import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { saveOrder } from "../../services/orderService";

const PaymentModal = ({ isOpen, onClose }) => {
    const { cart, total, clearCart } = useCart();
    const [method, setMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);

        const orderData = {
            items: cart,
            total,
            paymentMethod: method,
            createdAt: new Date(),
        };

        const response = await saveOrder(orderData);

        if (response.success) {
            clearCart();
            alert(`Order #${response.orderId} completed successfully!`);
            onClose();
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-96 p-6 rounded-xl shadow-xl">
                <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

                <div className="mb-4">
                    <p className="text-lg font-semibold">Total: ${total}</p>
                </div>

                {/* Payment Methods */}
                <div className="flex gap-3 mb-6">
                    {["Cash", "Card"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setMethod(type)}
                            className={`flex-1 py-3 rounded-lg transition ${method === type
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    {loading ? "Processing..." : "Confirm Payment"}
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-3 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
