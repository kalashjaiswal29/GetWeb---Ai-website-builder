import AuthContextProvider from "./features/auth/data/auth.context.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./app.route.jsx";
import { ProjectContextProvider } from "./features/project/data/project.context.jsx";
import { ToastProvider } from "./features/shared/components/Toast.jsx";

function App() {
  return (
    <AuthContextProvider>
      <ProjectContextProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ProjectContextProvider>
    </AuthContextProvider>
  );
}

export default App;
