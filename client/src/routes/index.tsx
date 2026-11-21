import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import Home from "../pages/Home";
import { RootLayout } from "../layouts/RootLayout";
import { RouteErrorBoundary } from "../components/ui/RouteErrorBoundary";

// Customer routes lazy loaded
const Shop = lazy(() => import("../pages/Shop"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));

// Admin routes lazy loaded
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("../pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));
const AdminCategoryForm = lazy(() => import("../pages/admin/AdminCategoryForm"));
const AdminInventory = lazy(() => import("../pages/admin/AdminInventory"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails"));
const ProtectedAdminRoute = lazy(() => import("../components/admin/ProtectedAdminRoute").then(m => ({ default: m.ProtectedAdminRoute })));
const AdminLayout = lazy(() => import("../layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // Customer Routes
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/shop",
        element: <Shop />,
      },
      {
        path: "/product/:id",
        element: <ProductDetails />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/wishlist",
        element: <Navigate to="/shop" replace />,
      },

      // Admin Login (Unprotected)
      {
        path: "/admin/login",
        element: <AdminLogin />,
      },

      // Protected Admin Routes
      {
        path: "/admin",
        element: <ProtectedAdminRoute />,
        children: [
          {
            path: "",
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="dashboard" replace />,
              },
              {
                path: "dashboard",
                element: <AdminDashboard />,
              },
              {
                path: "products",
                element: <AdminProducts />,
              },
              {
                path: "products/new",
                element: <AdminProductForm />,
              },
              {
                path: "products/:id/edit",
                element: <AdminProductForm />,
              },
              {
                path: "categories",
                element: <AdminCategories />,
              },
              {
                path: "categories/new",
                element: <AdminCategoryForm />,
              },
              {
                path: "categories/:id/edit",
                element: <AdminCategoryForm />,
              },
              // Placeholders for future routes
              {
                path: "inventory",
                element: <AdminInventory />,
              },
              {
                path: "orders",
                element: <AdminOrders />,
              },
              {
                path: "orders/:id",
                element: <AdminOrderDetails />,
              },
            ]
          }
        ]
      },
    ]
  }
]);
