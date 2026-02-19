import { useState, useEffect } from "react";
import { X, Package, Pencil, Tag, List, Info, Database, DollarSign, Plus, Minus } from "lucide-react";

const ProductModal = ({ isOpen, onClose, onSave, product, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        details: "",
        description: "",
        quantity: 0,
        options: [] // [{ name: "Size", choices: [{ name: "Large", price: 1.5 }] }]
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                category: product.category,
                details: product.details || "",
                description: product.description || "",
                quantity: product.quantity || 0,
                options: product.options || []
            });
        } else {
            setFormData({
                name: "",
                price: "",
                category: categories.length > 0 ? categories[0].id : "",
                details: "",
                description: "",
                quantity: 0,
                options: []
            });
        }
    }, [product, isOpen, categories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addOptionGroup = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { name: "", choices: [] }]
        }));
    };

    const removeOptionGroup = (index) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const updateGroupName = (index, name) => {
        setFormData(prev => {
            const newOptions = [...prev.options];
            newOptions[index].name = name;
            return { ...prev, options: newOptions };
        });
    };

    const addChoice = (groupIndex) => {
        setFormData(prev => {
            const newOptions = [...prev.options];
            newOptions[groupIndex].choices = [
                ...newOptions[groupIndex].choices,
                { name: "", price: 0 }
            ];
            return { ...prev, options: newOptions };
        });
    };

    const removeChoice = (groupIndex, choiceIndex) => {
        setFormData(prev => {
            const newOptions = [...prev.options];
            newOptions[groupIndex].choices = newOptions[groupIndex].choices.filter((_, i) => i !== choiceIndex);
            return { ...prev, options: newOptions };
        });
    };

    const updateChoice = (groupIndex, choiceIndex, field, value) => {
        setFormData(prev => {
            const newOptions = [...prev.options];
            newOptions[groupIndex].choices[choiceIndex][field] = value;
            return { ...prev, options: newOptions };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: Number(formData.price),
            category: Number(formData.category),
            quantity: Number(formData.quantity)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="bg-card w-[600px] max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl border border-border relative" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                            {product ? <Pencil className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {product ? "Modifier le produit" : "Ajouter un produit"}
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                {product ? `Modification : ${product.name}` : "Details du produit"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Basic Info Section */}
                        <div className="col-span-2 space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-secondary mb-3 uppercase tracking-widest">
                                    <Tag className="w-3.5 h-3.5" />
                                    Informations generales
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nom du produit"
                                    required
                                    className="block w-full rounded-2xl border-border bg-muted/50 p-4 text-xs focus:border-secondary focus:ring-secondary/20 transition-all border outline-none font-bold text-foreground"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">Categorie</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-2xl border-border bg-muted/50 p-4 text-xs focus:border-secondary focus:ring-secondary/20 transition-all border outline-none font-bold appearance-none text-foreground"
                                    >
                                        <option value="" disabled>Selectionner une categorie</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">Prix de base</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                        step="0.01"
                                        className="block w-full rounded-2xl border-border bg-muted/50 p-4 text-xs focus:border-secondary focus:ring-secondary/20 transition-all border outline-none font-bold font-mono-numbers text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Options Section */}
                        <div className="col-span-2 pt-4 border-t border-border">
                            <div className="flex justify-between items-center mb-6">
                                <label className="flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest">
                                    <List className="w-3.5 h-3.5" />
                                    Options de personnalisation
                                </label>
                                <button
                                    type="button"
                                    onClick={addOptionGroup}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Ajouter un groupe
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.options.map((group, groupIdx) => (
                                    <div key={groupIdx} className="p-4 bg-muted/50 border border-border rounded-2xl relative group/card">
                                        <button
                                            type="button"
                                            onClick={() => removeOptionGroup(groupIdx)}
                                            className="absolute top-4 right-4 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="mb-4 pr-10">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Nom du groupe (ex: Taille)</label>
                                            <input
                                                type="text"
                                                value={group.name}
                                                onChange={(e) => updateGroupName(groupIdx, e.target.value)}
                                                className="bg-transparent border-b border-border focus:border-secondary outline-none w-full py-1 font-bold text-foreground"
                                                placeholder="Saisir le nom du groupe..."
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            {group.choices.map((choice, choiceIdx) => (
                                                <div key={choiceIdx} className="flex gap-2 items-center animate-in slide-in-from-left-2 fade-in duration-200">
                                                    <input
                                                        type="text"
                                                        placeholder="Nom du choix"
                                                        value={choice.name}
                                                        onChange={(e) => updateChoice(groupIdx, choiceIdx, "name", e.target.value)}
                                                        className="flex-1 bg-card border border-border rounded-xl p-2 text-xs focus:border-secondary outline-none text-foreground"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Prix"
                                                        value={choice.price}
                                                        onChange={(e) => updateChoice(groupIdx, choiceIdx, "price", e.target.value)}
                                                        className="w-24 bg-card border border-border rounded-xl p-2 text-xs font-mono-numbers focus:border-secondary outline-none text-foreground"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChoice(groupIdx, choiceIdx)}
                                                        className="p-2 text-muted-foreground hover:text-red-500"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addChoice(groupIdx)}
                                                className="flex items-center gap-1.5 p-2 text-[10px] font-black text-secondary hover:text-secondary/80 uppercase tracking-widest"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Ajouter un choix
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {formData.options.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground text-xs italic opacity-60">
                                        Aucune option definie pour ce produit.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-border">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">Stock</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-border bg-muted/50 p-3.5 text-sm focus:border-secondary border outline-none font-mono-numbers text-foreground"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">Details courts</label>
                                <input
                                    type="text"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-border bg-muted/50 p-3.5 text-sm focus:border-secondary border outline-none font-medium text-foreground"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">Description complete</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Description detaillee du produit..."
                                    className="block w-full rounded-2xl border-border bg-muted/50 p-4 text-sm focus:border-secondary transition-all border outline-none font-medium resize-none text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all text-xs uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                        >
                            {product ? "Mettre a jour le produit" : "Creer le produit"}
                        </button>
                    </div>
                </form>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
            </div>
        </div>
    );
};

export default ProductModal;

