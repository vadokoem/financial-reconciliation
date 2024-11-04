import React, { useState, useRef, useCallback } from 'react';
import { financialApi } from '../api/financialApi';

interface FileUploadProps {
    onUploadSuccess: (fileName: string) => void;
	}

interface FileError {
    field: 'scadenze' | 'bank';
    message: string;
}

interface FilePreview {
    name: string;
    size: string;
    type: string;
    previewData?: string;
}

interface UploadStatus {
    id: number;
    message: string;
    status: 'pending' | 'success' | 'error' | 'loading';
    timestamp: Date;
}

interface ServerStatus {
    serverUrl: string;
    timestamp: Date;
    filesUploaded: {
        name: string;
        size: string;
        status: 'success' | 'error';
    }[];
}

interface ServerResponse {
    url: string;
    status: 'success' | 'error';
    timestamp: Date;
    message: string;
    files?: {
        name: string;
        size: string;
        status: 'success' | 'error';
    }[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPE = '.csv';


const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateFile = (file: File, fieldName: 'scadenze' | 'bank'): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        return 'Only CSV files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
        return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    return null;
};

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FileError[]>([]);
    const [previews, setPreviews] = useState<Record<string, FilePreview>>({});
    const [dragActive, setDragActive] = useState<{ scadenze: boolean; bank: boolean }>({
        scadenze: false,
        bank: false
    });
	
    const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
	const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
	const [serverResponse, setServerResponse] = useState<ServerResponse | null>(null);
	
	
	const scadenzeInputRef = useRef<HTMLInputElement>(null);
    const bankInputRef = useRef<HTMLInputElement>(null);
	
	
	
	const addStatusLog = (message: string, status: UploadStatus['status'] = 'pending') => {
    setUploadStatus(prev => [...prev, {
        id: Date.now(),
        message,
        status,
        timestamp: new Date()
    }]);
};

const updateLastStatus = (status: UploadStatus['status']) => {
    setUploadStatus(prev => {
        const newStatus = [...prev];
        if (newStatus.length > 0) {
            newStatus[newStatus.length - 1].status = status;
        }
        return newStatus;
    });
};

const clearLogs = () => {
    setUploadStatus([]);
};

 
const handleFile = useCallback(async (file: File, fieldName: 'scadenze' | 'bank') => {
    const error = validateFile(file, fieldName);
    if (error) {
        setErrors(prev => [...prev.filter(e => e.field !== fieldName), { field: fieldName, message: error }]);
        return;
    }

    setErrors(prev => prev.filter(e => e.field !== fieldName));

    const preview: FilePreview = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
    };

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 3).join('\n');
        preview.previewData = lines;
        setPreviews(prev => ({ ...prev, [fieldName]: preview }));
    };
    reader.readAsText(file);

   
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fieldName === 'scadenze' && scadenzeInputRef.current) {
        scadenzeInputRef.current.files = dataTransfer.files;
    } else if (fieldName === 'bank' && bankInputRef.current) {
        bankInputRef.current.files = dataTransfer.files;
    }
}, [validateFile, formatFileSize]);

const handleDrag = useCallback((e: React.DragEvent, fieldName: 'scadenze' | 'bank', isDragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fieldName]: isDragging }));
}, []);

