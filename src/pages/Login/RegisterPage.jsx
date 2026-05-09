import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Activity, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const { success, message } = await register(usuario, correo, clave);
    if (success) {
      alert('Registro exitoso. Ahora puede iniciar sesión.');
      navigate('/');
    } else {
      setError(message || 'Error al registrar.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 relative z-10">
        
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner mb-4 relative group">
              <div className="absolute inset-0 bg-teal-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <UserPlus className="w-8 h-8 text-teal-100 relative z-10" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight font-sans">Nova Salud</h1>
            <p className="text-teal-100/80 mt-2 text-sm font-medium tracking-wide">CREAR CUENTA ADMINISTRADOR</p>
          </div>

          {/* Form */}
          <form onSubmit={manejarEnvio} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-50 ml-1">Usuario</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ej. admin" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-teal-100/50 px-4 py-3 rounded-xl outline-none focus:bg-white/10 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/50 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-50 ml-1">Correo Electrónico (Opcional)</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Ej. admin@novasalud.com" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-teal-100/50 px-4 py-3 rounded-xl outline-none focus:bg-white/10 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-50 ml-1">Contraseña</label>
              <div className="relative group">
                <input 
                  type="password" 
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Cree una contraseña segura" 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-teal-100/50 px-4 py-3 rounded-xl outline-none focus:bg-white/10 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/50 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-lg flex items-center justify-center animate-pulse">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Registrar</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/" className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">
                ¿Ya tienes cuenta? Iniciar sesión
              </Link>
            </div>
          </form>

        </div>
        
        {/* Footer Text */}
        <p className="text-center text-teal-100/60 text-xs mt-8 tracking-wider font-medium">
          &copy; {new Date().getFullYear()} BOTICA NOVA SALUD. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
    </div>
  );
}
