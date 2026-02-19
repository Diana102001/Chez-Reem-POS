import api from "./api";

export const getUsers = async () => {
    const response = await api.get("users/");
    return response.data;
};

export const createUser = async (payload) => {
    const response = await api.post("users/", payload);
    return response.data;
};

export const deleteUser = async (id) => {
    await api.delete(`users/${id}/`);
};
