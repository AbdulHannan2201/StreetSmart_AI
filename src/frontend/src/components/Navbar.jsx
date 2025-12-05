import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const isLoggedIn = !!token;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">

        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center">
            {/* House Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h4m6 0h4a1 1 0 001-1V10"
              />
            </svg>
          </div>
          <span className="text-2xl font-semibold tracking-tight">StreetSmart AI</span>
        </NavLink>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">

          {/* HOME */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 relative hover:text-black transition ${isActive ? "text-black" : ""
              } group`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h4m6 0h4a1 1 0 001-1V10"
              />
            </svg>
            Home
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
          </NavLink>

          {/* PROPERTIES */}
          <NavLink
            to="/properties"
            className={({ isActive }) =>
              `flex items-center gap-2 relative hover:text-black transition ${isActive ? "text-black" : ""
              } group`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 10l8-8 8 8M5 11v9a1 1 0 001 1h4m4 0h4a1 1 0 001-1v-9"
              />
            </svg>
            Properties
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
          </NavLink>



          {/* DISCUSSIONS */}
          <NavLink
            to="/discussions"
            className={({ isActive }) =>
              `flex items-center gap-2 relative hover:text-black transition ${isActive ? "text-black" : ""
              } group`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h8m-8 4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Discussions
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
          </NavLink>

          {/* LANDLORD OPTIONS */}
          {user?.role === "landlord" && (
            <>
              <NavLink
                to="/my-properties"
                className={({ isActive }) =>
                  `flex items-center gap-2 relative hover:text-black transition ${isActive ? "text-black" : ""
                  } group`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                My Properties
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
              </NavLink>

              <NavLink
                to="/add-property"
                className={({ isActive }) =>
                  `flex items-center gap-2 relative hover:text-black transition ${isActive ? "text-black" : ""
                  } group`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Property
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
              </NavLink>
            </>
          )}

          {/* TENANT OPTIONS */}
          {user?.role === "tenant" && (
            <NavLink
              to="/saved-properties"
              className={({ isActive }) =>
                `flex items-center gap-2 relative hover:text-black transition ${isActive ? "text-black" : ""
                } group`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Saved
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
            </NavLink>
          )}
        </div>

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <NavLink
                to="/profile"
                className="px-4 py-2 text-gray-700 font-medium hover:text-black transition"
              >
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-800 hover:bg-gray-100 transition shadow-sm"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition shadow-sm"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
