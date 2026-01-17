import { useState } from 'react';
import { Settings as SettingsIcon, Shield, User, Save, AlertCircle } from 'lucide-react';
import { security } from '../lib/security';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
    const { showSuccess } = useNotification();
    // Two forms: Admin Credentials, Developer PIN

    // Admin Creds State
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmNewPass, setConfirmNewPass] = useState('');
    const [username, setUsername] = useState(''); // Allow changing username too? Requirement says "Change Username"
    const [adminMsg, setAdminMsg] = useState({ type: '', text: '' });

    // PIN State
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinMsg, setPinMsg] = useState({ type: '', text: '' });

    const handleAdminUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdminMsg({ type: '', text: '' });

        if (newPass !== confirmNewPass) {
            setAdminMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            const creds = await security.getAdminCredentials();
            if (!creds) return;

            // Verify old pass
            const validOld = await security.verify(oldPass, creds.passwordHash);
            if (!validOld) {
                setAdminMsg({ type: 'error', text: 'Incorrect current password' });
                return;
            }

            // Update
            const pHash = await security.hash(newPass);
            // If username provided, hash it, else keep old
            let uHash = creds.usernameHash;
            if (username.trim()) {
                uHash = await security.hash(username);
            }

            await security.setAdminCredentials(uHash, pHash);
            showSuccess('Admin credentials updated successfully');
            setOldPass('');
            setNewPass('');
            setConfirmNewPass('');
            setUsername('');
        } catch (err) {
            setAdminMsg({ type: 'error', text: 'Update failed' });
        }
    };

    const handlePinUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinMsg({ type: '', text: '' });

        if (newPin !== confirmNewPin) {
            setPinMsg({ type: 'error', text: 'New PINs do not match' });
            return;
        }
        if (newPin.length < 4) {
            setPinMsg({ type: 'error', text: 'PIN too short' });
            return;
        }

        try {
            const currentHash = await security.getDeveloperPinHash();
            if (!currentHash) return;

            // Verify old PIN
            const validOld = await security.verify(oldPin, currentHash);
            if (!validOld) {
                setPinMsg({ type: 'error', text: 'Incorrect current PIN' });
                return;
            }

            // Update
            const newHash = await security.hash(newPin);
            await security.setDeveloperPin(newHash);
            showSuccess('Developer PIN updated successfully');
            setOldPin('');
            setNewPin('');
            setConfirmNewPin('');
        } catch (err) {
            setPinMsg({ type: 'error', text: 'Update failed' });
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <SettingsIcon /> Settings
            </h1>

            {/* Admin Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Admin Account</h2>
                        <p className="text-sm text-gray-500">Manage login credentials</p>
                    </div>
                </div>
                <div className="p-8">
                    <form onSubmit={handleAdminUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700">Change Credentials</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Username (Optional)</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Leave blank to keep current" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                                <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                                <input type="password" value={confirmNewPass} onChange={e => setConfirmNewPass(e.target.value)} className="w-full p-2 border rounded-lg" required />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            {adminMsg.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${adminMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    <AlertCircle size={16} /> {adminMsg.text}
                                </div>
                            )}
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                <Save size={18} /> Update Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Developer PIN Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Developer Security</h2>
                        <p className="text-sm text-gray-500">Manage device access PIN</p>
                    </div>
                </div>
                <div className="p-8">
                    <form onSubmit={handlePinUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700">Change PIN</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current PIN *</label>
                                <input type="password" value={oldPin} onChange={e => setOldPin(e.target.value)} className="w-full p-2 border rounded-lg font-mono" placeholder="" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New PIN *</label>
                                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full p-2 border rounded-lg font-mono" placeholder="" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New PIN *</label>
                                <input type="password" value={confirmNewPin} onChange={e => setConfirmNewPin(e.target.value)} className="w-full p-2 border rounded-lg font-mono" placeholder="" required />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            {pinMsg.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${pinMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    <AlertCircle size={16} /> {pinMsg.text}
                                </div>
                            )}
                            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                <Save size={18} /> Update PIN
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
