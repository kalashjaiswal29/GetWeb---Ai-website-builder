import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/login";
import Register from "./features/auth/pages/register";
import Home from "./features/home/pages/home";
import Protected from "./features/auth/components/protected";
import DashboardPage from "./features/project/pages/dashboard";
import ProjectWorkspacePage from "./features/project/pages/projectworkspace";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <Protected>
        <DashboardPage />
      </Protected>
    ), //<Protected><DashboardPage /></Protected>,
  },
  {
    path: "/project",
    element: (
      <Protected>
        <ProjectWorkspacePage />
      </Protected>
    ),
  },
]);

export default router;
