// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Add product
    const addToCart = (product, selectedChoices = []) => {
        setCart((prevCart) => {
            // Create a unique key for the item based on ID and options
            const optionsKey = JSON.stringify(selectedChoices.map(c => c.name).sort());
            const uniqueId = `${product.id}-${optionsKey}`;

            const existing = prevCart.find((item) => item.uniqueId === uniqueId);

            // Calculate extra price from choices
            const extraPrice = selectedChoices.reduce((sum, c) => sum + parseFloat(c.price || 0), 0);
            const itemPrice = parseFloat(product.price) + extraPrice;

            if (existing) {
                return prevCart.map((item) =>
                    item.uniqueId === uniqueId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...prevCart,
                {
                    ...product,
                    uniqueId,
                    selectedChoices,
                    finalPrice: itemPrice,
                    quantity: 1
                }
            ];
        });
    };

    // Increase quantity
    const increaseQty = (uniqueId) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.uniqueId === uniqueId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    // Decrease quantity
    const decreaseQty = (uniqueId) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.uniqueId === uniqueId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Clear cart
    const clearCart = () => setCart([]);

    // Load existing order into cart
    const loadCart = (items) => {
        const mappedItems = items.map(item => {
            // Reconstruct uniqueId
            const selectedChoices = item.choices || [];
            const optionsKey = JSON.stringify(selectedChoices.map(c => c.name).sort());
            const uniqueId = `${item.product}-${optionsKey}`;

            return {
                id: item.product,
                name: item.name || "Product", // Fallback if name not passed
                uniqueId,
                selectedChoices,
                finalPrice: parseFloat(item.price),
                quantity: item.quantity,
                price: parseFloat(item.price) - selectedChoices.reduce((sum, c) => sum + parseFloat(c.price || 0), 0)
            };
        });
        setCart(mappedItems);
    };

    // Total calculation
    const total = cart.reduce(
        (sum, item) => sum + item.finalPrice * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                increaseQty,
                decreaseQty,
                clearCart,
                loadCart,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Custom hook (very important)
export const useCart = () => useContext(CartContext);
