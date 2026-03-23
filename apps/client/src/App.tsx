import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import RiskDashboardPage from '@/pages/RiskDashboardPage';
import UseCasesPage from '@/pages/UseCasesPage';

export default function App() {
    return (
        <QueryProvider>
            <SocketProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<DashboardLayout />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/risk" element={<RiskDashboardPage />} />
                            <Route path="/use-cases" element={<UseCasesPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SocketProvider>
        </QueryProvider>
    );
}
