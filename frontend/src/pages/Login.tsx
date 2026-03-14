import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', {
        email,
        password
      });

      // Gelen token'ı ve kullanıcı bilgilerini tarayıcıya kaydet
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      onLoginSuccess(); // App.tsx'e giriş yapıldığını bildir
      navigate('/'); // Board'a yönlendir
    } catch (err: any) {
      setError(err.response?.data?.error || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2 text-text-main font-bold text-3xl mb-2 transition-colors">
          <LayoutGrid className="text-primary w-8 h-8" />
          iFlow
        </div>
        <h2 className="mt-2 text-center text-xl tracking-tight font-medium text-text-muted transition-colors">
          Sign in to your workspace
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-border-main transition-colors duration-300 animate-in fade-in zoom-in-95">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-main transition-colors">Email address</label>
              <div className="mt-2">
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main transition-colors">Password</label>
              <div className="mt-2">
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none transition-colors disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted transition-colors">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-blue-500 transition-colors">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}