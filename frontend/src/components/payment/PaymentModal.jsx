import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { saveOrder, updateOrder } from "../../services/orderService";
import { X } from "lucide-react";
import Toast from "../ui/Toast";

const PaymentModal = ({
    isOpen,
    onClose,
    orderId,
    taxTypeId = null,
    subtotal = 0,
    taxAmount = 0,
    totalWithTax = 0,
}) => {
    const { cart, clearCart } = useCart();
    const [method, setMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);

        const orderData = {
            items: cart.map((item) => ({
                product: item.id,
                quantity: item.quantity,
                choices: item.selectedChoices,
            })),
            tax_type: taxTypeId,
            payment_method: method,
        };

        try {
            if (orderId) {
                await updateOrder(orderId, orderData);
            } else {
                await saveOrder(orderData);
            }

            setToast({
                message: "Commande validee avec succes !",
                type: "success",
            });

            setTimeout(() => {
                clearCart();
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Order failed", error);

            setToast({
                message: "Echec du traitement de la commande.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300" onClick={onClose}>
                <div className="bg-card w-[400px] p-8 rounded-3xl shadow-2xl border border-border relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-foreground">Finaliser le paiement</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-8 p-6 bg-secondary/5 rounded-2xl border border-secondary/10 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Montant total</p>
                        <p className="text-3xl font-black text-secondary font-mono-numbers">
                            {totalWithTax.toFixed(2)} EUR
                        </p>
                        <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                            {subtotal.toFixed(2)} EUR HT + {taxAmount.toFixed(2)} EUR taxe incluse
                        </p>
                    </div>

                    <div className="mb-8">
                        <p className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">Choisir le mode de paiement</p>
                        <div className="flex gap-4">
                            {[
                                { value: "Cash", label: "Especes" },
                                { value: "Card", label: "Carte" },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setMethod(type.value)}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-200 border-2 ${method === type.value
                                        ? "border-secondary bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20"
                                        : "border-border bg-card text-muted-foreground hover:border-secondary/30 hover:text-secondary"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                        >
                            {loading ? "Traitement..." : `Payer ${totalWithTax.toFixed(2)} EUR`}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3 text-muted-foreground hover:text-destructive font-bold transition-colors text-sm"
                        >
                            Annuler la transaction
                        </button>
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default PaymentModal;
