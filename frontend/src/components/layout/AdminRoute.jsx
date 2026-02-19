import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../common/Loader";

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <Loader text="Verification des droits" />;
    }

    if (!user || (user.role !== "admin" && !user.is_superuser)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
