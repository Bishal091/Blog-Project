import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("Please login to access this page!");
      router.push("/login");
    }
  }, [token]);

  if (!token) {
    return null; // Redirecting, so no need to render anything
  }

  return children;
};

export default ProtectedRoute;