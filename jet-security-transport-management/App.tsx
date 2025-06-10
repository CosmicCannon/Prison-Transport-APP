
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Officer, ScheduleItem, TimeOffItem, ModalContent, NotificationPayload, ConfirmationPayload, ViewType, TransportStatus } from './types';
import { NavItem } from './components/CommonUI';
import { ScheduleView, RosterView, TimeOffView, ArchivedView } from './components/AppViews';
import { ScheduleForm, RosterForm, TimeOffForm } from './components/AppForms';
import { FormModal, NotificationModal, ConfirmationModal, ImportModal } from './components/AppModals';
import { 
    CalendarIcon, UsersIcon, LogOutIcon, ArchiveIcon, PlusIcon, UploadIcon, FileTextIcon, ChevronsLeftIcon, ChevronsRightIcon 
} from './constants';

// --- Default Mock Data (Used only on first load if no saved data exists) ---
const initialOfficers: Officer[] = [
  { id: 1, name: 'John Smith', badge: '12345', contact: '(555) 123-4567', lastTransport: '2024-05-10', totalTransports: 5, availability: { Monday: 'Available', Tuesday: 'Available', Wednesday: 'Off', Thursday: 'Available', Friday: 'Available', Saturday: 'Off', Sunday: 'Off' } },
  { id: 2, name: 'Jane Doe', badge: '54321', contact: '(555) 987-6543', lastTransport: '2024-05-15', totalTransports: 8, availability: { Monday: 'Available', Tuesday: 'Available', Wednesday: 'Available', Thursday: 'Available', Friday: 'Available', Saturday: 'Training', Sunday: 'Training' } },
  { id: 3, name: 'Mike Johnson', badge: '67890', contact: '(555) 555-1212', lastTransport: '2024-04-20', totalTransports: 3, availability: { Monday: 'Off', Tuesday: 'Off', Wednesday: 'Available', Thursday: 'Available', Friday: 'Available', Saturday: 'Available', Sunday: 'Available' } },
  { id: 4, name: 'Emily White', badge: '13579', contact: '(555) 867-5309', lastTransport: '2024-06-01', totalTransports: 12, availability: { Monday: 'Available', Tuesday: 'Available', Wednesday: 'Available', Thursday: 'Available', Friday: 'Available', Saturday: 'Available', Sunday: 'Available' } },
];

const initialSchedule: ScheduleItem[] = [
    { id: 1, date: format(new Date(), 'yyyy-MM-dd'), prisonerName: 'Robert "Slick" Johnson', prisonerId: 'A789-234', pickup: 'Denton County Jail', destination: 'Huntsville Unit', officers: ['John Smith', 'Jane Doe'], status: 'Scheduled', notes: 'High risk transport.', scheduledPickupTime: '08:00', actualPickupTime: '', actualDropoffTime: '' },
    { id: 2, date: format(new Date(), 'yyyy-MM-dd'), prisonerName: 'Maria Garcia', prisonerId: 'B123-876', pickup: 'Tarrant County Jail', destination: 'Gatesville Unit', officers: ['Emily White'], status: 'Scheduled', notes: '', scheduledPickupTime: '09:30', actualPickupTime: '', actualDropoffTime: '' },
    { id: 3, date: '2024-05-30', prisonerName: 'David Chen', prisonerId: 'C567-112', pickup: 'Collin County Jail', destination: 'Federal Medical Center, Fort Worth', officers: ['Mike Johnson'], status: 'Completed', notes: 'Medical transfer.', scheduledPickupTime: '14:00', actualPickupTime: '14:05', actualDropoffTime: '15:02' },
];

const initialTimeOff: TimeOffItem[] = [
    { id: 1, officerId: 2, start: '2024-06-20', end: '2024-06-25', reason: 'Vacation' },
];

