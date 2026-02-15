import { useState, useEffect } from "react";
import {
    getProducts,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService";
import ProductModal from "../components/products/ProductModal";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to load products. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                setProducts((prev) => prev.filter((product) => product.id !== id));
            } catch (err) {
                console.error("Failed to delete product:", err);
                alert("Failed to delete product.");
            }
        }
    };

    const handleSave = async (productData) => {
        try {
            if (currentProduct) {
                const updated = await updateProduct(currentProduct.id, productData);
                setProducts((prev) =>
                    prev.map((p) => (p.id === currentProduct.id ? updated : p))
                );
            } else {
                const newProduct = await addProduct(productData);
                setProducts((prev) => [...prev, newProduct]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save product:", err);
            alert("Failed to save product.");
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : "Unknown";
    };

    if (loading) return <div className="p-6 text-center">Loading products...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Products</h2>
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Add Product
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Price</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{product.name}</td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                        {getCategoryName(product.category)}
                                    </span>
                                </td>
                                <td className="py-3 px-4">${product.price}</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(product.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No products found. Click "Add Product" to create one.
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={currentProduct}
                categories={categories}
            />
        </div>
    );
};

export default Products;
