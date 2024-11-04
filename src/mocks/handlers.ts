import { http, HttpResponse, delay } from 'msw';
import { 
    FinancialData, 
    ClientStatus, 
    ClientPriority, 
    ClientType,
    TransactionType,
    MonthType  
} from '../types/financial';

let mockFinancialData: FinancialData = {
    currentDeficit: -15000,
    currentSaldoBank: 1000,
    unpaidClients: [
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
    ],
    totalUnpaid: -20000,
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


// Add some debug logging
const logRequest = (method: string, path: string) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[MSW] ${method} ${path} intercepted`);
    }
};

export const handlers = [
    // Handle all variations of the financial-data endpoint
    http.get('*/financial-data', async ({ request }) => {
        logRequest('GET', request.url);
        await delay(500);
        return HttpResponse.json(mockFinancialData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }),

    // Handle all variations of the upload endpoint
    http.post('*/upload', async ({ request }) => {
        logRequest('POST', request.url);
        try {
            const formData = await request.formData();
            const scadenze = formData.get('scadenze');
            const bank = formData.get('bank');

            if (!scadenze || !bank) {
                return new HttpResponse(
                    JSON.stringify({ error: 'Both files are required' }), 
                    { 
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            // Simulate processing files and updating data
            mockFinancialData = {
                ...mockFinancialData,
                currentDeficit: -10000,
                currentSaldoBank: 500,
                unpaidClients: [
                    ...mockFinancialData.unpaidClients,
                    { 
                        name: 'NEW CLIENT FROM FILE',
                        amount: -3000,
                        daysOverdue: 10,
                        status: ClientStatus.InRitardo,
                        priority: ClientPriority.Media,
                        type: ClientType.Cliente
                    }
                ],
                totalUnpaid: -23000
            };

            await delay(1000);

            return HttpResponse.json(
                { 
                    success: true,
                    message: 'Files uploaded successfully'
                },
                { 
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error) {
            console.error('[MSW] Error processing upload:', error);
            return HttpResponse.json(
                { error: 'Failed to process upload' },
                { status: 500 }
            );
        }
    })
];