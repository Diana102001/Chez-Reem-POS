import { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-slide-in">
            <div
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
            >
                {type === "success" ? (
                    <CheckCircle size={20} />
                ) : (
                    <XCircle size={20} />
                )}
                <span className="font-semibold">{message}</span>
            </div>
        </div>
    );
};

export default Toast;
