import React, { useMemo, useState } from 'react';
import { FinancialData, Filters, UnpaidClient, ClientStatus, ClientType } from '../types/financial';
import FinancialForecast from './FinancialForecast';
import LoadingSpinner from './LoadingSpinner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface SortConfig {
    key: keyof UnpaidClient;
    direction: 'asc' | 'desc';
}

interface EnhancedFilters extends Filters {
    status: ClientStatus | '';
    type: ClientType | '';
}

interface DetailedViewProps {
    user: string;
    data: FinancialData | null;
    loading: boolean;
    error: string | null;
    filters: Filters;
    handleFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FilterBar: React.FC<{
    filters: EnhancedFilters;
    onFilterChange: (filters: EnhancedFilters) => void;
}> = ({ filters, onFilterChange }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => onFilterChange({ ...filters, name: e.target.value })}
                className="w-full"
            />
            <select
                value={filters.type}
                onChange={(e) => onFilterChange({ ...filters, type: e.target.value as ClientType })}
                className="border rounded-md px-2 py-1"
            >
                <option value="">All Types</option>
                {Object.values(ClientType).map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <select
                value={filters.status}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value as ClientStatus })}
                className="border rounded-md px-2 py-1"
            >
                <option value="">All Status</option>
                {Object.values(ClientStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4">
                <Input
                    type="number"
                    placeholder="Min Amount"
                    value={filters.minAmount}
                    onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
                    className="w-full"
                />
                <Input
                    type="number"
                    placeholder="Max Amount"
                    value={filters.maxAmount}
                    onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value })}
                    className="w-full"
                />
            </div>
            <div className="flex gap-4">
                <Input
                    type="number"
                    placeholder="Min Days"
                    value={filters.minDays}
                    onChange={(e) => onFilterChange({ ...filters, minDays: e.target.value })}
                    className="w-full"
                />
                <Input
                    type="number"
                    placeholder="Max Days"
                    value={filters.maxDays}
                    onChange={(e) => onFilterChange({ ...filters, maxDays: e.target.value })}
                    className="w-full"
                />
            </div>
        </div>
    </div>
);

const DetailedView: React.FC<DetailedViewProps> = ({
    user,
    data,
    loading,
    error,
    filters: initialFilters,
    handleFilterChange
}) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ 
        key: 'amount', 
        direction: 'desc' 
    });
    
    const [enhancedFilters, setEnhancedFilters] = useState<EnhancedFilters>({
        ...initialFilters,
        status: '',
        type: ''
    });

    const filteredAndSortedClients = useMemo(() => {
        if (!data) return [];
        
        const filtered = data.unpaidClients.filter(client => {
            const matchesName = client.name.toLowerCase()
                .includes(enhancedFilters.name.toLowerCase());
            
            const matchesMinAmount = !enhancedFilters.minAmount || 
                Math.abs(client.amount) >= parseFloat(enhancedFilters.minAmount);
            
            const matchesMaxAmount = !enhancedFilters.maxAmount || 
                Math.abs(client.amount) <= parseFloat(enhancedFilters.maxAmount);
            
            const matchesMinDays = !enhancedFilters.minDays || 
                client.daysOverdue >= parseInt(enhancedFilters.minDays);
            
            const matchesMaxDays = !enhancedFilters.maxDays || 
                client.daysOverdue <= parseInt(enhancedFilters.maxDays);

            const matchesStatus = !enhancedFilters.status || 
                client.status === enhancedFilters.status;

            const matchesType = !enhancedFilters.type || 
                client.type === enhancedFilters.type;
            
            return matchesName && matchesMinAmount && matchesMaxAmount && 
                   matchesMinDays && matchesMaxDays && matchesStatus && matchesType;
        });

        return filtered.sort((a, b) => {
            const factor = sortConfig.direction === 'asc' ? 1 : -1;
            
            if (sortConfig.key === 'amount') {
                return (a.amount - b.amount) * factor;
            }
            if (sortConfig.key === 'daysOverdue') {
                return (a.daysOverdue - b.daysOverdue) * factor;
            }
            
            return String(a[sortConfig.key])
                .localeCompare(String(b[sortConfig.key])) * factor;
        });
    }, [data, enhancedFilters, sortConfig]);

    const handleSort = (key: keyof UnpaidClient) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <div className="space-y-6">
            {user === 'barbara' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Filtri</h3>
                    <FilterBar 
                        filters={enhancedFilters} 
                        onFilterChange={setEnhancedFilters} 
                    />
                </div>
            )}
            
            {user === 'cfo' && <FinancialForecast data={data} />}

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">
                    Analisi Dettagliata 
                    {filteredAndSortedClients.length !== data.unpaidClients.length && 
                        ` (${filteredAndSortedClients.length} di ${data.unpaidClients.length})`}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="pb-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleSort('name')}
                                        className="flex items-center"
                                    >
                                        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </th>
                                <th className="pb-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleSort('amount')}
                                        className="flex items-center"
                                    >
                                        Importo <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </th>
                                <th className="pb-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleSort('daysOverdue')}
                                        className="flex items-center"
                                    >
                                        Giorni Scaduti <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </th>
                                <th className="pb-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleSort('status')}
                                        className="flex items-center"
                                    >
                                        Stato <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </th>
                                <th className="pb-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleSort('type')}
                                        className="flex items-center"
                                    >
                                        Tipo <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedClients.map(client => (
                                <tr 
                                    key={client.name} 
                                    className={`border-b ${
                                        client.type === 'Fiscale' ? 'bg-yellow-50' : ''
                                    }`}
                                >
                                    <td className="py-2">{client.name}</td>
                                    <td className="py-2 text-red-500">
                                        €{Math.abs(client.amount).toLocaleString()}
                                    </td>
                                    <td className="py-2">{client.daysOverdue} giorni</td>
                                    <td className="py-2">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            client.status === 'Critico' 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            client.type === 'Fiscale'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {client.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t">
                            <tr>
                                <td colSpan={2} className="py-2 font-bold text-red-500">
                                    Totale: €{filteredAndSortedClients
                                        .reduce((sum, client) => sum + Math.abs(client.amount), 0)
                                        .toLocaleString()}
                                </td>
                                <td colSpan={3} className="py-2 text-right">
                                    {filteredAndSortedClients.length} clienti fornitori fiscale
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailedView;