import { useState, useEffect } from "react";
import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} from "../services/productService";
import CategoryModal from "../components/categories/CategoryModal";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id);
                setCategories((prev) => prev.filter((c) => c.id !== id));
            } catch (err) {
                console.error("Failed to delete category:", err);
                alert("Failed to delete category.");
            }
        }
    };

    const handleSave = async (categoryData) => {
        try {
            if (currentCategory) {
                const updated = await updateCategory(currentCategory.id, categoryData);
                setCategories((prev) =>
                    prev.map((c) => (c.id === currentCategory.id ? updated : c))
                );
            } else {
                const newCategory = await addCategory(categoryData);
                setCategories((prev) => [...prev, newCategory]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save category:", err);
            alert("Failed to save category.");
        }
    };

    if (loading) return <div className="p-6 text-center">Loading categories...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Categories</h2>
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Add Category
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{category.name}</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditClick(category)}
                                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(category.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No categories found. Click "Add Category" to create one.
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                category={currentCategory}
            />
        </div>
    );
};

export default Categories;
