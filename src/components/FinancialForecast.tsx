import React from 'react';
import { FinancialData } from '../types/financial';

interface FinancialForecastProps {
    data: FinancialData;
}

interface ForecastItem {
    month: string;
    amount: number;
}

const FinancialForecast: React.FC<FinancialForecastProps> = ({ data }) => {
    // Calculate forecast data based on the real data
    const forecastData: ForecastItem[] = [
        { month: 'Corrente', amount: data.currentDeficit },
        { month: 'Prossimo', amount: data.nextMonthForecast },
        { month: '2° Mese', amount: 2000 },  // You might want to get these from the API
        { month: '3° Mese', amount: -5000 }  // You might want to get these from the API
    ];

    const maxAmount = Math.max(...forecastData.map(d => Math.abs(d.amount)));

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Previsione Finanziaria</h3>
            <div className="space-y-2">
                {forecastData.map((data, index) => (
                    <div key={`${data.month}-${index}`} className="flex items-center">
                        <span className="w-24">{data.month}:</span>
                        <div className="flex-1 h-8 bg-gray-200 rounded">
                            <div 
                                className={`h-full rounded ${data.amount >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{
                                    width: `${Math.min(Math.abs(data.amount) / maxAmount * 100, 100)}%`
                                }}
                            />
                        </div>
                        <span className={`w-32 text-right ${data.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            €{data.amount.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FinancialForecast;