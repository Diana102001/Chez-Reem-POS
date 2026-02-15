import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Order from '../pages/Order';
import Products from '../pages/Products';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

            <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<Order />} />
                <Route path="/products" element={<Products />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
