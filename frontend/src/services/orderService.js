export const saveOrder = async (orderData) => {
    console.log("Saving order:", orderData);

    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                orderId: Math.floor(Math.random() * 100000),
            });
        }, 1000);
    });
};

// await axios.post("/api/orders", orderData)
