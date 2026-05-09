import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PackageSearch, Users, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalClientes: 0,
    totalVentas: 0,
    ingresosHoy: 0,
    productosBajoStock: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resMed, resCli, resVen] = await Promise.all([
          api.get('/medicamentos'),
          api.get('/clientes'),
          api.get('/ventas')
        ]);

        const medicamentos = resMed.data;
        const clientes = resCli.data;
        const ventas = resVen.data;

        // Calculate today's income
        const hoy = new Date().toISOString().slice(0, 10);
        const ventasHoy = ventas.filter(v => v.fecha && v.fecha.startsWith(hoy));
        const ingresos = ventasHoy.reduce((sum, v) => sum + parseFloat(v.total), 0);

        // Low stock products (less than 10)
        const bajoStock = medicamentos.filter(m => m.stock < 10).length;

        setStats({
          totalProductos: medicamentos.length,
          totalClientes: clientes.length,
          totalVentas: ventas.length,
          ingresosHoy: ingresos,
          productosBajoStock: bajoStock
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Ventas Totales",
      value: stats.totalVentas,
      icon: Receipt,
      color: "from-blue-500 to-cyan-400",
      textColor: "text-blue-50"
    },
    {
      title: "Ingresos de Hoy",
      value: `S/. ${stats.ingresosHoy.toFixed(2)}`,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-400",
      textColor: "text-emerald-50"
    },
    {
      title: "Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "from-indigo-500 to-purple-400",
      textColor: "text-indigo-50"
    },
    {
      title: "Productos",
      value: stats.totalProductos,
      icon: PackageSearch,
      color: "from-orange-500 to-amber-400",
      textColor: "text-orange-50"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Hola, <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">{user?.nombre || 'Usuario'}</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Bienvenido al panel de administración de Nova Salud.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 animate-pulse text-lg">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className={`rounded-2xl p-6 bg-gradient-to-br ${card.color} shadow-lg relative overflow-hidden group`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-medium ${card.textColor} opacity-80 mb-1`}>{card.title}</p>
                      <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl shadow-inner backdrop-blur-sm">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Panel de Gráficos</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Próximamente: Integración de gráficos de barras y líneas para el análisis detallado de ventas mensuales.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas de Stock
              </h3>
              
              {stats.productosBajoStock > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <PackageSearch className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800">Atención</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Hay <strong>{stats.productosBajoStock}</strong> productos con stock menor a 10 unidades. Se recomienda reabastecer pronto.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <PackageSearch className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800">Todo en orden</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      El inventario cuenta con stock suficiente. No hay productos críticos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}