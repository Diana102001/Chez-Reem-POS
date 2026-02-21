import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Order from '../pages/Order';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Users from '../pages/Users';
import TaxTypes from '../pages/TaxTypes';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AdminRoute from '../components/layout/AdminRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

            <Route element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order" element={<Order />} />
                <Route path="/order/:id" element={<Order />} />
                <Route path="/products" element={<AdminRoute><Products /></AdminRoute>} />
                <Route path="/categories" element={<AdminRoute><Categories /></AdminRoute>} />
                <Route path="/tax-types" element={<AdminRoute><TaxTypes /></AdminRoute>} />
                <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
