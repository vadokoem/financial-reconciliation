import { 
    FinancialData, 
    ClientStatus, 
    ClientType,
    ClientPriority,
    TransactionType,
    MonthType 
} from './types/financial';

export const placeholderData: FinancialData = {
    currentDeficit: -5000,
    currentSaldoBank: 2000,
    unpaidClients: [
        { 
            name: 'Cliente Esempio 1', 
            amount: -3000, 
            daysOverdue: 15, 
            status: ClientStatus.InRitardo,
            priority: ClientPriority.Media,
            type: ClientType.Cliente
        },
        { 
            name: 'Fiscale Esempio', 
            amount: -2000, 
            daysOverdue: 30, 
            status: ClientStatus.Critico,
            priority: ClientPriority.Alta,
            type: ClientType.Fiscale
        }
    ],
    totalUnpaid: -5000,
    nextMonthForecast: 1000,
    cashDeficit: {
        entrate: [
            {
                id: '1',
                name: 'Pagamento Cliente',
                amount: 3000,
                type: TransactionType.Entrata,
                month: MonthType.Current,
                date: new Date().toISOString().split('T')[0],
                category: 'Vendite'
            }
        ],
        uscite: [
            {
                id: '2',
                name: 'Pagamento Fornitore',
                amount: 2000,
                type: TransactionType.Uscita,
                month: MonthType.Current,
                date: new Date().toISOString().split('T')[0],
                category: 'Acquisti'
            }
        ]
    },
    monthlyTotals: {
        [MonthType.Current]: {
            entrate: 3000,
            uscite: 2000,
            balance: 1000
        },
        [MonthType.Previous]: {
            entrate: 2500,
            uscite: 2000,
            balance: 500
        },
        [MonthType.TwoMonthsAgo]: {
            entrate: 3000,
            uscite: 2800,
            balance: 200
        },
        [MonthType.ThreeMonthsAgo]: {
            entrate: 2800,
            uscite: 2600,
            balance: 200
        }
    }
};