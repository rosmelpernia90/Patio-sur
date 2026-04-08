import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { loginAPI } from '../services/api/auth';
import clsx from 'clsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAPI(email, password);
      login(response.access_token, response.user);
      navigate('/projects', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(
        axiosErr.response?.data?.detail ||
        axiosErr.message ||
        'Error de conexion. Verifique que el servidor esta activo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/images/pcmejia-logo.png"
              alt="PC Mejía Ingeniería"
              className="h-20 w-auto drop-shadow-lg"
            />
          </div>
          <p className="text-primary-300 text-sm mt-1">Gestion de Proyectos — Obra Electrica</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-steel-900">Iniciar Sesion</h2>
            <p className="text-xs text-steel-400 mt-1">Ingrese sus credenciales para acceder al sistema</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-steel-600 mb-1.5">
                Correo Electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@pcmejia.com"
                required
                autoFocus
                className="w-full rounded-xl border border-steel-300 px-4 py-2.5 text-sm text-steel-800 placeholder:text-steel-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-steel-600 mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-steel-300 px-4 py-2.5 pr-10 text-sm text-steel-800 placeholder:text-steel-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-600 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow-lg shadow-primary-600/25',
                loading
                  ? 'bg-primary-400 cursor-wait'
                  : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-steel-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] text-steel-400 uppercase tracking-wider">Usuarios de prueba</span>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { email: 'gerente@pcmejia.com', pwd: 'PcMejia2025*', role: 'Gerente', color: 'bg-primary-50 border-primary-200 text-primary-700' },
              { email: 'controller@pcmejia.com', pwd: 'Controller2025*', role: 'Controller', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { email: 'ingeniero@pcmejia.com', pwd: 'Ingeniero2025*', role: 'Ingeniero', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { email: 'viewer@pcmejia.com', pwd: 'Viewer2025*', role: 'Viewer', color: 'bg-steel-50 border-steel-200 text-steel-600' },
            ].map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => {
                  setEmail(demo.email);
                  setPassword(demo.pwd);
                  setError('');
                }}
                className={clsx(
                  'rounded-lg border px-3 py-2 text-[10px] font-semibold transition hover:opacity-80',
                  demo.color
                )}
              >
                {demo.role}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-primary-400 mt-6">
          PC Mejia Ingenieria S.A. — Sistema de Gestion de Proyectos v1.0
        </p>
      </div>
    </div>
  );
}
