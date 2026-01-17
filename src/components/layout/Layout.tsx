import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <TopBar />
                <main className="p-8 pt-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
