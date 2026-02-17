import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { saveOrder } from "../../services/orderService";
import { X } from "lucide-react";

const PaymentModal = ({ isOpen, onClose }) => {
    const { cart, total, clearCart } = useCart();
    const [method, setMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);

        const orderData = {
            items: cart.map(item => ({
                product: item.id,
                quantity: item.quantity
            })),
            total: total,
            payment_method: method
        };

        try {
            await saveOrder(orderData);
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
        <div className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-[400px] p-8 rounded-3xl shadow-2xl border border-border relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Complete Payment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Amount Display */}
                <div className="mb-8 p-6 bg-secondary/5 rounded-2xl border border-secondary/10 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Amount</p>
                    <p className="text-4xl font-black text-secondary font-mono-numbers">
                        ${total.toFixed(2)}
                    </p>
                </div>

                {/* Method Selection */}
                <div className="mb-8">
                    <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Select Payment Method</p>
                    <div className="flex gap-4">
                        {["Cash", "Card"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMethod(type)}
                                className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-200 border-2 ${method === type
                                        ? "border-secondary bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20"
                                        : "border-border bg-white text-muted-foreground hover:border-secondary/30 hover:text-secondary"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                    >
                        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full py-3 text-muted-foreground hover:text-destructive font-bold transition-colors text-sm"
                    >
                        Cancel Transaction
                    </button>
                </div>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
            </div>
        </div>
    );
};

export default PaymentModal;
