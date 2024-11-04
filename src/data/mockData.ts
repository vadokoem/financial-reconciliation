import { 
    FinancialData, 
    UnpaidClient, 
    ClientStatus, 
    ClientPriority, 
    ClientType,
    TransactionType,
    MonthType	
} from '../types/financial';

export const unpaidClients: UnpaidClient[] = [
    { 
        name: 'Agenzie Entrate', 
        amount: -12000, 
        daysOverdue: 15, 
        status: ClientStatus.Critico,
        priority: ClientPriority.Alta,
        type: ClientType.Fiscale
    },
    { 
        name: 'RAMPI PRODOTTI CHIMICI', 
        amount: -5000, 
        daysOverdue: 15, 
        status: ClientStatus.InRitardo,
        priority: ClientPriority.Media,
        type: ClientType.Fornitore
    },
    { 
        name: 'DOMANI SERENO SERVICE SRL', 
        amount: -3000, 
        daysOverdue: 30, 
        status: ClientStatus.Critico,
        priority: ClientPriority.Media,
        type: ClientType.Cliente
    }
];

export const financialData: FinancialData = {
    currentDeficit: -15000,
    currentSaldoBank: 100,
    unpaidClients,
    totalUnpaid: -15000,
    nextMonthForecast: 5000,
	cashDeficit: {
        entrate: [
            {
                id: '1',
                name: 'Pagamento Cliente A',
                amount: 5000,
                type: TransactionType.Entrata,
                month: MonthType.Current,
                date: '2024-03-15',
                category: 'Vendite'
            },
            {
                id: '2',
                name: 'Pagamento Cliente B',
                amount: 3000,
                type: TransactionType.Entrata,
                month: MonthType.Previous,
                date: '2024-02-28',
                category: 'Vendite'
            }
        ],
        uscite: [
            {
                id: '3',
                name: 'Fornitore X',
                amount: 2000,
                type: TransactionType.Uscita,
                month: MonthType.Current,
                date: '2024-03-10',
                category: 'Acquisti'
            },
            {
                id: '4',
                name: 'Tasse',
                amount: 5000,
                type: TransactionType.Uscita,
                month: MonthType.Previous,
                date: '2024-02-20',
                category: 'Fiscale'
            }
        ]
    },
    monthlyTotals: {
        [MonthType.Current]: {
            entrate: 5000,
            uscite: 2000,
            balance: 3000
        },
        [MonthType.Previous]: {
            entrate: 3000,
            uscite: 5000,
            balance: -2000
        },
        [MonthType.TwoMonthsAgo]: {
            entrate: 4000,
            uscite: 3500,
            balance: 500
        },
		[MonthType.ThreeMonthsAgo]: {
            entrate: 3500,
            uscite: 3000,
            balance: 500
		}
    }
};

export interface ForecastItem {
    month: string;
    amount: number;
}

export const forecastData: readonly ForecastItem[] = [
    { month: 'Corrente', amount: -15000 },
    { month: 'Prossimo', amount: 5000 },
    { month: '2° Mese', amount: 2000 },
    { month: '3° Mese', amount: -5000 }
] as const;

export interface MockDataConfig {
    shouldShowFiscalData: boolean;
    refreshInterval: number;
    currency: 'EUR';
}

export const mockConfig: MockDataConfig = {
    shouldShowFiscalData: true,
    refreshInterval: 5000, // milliseconds
    currency: 'EUR'
};