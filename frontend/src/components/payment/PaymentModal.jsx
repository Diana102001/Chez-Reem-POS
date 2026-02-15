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

        // Format data for Django backend
        // Assuming backend expects: 
        //   items: [{ product: id, quantity: qty, price: unit_price }, ...]
        //   total_amount: ...
        //   payment_method: ...

        const orderData = {
            items: cart.map(item => ({
                product: item.id,
                quantity: item.quantity
            })),
            total: total, // Backend matches this now, though backend calculates it anyway
            payment_method: method
        };

        try {
            const response = await saveOrder(orderData);
            clearCart();
            alert(`Order completed successfully!`);
            onClose();
        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to process order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white w-96 p-6 rounded-2xl shadow-2xl transform transition-all">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment</h2>

                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</p>
                </div>

                <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
                <div className="flex gap-3 mb-8">
                    {["Cash", "Card"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setMethod(type)}
                            className={`flex-1 py-3 rounded-xl font-medium transition duration-200 border-2 ${method === type
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                    {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </button>

                <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 font-medium transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
