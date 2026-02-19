import { useState, useEffect } from "react";
import {
    getProducts,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService";
import ProductModal from "../components/products/ProductModal";
import Loader from "../components/common/Loader";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState("All");

    const filteredProducts = selectedCategoryId === "All"
        ? products
        : products.filter(p => String(p.category) === String(selectedCategoryId));

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

    if (loading) return <Loader text="Loading Products" />;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-card p-6 rounded-xl shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Products</h2>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[160px]"
                    >
                        <option value="All">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddClick}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        Add Product
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Name</th>
                            {selectedCategoryId === "All" && <th className="py-3 px-4 font-semibold text-muted-foreground">Category</th>}
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Quantity</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Price</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-4 px-4">
                                    <p className="font-bold text-foreground">{product.name}</p>
                                    {product.details && (
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5 line-clamp-1">
                                            {product.details}
                                        </p>
                                    )}
                                </td>
                                {selectedCategoryId === "All" && (
                                    <td className="py-4 px-4">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-secondary/10 text-secondary uppercase tracking-wider">
                                            {getCategoryName(product.category)}
                                        </span>
                                    </td>
                                )}
                                <td className="py-3 px-4 font-mono-numbers">{product.quantity}</td>
                                <td className="py-3 px-4 font-mono-numbers">{product.price}€</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(product.id)}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground font-bold">
                        No products found in this category.
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
