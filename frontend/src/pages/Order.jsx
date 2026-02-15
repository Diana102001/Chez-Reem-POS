import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import PaymentModal from "../components/payment/PaymentModal";
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
                        className={`px-4 py-2 rounded-full transition whitespace-nowrap
                            ${selectedCategoryId === "All"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={`px-4 py-2 rounded-full transition whitespace-nowrap
                                ${selectedCategoryId === category.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
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
                            onClick={() => addToCart(product)}
                            className="p-6 bg-gray-100 rounded-2xl hover:bg-blue-100 transition text-left h-32 flex flex-col justify-between shadow-sm"
                        >
                            <h3 className="font-semibold text-lg line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="font-medium text-blue-600">
                                ${product.price}
                            </p>
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
                            key={item.id}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
                        >
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                    ${item.price} x {item.quantity}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => decreaseQty(item.id)}
                                    className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                >
                                    -
                                </button>

                                <span className="w-6 text-center font-medium">{item.quantity}</span>

                                <button
                                    onClick={() => increaseQty(item.id)}
                                    className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200"
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
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Proceed to Payment
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
        </div>
    );
};

export default Order;
