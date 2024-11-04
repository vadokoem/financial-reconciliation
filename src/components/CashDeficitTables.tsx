import React from 'react';
import { 
    CashDeficitEntry, 
    TransactionType, 
    MonthType 
} from '../types/financial';
import { Button } from './ui/button';
import { ArrowUpDown } from 'lucide-react';

// Sort config interface
interface CashDeficitSortConfig {
    key: keyof CashDeficitEntry;
    direction: 'asc' | 'desc';
}

interface CashDeficitTablesProps {
    entrate: CashDeficitEntry[];
    uscite: CashDeficitEntry[];
    monthlyTotals: {
        [key in MonthType]: {
            entrate: number;
            uscite: number;
            balance: number;
        };
    };
    onSort: (key: keyof CashDeficitEntry) => void;
    sortConfig: CashDeficitSortConfig;
}

const CashDeficitTable: React.FC<{
    entries: CashDeficitEntry[];
    title: string;
    type: TransactionType;
    onSort: (key: keyof CashDeficitEntry) => void;
    sortConfig: CashDeficitSortConfig;
}> = ({ entries, title, type, onSort, sortConfig }) => {
    const getSortIndicator = (key: keyof CashDeficitEntry) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? '↑' : '↓';
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">
                {title} 
                <span className="text-sm font-normal ml-2">
                    (Totale: €{entries.reduce((sum, entry) => sum + entry.amount, 0).toLocaleString()})
                </span>
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="pb-2">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => onSort('name')}
                                    className="flex items-center"
                                >
                                    Nome {getSortIndicator('name')} <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="pb-2">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => onSort('amount')}
                                    className="flex items-center"
                                >
                                    Importo {getSortIndicator('amount')} <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="pb-2">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => onSort('month')}
                                    className="flex items-center"
                                >
                                    Mese {getSortIndicator('month')} <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="pb-2">Data</th>
                            <th className="pb-2">Categoria</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => (
                            <tr key={entry.id} className="border-b">
                                <td className="py-2">{entry.name}</td>
                                <td className={`py-2 ${
                                    type === TransactionType.Entrata 
                                        ? 'text-green-500' 
                                        : 'text-red-500'
                                }`}>
                                    €{entry.amount.toLocaleString()}
                                </td>
                                <td className="py-2">{entry.month}</td>
                                <td className="py-2">
                                    {new Date(entry.date).toLocaleDateString('it-IT')}
                                </td>
                                <td className="py-2">
                                    {entry.category && (
                                        <span className="px-2 py-1 rounded text-sm bg-gray-100">
                                            {entry.category}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MonthlyTotalsTable: React.FC<{
    monthlyTotals: CashDeficitTablesProps['monthlyTotals'];
}> = ({ monthlyTotals }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Riepilogo Mensile</h3>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left border-b">
                        <th className="pb-2">Mese</th>
                        <th className="pb-2">Entrate</th>
                        <th className="pb-2">Uscite</th>
                        <th className="pb-2">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(monthlyTotals).map(([month, totals]) => (
                        <tr key={month} className="border-b">
                            <td className="py-2">{month}</td>
                            <td className="py-2 text-green-500">
                                €{totals.entrate.toLocaleString()}
                            </td>
                            <td className="py-2 text-red-500">
                                €{totals.uscite.toLocaleString()}
                            </td>
                            <td className={`py-2 ${
                                totals.balance >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                €{totals.balance.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CashDeficitTables: React.FC<CashDeficitTablesProps> = ({ 
    entrate, 
    uscite, 
    monthlyTotals,
    onSort,
    sortConfig 
}) => {
    return (
        <div className="space-y-6">
            <MonthlyTotalsTable monthlyTotals={monthlyTotals} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashDeficitTable 
                    entries={entrate} 
                    title="Entrate" 
                    type={TransactionType.Entrata}
                    onSort={onSort}
                    sortConfig={sortConfig}
                />
                <CashDeficitTable 
                    entries={uscite} 
                    title="Uscite" 
                    type={TransactionType.Uscita}
                    onSort={onSort}
                    sortConfig={sortConfig}
                />
            </div>
        </div>
    );
};

export default CashDeficitTables;