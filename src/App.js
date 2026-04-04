import React from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";

//import Dashboard from "./pages/Dashboard";
import Registrations from "./pages/Registrations";

import HeroEditor from "./pages/HeroEditor";
import AboutEditor from "./pages/AboutEditor";
import ServicesEditor from "./pages/ServicesEditor";
import TeamEditor from "./pages/TeamEditor";

import DynamicSectionsEditor from "./pages/DynamicSectionsEditor";
import ContactEditor from "./pages/ContactEditor";

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandDot" />
          <div>
            <div className="brandTitle">NSY Admin</div>
            {/* <div className="brandSub">Dashboard</div> */}
          </div>
        </div>

        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            {/* Dashboard */}
          </NavLink>

          <NavLink
            to="/registrations"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            Registrations
          </NavLink>

          <div className="navSectionTitle">CONTENT</div>

          <NavLink
            to="/hero"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            Hero Editor
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            About Editor
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            Services Editor
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            Team Editor
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            Contact Editor
          </NavLink>

          <NavLink
            to="/dynamic-sections"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            Dynamic Sections
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <small>API: /api</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbarTitle">Admin Panel</div>
        </header>

        <div className="page">
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/registrations" element={<Registrations />} />

            <Route path="/hero" element={<HeroEditor />} />
            <Route path="/about" element={<AboutEditor />} />
            <Route path="/services" element={<ServicesEditor />} />
            <Route path="/team" element={<TeamEditor />} />
            <Route path="/contact" element={<ContactEditor />} />

            <Route
              path="/dynamic-sections"
              element={<DynamicSectionsEditor />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
