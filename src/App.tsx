import React, { useState, useEffect, useCallback } from 'react';
import Overview from './components/Overview';
import DetailedView from './components/DetailedView';
import { financialApi } from './api/financialApi';
import { FinancialData, Filters } from './types/financial';
import LoadingSpinner from './components/LoadingSpinner';
import { placeholderData } from './mockData';

const App: React.FC = () => {
    const [user, setUser] = useState<'barbara' | 'cfo'>('barbara');
    const [screen, setScreen] = useState<'overview' | 'details'>('overview');
    const [filters, setFilters] = useState<Filters>({
        name: '',
        minAmount: '',
        maxAmount: '',
        minDays: '',
        maxDays: ''
    });
    const [financialData, setFinancialData] = useState<FinancialData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshPending, setIsRefreshPending] = useState<boolean>(false);

 const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            if (process.env.NODE_ENV === 'development') {
                const data = await financialApi.getFinancialData();
                setFinancialData(data);
            } else {
                // In production, use placeholder data for now
                setFinancialData(placeholderData);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            // In production, fallback to placeholder data on error
            if (process.env.NODE_ENV === 'production') {
                setFinancialData(placeholderData);
                setError('Dati temporaneamente non disponibili. Visualizzazione dati di esempio.');
            } else {
                setError('Failed to fetch data: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle refresh after upload
    useEffect(() => {
        let refreshTimer: NodeJS.Timeout;
        if (isRefreshPending) {
            refreshTimer = setTimeout(() => {
                fetchData();
                setIsRefreshPending(false);
            }, 5000); // 5 second delay
        }
        return () => {
            if (refreshTimer) {
                clearTimeout(refreshTimer);
            }
        };
    }, [isRefreshPending, fetchData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleUploadSuccess = useCallback(() => {
        setIsRefreshPending(true);
    }, []);

    if (loading && !isRefreshPending) return <LoadingSpinner />;
    if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
    if (!financialData) return <div className="text-center p-6">No data available</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
		 {process.env.NODE_ENV === 'production' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-sm text-blue-700">
                    Applicazione in fase di sviluppo. I dati visualizzati sono di esempio.
                </p>
            </div>
        )}	
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Riconciliazione Finanziaria</h1>
                <select 
                    className="p-2 border rounded"
                    value={user}
                    onChange={(e) => setUser(e.target.value as 'barbara' | 'cfo')}
                >
                    <option value="barbara">Barbara</option>
                    <option value="cfo">CFO</option>
                </select>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    className={`px-4 py-2 rounded ${
                        screen === 'overview' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200'
                    }`}
                    onClick={() => setScreen('overview')}
                >
                    Panoramica
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        screen === 'details' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200'
                    }`}
                    onClick={() => setScreen('details')}
                >
                    Dettagli
                </button>
            </div>

            {screen === 'overview' ? (
                <Overview 
                    user={user}
                    data={financialData}
                    loading={loading && !isRefreshPending}
                    error={error}
                    onUploadSuccess={handleUploadSuccess}
                />
            ) : (
                <DetailedView 
                    user={user}
                    data={financialData}
                    loading={loading && !isRefreshPending}
                    error={error}
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                />
            )}
        </div>
    );
};

export default App;