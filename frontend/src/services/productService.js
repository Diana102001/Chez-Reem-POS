import api from "./api";

export const getProducts = async () => {
    const response = await api.get("products/");
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get("categories/");
    return response.data;
};

export const addCategory = async (category) => {
    const response = await api.post("categories/", category);
    return response.data;
};

export const updateCategory = async (id, updatedData) => {
    const response = await api.patch(`categories/${id}/`, updatedData);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`categories/${id}/`);
    return response.data;
};

export const addProduct = async (product) => {
    const response = await api.post("products/", product);
    return response.data;
};

export const updateProduct = async (id, updatedData) => {
    const response = await api.patch(`products/${id}/`, updatedData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`products/${id}/`);
    return response.data;
};
