import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import { 
    FinancialData, 
    UnpaidClient, 
    ClientStatus, 
    ClientType,
    ClientPriority 
} from '../types/financial';
import LoadingSpinner from './LoadingSpinner';

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

const ClientItem: React.FC<{ client: UnpaidClient }> = ({ client }) => (
    <li className={`flex justify-between items-center p-2 rounded
        ${client.type === ClientType.Fiscale ? 
            'bg-yellow-50 high-priority' : 
            'hover:bg-gray-50'}`}
    >
        <div>
            <span className="font-medium">{client.name}</span>
            <StatusBadge status={client.status} />
            {client.priority === ClientPriority.Alta && (
                <span className="ml-2 px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                    Alta Priorità
                </span>
            )}
        </div>
        <span className="font-bold text-red-500">
            €{Math.abs(client.amount).toLocaleString()}
        </span>
    </li>
);

const Overview: React.FC<OverviewProps> = ({ 
    user, 
    data, 
    loading, 
    error, 
    onUploadSuccess 
}) => {
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);

    const handleUploadSuccess = useCallback((fileName: string) => {
        setUploadedFile(fileName);
    }, []);

    const handleSummaryComplete = useCallback(() => {
        setUploadedFile(null);
        onUploadSuccess();
    }, [onUploadSuccess]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return <div>No data available</div>;

    const renderFinancialSummary = () => (
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

    const renderUnpaidList = () => (
        <ul className="space-y-3">
            {data.unpaidClients
                .sort((a, b) => {
                    if (a.type === ClientType.Fiscale && b.type !== ClientType.Fiscale) return -1;
                    if (a.type !== ClientType.Fiscale && b.type === ClientType.Fiscale) return 1;
                    if (a.priority === ClientPriority.Alta && b.priority !== ClientPriority.Alta) return -1;
                    return 0;
                })
                .map(client => (
                    <ClientItem key={client.name} client={client} />
                ))
            }
        </ul>
    );

    return (
        <div className="space-y-6">
            {user === 'barbara' && (
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
        </div>
    );
};

export default Overview;