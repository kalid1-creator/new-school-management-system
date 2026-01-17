
// Using Web Crypto API for secure hashing
export const security = {
    // Hash a string using SHA-256
    async hash(text: string): Promise<string> {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    // Verify if candidate string matches hash
    async verify(candidate: string, hash: string): Promise<boolean> {
        const candidateHash = await this.hash(candidate);
        return candidateHash === hash;
    },

    // Developer PIN Management
    async getDeveloperPinHash(): Promise<string | null> {
        return localStorage.getItem('developer_pin_hash');
    },

    async setDeveloperPin(hash: string): Promise<void> {
        localStorage.setItem('developer_pin_hash', hash);
    },

    async isDeviceTrusted(): Promise<boolean> {
        return localStorage.getItem('device_trusted') === 'true';
    },

    async trustDevice(): Promise<void> {
        localStorage.setItem('device_trusted', 'true');
    },

    // Admin Credential Management
    async getAdminCredentials(): Promise<{ usernameHash: string, passwordHash: string } | null> {
        const u = localStorage.getItem('admin_username_hash');
        const p = localStorage.getItem('admin_password_hash');
        if (u && p) return { usernameHash: u, passwordHash: p };
        return null;
    },

    async setAdminCredentials(usernameHash: string, passwordHash: string): Promise<void> {
        localStorage.setItem('admin_username_hash', usernameHash);
        localStorage.setItem('admin_password_hash', passwordHash);
    }
};

export const DEFAULT_DEV_PIN = '3759';
