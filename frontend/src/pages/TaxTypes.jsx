import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import { createTaxType, deleteTaxType, getTaxTypes, updateTaxType } from "../services/orderService";

const emptyForm = {
    type: "",
    percent: "",
};

const TaxTypes = () => {
    const [taxTypes, setTaxTypes] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        loadTaxTypes();
    }, []);

    const loadTaxTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTaxTypes();
            setTaxTypes(data);
        } catch (err) {
            console.error("Failed to fetch tax types:", err);
            setError("Impossible de charger les types de taxe.");
        } finally {
            setLoading(false);
        }
    };

    const onInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const startEdit = (taxType) => {
        setEditingId(taxType.id);
        setForm({
            type: taxType.type || "",
            percent: String(taxType.percent ?? ""),
        });
        setError(null);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.type.trim()) return;

        const percent = Number(form.percent);
        if (Number.isNaN(percent) || percent < 0 || percent > 100) {
            setError("Le pourcentage doit etre entre 0 et 100.");
            return;
        }

        setSaving(true);
        setError(null);
        const payload = {
            type: form.type.trim(),
            percent,
        };

        try {
            if (editingId) {
                const updated = await updateTaxType(editingId, payload);
                setTaxTypes((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
            } else {
                const created = await createTaxType(payload);
                setTaxTypes((prev) => [...prev, created]);
            }
            resetForm();
        } catch (err) {
            console.error("Failed to save tax type:", err);
            const backendError =
                err.response?.data?.type?.[0] ||
                err.response?.data?.percent?.[0] ||
                err.response?.data?.detail ||
                "Impossible de sauvegarder le type de taxe.";
            setError(backendError);
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteTaxType(deleteTarget.id);
            setTaxTypes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Failed to delete tax type:", err);
            setError("Impossible de supprimer ce type de taxe.");
        }
    };

    if (loading) return <Loader text="Chargement des types de taxe" />;

    return (
        <div className="bg-card p-6 rounded-xl shadow h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Types de taxe</h2>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    name="type"
                    value={form.type}
                    onChange={onInput}
                    placeholder="Nom du type (ex: Sur place)"
                    required
                    className="md:col-span-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                />
                <input
                    name="percent"
                    value={form.percent}
                    onChange={onInput}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Taxe %"
                    required
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {saving ? "Sauvegarde..." : editingId ? "Mettre a jour" : "Ajouter"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </form>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Type</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Taxe (%)</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {taxTypes.map((taxType) => (
                            <tr key={taxType.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4 font-bold text-foreground">{taxType.type}</td>
                                <td className="py-3 px-4 font-mono-numbers">{Number(taxType.percent).toFixed(2)}%</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => startEdit(taxType)}
                                        className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(taxType)}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {taxTypes.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        Aucun type de taxe trouve.
                    </div>
                )}
            </div>

            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300"
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-foreground mb-2">Supprimer le type de taxe</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Confirmer la suppression de "{deleteTarget.type}" ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxTypes;
