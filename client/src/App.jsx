import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
