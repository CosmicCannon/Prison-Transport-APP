
import React, { useState } from 'react';
import { ViewType } from '../types';

interface FormModalProps {
  children: React.ReactNode;
  onClose: () => void;
}
export const FormModal: React.FC<FormModalProps> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            {children}
        </div>
    </div>
);

interface NotificationModalProps {
  title: string;
  message: string;
  onClose: () => void;
}
export const NotificationModal: React.FC<NotificationModalProps> = ({ title, message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
            <p className="text-gray-700 whitespace-pre-line">{message}</p>
            <div className="mt-6">
                <button type="button" onClick={onClose} className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">OK</button>
            </div>
        </div>
    </div>
);

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h2>
            <p className="text-gray-700">{message}</p>
            <div className="mt-6 flex justify-center space-x-4">
                <button onClick={onCancel} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-6 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">Confirm</button>
            </div>
        </div>
    </div>
);

interface ImportModalProps {
  onImport: (file: File) => void;
  onClose: () => void;
  importType: ViewType;
}
export const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose, importType }) => {
    const [file, setFile] = useState<File | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
        }
    };
    
    const formatInstructions = importType === 'Roster' 
        ? "Name,Badge,Contact" 
        : "Date,Prisoner_Name,Prisoner_ID,Pickup,Destination,Scheduled_Time,Notes";

    return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
             <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">Import {importType} from CSV</h2>
             <p className="text-gray-600 mb-2 text-sm text-center">Select a .csv file to import.</p>
             <p className="text-xs text-gray-500 mb-5 text-center">Required headers: <span className="font-mono bg-gray-100 p-0.5 rounded">{formatInstructions}</span></p>
             <div className="my-4">
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                />
             </div>
             <div className="flex justify-end space-x-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                <button onClick={() => file && onImport(file)} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" disabled={!file}>Import</button>
             </div>
        </div>
    </div>
    );
};
