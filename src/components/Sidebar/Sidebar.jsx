import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, ShoppingCart, Receipt, PackageSearch, Users, UserCog, LogOut, Pill } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Nueva Venta", path: "/nueva-venta", icon: ShoppingCart },
  { name: "Comprobantes", path: "/comprobantes", icon: Receipt },
  { name: "Productos", path: "/productos", icon: PackageSearch },
  { name: "Clientes", path: "/clientes", icon: Users },
  { name: "Usuarios", path: "/usuarios", icon: UserCog },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-72 bg-slate-900 text-white h-screen flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      
      {/* Header */}
      <div className="p-8 pb-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-500 p-2 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.5)]">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">Nova Salud</h1>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider pl-12">Sistema Administrativo</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto relative z-10 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group relative ${
                  isActive
                    ? "bg-teal-500/10 text-teal-400 shadow-[inset_4px_0_0_rgba(20,184,166,1)]"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User info and Logout */}
      <div className="p-4 border-t border-slate-800 relative z-10 bg-slate-900/50 backdrop-blur-sm">
        {user && (
          <div className="px-4 py-3 mb-2 bg-slate-800/50 rounded-xl">
            <p className="text-sm font-medium text-slate-200 truncate">{user.nombre}</p>
            <p className="text-xs text-slate-500 truncate">{user.cargo_nombre || 'Administrador'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-300 font-medium group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
