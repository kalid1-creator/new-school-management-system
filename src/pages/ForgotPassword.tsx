import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, ArrowRight, AlertCircle, User, Shield } from 'lucide-react';
import { security } from '../lib/security';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Steps: 0 = Verify User & PIN, 1 = Reset Password
    const [step, setStep] = useState(0);

    // Step 0
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');

    // Step 1
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const [creds, devPinHash] = await Promise.all([
                security.getAdminCredentials(),
                security.getDeveloperPinHash()
            ]);

            if (!creds || !devPinHash) {
                setError('System configuration error');
                setLoading(false);
                return;
            }

            const validUser = await security.verify(username, creds.usernameHash);
            const validPin = await security.verify(pin, devPinHash);

            if (validUser && validPin) {
                setStep(1);
            } else {
                setError('Invalid Username or Developer PIN');
            }
        } catch (err) {
            setError('Verification failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPass !== confirmPass) {
            setError('Passwords do not match');
            return;
        }
        if (newPass.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const newPassHash = await security.hash(newPass);
            const userHash = await security.hash(username); // Re-hash verified username

            await security.setAdminCredentials(userHash, newPassHash);

            navigate('/login');
        } catch (err) {
            setError('Reset failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <KeyRound size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Recovery</h1>
                        <p className="text-sm text-gray-500">Reset Admin Password</p>
                    </div>
                </div>

                <div className="p-8">
                    {step === 0 ? (
                        <form onSubmit={handleVerify} className="space-y-5">
                            <div className="p-4 bg-orange-50 text-orange-800 rounded-xl text-sm flex gap-2">
                                <Shield size={18} className="shrink-0" />
                                <p>Enter your Admin Username and the Developer PIN to prove identity.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="admin"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Developer PIN
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-center tracking-widest"
                                        placeholder=""
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify Details'}
                                </button>
                                <Link to="/login" className="text-center text-sm text-gray-500 hover:text-gray-700">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={newPass}
                                        onChange={(e) => setNewPass(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Min 6 chars"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Repeat password"
                                        required
                                    />
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
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
