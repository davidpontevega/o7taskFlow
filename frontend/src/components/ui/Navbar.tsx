import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const session  = useAuthStore(s => s.session);
  const logout   = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3
                       flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-white">⬡ O7TaskFlow</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400 text-sm">{session?.branchName}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white text-sm font-medium">{session?.fullName}</p>
          <p className="text-gray-500 text-xs">
            {session?.company} — {session?.branch}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center
                        justify-center text-white font-bold text-sm">
          {session?.fullName?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white border
                     border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
}