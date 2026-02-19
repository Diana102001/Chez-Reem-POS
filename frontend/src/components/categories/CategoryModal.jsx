import { useState, useEffect } from "react";
import { X, Layers, Tag, Pencil } from "lucide-react";

const CategoryModal = ({ isOpen, onClose, onSave, category }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState([]); // [{ name: "", price_change: 0 }]

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || "");
            setOptions(category.options || []);
        } else {
            setName("");
            setDescription("");
            setOptions([]);
        }
    }, [category, isOpen]);

    const addOption = () => {
        setOptions([...options, { name: "", price_change: 0 }]);
    };

    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, description, options });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="bg-card w-[500px] max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-border relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                            {category ? <Pencil className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {category ? "Edit Category" : "Add Category"}
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                {category ? "Update existing" : "Create new"}
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

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Category Name Input */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-secondary mb-3 uppercase tracking-widest">
                            <Tag className="w-3.5 h-3.5" />
                            General Information
                        </label>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Category Name (e.g. Beverages)"
                                required
                                className="block w-full rounded-2xl border-border bg-muted/50 p-4 text-xs focus:border-secondary focus:ring-secondary/20 transition-all border outline-none font-bold text-foreground"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Category Description (optional)"
                                rows="2"
                                className="block w-full rounded-2xl border-border bg-muted/50 p-4 text-xs focus:border-secondary focus:ring-secondary/20 transition-all border outline-none font-medium resize-none text-foreground"
                            />
                        </div>
                    </div>

                    {/* Category-wide Options */}
                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest">
                                <span className="w-3.5 h-3.5 bg-secondary rounded-full flex items-center justify-center text-[8px] text-white">?</span>
                                Global Options
                            </label>
                            <button
                                type="button"
                                onClick={addOption}
                                className="px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-xl text-xs font-bold transition-all"
                            >
                                Add Option
                            </button>
                        </div>

                        <div className="space-y-4">
                            {options.map((option, idx) => (
                                <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 fade-in duration-200">
                                    <input
                                        type="text"
                                        placeholder="Add-on name"
                                        value={option.name}
                                        onChange={(e) => updateOption(idx, "name", e.target.value)}
                                        className="flex-1 bg-muted/50 border border-border rounded-xl p-3 text-sm focus:border-secondary outline-none font-medium text-foreground"
                                    />
                                    <div className="relative w-24">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={option.price_change}
                                            onChange={(e) => updateOption(idx, "price_change", e.target.value)}
                                            step="0.01"
                                            className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-mono-numbers focus:border-secondary outline-none font-bold pr-5 text-foreground"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">€</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {options.length === 0 && (
                                <p className="text-center py-4 text-xs italic text-muted-foreground opacity-60">
                                    No category-wide options defined.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all text-xs uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                        >
                            {category ? "Save Changes" : "Save Category"}
                        </button>
                    </div>
                </form>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
            </div>
        </div>
    );
};

export default CategoryModal;