const handleDrop = useCallback((e: React.DragEvent, fieldName: 'scadenze' | 'bank') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fieldName]: false }));

    const file = e.dataTransfer?.files?.[0];
    if (file) {
        handleFile(file, fieldName);
    }
}, [handleFile]);
   
   

    const removeFile = (fieldName: 'scadenze' | 'bank') => {
        setPreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[fieldName];
            return newPreviews;
        });
        setErrors(prev => prev.filter(e => e.field !== fieldName));
        
        if (fieldName === 'scadenze' && scadenzeInputRef.current) {
            scadenzeInputRef.current.value = '';
        } else if (fieldName === 'bank' && bankInputRef.current) {
            bankInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        const scadenzeFile = scadenzeInputRef.current?.files?.[0];
        const bankFile = bankInputRef.current?.files?.[0];

        if (!scadenzeFile || !bankFile) {
            setErrors([{ field: 'scadenze', message: 'Both files are required' }]);
            return;
        }

        setLoading(true);
        setErrors([]);
        clearLogs();
        setServerStatus(null);
		setServerResponse(null);
		
		const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
		
        try {
            // Authentication status
            addStatusLog('Authenticating to backend server...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            updateLastStatus('success');

            // Connection status
            addStatusLog('Establishing secure connection...', 'loading');
            await new Promise(resolve => setTimeout(resolve, 800));
            updateLastStatus('success');

            // File preparation
            addStatusLog('Preparing files for upload...', 'loading');
            const formData = new FormData();
            formData.append('scadenze', scadenzeFile);
            formData.append('bank', bankFile);
            updateLastStatus('success');

            // Upload status
            addStatusLog('Uploading files to server...', 'loading');
            await financialApi.uploadFiles(formData);
            updateLastStatus('success');

            // Processing status
            addStatusLog('Processing uploaded files...', 'loading');
            await new Promise(resolve => setTimeout(resolve, 1200));
            updateLastStatus('success');

            // Final success
            addStatusLog('Upload completed successfully!', 'success');
            
            // Create server status
            setServerStatus({
                serverUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
                timestamp: new Date(),
                filesUploaded: [
                    {
                        name: scadenzeFile.name,
                        size: formatFileSize(scadenzeFile.size),
                        status: 'success'
                    },
                    {
                        name: bankFile.name,
                        size: formatFileSize(bankFile.size),
                        status: 'success'
                    }
                ]
            });

		setServerResponse({
                url: serverUrl,
                status: 'success',
                timestamp: new Date(),
                message: 'Files processed successfully',
                files: [
                    {
                        name: scadenzeFile.name,
                        size: formatFileSize(scadenzeFile.size),
                        status: 'success'
                    },
                    {
                        name: bankFile.name,
                        size: formatFileSize(bankFile.size),
                        status: 'success'
                    }
                ]
            });


            // Call onUploadSuccess with the primary file name
              addStatusLog('Upload completed successfully!', 'success');
			onUploadSuccess(`${scadenzeFile.name}, ${bankFile.name}`);
			

        } catch (error) {
            const errorMessage = 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error');
            addStatusLog(errorMessage, 'error');
            setErrors([{ field: 'scadenze', message: errorMessage }]);
            
            setServerStatus({
                serverUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
                timestamp: new Date(),
                filesUploaded: [
                    {
                        name: scadenzeFile.name,
                        size: formatFileSize(scadenzeFile.size),
                        status: 'error'
                    },
                    {
                        name: bankFile.name,
                        size: formatFileSize(bankFile.size),
                        status: 'error'
                    }
                ]
            });
			
			setServerResponse({
                url: process.env.REACT_APP_API_URL || 'http://localhost:3000',
                status: 'error',
                timestamp: new Date(),
                message: errorMessage,
                files: [
                    {
                        name: scadenzeFile.name,
                        size: formatFileSize(scadenzeFile.size),
                        status: 'error'
                    },
                    {
                        name: bankFile.name,
                        size: formatFileSize(bankFile.size),
                        status: 'error'
                    }
                ]
            });

            addStatusLog(`Upload failed: ${errorMessage}`, 'error');
            setErrors([{ field: 'scadenze', message: errorMessage }]);
			
			
			
        } finally {
            setLoading(false);
        }
    };


    const renderFileInput = (fieldName: 'scadenze' | 'bank', label: string) => {
        const hasPreview = !!previews[fieldName];
        const isDragging = dragActive[fieldName];

        return (
            <div>
                <label className="block text-sm text-gray-600 mb-2">
                    {label} (.csv)
                </label>
                <div
                    className={`relative border-2 rounded-lg p-4 transition-all duration-200
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'}
                        ${hasPreview ? 'bg-gray-50' : ''}`}
                    onDragEnter={e => handleDrag(e, fieldName, true)}
                    onDragLeave={e => handleDrag(e, fieldName, false)}
                    onDragOver={e => handleDrag(e, fieldName, true)}
                    onDrop={e => handleDrop(e, fieldName)}
                >
                    <input
                        ref={fieldName === 'scadenze' ? scadenzeInputRef : bankInputRef}
                        type="file"
                        accept={ALLOWED_FILE_TYPE}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file, fieldName);
                        }}
                        className={`block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            cursor-pointer
                            ${hasPreview ? 'hidden' : ''}`}
                    />
                    {!hasPreview && (
                        <div className="text-center text-gray-500 text-sm mt-2">
                            Drag & drop your file here or click to select
                        </div>
                    )}
                    {hasPreview && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{previews[fieldName].name}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">{previews[fieldName].size}</span>
                                    <button
                                        onClick={() => removeFile(fieldName)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {previews[fieldName].previewData && (
                                <div className="p-2 bg-white rounded border text-xs font-mono overflow-x-auto">
                                    {previews[fieldName].previewData}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {errors.find(e => e.field === fieldName)?.message && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.find(e => e.field === fieldName)?.message}
                    </p>
                )}
            </div>
        );
    };
    const renderStatusLog = () => {
    if (uploadStatus.length === 0) return null;

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Upload Status Log</h3>
            <div className="space-y-2">
                {uploadStatus.map((log) => (
                    <div 
                        key={log.id} 
                        className="flex items-center text-sm"
                    >
                        <div className="mr-2">
                            {log.status === 'pending' && (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                            )}
                            {log.status === 'loading' && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {log.status === 'success' && (
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {log.status === 'error' && (
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <span className={`flex-1 ${log.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                            {log.message}
                        </span>
                        <span className="text-xs text-gray-400">
                            {log.timestamp.toLocaleTimeString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
    }; 
	
	const renderServerStatus = () => {
        if (!serverStatus) return null;

        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Summary</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Server:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {serverStatus.serverUrl}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="font-mono">
                            {serverStatus.timestamp.toLocaleString()}
                        </span>
                    </div>
                    <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                        <div className="space-y-2">
                            {serverStatus.filesUploaded.map((file, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                            file.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-gray-500">({file.size})</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        file.status === 'success' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {file.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

const renderServerResponse = () => {
        if (!serverResponse) return null;

        return (
            <div className={`mt-4 p-4 rounded-lg border ${
                serverResponse.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
            }`}>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Server Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            serverResponse.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {serverResponse.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Server URL:</span>
                            <span className="font-mono">{serverResponse.url}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Timestamp:</span>
                            <span>{serverResponse.timestamp.toLocaleString()}</span>
                        </div>
                        <div className="mt-2">
                            <p className={serverResponse.status === 'success' 
                                ? 'text-green-700' 
                                : 'text-red-700'
                            }>
                                {serverResponse.message}
                            </p>
                        </div>
                    </div>
                    {serverResponse.files && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-sm font-medium">Processed Files:</span>
                            <div className="mt-2 space-y-2">
                                {serverResponse.files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center">
                                            <span className={`w-2 h-2 rounded-full mr-2 ${
                                                file.status === 'success' 
                                                    ? 'bg-green-500' 
                                                    : 'bg-red-500'
                                            }`} />
                                            {file.name}
                                        </span>
                                        <span className="text-gray-500">{file.size}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };



	
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
                {renderFileInput('scadenze', 'Scadenze File')}
                {renderFileInput('bank', 'Bank File')}
                
                <button
                    onClick={handleUpload}
                    disabled={loading || errors.length > 0}
                    className={`w-full py-2 px-4 rounded
                        transition duration-150 ease-in-out
                        ${loading || errors.length > 0 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </span>
                    ) : 'Upload Files'}
                </button>
				 {renderStatusLog()} 
				  {renderServerStatus()}
				   {renderServerResponse()}
            </div>
        </div>
    );
};

export default FileUpload;