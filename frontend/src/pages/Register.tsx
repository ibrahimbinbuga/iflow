import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', title: '', location: '', company: '', bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', formData);
      navigate('/login'); // Kayıt başarılıysa girişe yönlendir
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2 text-text-main font-bold text-3xl mb-2 transition-colors">
          <LayoutGrid className="text-primary w-8 h-8" />
          iFlow
        </div>
        <h2 className="mt-2 text-center text-xl tracking-tight font-medium text-text-muted transition-colors">
          Create your free workspace
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-border-main transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4">
          <form className="space-y-5" onSubmit={handleRegister}>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Full Name</label>
                <input required name="full_name" type="text" onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Email address</label>
                <input required name="email" type="email" onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none" placeholder="you@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Password</label>
                <input required name="password" type="password" onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none" placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Job Title</label>
                <input name="title" type="text" onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none" placeholder="e.g. Product Designer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Location</label>
                <input name="location" type="text" onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none" placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Company</label>
                <input name="company" type="text" onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none" placeholder="Company Name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Bio</label>
              <textarea name="bio" rows={2} onChange={handleChange} className="w-full bg-background border border-border-main rounded-lg px-4 py-2 text-sm text-text-main focus:border-primary focus:outline-none resize-none" placeholder="Tell us a bit about yourself..." />
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none transition-colors disabled:opacity-50 mt-4">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-blue-500">Sign in instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
}