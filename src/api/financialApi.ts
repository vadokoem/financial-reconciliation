import axios from 'axios';
import { FinancialData } from '../types/financial';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const financialApi = {
    uploadFiles: async (formData: FormData): Promise<void> => {
        const response = await axiosInstance.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status !== 200) {
            throw new Error(response.data?.message || 'Upload failed');
        }
    },

    getFinancialData: async (): Promise<FinancialData> => {
        try {
            const response = await axiosInstance.get<FinancialData>('/financial-data');
            
            // Return the data directly as it should match FinancialData type
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message || 
                    'Failed to fetch financial data'
                );
            }
            throw new Error('Failed to fetch financial data');
        }
    }
};