import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "sonner";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  useLocation,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import AddListing from "./components/addListing";
import ChatPage from "./components/ChatPage";
import LandlordQuestionaries from "./components/Landlord/landlordQuestionnaire";
import TenantQuestionnaire from "./components/students/TenantQuestionnaire";
import ModeratorDashboard from "./components/moderator/dashboard";
import PropertyDetailsPage from "./components/students/PropertyDetailsPage";
import Footer from "./components/footer";
import AuthPage from "./components/userAuth";
import UserProfile from "./components/userProfile";
import LandlordProperties from "./components/Landlord/landlordProperties";
import AddQuestionnairePage from "./components/Landlord/addQuestionnaire";
import AppliedListingsPage from "./components/Landlord/appliedListings";
import QuestionnaireDetailsPage from "./components/Landlord/questionnaireDetails";
import FavoriteListingsPage from "./components/students/studentFavouriteListing"; //Importing all the fav Listing
import ProtectedRoute from "./guards/ProtectedRoute";
import EditListing from "./components/editListing";
import NotificationCenter from "./components/NotificationCenter";
import Insights from "./components/moderator/insights";
import { fetchUnreadCount } from "./api";
import Privacy from "./components/Privacy";
import About from "./components/About";

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(
    localStorage.getItem("userRole")
  );
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    // Add click event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setUserRole(localStorage.getItem("userRole"));
      setAuthToken(localStorage.getItem("authToken"));
    };

    // Listen for storage changes
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);

    // Cleanup listener
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Logout function to clear both state and localStorage
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setAuthToken(null);
    setUserRole(null);
    window.dispatchEvent(new Event("authChange"));
  };

  const updateUnreadCount = () => {
    fetchUnreadCount().then(setUnreadCount).catch(() => { })
  }

  const CheckAuth: React.FC = () => {
    const location = useLocation()

    // logout if auth token is expired
    useEffect(() => {
      const authToken = localStorage.getItem("authToken")
      if (!authToken)
        return

      const jwt = jwtDecode(authToken)
      if (jwt.exp! * 1000 < Date.now()) {
        handleLogout()
        toast.warning("You have been logged out since your session expired.")
      }
    }, [location])

    return (
      <></>
    )
  }

  const checkAuth = useMemo(() => <CheckAuth />, [])
  const notificationCenter = useMemo(() => <NotificationCenter toggleUnreadUpdate={updateUnreadCount} />, [])

  return (
    <Router>
      <Toaster />
      {checkAuth}
      {notificationCenter}
      <div className="app">
        {/* Desktop Navbar (visible on md and up) */}
        <nav className="items-center justify-between hidden p-3 bg-black shadow-lg md:flex">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/">
              <img src="/Logo.png" className="w-20 h-10" alt="Logo" />
            </NavLink>
          </div>
          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-white border-b-2 border-yellow-600"
                  : "text-gray-400 hover:text-white"
              }
            >
              Home
            </NavLink>
            {userRole === "Student" && (
              <NavLink
                to="/favourites"
                className={({ isActive }) =>
                  isActive
                    ? "text-white border-b-2 border-yellow-600"
                    : "text-gray-400 hover:text-white"
                }
              >
                Favourites
              </NavLink>
            )}
            {userRole === "Landlord" && (
              <>
                <NavLink
                  to="/add-listing"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Add Listing
                </NavLink>
                <NavLink
                  to="/properties"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Listings
                </NavLink>
                <NavLink
                  to="/questionnaires"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Questionnaires
                </NavLink>
                <NavLink
                  to="/appliedlistings"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Applied Listings
                </NavLink>
              </>
            )}
            {(userRole === "Landlord" ||
              userRole === "Student" ||
              userRole === "Moderator") && (
                <NavLink
                  to="/chatting"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Chats
                  <sup
                    className={`${unreadCount === 0 ? "hidden" : ""}`}
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "#a00",
                      borderRadius: "999px",
                      marginLeft: "2px",
                    }}
                  >
                    {unreadCount}
                  </sup>
                </NavLink>
              )}
            {userRole === "Moderator" && (
              <>
                <NavLink
                  to="/moderator-dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Listings
                </NavLink>
                <NavLink
                  to="/insights"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Insights
                </NavLink>
              </>
            )}
            {authToken ? (
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
              >
                <button className="text-gray-400 hover:text-white">
                  Profile
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 w-auto mt-2 bg-white rounded-lg shadow-lg"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={closeDropdown}
                  >
                    <ul className="py-2">
                      <li>
                        <NavLink
                          to="/user-profile"
                          className="block px-4 py-1 text-gray-800 hover:bg-yellow-600 whitespace-nowrap"
                        >
                          User Profile
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/auth"
                          onClick={handleLogout}
                          className="block w-full px-4 py-1 text-left text-gray-800 hover:bg-yellow-600 whitespace-nowrap"
                        >
                          Sign Out
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/auth"
                className={({ isActive }) =>
                  isActive
                    ? "text-white border-b-2 border-yellow-600"
                    : "text-gray-400 hover:text-white"
                }
              >
                Register
              </NavLink>
            )}
          </div>
        </nav>

        {/* Mobile Navbar (visible on screens smaller than md) */}
        <nav className="flex flex-col bg-black shadow-lg md:hidden">
          <div className="flex items-center justify-between p-3">
            <NavLink to="/">
              <img src="/Logo.png" className="w-20 h-10" alt="Logo" />
            </NavLink>
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              {menuOpen ? "✖" : "☰"}
            </button>
          </div>

          {menuOpen && (
            <div className="bg-black shadow-lg">
              <div className="flex flex-col p-4 space-y-4">
                <NavLink
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "text-white border-b-2 border-yellow-600"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  Home
                </NavLink>

                {userRole === "Student" && (
                  <NavLink
                    to="/favourites"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-white border-b-2 border-yellow-600"
                        : "text-gray-400 hover:text-white"
                    }
                  >
                    Favourites
                  </NavLink>
                )}

                {userRole === "Landlord" && (
                  <>
                    <NavLink
                      to="/add-listing"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Add Listing
                    </NavLink>
                    <NavLink
                      to="/properties"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Listings
                    </NavLink>
                    <NavLink
                      to="/questionnaires"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Questionnaires
                    </NavLink>
                    <NavLink
                      to="/appliedlistings"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Applied Listings
                    </NavLink>
                  </>
                )}

                {(userRole === "Landlord" ||
                  userRole === "Student" ||
                  userRole === "Moderator") && (
                    <NavLink
                      to="/chatting"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Chats
                      <sup
                        className={`${unreadCount === 0 ? "hidden" : ""}`}
                        style={{
                          padding: "2px 6px",
                          backgroundColor: "#a00",
                          borderRadius: "999px",
                          marginLeft: "2px",
                        }}
                      >
                        {unreadCount}
                      </sup>
                    </NavLink>
                  )}

                {userRole === "Moderator" && (
                  <>
                    <NavLink
                      to="/moderator-dashboard"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Listings
                    </NavLink>
                    <NavLink
                      to="/insights"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      Insights
                    </NavLink>
                  </>
                )}

                {/* Show User Profile and Sign Out as normal links when authenticated */}
                {authToken ? (
                  <>
                    <NavLink
                      to="/user-profile"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-white border-b-2 border-yellow-600"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      User Profile
                    </NavLink>
                    <NavLink
                      to="/auth"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      Sign Out
                    </NavLink>
                  </>
                ) : (
                  <NavLink
                    to="/auth"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-white border-b-2 border-yellow-600"
                        : "text-gray-400 hover:text-white"
                    }
                  >
                    Register
                  </NavLink>
                )}
              </div>
            </div>
          )}
        </nav>


        {/* Main Content */}
        <div className="min-h-screen p-6 bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-listing" element={<AddListing />} />
            <Route
              path="/chatting"
              element={
                <ProtectedRoute>
                  <ChatPage toggleUnreadUpdate={updateUnreadCount} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moderator-dashboard"
              element={
                <ProtectedRoute requiredRole="Moderator">
                  <ModeratorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute requiredRole="Moderator">
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approve-listing/:id"
              element={
                <ProtectedRoute requiredRole="Moderator">
                  <PropertyDetailsPage mode="moderator" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/listing/:id"
              element={<PropertyDetailsPage mode="user" />}
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/properties" element={<LandlordProperties />} />
            <Route path="/favourites" element={<FavoriteListingsPage />} />
            <Route
              path="/questionnaires"
              element={<LandlordQuestionaries />}
            />
            <Route
              path="/tenant-questionnaire/:landlordQuestionnaireId/:propertyId"
              element={<TenantQuestionnaire />}
            />
            <Route
              path="/add-questionnaire"
              element={<AddQuestionnairePage />}
            />
            <Route
              path="/appliedlistings"
              element={<AppliedListingsPage />}
            />
            <Route path="/landlord" element={<HomePage />} />
            <Route
              path="/questionnaire-details/:id"
              element={<QuestionnaireDetailsPage />}
            />
            <Route path="/edit-listing/:id" element={<EditListing />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
