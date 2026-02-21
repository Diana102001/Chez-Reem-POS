import api from "./api";

export const saveOrder = async (orderData) => {
    const response = await api.post("orders/", orderData);
    return response.data;
};

export const getOrders = async () => {
    const response = await api.get("orders/");
    return response.data;
};

export const getOrder = async (id) => {
    const response = await api.get(`orders/${id}/`);
    return response.data;
};

export const getTaxTypes = async () => {
    const response = await api.get("tax-types/");
    return response.data;
};

export const createTaxType = async (payload) => {
    const response = await api.post("tax-types/", payload);
    return response.data;
};

export const updateTaxType = async (id, payload) => {
    const response = await api.patch(`tax-types/${id}/`, payload);
    return response.data;
};

export const deleteTaxType = async (id) => {
    await api.delete(`tax-types/${id}/`);
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`orders/${id}/`, { status });
    return response.data;
};

export const updateOrder = async (id, orderData) => {
    const response = await api.put(`orders/${id}/`, orderData);
    return response.data;
};
