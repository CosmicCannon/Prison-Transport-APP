
import React from 'react';
import { ScheduleItem, Officer, TimeOffItem, TransportStatus, ViewType } from '../types';
import { Table, TableHeader, TableRow, ActionButtons, StatusDropdown } from './CommonUI';
import { SearchIcon, EditIcon, TrashIcon, RestoreIcon } from '../constants';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onStatusChange: (id: number, newStatus: TransportStatus) => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (viewToDelete: ViewType, id: number) => void;
  onFindOfficer: (transportDate: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, onStatusChange, onEdit, onDelete, onFindOfficer }) => {
    const columns = [ { title: 'Date' }, { title: 'Prisoner' }, { title: 'Route' }, { title: 'Time' }, { title: 'Assigned Officers', align: 'left' as const }, { title: 'Status' }, { title: 'Actions', align: 'center' as const } ];
    return (
        <Table>
            <TableHeader columns={columns} />
            <tbody className="text-gray-700 text-sm">
                {schedule.map((item) => (
                    <TableRow key={item.id} status={item.status}>
                        <td className="py-3 px-4 whitespace-nowrap">{item.date}</td>
                        <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800">{item.prisonerName}</div>
                            <div className="text-xs text-gray-500">{item.prisonerId}</div>
                        </td>
                        <td className="py-3 px-4">
                            <div>{item.pickup} to</div>
                            <div className="font-semibold text-gray-800">{item.destination}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                            <div><span className="font-medium text-gray-600">Sch:</span> {item.scheduledPickupTime || '--:--'}</div>
                            <div><span className="font-medium text-gray-600">P-up:</span> {item.actualPickupTime || '--:--'}</div>
                            <div><span className="font-medium text-gray-600">D-off:</span> {item.actualDropoffTime || '--:--'}</div>
                        </td>
                        <td className="py-3 px-4">
                           {item.officers.length > 0 ? item.officers.join(', ') : <span className="text-gray-400 italic">None</span>}
                        </td>
                        <td className="py-3 px-4"><StatusDropdown id={item.id} currentStatus={item.status} onStatusChange={onStatusChange} /></td>
                        <ActionButtons>
                            {item.status === 'Scheduled' && <button onClick={() => onFindOfficer(item.date)} className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-full hover:bg-indigo-100 transition-colors" title="Find Next Officer"><SearchIcon className="text-[18px]" /></button>}
                            <button onClick={() => onEdit(item)} className="text-yellow-500 hover:text-yellow-700 p-1.5 rounded-full hover:bg-yellow-100 transition-colors" title="Edit"><EditIcon className="text-[18px]" /></button>
                            <button onClick={() => onDelete('Schedule', item.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon className="text-[18px]" /></button>
                        </ActionButtons>
                    </TableRow>
                ))}
                 {schedule.length === 0 && (
                    <TableRow>
                        <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                            No transports scheduled.
                        </td>
                    </TableRow>
                )}
            </tbody>
        </Table>
    );
};

interface ArchivedViewProps {
  schedule: ScheduleItem[];
  onRestore: (id: number, newStatus: TransportStatus) => void;
  onDelete: (viewToDelete: ViewType, id: number) => void;
}

export const ArchivedView: React.FC<ArchivedViewProps> = ({ schedule, onRestore, onDelete }) => {
    const columns = [ { title: 'Date' }, { title: 'Prisoner' }, { title: 'Route' }, { title: 'Time' }, { title: 'Assigned Officers', align: 'left' as const }, { title: 'Status' }, { title: 'Actions', align: 'center' as const } ];
    return (
        <Table>
            <TableHeader columns={columns} />
            <tbody className="text-gray-600 text-sm">
                {schedule.map((item) => (
                    <TableRow key={item.id} status={item.status}>
                        <td className="py-3 px-4 whitespace-nowrap">{item.date}</td>
                        <td className="py-3 px-4">
                            <div className="font-semibold">{item.prisonerName}</div>
                            <div className="text-xs">{item.prisonerId}</div>
                        </td>
                        <td className="py-3 px-4">
                            <div>{item.pickup} to</div>
                            <div className="font-semibold">{item.destination}</div>
                        </td>
                         <td className="py-3 px-4 whitespace-nowrap">
                            <div><span className="font-medium">Sch:</span> {item.scheduledPickupTime || '--:--'}</div>
                            <div><span className="font-medium">P-up:</span> {item.actualPickupTime || '--:--'}</div>
                            <div><span className="font-medium">D-off:</span> {item.actualDropoffTime || '--:--'}</div>
                        </td>
                        <td className="py-3 px-4">
                           {item.officers.join(', ')}
                        </td>
                        <td className="py-3 px-4"><StatusDropdown id={item.id} currentStatus={item.status} onStatusChange={onRestore} /></td>
                        <ActionButtons>
                            <button onClick={() => onRestore(item.id, 'Scheduled')} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-100 transition-colors" title="Restore"><RestoreIcon className="text-[18px]" /></button>
                            <button onClick={() => onDelete('Archived', item.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon className="text-[18px]" /></button>
                        </ActionButtons>
                    </TableRow>
                ))}
                {schedule.length === 0 && (
                    <TableRow>
                        <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                            No archived transports.
                        </td>
                    </TableRow>
                )}
            </tbody>
        </Table>
    );
};

interface RosterViewProps {
  officers: Officer[];
  onEdit: (item: Officer) => void;
  onDelete: (viewToDelete: ViewType, id: number) => void;
}
export const RosterView: React.FC<RosterViewProps> = ({ officers, onEdit, onDelete }) => {
    const columns = [ { title: 'Officer Name' }, { title: 'Badge #' }, { title: 'Contact #' }, { title: 'Last Transport' }, { title: 'Total Transports', align: 'center' as const }, { title: 'Actions', align: 'center' as const }];
    return (
        <Table>
            <TableHeader columns={columns} />
            <tbody className="text-gray-700 text-sm">
                {officers.map((officer) => (
                    <TableRow key={officer.id}>
                        <td className="py-3 px-4 font-semibold text-gray-800">{officer.name}</td>
                        <td className="py-3 px-4">{officer.badge}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{officer.contact}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{officer.lastTransport}</td>
                        <td className="py-3 px-4 text-center">{officer.totalTransports}</td>
                        <ActionButtons>
                            <button onClick={() => onEdit(officer)} className="text-yellow-500 hover:text-yellow-700 p-1.5 rounded-full hover:bg-yellow-100 transition-colors" title="Edit"><EditIcon className="text-[18px]" /></button>
                            <button onClick={() => onDelete('Roster', officer.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon className="text-[18px]" /></button>
                        </ActionButtons>
                    </TableRow>
                ))}
                {officers.length === 0 && (
                     <TableRow>
                        <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                            No officers in the roster.
                        </td>
                    </TableRow>
                )}
            </tbody>
        </Table>
    );
};

interface TimeOffViewProps {
  timeOff: TimeOffItem[];
  officers: Officer[];
  onEdit: (item: TimeOffItem) => void;
  onDelete: (viewToDelete: ViewType, id: number) => void;
}
export const TimeOffView: React.FC<TimeOffViewProps> = ({ timeOff, officers, onEdit, onDelete }) => {
    const columns = [ { title: 'Officer Name' }, { title: 'Contact #' }, { title: 'Start Date' }, { title: 'End Date' }, { title: 'Reason' }, { title: 'Actions', align: 'center' as const }];
    return (
        <Table>
            <TableHeader columns={columns} />
            <tbody className="text-gray-700 text-sm">
                {timeOff.map((item) => {
                    const officer = officers.find(o => o.id === item.officerId) || {name: 'Unknown', contact: 'N/A'};
                    return (
                        <TableRow key={item.id}>
                            <td className="py-3 px-4 font-semibold text-gray-800">{officer.name}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{officer.contact}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{item.start}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{item.end}</td>
                            <td className="py-3 px-4">{item.reason}</td>
                            <ActionButtons>
                                <button onClick={() => onEdit(item)} className="text-yellow-500 hover:text-yellow-700 p-1.5 rounded-full hover:bg-yellow-100 transition-colors" title="Edit"><EditIcon className="text-[18px]" /></button>
                                <button onClick={() => onDelete('Time Off', item.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon className="text-[18px]" /></button>
                            </ActionButtons>
                        </TableRow>
                    );
                })}
                {timeOff.length === 0 && (
                    <TableRow>
                        <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                            No time off requests.
                        </td>
                    </TableRow>
                )}
            </tbody>
        </Table>
    );
};