const App: React.FC = () => {
  const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return defaultValue;
        }
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
  };

  const [view, setView] = useState<ViewType>('Schedule');
  const [schedule, setSchedule] = useStickyState<ScheduleItem[]>(initialSchedule, 'jet-security-schedule');
  const [officers, setOfficers] = useStickyState<Officer[]>(initialOfficers, 'jet-security-officers');
  const [timeOff, setTimeOff] = useStickyState<TimeOffItem[]>(initialTimeOff, 'jet-security-timeoff');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ type: '', data: null });
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationPayload | null>(null);

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed && confirmation && confirmation.onConfirm) {
        confirmation.onConfirm();
    }
    setConfirmation(null);
  };
  
  const handleFindNextOfficer = (transportDate: string) => {
    if (!transportDate) {
      setNotification({ title: "Error", message: "Please provide a transport date." });
      return;
    }
    // Ensure the date is parsed correctly regardless of timezone issues with parseISO by setting time explicitly
    const targetDate = parseISO(`${transportDate}T12:00:00Z`); // Using Z for UTC to ensure consistency
    const dayOfWeek = format(targetDate, 'EEEE') as keyof Officer["availability"];

    const availableOfficers = officers
      .filter(officer => {
        const hasGeneralAvailability = officer.availability[dayOfWeek]?.toLowerCase() === 'available';
        const isOnSpecificTimeOff = timeOff.some(off => 
            off.officerId === officer.id && 
            targetDate >= parseISO(`${off.start}T00:00:00Z`) && 
            targetDate <= parseISO(`${off.end}T23:59:59Z`)
        );
        return hasGeneralAvailability && !isOnSpecificTimeOff;
      })
      .sort((a, b) => new Date(a.lastTransport).getTime() - new Date(b.lastTransport).getTime());

    if (availableOfficers.length === 0) {
      setNotification({ title: "No Officers Found", message: `No available officers found for ${transportDate} (${dayOfWeek}).`});
    } else {
        const primary = availableOfficers[0];
        const secondary = availableOfficers.length > 1 ? availableOfficers[1] : null;
        let message = `Primary: ${primary.name} (Last Transport: ${primary.lastTransport || 'N/A'})`;
        if (secondary) message += `\nSecondary: ${secondary.name} (Last Transport: ${secondary.lastTransport || 'N/A'})`;
        setNotification({ title: "Next Officers in Rotation", message });
    }
  };

  const updateOfficerStatsOnCompletion = (transport: ScheduleItem, isCompleting: boolean) => {
    const updatedOfficers = officers.map(officer => {
        if (transport.officers.includes(officer.name)) {
            let newTotalTransports = officer.totalTransports;
            let newLastTransport = officer.lastTransport;

            if (isCompleting) {
                newTotalTransports += 1;
                // Only update lastTransport if this transport is newer or if no lastTransport recorded
                if (!officer.lastTransport || new Date(transport.date) > new Date(officer.lastTransport)) {
                    newLastTransport = transport.date;
                }
            } else { // Reverting completion
                newTotalTransports = Math.max(0, officer.totalTransports - 1);
                // This part is tricky: what should lastTransport revert to? 
                // For simplicity, we might not revert lastTransport unless complex history is kept.
                // Or, if this was the last transport, set it to N/A or find previous.
                // Current logic: don't change lastTransport on revert, only on completion.
            }
            return { 
                ...officer, 
                lastTransport: newLastTransport,
                totalTransports: newTotalTransports
            };
        }
        return officer;
    });
    setOfficers(updatedOfficers);
  };


  const handleStatusChange = (id: number, newStatus: TransportStatus) => {
      const transport = schedule.find(t => t.id === id);
      if (!transport) return;

      if (transport.status !== 'Completed' && newStatus === 'Completed') {
          updateOfficerStatsOnCompletion(transport, true);
      } else if (transport.status === 'Completed' && newStatus !== 'Completed') {
          updateOfficerStatsOnCompletion(transport, false);
      }

      const updatedSchedule = schedule.map(t => t.id === id ? { ...t, status: newStatus } : t);
      setSchedule(updatedSchedule);
  };

  const handleDelete = (viewToDelete: ViewType, id: number) => {
      setConfirmation({
          message: "Are you sure you want to permanently delete this item? This action cannot be undone.",
          onConfirm: () => {
              if (viewToDelete === 'Schedule' || viewToDelete === 'Archived') {
                const transportToDelete = schedule.find(item => item.id === id);
                if (transportToDelete && transportToDelete.status === 'Completed') {
                    // If deleting a completed transport, consider if officer stats should be reversed.
                    // For simplicity, current decision is not to auto-reverse stats on permanent deletion.
                }
                setSchedule(prevSchedule => prevSchedule.filter(item => item.id !== id));
              }
              else if (viewToDelete === 'Roster') setOfficers(prevOfficers => prevOfficers.filter(item => item.id !== id));
              else if (viewToDelete === 'Time Off') setTimeOff(prevTimeOff => prevTimeOff.filter(item => item.id !== id));
              setNotification({title: "Success", message: "Item deleted successfully."});
          }
      });
  };

  const handleOpenModal = (type: ModalContent['type'], data: ScheduleItem | Officer | TimeOffItem | null = null) => {
    setModalContent({ type, data });
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setModalContent({ type: '', data: null });
  };

  const handleSave = (type: ModalContent['type'], itemData: any) => { // itemData is any because it can be ScheduleItem, Officer, or TimeOffItem
    if (type === 'Schedule') {
        const finalData = { ...itemData, officers: itemData.officers.filter((name: string) => name && name !== "") };
        if (finalData.id && finalData.id !== 0) { // Check for existing ID (not 0)
            setSchedule(prev => prev.map(s => s.id === finalData.id ? finalData : s));
            setNotification({title: "Success", message: "Transport updated successfully."});
        } else {
            setSchedule(prev => [...prev, { ...finalData, id: Date.now(), status: 'Scheduled' }]);
            setNotification({title: "Success", message: "New transport scheduled."});
        }
    } else if (type === 'Roster') {
        if (itemData.id && itemData.id !== 0) {
            setOfficers(prev => prev.map(o => o.id === itemData.id ? itemData : o));
            setNotification({title: "Success", message: "Officer details updated."});
        } else {
            setOfficers(prev => [...prev, { ...itemData, id: Date.now(), totalTransports: 0, lastTransport: 'N/A' }]);
            setNotification({title: "Success", message: "New officer added to roster."});
        }
    } else if (type === 'Time Off') {
        if (itemData.id && itemData.id !== 0) {
            setTimeOff(prev => prev.map(t => t.id === itemData.id ? itemData : t));
            setNotification({title: "Success", message: "Time off request updated."});
        } else {
            setTimeOff(prev => [...prev, { ...itemData, id: Date.now() }]);
            setNotification({title: "Success", message: "Time off request added."});
        }
    }
    handleCloseModal();
  };
  
  const handleImportCsv = (file: File | null, importType: ViewType) => {
    if (!file) {
      setNotification({ title: "Error", message: "No file selected." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const csv = event.target?.result as string;
            const lines = csv.split(/[\r\n]+/).filter(line => line.trim() !== ''); // More robust line splitting
            if (lines.length < 2) throw new Error("CSV file must contain a header row and at least one data row.");
            
            const headers = lines.shift()!.split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes from headers

            if (importType === 'Roster') {
                const requiredHeaders = ['Name', 'Badge', 'Contact'];
                if (!requiredHeaders.every(h => headers.includes(h))) {
                    throw new Error(`CSV must contain headers: ${requiredHeaders.join(', ')}`);
                }
                const newOfficers: Officer[] = lines.map((line, index) => {
                    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const officerData: {[key: string]: string} = {};
                    headers.forEach((header, i) => {
                         officerData[header] = values[i] || '';
                    });
                    return {
                        id: Date.now() + index,
                        name: officerData.Name, badge: officerData.Badge, contact: officerData.Contact,
                        lastTransport: 'N/A', totalTransports: 0,
                        availability: { Monday: 'Available', Tuesday: 'Available', Wednesday: 'Available', Thursday: 'Available', Friday: 'Available', Saturday: 'Off', Sunday: 'Off' },
                    };
                });
                setOfficers(prev => [...prev, ...newOfficers]);
                setNotification({ title: "Success", message: `${newOfficers.length} officers imported!`});
            } else if (importType === 'Schedule') {
                const requiredHeaders = ['Date', 'Prisoner_Name', 'Prisoner_ID', 'Pickup', 'Destination', 'Scheduled_Time', 'Notes'];
                 if (!requiredHeaders.every(h => headers.includes(h))) {
                    throw new Error(`CSV must contain headers: ${requiredHeaders.join(', ')}`);
                }
                const newSchedules: ScheduleItem[] = lines.map((line, index) => {
                    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                     const scheduleData: {[key: string]: string} = {};
                    headers.forEach((header, i) => {
                         scheduleData[header] = values[i] || '';
                    });
                    return {
                        id: Date.now() + index,
                        date: scheduleData.Date, prisonerName: scheduleData.Prisoner_Name, prisonerId: scheduleData.Prisoner_ID,
                        pickup: scheduleData.Pickup, destination: scheduleData.Destination,
                        scheduledPickupTime: scheduleData.Scheduled_Time, notes: scheduleData.Notes,
                        officers: [], status: 'Scheduled', actualPickupTime: '', actualDropoffTime: '',
                    };
                });
                setSchedule(prev => [...prev, ...newSchedules]);
                setNotification({ title: "Success", message: `${newSchedules.length} transports imported!`});
            }
            setIsImportModalOpen(false);
        } catch (error: any) {
            setNotification({ title: "Import Error", message: error.message || "An unknown error occurred during import." });
        }
    };
    reader.readAsText(file);
};


  const handleExport = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const transportsToExport = schedule.filter(s => s.status !== 'Canceled'); // Export all non-canceled for broader reporting
    
    if (transportsToExport.length === 0) {
        setNotification({ title: "No Data", message: "There are no active or completed transports to export." });
        return;
    }
    exportToCsv(transportsToExport, `All_Transports_${todayStr}`);
    setNotification({ title: "Export Started", message: "Your CSV report is being downloaded."});
  };

  const exportToCsv = (data: ScheduleItem[], filenamePrefix: string) => {
    const headers = ["ID", "Date", "Prisoner_ID", "Prisoner_Name", "Pickup", "Destination", "Scheduled_Time", "Actual_Pickup", "Actual_Dropoff", "Officers", "Status", "Notes"];
    const csvRows = [
        headers.join(','),
        ...data.map(row => [ 
            `"${row.id}"`,
            `"${row.date}"`, 
            `"${row.prisonerId}"`, 
            `"${row.prisonerName}"`, 
            `"${row.pickup}"`, 
            `"${row.destination}"`, 
            `"${row.scheduledPickupTime}"`, 
            `"${row.actualPickupTime}"`, 
            `"${row.actualDropoffTime}"`, 
            `"${row.officers.join('; ')}"`, 
            `"${row.status}"`, 
            `"${row.notes.replace(/"/g, '""')}"`
        ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filenamePrefix}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderHeaderButton = () => {
    return (
        <div className="flex items-center space-x-3 sm:space-x-4">
            {(view === 'Roster' || view === 'Schedule') && (
                 <button 
                    onClick={() => setIsImportModalOpen(true)} 
                    className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                    aria-label={`Import ${view} from CSV`}
                  >
                    <UploadIcon className="mr-0 sm:mr-2 h-5 w-5" /> <span className="hidden sm:inline">Import {view}</span>
                 </button>
            )}
            { (view === 'Schedule' || view === 'Roster' || view === 'Time Off') &&
                <button 
                    onClick={() => handleOpenModal(view)} 
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                    aria-label={view === 'Schedule' ? 'Schedule New Transport' : view === 'Roster' ? 'Add New Officer' : 'Add Time Off Request'}
                >
                <PlusIcon className="mr-0 sm:mr-2 h-5 w-5" /> 
                <span className="hidden sm:inline">{view === 'Schedule' ? 'New Transport' : view === 'Roster' ? 'New Officer' : 'Add Time Off'}</span>
                </button>
            }
        </div>
    );
  };
  
  const renderModalContent = () => {
    if (!modalContent.type) return null;
    switch (modalContent.type) {
      case 'Schedule': return <ScheduleForm item={modalContent.data as ScheduleItem | null} onSave={handleSave as any} onClose={handleCloseModal} officers={officers} />;
      case 'Roster': return <RosterForm item={modalContent.data as Officer | null} onSave={handleSave as any} onClose={handleCloseModal} />;
      case 'Time Off': return <TimeOffForm item={modalContent.data as TimeOffItem | null} onSave={handleSave as any} onClose={handleCloseModal} officers={officers} />;
      default: return null;
    }
  };
  
  const renderView = () => {
    switch(view) {
      case 'Schedule': return <ScheduleView schedule={schedule.filter(s => s.status !== 'Completed')} onStatusChange={handleStatusChange} onEdit={(item) => handleOpenModal('Schedule', item)} onDelete={handleDelete} onFindOfficer={handleFindNextOfficer} />;
      case 'Roster': return <RosterView officers={officers} onEdit={(item) => handleOpenModal('Roster', item)} onDelete={handleDelete} />;
      case 'Time Off': return <TimeOffView timeOff={timeOff} officers={officers} onEdit={(item) => handleOpenModal('Time Off', item)} onDelete={handleDelete} />;
      case 'Archived': return <ArchivedView schedule={schedule.filter(s => s.status === 'Completed')} onRestore={handleStatusChange} onDelete={handleDelete} />;
      default: return <div className="text-center py-10 text-gray-500">Selected view not available.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased">
      <nav className={`bg-slate-800 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out relative shadow-lg ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="absolute top-7 -right-3.5 z-20 p-1.5 bg-slate-700 text-white rounded-full hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
            title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
            aria-label={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
        >
            {isSidebarCollapsed ? <ChevronsRightIcon className="h-5 w-5" /> : <ChevronsLeftIcon className="h-5 w-5" />}
        </button>
        <div className="flex items-center justify-center text-xl font-bold text-center py-6 border-b border-slate-700 px-4">
            <div className={`flex items-center overflow-hidden`}>
                <img 
                    src="https://jetsecuritypros.com/wp-content/uploads/2022/10/Jet-Security-Pros-of-Massachusetts.png" 
                    alt="JET Security Logo" 
                    className="h-8 w-auto shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                />
                {!isSidebarCollapsed && <span className="ml-2.5 whitespace-nowrap">JET SECURITY</span>}
            </div>
        </div>
        <ul className="flex-grow overflow-y-auto pt-2">
          <NavItem icon={<CalendarIcon />} text="Schedule" active={view === 'Schedule'} onClick={() => setView('Schedule')} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<UsersIcon />} text="Officer Roster" active={view === 'Roster'} onClick={() => setView('Roster')} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<LogOutIcon />} text="Time Off" active={view === 'Time Off'} onClick={() => setView('Time Off')} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<ArchiveIcon className="text-[24px]" />} text="Archived" active={view === 'Archived'} onClick={() => setView('Archived')} isCollapsed={isSidebarCollapsed} />
        </ul>
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleExport} 
            title="Export All Transports Report" 
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 shadow-md"
            aria-label="Export All Transports Report"
          >
            <FileTextIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
            {!isSidebarCollapsed && 'Export Report'}
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">{view} Management</h1>
          {renderHeaderButton()}
        </header>
        {renderView()}
      </main>

      {isFormModalOpen && <FormModal onClose={handleCloseModal}>{renderModalContent()}</FormModal>}
      {isImportModalOpen && <ImportModal onImport={(file) => handleImportCsv(file, view)} onClose={() => setIsImportModalOpen(false)} importType={view} />}
      {notification && <NotificationModal title={notification.title} message={notification.message} onClose={() => setNotification(null)} />}
      {confirmation && <ConfirmationModal message={confirmation.message} onConfirm={() => handleConfirmation(true)} onCancel={() => handleConfirmation(false)} />}
    </div>
  );
};

export default App;
