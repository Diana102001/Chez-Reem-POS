import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} from "../services/productService";
import CategoryModal from "../components/categories/CategoryModal";
import Loader from "../components/common/Loader";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const deleteCloseTimerRef = useRef(null);

    useEffect(() => {
        loadCategories();

        return () => {
            if (deleteCloseTimerRef.current) {
                clearTimeout(deleteCloseTimerRef.current);
            }
        };
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Impossible de charger les categories.");
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

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setIsDeleteSuccess(false);
    };

    const closeDeleteModal = () => {
        if (deleteCloseTimerRef.current) {
            clearTimeout(deleteCloseTimerRef.current);
            deleteCloseTimerRef.current = null;
        }
        setCategoryToDelete(null);
        setIsDeleteSuccess(false);
    };

    const handleDeleteClick = async () => {
        if (!categoryToDelete || isDeleteSuccess) return;

        try {
            await deleteCategory(categoryToDelete.id);
            setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
            setIsDeleteSuccess(true);
            deleteCloseTimerRef.current = setTimeout(() => {
                closeDeleteModal();
            }, 900);
        } catch (err) {
            console.error("Failed to delete category:", err);
            alert("Impossible de supprimer la categorie.");
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
            alert("Impossible de sauvegarder la categorie.");
        }
    };

    if (loading) return <Loader text="Chargement des categories" />;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-card p-6 rounded-xl shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Categories</h2>
                <button
                    onClick={handleAddClick}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    Ajouter une categorie
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Categorie</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4">
                                    <p className="font-bold text-foreground text-sm">{category.name}</p>
                                    {category.description && (
                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-1 italic max-w-[400px]">
                                            {category.description}
                                        </p>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditClick(category)}
                                        className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(category)}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        Aucune categorie trouvee. Cliquez sur "Ajouter une categorie" pour en creer une.
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                category={currentCategory}
            />
            {categoryToDelete && (
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
                                <p className="text-sm font-bold text-foreground">Categorie supprimee</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-foreground mb-2">Supprimer la categorie</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Etes-vous sur de vouloir supprimer cette categorie ?
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

export default Categories;
