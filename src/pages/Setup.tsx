import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { security, DEFAULT_DEV_PIN } from '../lib/security';
import { useAuth } from '../context/AuthContext';

export default function Setup() {
    const navigate = useNavigate();
    const { trustCurrentDevice, isDeviceTrusted, isSetupComplete } = useAuth();

    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If device is already trusted, redirect
        if (isDeviceTrusted) {
            if (isSetupComplete) {
                navigate('/login');
            } else {
                navigate('/register'); // Or handle initial admin creation if not implicit
            }
        }
    }, [isDeviceTrusted, isSetupComplete, navigate]);

    const initializeDefaultPin = async () => {
        // Check if dev pin hash exists, if not set default
        const currentPin = await security.getDeveloperPinHash();
        if (!currentPin) {
            const hash = await security.hash(DEFAULT_DEV_PIN);
            await security.setDeveloperPin(hash);
        }
    };

    useEffect(() => {
        initializeDefaultPin();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const storedHash = await security.getDeveloperPinHash();
            if (!storedHash) {
                // Safety fallback
                await initializeDefaultPin();
            }

            // Re-fetch in case it was just set
            const currentHash = await security.getDeveloperPinHash() || '';
            const isValid = await security.verify(pin, currentHash);

            if (isValid) {
                await trustCurrentDevice();
                // Navigation handled by useEffect
            } else {
                setError('Invalid Developer PIN');
            }
        } catch (err) {
            setError('Verification failed');
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
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Device Setup</h1>
                        <p className="text-sm text-gray-500">Developer Verification Required</p>
                    </div>
                </div>

                <div className="p-8">

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Developer PIN
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono tracking-widest text-center text-lg"
                                    placeholder=""
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !pin}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? 'Verifying...' : 'Authorize Device'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
