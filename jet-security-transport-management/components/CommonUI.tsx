
import React from 'react';
import { TransportStatus, ScheduleItem } from '../types';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, text, active, onClick, isCollapsed }) => (
  <li title={text} className={`flex items-center p-4 cursor-pointer transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`} onClick={onClick}>
    <span className="w-6 h-6">{icon}</span>
    {!isCollapsed && <span className="ml-4 whitespace-nowrap">{text}</span>}
  </li>
);

interface TableProps {
  children: React.ReactNode;
}
export const Table: React.FC<TableProps> = ({ children }) => <div className="bg-white rounded-lg shadow-md overflow-x-auto"><table className="w-full text-left table-auto min-w-[768px]">{children}</table></div>;


interface TableHeaderColumn {
    title: string;
    align?: 'left' | 'center' | 'right';
}
interface TableHeaderProps {
  columns: TableHeaderColumn[];
}
export const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
    <thead className="bg-gray-200 text-gray-700 uppercase text-sm">
        <tr>
            {columns.map((col, i) => (
                <th key={i} className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {col.title}
                </th>
            ))}
        </tr>
    </thead>
);

interface TableRowProps {
  children: React.ReactNode;
  status?: TransportStatus; 
}
export const TableRow: React.FC<TableRowProps> = ({ children, status }) => (
  <tr className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${status === 'Completed' ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}>
    {children}
  </tr>
);

interface ActionButtonsProps {
  children: React.ReactNode;
}
export const ActionButtons: React.FC<ActionButtonsProps> = ({ children }) => <td className="py-2 px-4 text-center"><div className="flex justify-center items-center space-x-1">{children}</div></td>;

interface StatusDropdownProps {
  id: number;
  currentStatus: TransportStatus;
  onStatusChange: (id: number, newStatus: TransportStatus) => void;
}
export const StatusDropdown: React.FC<StatusDropdownProps> = ({ id, currentStatus, onStatusChange }) => {
    const statusOptions: TransportStatus[] = ['Scheduled', 'Completed', 'Canceled'];
    const colors: Record<TransportStatus, string> = { Scheduled: "bg-blue-100 text-blue-800", Completed: "bg-green-100 text-green-800", Canceled: "bg-red-100 text-red-800" };
    
    return (
        <select value={currentStatus} onChange={(e) => onStatusChange(id, e.target.value as TransportStatus)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 appearance-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${colors[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
            {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
    );
};

interface TimePicker24HourProps {
    name: string;
    value: string; // HH:mm
    onChange: (event: { target: { name: string; value: string } }) => void;
}

// Dark SVG arrow for light selects
const darkSelectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236B7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`;

export const TimePicker24Hour: React.FC<TimePicker24HourProps> = ({ name, value, onChange }) => {
    const [hour = '', minute = ''] = value ? value.split(':') : ['', ''];

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newHour = e.target.value;
        onChange({ target: { name, value: `${newHour}:${minute || '00'}` } });
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMinute = e.target.value;
        onChange({ target: { name, value: `${hour || '00'}:${newMinute}` } });
    };

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const selectClasses = "w-full p-2 border border-gray-300 rounded bg-white text-gray-900 appearance-none text-center focus:ring-indigo-500 focus:border-indigo-500 pr-8"; // pr-8 for arrow space

    return (
        <div className="flex space-x-2">
            <select 
                value={hour} 
                onChange={handleHourChange} 
                className={selectClasses}
                style={{ backgroundImage: darkSelectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: `right 0.5rem center`, backgroundSize: `1em 1em` }}

            >
                <option value="">HH</option>
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="flex items-center font-bold text-gray-500">:</span>
            <select 
                value={minute} 
                onChange={handleMinuteChange} 
                className={selectClasses}
                style={{ backgroundImage: darkSelectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: `right 0.5rem center`, backgroundSize: `1em 1em` }}
            >
                <option value="">MM</option>
                {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
    );
};
