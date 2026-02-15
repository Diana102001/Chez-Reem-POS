import { useState, useEffect } from "react";

const CategoryModal = ({ isOpen, onClose, onSave, category }) => {
    const [name, setName] = useState("");

    useEffect(() => {
        if (category) {
            setName(category.name);
        } else {
            setName("");
        }
    }, [category, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-96 p-6 rounded-xl shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                    {category ? "Edit Category" : "Add Category"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
