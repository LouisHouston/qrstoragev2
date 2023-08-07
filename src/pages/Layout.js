import { Outlet, Link } from "react-router-dom";
import { useContext } from "react";
import "../styles/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { UserContext } from "../Services/Login";
import { signInWith, signOut } from "../Services/firebaseauth";

const Layout = () => {
  const { user } = useContext(UserContext);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            QRStorage
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              {user ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link" style={{ color: 'white' }}>
                      Welcome, {user.displayName}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" onClick={signOut}>
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <button className="nav-link" onClick={signInWith}>
                    Sign In
                  </button>
                </li>
              )}
              <li className="nav-item">
                <Link to="/boxes" className="nav-link">
                  Boxes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/settings" className="nav-link">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;
