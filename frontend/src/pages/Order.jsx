import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../services/productService";
import { saveOrder, getOrder, updateOrder } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Plus, Minus, Trash2, Tag, Utensils, Search, Filter, History, Clock, ArrowRight, Save, Receipt, ChevronRight, Edit2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import OptionSelectionModal from "../components/products/OptionSelectionModal";
import PaymentModal from "../components/payment/PaymentModal";
import Loader from "../components/common/Loader";

const Order = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("All");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const {
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        clearCart,
        loadCart,
        total,
    } = useCart();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [productForOptions, setProductForOptions] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);

                // If editing, fetch order
                if (id) {
                    const orderData = await getOrder(id);
                    if (orderData.status !== 'in_progress') {
                        alert("Seules les commandes en cours peuvent etre modifiees.");
                        navigate("/orders");
                        return;
                    }
                    // We need to map product IDs back to names if loadCart needs them
                    // Since loadCart uses item.product and item.name
                    const itemsWithNames = orderData.items.map(item => {
                        const p = productsData.find(prod => prod.id === item.product);
                        return { ...item, name: p?.name || "Produit" };
                    });
                    loadCart(itemsWithNames);
                } else {
                    clearCart();
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSaveOrder = async () => {
        if (cart.length === 0) return;
        setIsSaving(true);
        const orderData = {
            items: cart.map(item => ({
                product: item.id,
                quantity: item.quantity,
                choices: item.selectedChoices
            })),
            status: 'in_progress'
        };

        try {
            if (id) {
                await updateOrder(id, orderData);
            } else {
                await saveOrder(orderData);
            }
            clearCart();
            navigate("/orders");
        } catch (error) {
            console.error("Failed to save order", error);
            alert("Impossible de sauvegarder la commande. Veuillez reessayer.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts =
        selectedCategoryId === "All"
            ? products
            : products.filter((p) => p.category === selectedCategoryId);

    if (loading) return <Loader text="Preparation du menu" />;

    //     return (
    //         <div className="flex h-full gap-6">
    //             {/* LEFT SIDE */}
    //             <div className="flex-[2] bg-card p-6 rounded-xl shadow flex flex-col">
    //                 {/* Categories */}
    //                 <div className="flex gap-3 mb-6 overflow-x-auto">
    //                     <button
    //                         onClick={() => setSelectedCategoryId("All")}
    //                         className={`px-6 py-2.5 rounded-xl font-bold transition-all border-2 whitespace-nowrap
    //                             ${selectedCategoryId === "All"
    //                                 ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
    //                                 : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
    //                             }`}
    //                     >
    //                         All Items
    //                     </button>
    //                     {categories.map((category) => (
    //                         <button
    //                             key={category.id}
    //                             onClick={() => setSelectedCategoryId(category.id)}
    //                             className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap border-2
    //                                 ${selectedCategoryId === category.id
    //                                     ? "bg-secondary border-secondary text-secondary-foreground shadow-lg shadow-secondary/20"
    //                                     : "bg-card border-border text-muted-foreground hover:border-secondary/30 hover:text-secondary"
    //                                 }`}
    //                         >
    //                             {category.name}
    //                         </button>
    //                     ))}
    //                 </div>

    //                 {/* Products */}
    //                 <div className="grid grid-cols-4 gap-3 flex-1 overflow-auto content-start">
    //                     {filteredProducts.map((product) => (
    //                         <button
    //                             key={product.id}
    //                             onClick={() => {
    //                                 const category = categories.find(c => c.id === product.category);
    //                                 const catOptions = category?.options || [];
    //                                 const hasOptions = (product.options && product.options.length > 0) || (catOptions.length > 0);

    //                                 if (hasOptions) {
    //                                     setProductForOptions(product);
    //                                     setIsOptionModalOpen(true);
    //                                 } else {
    //                                     addToCart(product);
    //                                 }
    //                             }}
    //                             className="p-3 bg-card border border-border rounded-xl hover:bg-secondary/5 hover:border-secondary/30 transition-all text-left min-h-[130px] flex flex-col shadow-sm hover:shadow-md group"
    //                         >
    //                             <div className="flex-1">
    //                                 <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-secondary transition-colors mb-0.5">
    //                                     {product.name}
    //                                 </h3>
    //                                 {product.details && (
    //                                     <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide line-clamp-1">
    //                                         {product.details}
    //                                     </p>
    //                                 )}
    //                             </div>

    //                             <div className="mt-3">
    //                                 <p className="font-black text-primary text-lg font-mono-numbers leading-none">
    //                                     {product.price}€
    //                                 </p>
    //                                 <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-border">
    //                                     <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
    //                                         Stock: {product.quantity}
    //                                     </p>
    //                                     <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
    //                                         <Plus className="w-3 h-3" />
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </button>
    //                     ))}
    //                 </div>
    //             </div>

    //             {/* RIGHT SIDE - CART */}
    //             <div className="flex-1 bg-card p-5 rounded-xl shadow flex flex-col border border-border/50">
    //                 <h2 className="text-lg font-black mb-3 text-foreground flex items-center gap-2">
    //                     <div className="w-2 h-5 bg-secondary rounded-full" />
    //                     {id ? `Edit Order #${id}` : "Current Order"}
    //                 </h2>

    //                 <div className="flex-1 overflow-auto space-y-2.5 pr-1">
    //                     {cart.length === 0 && (
    //                         <div className="text-center py-10 text-muted-foreground">
    //                             No items added
    //                         </div>
    //                     )}

    //                     {cart.map((item) => (
    //                         <div
    //                             key={item.uniqueId}
    //                             className="flex justify-between items-center bg-muted/50 p-3 rounded-xl border border-border group transition-all hover:border-secondary/20 hover:bg-card"
    //                         >
    //                             <div className="flex-1 min-w-0">
    //                                 <p className="font-bold text-foreground text-sm leading-tight truncate">{item.name}</p>
    //                                 <div className="flex flex-wrap gap-1 mt-1">
    //                                     {item.selectedChoices && item.selectedChoices.map((c, i) => (
    //                                         <span key={i} className="text-[9px] bg-secondary/5 text-secondary px-2 py-0.5 rounded-md font-black uppercase tracking-tighter border border-secondary/10">
    //                                             {c.name}
    //                                         </span>
    //                                     ))}
    //                                 </div>
    //                                 <div className="mt-2 flex items-center gap-2">
    //                                     <span className="text-[11px] font-black text-primary font-mono-numbers bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
    //                                         {parseFloat(item.finalPrice).toFixed(2)}€
    //                                     </span>
    //                                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
    //                                         Qty: {item.quantity}
    //                                     </span>
    //                                 </div>
    //                             </div>

    //                             <div className="flex items-center gap-1.5 ml-2">
    //                                 <button
    //                                     onClick={() => decreaseQty(item.uniqueId)}
    //                                     className="w-7 h-7 flex items-center justify-center bg-card border border-border text-red-500 rounded-lg hover:bg-destructive/10 hover:border-destructive/30 transition-all shadow-sm active:scale-90"
    //                                 >
    //                                     <Minus size={14} />
    //                                 </button>

    //                                 <span className="w-5 text-center font-black text-xs text-foreground">{item.quantity}</span>

    //                                 <button
    //                                     onClick={() => increaseQty(item.uniqueId)}
    //                                     className="w-7 h-7 flex items-center justify-center bg-card border border-border text-green-500 rounded-lg hover:bg-green-500/10 hover:border-green-500/30 transition-all shadow-sm active:scale-90"
    //                                 >
    //                                     <Plus size={14} />
    //                                 </button>
    //                             </div>
    //                         </div>
    //                     ))}
    //                 </div>

    //                 <div className="mt-4 border-t border-border pt-3">
    //                     <div className="flex justify-between text-lg font-black mb-3 px-1 text-foreground">
    //                         <span>Total</span>
    //                         <span className="font-mono-numbers text-primary">{total.toFixed(2)}€</span>
    //                     </div>

    //                     <div className="flex gap-2">
    //                         <button
    //                             disabled={cart.length === 0 || isSaving}
    //                             onClick={handleSaveOrder}
    //                             className={`flex-1 py-2 rounded-xl text-sm font-bold transition shadow-md
    //                                 ${cart.length === 0 || isSaving
    //                                     ? "bg-muted text-muted-foreground cursor-not-allowed"
    //                                     : "bg-secondary text-secondary-foreground hover:opacity-90 shadow-secondary/20"
    //                                 }`}
    //                         >
    //                             {isSaving ? "Saving..." : "Save Order"}
    //                         </button>

    //                         <button
    //                             disabled={cart.length === 0}
    //                             onClick={() => setIsPaymentOpen(true)}
    //                             className={`flex-1 py-2 rounded-xl text-sm font-bold transition shadow-md
    //                                 ${cart.length === 0
    //                                     ? "bg-muted text-muted-foreground cursor-not-allowed"
    //                                     : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
    //                                 }`}
    //                         >
    //                             Place Order
    //                         </button>
    //                     </div>

    //                     {cart.length > 0 && (
    //                         <button
    //                             onClick={clearCart}
    //                             className="w-full mt-2 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition text-xs font-bold"
    //                         >
    //                             Clear Order
    //                         </button>
    //                     )}
    //                 </div>
    //             </div>
    //             <PaymentModal
    //                 isOpen={isPaymentOpen}
    //                 onClose={() => setIsPaymentOpen(false)}
    //                 orderId={id}
    //             />
    //             <OptionSelectionModal
    //                 isOpen={isOptionModalOpen}
    //                 onClose={() => setIsOptionModalOpen(false)}
    //                 product={productForOptions}
    //                 categoryOptions={
    //                     productForOptions
    //                         ? categories.find(c => c.id === productForOptions.category)?.options || []
    //                         : []
    //                 }
    //                 onConfirm={addToCart}
    //             />
    //         </div>
    //     );

    return (
        <div className="flex h-full w-full gap-4 overflow-hidden bg-background p-4">
            {/* LEFT SIDE: Menu Section */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

                {/* 1. Horizontal Category Scroller */}
                <div className="flex gap-2 mb-4 pb-2 overflow-x-auto scrollbar-hide shrink-0">
                    <button
                        onClick={() => setSelectedCategoryId("All")}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all border-2 whitespace-nowrap text-sm flex items-center gap-2
                        ${selectedCategoryId === "All"
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                            }`}
                    >
                        <Utensils className="w-4 h-4" />
                        Tous les articles
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap border-2 text-sm
                            ${selectedCategoryId === category.id
                                    ? "bg-secondary border-secondary text-secondary-foreground shadow-lg shadow-secondary/20"
                                    : "bg-card border-border text-muted-foreground hover:border-secondary/30 hover:text-secondary"
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* 2. Product Grid (Scrollable area) */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start pb-4">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => {
                                    const category = categories.find(c => c.id === product.category);
                                    const catOptions = category?.options || [];
                                    const hasOptions = (product.options && product.options.length > 0) || (catOptions.length > 0);

                                    if (hasOptions) {
                                        setProductForOptions(product);
                                        setIsOptionModalOpen(true);
                                    } else {
                                        addToCart(product);
                                    }
                                }}
                                className="p-3 bg-card border border-border rounded-xl hover:ring-2 hover:ring-secondary/40 transition-all text-left flex flex-col justify-between shadow-sm min-h-[140px] group active:scale-[0.98]"
                            >
                                <div>
                                    <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-secondary transition-colors">
                                        {product.name}
                                    </h3>
                                    {product.details && (
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                                            {product.details}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <p className="text-lg font-black text-primary font-mono-numbers leading-none">
                                        {product.price}€
                                    </p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Qt: {product.quantity}
                                        </p>
                                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <Plus className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Fixed Width Order Panel */}
            <div className="w-[400px] shrink-0 bg-card rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden">
                {/* Order Header */}
                <div className="p-5 border-b border-border bg-muted/20">
                    <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                        <div className="w-2 h-5 bg-secondary rounded-full" />
                        {id ? `Modifier commande #${id.slice(-5)}` : "Nouvelle commande"}
                    </h2>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
                            <ShoppingCart size={48} strokeWidth={1.5} className="mb-2" />
                            <p className="font-bold text-sm">Ajoutez des articles pour commencer</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div
                                key={item.uniqueId}
                                className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border border-border/50 group hover:border-secondary/30 transition-all"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-foreground text-sm leading-tight truncate">{item.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.selectedChoices?.map((c, i) => (
                                            <span key={i} className="text-[8px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[11px] font-black text-primary font-mono-numbers">
                                            {parseFloat(item.finalPrice).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-3">
                                    <button
                                        onClick={() => decreaseQty(item.uniqueId)}
                                        className="w-8 h-8 flex items-center justify-center bg-background border border-border text-red-500 rounded-lg hover:bg-red-50 transition-all active:scale-90"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-4 text-center font-black text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => increaseQty(item.uniqueId)}
                                        className="w-8 h-8 flex items-center justify-center bg-background border border-border text-green-500 rounded-lg hover:bg-green-50 transition-all active:scale-90"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Order Summary & Footer */}
                <div className="p-5 bg-muted/10 border-t border-border mt-auto">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-muted-foreground font-bold">Total general</span>
                        <span className="text-2xl font-black text-primary font-mono-numbers">{total.toFixed(2)}€</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={cart.length === 0 || isSaving}
                            onClick={handleSaveOrder}
                            className="flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-secondary/10"
                        >
                            {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </button>

                        <button
                            disabled={cart.length === 0}
                            onClick={() => setIsPaymentOpen(true)}
                            className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-primary/10"
                        >
                            Paiement
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="w-full mt-3 py-1 text-destructive hover:text-destructive/80 text-[10px] font-black uppercase tracking-widest transition"
                        >
                            Vider la commande en cours
                        </button>
                    )}
                </div>
            </div>

            {/* Modals Container */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                orderId={id}
            />
            <OptionSelectionModal
                isOpen={isOptionModalOpen}
                onClose={() => setIsOptionModalOpen(false)}
                product={productForOptions}
                categoryOptions={
                    productForOptions
                        ? categories.find(c => c.id === productForOptions.category)?.options || []
                        : []
                }
                onConfirm={addToCart}
            />
        </div>
    );

};

export default Order;
