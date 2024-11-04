// Status and type enums for better type safety
export enum ClientStatus {
    Critico = 'Critico',
    InRitardo = 'In Ritardo'
}

export enum ClientPriority {
    Alta = 'Alta',
    Media = 'Media',
    Bassa = 'Bassa'
}

export enum ClientType {
    Fiscale = 'Fiscale',
    Fornitore = 'Fornitore',
    Cliente = 'Cliente'
}

// Base client interface
export interface UnpaidClient {
    name: string;
    amount: number;
    daysOverdue: number;
    status: ClientStatus;
    priority: ClientPriority;
    type: ClientType;
}

export enum TransactionType {
    Entrata = 'Entrata',
    Uscita = 'Uscita'
}

export enum MonthType {
    Current = 'Corrente',
    Previous = 'Precedente',
    TwoMonthsAgo = 'Due Mesi Fa',
    ThreeMonthsAgo = 'Tre Mesi Fa',
}

export interface CashDeficitEntry {
    id: string;
    name: string;
    amount: number;
    type: TransactionType;
    month: MonthType;
    date: string; 
    category?: string;
    notes?: string;
}




// Main financial data interface
export interface FinancialData {
    currentDeficit: number;
    currentSaldoBank: number;
    unpaidClients: UnpaidClient[];
    totalUnpaid: number;
    nextMonthForecast: number;
	cashDeficit: {
        entrate: CashDeficitEntry[];
        uscite: CashDeficitEntry[];
    };
    monthlyTotals: {
        [key in MonthType]: {
            entrate: number;
            uscite: number;
            balance: number;
        };
    };
}

// Filter interface for client filtering
export interface Filters {
    name: string;
    minAmount: string;
    maxAmount: string;
    minDays: string;
    maxDays: string;
}

// API related interfaces
export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
    timestamp?: string;
}

// File upload related interfaces
export interface FileUploadResponse {
    message: string;
    filesProcessed: string[];
    timestamp: string;
}

export interface ReconciliationStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message: string;
    lastUpdated: string;
    details?: {
        processedRecords: number;
        errors?: string[];
    };
}

// Summary statistics interface
export interface FinancialSummary {
    totalClients: number;
    totalFiscale: number;
    totalFornitori: number;
    averageDaysOverdue: number;
    criticalCount: number;
    highPriorityCount: number;
}

// Helper type for API endpoints
export type ApiEndpoints = {
    upload: '/upload';
    financialData: '/financial-data';
    reconciliationStatus: '/reconciliation-status';
};

// Utility type for pagination
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Type guard functions
export const isUnpaidClient = (obj: any): obj is UnpaidClient => {
    return (
        typeof obj === 'object' &&
        typeof obj.name === 'string' &&
        typeof obj.amount === 'number' &&
        typeof obj.daysOverdue === 'number' &&
        Object.values(ClientStatus).includes(obj.status) &&
        Object.values(ClientPriority).includes(obj.priority) &&
        Object.values(ClientType).includes(obj.type)
    );
};

export const isFinancialData = (obj: any): obj is FinancialData => {
    return (
        typeof obj === 'object' &&
        typeof obj.currentDeficit === 'number' &&
        typeof obj.currentSaldoBank === 'number' &&
        Array.isArray(obj.unpaidClients) &&
        obj.unpaidClients.every(isUnpaidClient) &&
        typeof obj.totalUnpaid === 'number' &&
        typeof obj.nextMonthForecast === 'number'
    );
};