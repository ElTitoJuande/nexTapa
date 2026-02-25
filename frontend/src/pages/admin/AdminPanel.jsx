// AdminPanel.jsx

import { NavLink, Outlet } from 'react-router-dom';
import './styles/admin.css';

export const AdminPanel = () => {
   return (
      <div className="admin-layout">
      
         {/* Sidebar */}
         <aside className="admin-sidebar">
            <h1>⚙️ Panel de Administración</h1>
            <nav>
               <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => isActive ? 'active' : ''}
               >
                  Dashboard
               </NavLink>
               <NavLink
                  to="/admin/establishments"
                  className={({ isActive }) => isActive ? 'active' : ''}
               >
                  Establishments
               </NavLink>
            </nav>
         </aside>

         {/* Main content */}
         <main className="admin-main">
            <Outlet />
         </main>

      </div>
   );
};