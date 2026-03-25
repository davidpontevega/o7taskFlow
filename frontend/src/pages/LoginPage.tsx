import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { Company, Branch } from '../types';

export default function LoginPage() {
  const [user,      setUser]      = useState('');
  const [password,  setPassword]  = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches,  setBranches]  = useState<Branch[]>([]);
  const [company,   setCompany]   = useState('');
  const [branch,    setBranch]    = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState<'credentials'|'company'|'branch'>('credentials');

  const setSession = useAuthStore(s => s.setSession);
  const navigate   = useNavigate();

  const handleLoadCompanies = async () => {
    if (!user || !password) return;
    setLoading(true); setError('');
    try {
      const data = await authApi.getCompanies(user, password);
      if (data.length === 0) {
        setError('Usuario o contraseña incorrectos');
        return;
      }
      setCompanies(data);
      setStep('company');
    } catch {
      setError('Error al conectar con el servidor');
    } finally { setLoading(false); }
  };

  const handleSelectCompany = async (code: string) => {
    setCompany(code);
    setLoading(true);
    try {
      const data = await authApi.getBranches(user, password);
      const filtered = data.filter(b => b.code.startsWith(code));
      setBranches(filtered);
      setStep('branch');
    } catch {
      setError('Error al cargar sucursales');
    } finally { setLoading(false); }
  };

  const handleLogin = async (branchCode: string) => {
    setBranch(branchCode);
    setLoading(true); setError('');
    try {
      const session = await authApi.login(user, password, company, branchCode);
      setSession(session);
      navigate('/dashboard');
    } catch {
      setError('Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">
            ⬡ O7TaskFlow
          </h1>
          <p className="text-gray-400 text-sm">
            Sistema de Gestión de Tareas
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8
                        shadow-2xl">

          {/* PASO 1 — Credenciales */}
          {step === 'credentials' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-6">
                Iniciar Sesión
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-2">
                  Usuario
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-4 py-3 text-white text-sm
                             focus:outline-none focus:border-indigo-500
                             transition-colors"
                  placeholder="Tu usuario"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLoadCompanies()}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-4 py-3 text-white text-sm
                             focus:outline-none focus:border-indigo-500
                             transition-colors"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLoadCompanies()}
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm bg-red-950 border
                              border-red-800 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
              <button
                onClick={handleLoadCompanies}
                disabled={loading || !user || !password}
                className="w-full bg-indigo-600 hover:bg-indigo-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white font-semibold rounded-lg py-3
                           transition-colors mt-2"
              >
                {loading ? 'Verificando...' : 'Continuar →'}
              </button>
            </div>
          )}

          {/* PASO 2 — Seleccionar Empresa */}
          {step === 'company' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep('credentials')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold text-white">
                  Selecciona Empresa
                </h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Bienvenido <span className="text-white font-medium">{user}</span>,
                selecciona tu empresa:
              </p>
              {companies.map(c => (
                <button
                  key={c.code}
                  onClick={() => handleSelectCompany(c.code)}
                  disabled={loading}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700
                             border border-gray-700 hover:border-indigo-500
                             rounded-lg px-4 py-3 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{c.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Código: {c.code}
                      </p>
                    </div>
                    <span className="text-gray-600 group-hover:text-indigo-400
                                     transition-colors">→</span>
                  </div>
                </button>
              ))}
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>
          )}

          {/* PASO 3 — Seleccionar Sucursal */}
          {step === 'branch' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep('company')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold text-white">
                  Selecciona Sucursal
                </h2>
              </div>
              {branches.map(b => (
                <button
                  key={b.code}
                  onClick={() => handleLogin(b.code)}
                  disabled={loading}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700
                             border border-gray-700 hover:border-indigo-500
                             rounded-lg px-4 py-3 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{b.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Código: {b.code}
                      </p>
                    </div>
                    <span className="text-gray-600 group-hover:text-indigo-400
                                     transition-colors">
                      {loading ? '...' : '→'}
                    </span>
                  </div>
                </button>
              ))}
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}