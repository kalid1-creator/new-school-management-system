import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, ArrowRight, AlertCircle, User } from 'lucide-react';
import { security } from '../lib/security';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const creds = await security.getAdminCredentials();
            if (!creds) {
                // If somehow we're here without creds, redirect to register
                navigate('/register');
                return;
            }

            const validUser = await security.verify(username, creds.usernameHash);
            const validPass = await security.verify(password, creds.passwordHash);

            if (validUser && validPass) {
                login();
                navigate('/');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Login failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <LogIn size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
                        <p className="text-sm text-gray-500">Welcome back</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
