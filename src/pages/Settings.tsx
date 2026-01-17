import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Settings as SettingsIcon, User, Mail, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
    const { user } = useAuth();
    const { showSuccess } = useNotification();

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            showSuccess('Password reset email sent!');
        } catch (error: any) {
            console.error('Failed to send reset email', error);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <SettingsIcon /> Settings
            </h1>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Account Information</h2>
                        <p className="text-sm text-gray-500">Manage your profile and security</p>
                    </div>
                </div>
                <div className="p-8">
                    <div className="max-w-2xl space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Mail className="text-gray-400" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                                <p className="text-gray-700 font-medium">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <ShieldCheck className="text-green-500" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Auth Provider</p>
                                <p className="text-gray-700 font-medium capitalize">
                                    {user?.providerData[0]?.providerId.replace('.com', '') || 'Password'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Key size={18} /> Password & Security
                            </h3>
                            <p className="text-sm text-gray-500">
                                Need to change your password? We'll send a secure link to your registered email address.
                            </p>
                            <button
                                onClick={handlePasswordReset}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-200"
                            >
                                Send Password Reset Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
