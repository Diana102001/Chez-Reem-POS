import { useState } from "react";
import { useCart } from "../context/CartContext";
import PaymentModal from "../components/payment/PaymentModal";

const Order = () => {
    const categories = ["All", "Food", "Drinks", "Desserts"];

    const products = [
        { id: 1, name: "Burger", price: 8, category: "Food" },
        { id: 2, name: "Pizza", price: 12, category: "Food" },
        { id: 3, name: "Pasta", price: 10, category: "Food" },
        { id: 4, name: "Coke", price: 3, category: "Drinks" },
        { id: 5, name: "Water", price: 2, category: "Drinks" },
        { id: 6, name: "Ice Cream", price: 5, category: "Desserts" },
        { id: 7, name: "Cake", price: 6, category: "Desserts" },
    ];

    const [selectedCategory, setSelectedCategory] = useState("All");

    const {
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        clearCart,
        total,
    } = useCart();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const filteredProducts =
        selectedCategory === "All"
            ? products
            : products.filter((p) => p.category === selectedCategory);

    return (
        <div className="flex h-full gap-6">
            {/* LEFT SIDE */}
            <div className="flex-[2] bg-white p-6 rounded-xl shadow flex flex-col">
                {/* Categories */}
                <div className="flex gap-3 mb-6 overflow-x-auto">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full transition
                ${selectedCategory === category
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Products */}
                <div className="grid grid-cols-3 gap-5 flex-1 overflow-auto">
                    {filteredProducts.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="p-6 bg-gray-100 rounded-2xl hover:bg-blue-100 transition text-left h-32 flex flex-col justify-between shadow-sm"
                        >
                            <h3 className="font-semibold text-lg">
                                {product.name}
                            </h3>
                            <p className="font-medium">
                                ${product.price}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE - CART */}
            <div className="flex-1 bg-white p-6 rounded-xl shadow flex flex-col">
                <h2 className="text-xl font-bold mb-4">Cart</h2>

                <div className="flex-1 overflow-auto space-y-3">
                    {cart.length === 0 && (
                        <p className="text-gray-400">No items added</p>
                    )}

                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                        >
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">
                                    ${item.price} x {item.quantity}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => decreaseQty(item.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded"
                                >
                                    -
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                    onClick={() => increaseQty(item.id)}
                                    className="px-3 py-1 bg-green-500 text-white rounded"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${total}</span>
                    </div>

                    <button
                        disabled={cart.length === 0}
                        onClick={() => setIsPaymentOpen(true)}
                        className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-lg"
                    >
                        Pay Now
                    </button>


                    <button
                        onClick={clearCart}
                        className="w-full mt-2 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
                    >
                        Clear
                    </button>
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
