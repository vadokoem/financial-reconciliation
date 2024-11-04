import React, { useState, useCallback, useMemo } from 'react';
import FileUpload from './FileUpload';
import { 
    FinancialData, 
    UnpaidClient, 
    ClientStatus, 
    ClientType,
    ClientPriority,
    TransactionType,  
    MonthType,
    CashDeficitEntry  	
} from '../types/financial';
import LoadingSpinner from './LoadingSpinner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import CashDeficitTables from './CashDeficitTables';

interface UploadSummaryProps {
    fileName: string;
    onComplete: () => void;
}

const UploadSummary: React.FC<UploadSummaryProps> = ({ fileName, onComplete }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Upload Successful</h4>
                    <p className="text-sm text-green-600">{fileName} has been uploaded</p>
                </div>
            </div>
            <div className="text-sm text-green-600">
                Refreshing in 5s...
            </div>
        </div>
    );
};

interface OverviewProps {
    user: 'barbara' | 'cfo';
    data: FinancialData | null;
    loading: boolean;
    error: string | null;
    onUploadSuccess: () => void;
}

const StatusBadge: React.FC<{ status: ClientStatus }> = ({ status }) => (
    <span className={`ml-2 px-2 py-1 rounded text-xs ${
        status === ClientStatus.Critico 
            ? 'bg-red-100 text-red-800' 
            : 'bg-yellow-100 text-yellow-800'
    }`}>
        {status}
    </span>
);

interface SortConfig {
    key: keyof UnpaidClient;
    direction: 'asc' | 'desc';
}

interface FilterConfig {
    name: string;
    type: ClientType | '';
    status: ClientStatus | '';
    priority: ClientPriority | '';
}

const FilterBar: React.FC<{
    filters: FilterConfig;
    onFilterChange: (filters: FilterConfig) => void;
}> = ({ filters, onFilterChange }) => (
    <div className="flex gap-4 mb-4">
        <Input
            placeholder="Ricerca per nome..."
            value={filters.name}
            onChange={(e) => onFilterChange({ ...filters, name: e.target.value })}
            className="max-w-xs"
        />
        <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value as ClientType })}
            className="border rounded-md px-2 py-1"
        >
            <option value="">Tutti i tipi</option>
            {Object.values(ClientType).map(type => (
                <option key={type} value={type}>{type}</option>
            ))}
        </select>
        <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as ClientStatus })}
            className="border rounded-md px-2 py-1"
        >
            <option value="">Tutti i Status</option>
            {Object.values(ClientStatus).map(status => (
                <option key={status} value={status}>{status}</option>
            ))}
        </select>
        <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as ClientPriority })}
            className="border rounded-md px-2 py-1"
        >
            <option value="">Tutte le priorità</option>
            {Object.values(ClientPriority).map(priority => (
                <option key={priority} value={priority}>{priority}</option>
            ))}
        </select>
    </div>
);

const ClientItem: React.FC<{ client: UnpaidClient }> = ({ client }) => (
    <li className={`flex justify-between items-center p-2 rounded
        ${client.type === ClientType.Fiscale ? 
            'bg-yellow-50 high-priority' : 
            'hover:bg-gray-50'}`}
    >
        <div className="flex items-center space-x-2">
            <span className="font-medium">{client.name}</span>
            <StatusBadge status={client.status} />
            {client.priority === ClientPriority.Alta && (
                <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                    Alta Priorità
                </span>
            )}
            <span className="text-sm text-gray-500">{client.type}</span>
        </div>
        <span className="font-bold text-red-500">
            €{Math.abs(client.amount).toLocaleString()}
        </span>
    </li>
);

interface CashDeficitSortConfig {
    key: keyof CashDeficitEntry;
    direction: 'asc' | 'desc';
}


