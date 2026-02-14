import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await API.get("products/");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products", err);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            setCart(
                cart.map((item) =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                )
            );
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const changeQty = (id, delta) => {
        setCart(
            cart
                .map((item) =>
                    item.id === id ? { ...item, qty: item.qty + delta } : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const handlePay = () => {
        if (cart.length === 0) return alert("Cart is empty!");
        alert(`Payment successful! Total: $${total.toFixed(2)}`);
        setCart([]);
    };

    return (
        <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden">
            {/* Products Panel */}
            <div className="flex-[3] bg-slate-800 p-4 flex flex-col overflow-hidden">
                <h1 className="text-4xl font-bold text-emerald-400 mb-4">Products</h1>
                <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-1">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            className="bg-slate-700 rounded-2xl p-6 font-bold text-lg text-white shadow-lg hover:bg-emerald-600 transition-all duration-200"
                            onClick={() => addToCart(product)}
                        >
                            {product.name}
                            <br />
                            <span className="text-emerald-400 font-bold text-xl">
                                ${product.price}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Panel */}
            <div className="flex-[2] bg-slate-800 p-4 flex flex-col overflow-hidden">
                <h1 className="text-4xl font-bold text-emerald-400 mb-4">Order</h1>

                {/* Scrollable Cart Items */}
                <div className="flex-1 overflow-y-auto mb-4">
                    {cart.length === 0 && (
                        <p className="text-gray-300 text-lg">Cart is empty</p>
                    )}

                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-center mb-2 p-3 bg-slate-700 rounded-xl"
                        >
                            <div>
                                <p className="text-lg font-semibold">{item.name}</p>
                                <div className="flex gap-2 mt-1">
                                    <button
                                        onClick={() => changeQty(item.id, -1)}
                                        className="bg-red-500 px-2 rounded"
                                    >
                                        -
                                    </button>
                                    <span className="px-2">{item.qty}</span>
                                    <button
                                        onClick={() => changeQty(item.id, 1)}
                                        className="bg-green-500 px-2 rounded"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="font-bold text-lg">
                                ${(item.price * item.qty).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total + Buttons */}
                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex justify-between items-center text-2xl font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handlePay}
                            className="flex-1 bg-green-500 p-4 rounded-xl font-bold hover:bg-green-600"
                        >
                            PAY
                        </button>
                        <button
                            onClick={() => setCart([])}
                            className="flex-1 bg-red-500 p-4 rounded-xl font-bold hover:bg-red-600"
                        >
                            CLEAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
