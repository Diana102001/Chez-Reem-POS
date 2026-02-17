import { useState, useEffect } from "react";
import { X, Check, ShoppingCart, Plus, Minus } from "lucide-react";

const OptionSelectionModal = ({ isOpen, onClose, product, categoryOptions = [], onConfirm }) => {
    const [selectedChoices, setSelectedChoices] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (product) {
            setTotalPrice(parseFloat(product.price));
            setSelectedChoices([]);
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    const toggleChoice = (optionGroupName, choice, isCategoryOption = false) => {
        setSelectedChoices((prev) => {
            const otherOptions = prev.filter((c) => c.groupName !== optionGroupName);
            const isAlreadySelected = prev.find(
                (c) => c.groupName === optionGroupName && c.name === choice.name
            );

            let newChoices;
            if (isAlreadySelected) {
                newChoices = otherOptions;
            } else {
                newChoices = [...otherOptions, { ...choice, groupName: optionGroupName, isCategoryOption }];
            }

            // Update total price
            const productExtra = newChoices
                .filter(c => !c.isCategoryOption)
                .reduce((sum, c) => sum + parseFloat(c.price || 0), 0);

            const categoryExtra = newChoices
                .filter(c => c.isCategoryOption)
                .reduce((sum, c) => sum + parseFloat(c.price_change || 0), 0);

            setTotalPrice(parseFloat(product.price) + productExtra + categoryExtra);

            return newChoices;
        });
    };

    const handleAddToCart = () => {
        onConfirm(product, selectedChoices);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-[60] backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-[500px] max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                            {product.details && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">
                                    {product.details}
                                </span>
                            )}
                        </div>
                        {product.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-[380px]">
                                {product.description}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No description available</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors mt-[-4px]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Options List */}
                <div className="flex-1 overflow-auto p-6 space-y-8">
                    {/* Category Options Section */}
                    {categoryOptions && categoryOptions.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#808c49] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#808c49]"></span>
                                Extras & Add-ons
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {categoryOptions.map((opt, idx) => {
                                    const isSelected = selectedChoices.find(
                                        (c) => c.groupName === "General" && c.name === opt.name
                                    );
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleChoice("General", opt, true)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center group
                                                ${isSelected
                                                    ? "border-[#808c49] bg-[#808c49]/5 ring-4 ring-[#808c49]/10"
                                                    : "border-border hover:border-[#808c49]/30 bg-white"
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-bold transition-colors ${isSelected ? "text-secondary" : "text-foreground"}`}>
                                                    {opt.name}
                                                </p>
                                                <p className="text-xs font-mono-numbers text-muted-foreground">
                                                    +{parseFloat(opt.price_change).toFixed(2)}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="bg-[#808c49] text-white rounded-full p-1 shadow-lg shadow-[#808c49]/20 scale-110">
                                                    <Check className="w-3 h-3" strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Product Options Section */}
                    {product.options && product.options.map((group) => (
                        <div key={group.id} className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                {group.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {group.choices && group.choices.map((choice, idx) => {
                                    const isSelected = selectedChoices.find(
                                        (c) => c.groupName === group.name && c.name === choice.name
                                    );
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleChoice(group.name, choice)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center group
                                                ${isSelected
                                                    ? "border-secondary bg-secondary/5 ring-4 ring-secondary/10"
                                                    : "border-border hover:border-secondary/30 bg-white"
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-bold transition-colors ${isSelected ? "text-secondary" : "text-foreground"}`}>
                                                    {choice.name}
                                                </p>
                                                <p className="text-xs font-mono-numbers text-muted-foreground">
                                                    +{parseFloat(choice.price).toFixed(2)}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="bg-secondary text-secondary-foreground rounded-full p-1 shadow-lg shadow-secondary/20 scale-110">
                                                    <Check className="w-3 h-3" strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {(!product.options || product.options.length === 0) && (!categoryOptions || categoryOptions.length === 0) && (
                        <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                            No customizable options for this product
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-border mt-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Price</p>
                            <p className="text-3xl font-black text-primary font-mono-numbers">
                                ${totalPrice.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white px-2 py-1 rounded-full border border-border inline-block">
                                {selectedChoices.length} customization(s)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionSelectionModal;
