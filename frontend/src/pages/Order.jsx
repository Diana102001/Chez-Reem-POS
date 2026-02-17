import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Plus, Minus, X, Check, ShoppingCart } from "lucide-react";
import PaymentModal from "../components/payment/PaymentModal";
import OptionSelectionModal from "../components/products/OptionSelectionModal";
import { getProducts, getCategories } from "../services/productService";

const Order = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("All");
    const [loading, setLoading] = useState(true);

    const {
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        clearCart,
        total,
    } = useCart();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [productForOptions, setProductForOptions] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts =
        selectedCategoryId === "All"
            ? products
            : products.filter((p) => p.category === selectedCategoryId);

    if (loading) return <div className="p-6 text-center">Loading menu...</div>;

    return (
        <div className="flex h-full gap-6">
            {/* LEFT SIDE */}
            <div className="flex-[2] bg-white p-6 rounded-xl shadow flex flex-col">
                {/* Categories */}
                <div className="flex gap-3 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setSelectedCategoryId("All")}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all border-2 whitespace-nowrap
                            ${selectedCategoryId === "All"
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-white border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                            }`}
                    >
                        All Items
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap border-2
                                ${selectedCategoryId === category.id
                                    ? "bg-secondary border-secondary text-secondary-foreground shadow-lg shadow-secondary/20"
                                    : "bg-white border-border text-muted-foreground hover:border-secondary/30 hover:text-secondary"
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Products */}
                <div className="grid grid-cols-3 gap-5 flex-1 overflow-auto content-start">
                    {filteredProducts.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => {
                                const category = categories.find(c => c.id === product.category);
                                const catOptions = category?.options || [];
                                const hasOptions = (product.options && product.options.length > 0) || (catOptions.length > 0);

                                if (hasOptions) {
                                    setProductForOptions(product);
                                    setIsOptionModalOpen(true);
                                } else {
                                    addToCart(product);
                                }
                            }}
                            className="p-5 bg-white border border-border rounded-2xl hover:bg-secondary/5 hover:border-secondary/30 transition-all text-left min-h-[180px] flex flex-col shadow-sm hover:shadow-md group"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-foreground text-base leading-tight line-clamp-2 group-hover:text-secondary transition-colors mb-1">
                                    {product.name}
                                </h3>
                                {product.details && (
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide line-clamp-1">
                                        {product.details}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4">
                                <p className="font-black text-primary text-xl font-mono-numbers leading-none">
                                    ${product.price}
                                </p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Stock: {product.quantity}
                                    </p>
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Plus className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE - CART */}
            <div className="flex-1 bg-white p-6 rounded-xl shadow flex flex-col">
                <h2 className="text-xl font-bold mb-4">Current Order</h2>

                <div className="flex-1 overflow-auto space-y-3">
                    {cart.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            No items added
                        </div>
                    )}

                    {cart.map((item) => (
                        <div
                            key={item.uniqueId}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group transition-all hover:border-secondary/20"
                        >
                            <div className="flex-1">
                                <p className="font-bold text-foreground">{item.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedChoices && item.selectedChoices.map((c, i) => (
                                        <span key={i} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                            {c.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-primary mt-2 font-mono-numbers bg-primary/5 px-2 py-1 rounded-lg inline-block">
                                    ${parseFloat(item.finalPrice).toFixed(2)} <span className="text-muted-foreground font-medium text-[10px] ml-1">x {item.quantity}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => decreaseQty(item.uniqueId)}
                                    className="w-8 h-8 flex items-center justify-center bg-white border border-border text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
                                >
                                    -
                                </button>

                                <span className="w-6 text-center font-black text-foreground">{item.quantity}</span>

                                <button
                                    onClick={() => increaseQty(item.uniqueId)}
                                    className="w-8 h-8 flex items-center justify-center bg-white border border-border text-green-500 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all shadow-sm active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <button
                        disabled={cart.length === 0}
                        onClick={() => setIsPaymentOpen(true)}
                        className={`w-full py-4 rounded-xl text-lg font-bold transition shadow-lg
                            ${cart.length === 0
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
                            }`}
                    >
                        Place Order
                    </button>

                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="w-full mt-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                            Clear Order
                        </button>
                    )}
                </div>
            </div>
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
            />
            <OptionSelectionModal
                isOpen={isOptionModalOpen}
                onClose={() => setIsOptionModalOpen(false)}
                product={productForOptions}
                categoryOptions={
                    productForOptions
                        ? categories.find(c => c.id === productForOptions.category)?.options || []
                        : []
                }
                onConfirm={addToCart}
            />
        </div>
    );
};

export default Order;
