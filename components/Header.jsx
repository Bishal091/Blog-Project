import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

const Header = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if localStorage is available (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  return (
    <header className="bg-gray-800 text-white shadow-lg left-0 w-full z-50 sticky top-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-white"
        >
          <Link href="/" className="hover:text-green-300 flex items-center">
            <span>Burrr</span>
          </Link>
        </motion.h1>

        {/* Navigation */}
        <nav className="hidden md:flex items-stretch">
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-16"
          >
            <li>
              <Link href="/" className="hover:text-white transition duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/create-post" className="hover:text-white text-start flex items-center transition duration-300">
                Post <FaPlus size={10} className="inline-block" />
              </Link>
            </li>
            {isLoggedIn ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white p-2 py-[0.6vh] rounded-md hover:bg-red-700 transition duration-300"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/register" className="hover:text-white transition duration-300">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition duration-300">
                    Login
                  </Link>
                </li>
              </>
            )}
          </motion.ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;