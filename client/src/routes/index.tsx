import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import { RootLayout } from "../layouts/RootLayout";

// Admin imports
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminProductForm from "../pages/admin/AdminProductForm";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminCategoryForm from "../pages/admin/AdminCategoryForm";
import AdminInventory from "../pages/admin/AdminInventory";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetails from "../pages/admin/AdminOrderDetails";
import { ProtectedAdminRoute } from "../components/admin/ProtectedAdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
