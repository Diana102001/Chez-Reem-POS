import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
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
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState("All");
    const deleteCloseTimerRef = useRef(null);

    const filteredProducts = selectedCategoryId === "All"
        ? products
        : products.filter((p) => String(p.category) === String(selectedCategoryId));

    useEffect(() => {
        loadData();

        return () => {
            if (deleteCloseTimerRef.current) {
                clearTimeout(deleteCloseTimerRef.current);
            }
        };
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
            setError("Impossible de charger les produits. Verifiez que le serveur backend est actif.");
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

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsDeleteSuccess(false);
    };

    const closeDeleteModal = () => {
        if (deleteCloseTimerRef.current) {
            clearTimeout(deleteCloseTimerRef.current);
            deleteCloseTimerRef.current = null;
        }
        setProductToDelete(null);
        setIsDeleteSuccess(false);
    };

    const handleDeleteClick = async () => {
        if (!productToDelete || isDeleteSuccess) return;

        try {
            await deleteProduct(productToDelete.id);
            setProducts((prev) => prev.filter((product) => product.id !== productToDelete.id));
            setIsDeleteSuccess(true);
            deleteCloseTimerRef.current = setTimeout(() => {
                closeDeleteModal();
            }, 900);
        } catch (err) {
            console.error("Failed to delete product:", err);
            alert("Impossible de supprimer le produit.");
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
            alert("Impossible de sauvegarder le produit.");
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : "Inconnu";
    };

    if (loading) return <Loader text="Chargement des produits" />;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-card p-6 rounded-xl shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Produits</h2>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[160px]"
                    >
                        <option value="All">Toutes les categories</option>
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
                        Ajouter un produit
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Nom</th>
                            {selectedCategoryId === "All" && <th className="py-3 px-4 font-semibold text-muted-foreground">Categorie</th>}
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Prix</th>
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
                                <td className="py-3 px-4 font-mono-numbers">{product.price}€</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(product)}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground font-bold">
                        Aucun produit trouve dans cette categorie.
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
            {productToDelete && (
                <div
                    className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300"
                    onClick={isDeleteSuccess ? undefined : closeDeleteModal}
                >
                    <div
                        className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isDeleteSuccess ? (
                            <div className="py-4 flex flex-col items-center">
                                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                                    <Check className="w-7 h-7" />
                                </div>
                                <p className="text-sm font-bold text-foreground">Produit supprime</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-foreground mb-2">Supprimer le produit</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Etes-vous sur de vouloir supprimer ce produit ?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeDeleteModal}
                                        className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteClick}
                                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