const Overview: React.FC<OverviewProps> = ({ 
    user, 
    data, 
    loading, 
    error, 
    onUploadSuccess 
}) => {
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ 
        key: 'amount', 
        direction: 'desc' 
    });
	const [cashDeficitSortConfig, setCashDeficitSortConfig] = useState<CashDeficitSortConfig>({ 
        key: 'amount', 
        direction: 'desc' 
    });	
    const [filters, setFilters] = useState<FilterConfig>({
        name: '',
        type: '',
        status: '',
        priority: ''
    });

    const handleUploadSuccess = useCallback((fileName: string) => {
        setUploadedFile(fileName);
    }, []);

    const handleSummaryComplete = useCallback(() => {
        setUploadedFile(null);
        onUploadSuccess();
    }, [onUploadSuccess]);

    const sortedAndFilteredClients = useMemo(() => {
        if (!data?.unpaidClients) return [];

        return data.unpaidClients
            .filter(client => {
                const nameMatch = client.name.toLowerCase().includes(filters.name.toLowerCase());
                const typeMatch = !filters.type || client.type === filters.type;
                const statusMatch = !filters.status || client.status === filters.status;
                const priorityMatch = !filters.priority || client.priority === filters.priority;
                return nameMatch && typeMatch && statusMatch && priorityMatch;
            })
            .sort((a, b) => {
                const factor = sortConfig.direction === 'asc' ? 1 : -1;
                
                if (sortConfig.key === 'amount') {
                    return (a.amount - b.amount) * factor;
                }
                
                return String(a[sortConfig.key])
                    .localeCompare(String(b[sortConfig.key])) * factor;
            });
    }, [data?.unpaidClients, sortConfig, filters]);
	
	if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return <div>No data available</div>;
	
	
	const renderFinancialSummary = () => {
    if (!data) return null;  // Add early return if data is null
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="font-medium">Totale Insoluti:</span>
                <span className="font-bold text-red-500">
                    €{Math.abs(data.totalUnpaid).toLocaleString()}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-medium">Previsione Prossimo Mese:</span>
                <span className={`font-bold ${
                    data.nextMonthForecast >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                    €{data.nextMonthForecast.toLocaleString()}
                </span>
            </div>
        </div>
    );
};

    const handleSort = (key: keyof UnpaidClient) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
	
	const handleCashDeficitSort = (key: keyof CashDeficitEntry) => {
        setCashDeficitSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderUnpaidList = () => (
        <div>
            <div className="mb-4">
                <FilterBar filters={filters} onFilterChange={setFilters} />
            </div>
            <div className="flex justify-between mb-2">
                <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="flex items-center"
                >
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={() => handleSort('amount')}
                    className="flex items-center"
                >
                    Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <ul className="space-y-3">
                {sortedAndFilteredClients.map(client => (
                    <ClientItem key={client.name} client={client} />
                ))}
            </ul>
        </div>
    );

return (
    <div className="space-y-6">
      {user === 'barbara' && process.env.NODE_ENV === 'development' && (
    <>
        {uploadedFile ? (
            <UploadSummary 
                fileName={uploadedFile}
                onComplete={handleSummaryComplete}
            />
        ) : (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
        )}
    </>
)}

{user === 'barbara' && process.env.NODE_ENV === 'production' && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
            La funzionalità di upload sarà disponibile a breve.
        </p>
    </div>
)}

        {data && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4">Deficit Mese Corrente</h3>
                        <p className="text-3xl font-bold text-red-500">
                            €{Math.abs(data.currentDeficit).toLocaleString()}
                        </p>
                        <h3 className="text-lg font-bold mb-4 mt-4">Saldo Bank Mese Corrente</h3>
                        <p className="text-3xl font-bold text-blue-500">
                            €{data.currentSaldoBank.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4">
                            {user === 'cfo' 
                                ? 'Riepilogo Finanziario' 
                                : 'Clienti, Fiscale, Fornitori Insoluti'
                            }
                        </h3>
                        {user === 'cfo' ? renderFinancialSummary() : renderUnpaidList()}
                    </div>
                </div>

                {user === 'barbara' && (
                    <CashDeficitTables 
                    entrate={data.cashDeficit.entrate}
                    uscite={data.cashDeficit.uscite}
                    monthlyTotals={data.monthlyTotals}
                    onSort={handleCashDeficitSort}
                    sortConfig={cashDeficitSortConfig}
                    />
                )}
            </>
        )}
    </div>
);
};

export default Overview;