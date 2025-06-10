
import React, { useState }from 'react';
import { ScheduleItem, Officer, TimeOffItem, Availability, DayOfWeek } from '../types';
import { TimePicker24Hour } from './CommonUI';
import { TrashIcon } from '../constants';

interface ScheduleFormProps {
  item: ScheduleItem | null;
  onSave: (type: 'Schedule', itemData: ScheduleItem) => void;
  onClose: () => void;
  officers: Officer[];
}

// White SVG arrow for dark selects
const whiteSelectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`;

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ item, onSave, onClose, officers: allOfficers }) => {
    
    const getInitialOfficers = () => {
        const initial = item?.officers || [];
        while (initial.length < 2) {
            initial.push(''); 
        }
        return initial;
    };

    const [formData, setFormData] = useState<ScheduleItem>(() => ({
        id: item?.id || 0,
        date: item?.date || '',
        prisonerName: item?.prisonerName || '',
        prisonerId: item?.prisonerId || '',
        pickup: item?.pickup || '',
        destination: item?.destination || '',
        notes: item?.notes || '',
        scheduledPickupTime: item?.scheduledPickupTime || '',
        actualPickupTime: item?.actualPickupTime || '',
        actualDropoffTime: item?.actualDropoffTime || '',
        officers: getInitialOfficers(),
        status: item?.status || 'Scheduled',
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | {target: {name: string, value: string}} ) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
    
    const handleOfficerChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const newOfficers = [...formData.officers];
        newOfficers[index] = e.target.value;
        setFormData(prev => ({ ...prev, officers: newOfficers }));
    };

    const handleAddOfficer = () => {
        setFormData(prev => ({ ...prev, officers: [...prev.officers, ''] }));
    };

    const handleRemoveOfficer = (index: number) => {
        setFormData(prev => ({ ...prev, officers: prev.officers.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        const finalData = { ...formData, officers: formData.officers.filter(name => name && name !== "") };
        onSave('Schedule', finalData);
    };
    
    const darkInputBaseClasses = "block w-full p-2.5 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 focus:ring-offset-2 focus:ring-offset-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{item?.id ? 'Edit' : 'New'} Transport</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={darkInputBaseClasses} style={{colorScheme: 'dark'}} required />
                </div>
                <div>
                    <label htmlFor="prisonerId" className="block text-sm font-medium text-gray-700 mb-1">Prisoner ID</label>
                    <input type="text" name="prisonerId" id="prisonerId" placeholder="Prisoner ID" value={formData.prisonerId} onChange={handleChange} className={darkInputBaseClasses} />
                </div>
            </div>
            
            <div>
                <label htmlFor="prisonerName" className="block text-sm font-medium text-gray-700 mb-1">Prisoner Name</label>
                <input type="text" name="prisonerName" id="prisonerName" placeholder="Prisoner Name" value={formData.prisonerName} onChange={handleChange} className={darkInputBaseClasses} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                    <input type="text" name="pickup" id="pickup" placeholder="e.g., Denton County Jail" value={formData.pickup} onChange={handleChange} className={darkInputBaseClasses} />
                </div>
                 <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <input type="text" name="destination" id="destination" placeholder="e.g., Huntsville Unit" value={formData.destination} onChange={handleChange} className={darkInputBaseClasses} />
                </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Transport Times</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Pickup</label>
                        <TimePicker24Hour name="scheduledPickupTime" value={formData.scheduledPickupTime} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Pickup</label>
                        <TimePicker24Hour name="actualPickupTime" value={formData.actualPickupTime} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Dropoff</label>
                        <TimePicker24Hour name="actualDropoffTime" value={formData.actualDropoffTime} onChange={handleChange} />
                    </div>
                 </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Officers</label>
              {formData.officers.map((officerName, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                      <select 
                          value={officerName} 
                          onChange={(e) => handleOfficerChange(e, index)} 
                          className={`${darkInputBaseClasses} appearance-none pr-10`}
                          style={{ backgroundImage: whiteSelectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: `right 0.75rem center`, backgroundSize: `1em 1em` }}
                      >
                          <option value="">-- Select Officer --</option>
                          {allOfficers.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                      </select>
                      {formData.officers.length > 0 && (
                        <button type="button" onClick={() => handleRemoveOfficer(index)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-100" title="Remove Officer">
                            <TrashIcon className="text-[18px]" />
                        </button>
                      )}
                  </div>
              ))}
              <button type="button" onClick={handleAddOfficer} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                  + Add another officer
              </button>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" id="notes" placeholder="e.g., high risk, medical needs" value={formData.notes} onChange={handleChange} className={`${darkInputBaseClasses} min-h-[60px]`} rows={3}></textarea>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Save Transport</button>
            </div>
        </form>
    );
};

interface RosterFormProps {
  item: Officer | null;
  onSave: (type: 'Roster', itemData: Officer) => void;
  onClose: () => void;
}

export const RosterForm: React.FC<RosterFormProps> = ({ item, onSave, onClose }) => {
    const initialAvailability: Availability = { Monday: 'Available', Tuesday: 'Available', Wednesday: 'Available', Thursday: 'Available', Friday: 'Available', Saturday: 'Off', Sunday: 'Off' };
    
    const [formData, setFormData] = useState<Officer>(() => ({
        id: item?.id || 0,
        name: item?.name || '',
        badge: item?.badge || '',
        contact: item?.contact || '',
        availability: item?.availability || initialAvailability,
        lastTransport: item?.lastTransport || 'N/A',
        totalTransports: item?.totalTransports || 0,
    }));

    const formatPhoneNumber = (phoneNumberString: string): string => {
      const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
      if (cleaned.length === 10) {
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
      }
      return phoneNumberString;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>, day: DayOfWeek) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            availability: { ...prev.availability, [day]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            contact: formatPhoneNumber(formData.contact)
        };
        onSave('Roster', formattedData);
    };

    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const availabilityOptions = ['Available', 'Off', 'Training', 'Sick'];
    const formInputBaseClasses = "w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500";


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{item?.id ? 'Edit' : 'New'} Officer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={formInputBaseClasses} required />
                </div>
                <div>
                    <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-1">Badge #</label>
                    <input type="text" name="badge" id="badge" value={formData.badge} onChange={handleChange} className={formInputBaseClasses} />
                </div>
            </div>
            <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact #</label>
                <input type="text" name="contact" id="contact" value={formData.contact} onChange={handleChange} placeholder="(XXX) XXX-XXXX" className={formInputBaseClasses} />
            </div>
            <div className="border-t border-gray-200 pt-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Weekly Availability</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
                    {days.map(day => (
                        <div key={day}>
                            <label htmlFor={day} className="block text-sm font-medium text-gray-700 mb-1">{day}</label>
                            <select name={day} id={day} value={formData.availability[day]} onChange={(e) => handleAvailabilityChange(e, day as DayOfWeek)} className={formInputBaseClasses}>
                                {availabilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    ))}
                 </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Save Officer</button>
            </div>
        </form>
    );
};

interface TimeOffFormProps {
  item: TimeOffItem | null;
  onSave: (type: 'Time Off', itemData: TimeOffItem) => void;
  onClose: () => void;
  officers: Officer[];
}
export const TimeOffForm: React.FC<TimeOffFormProps> = ({ item, onSave, onClose, officers }) => {
    const [formData, setFormData] = useState<TimeOffItem>(() => ({
        id: item?.id || 0,
        officerId: item?.officerId || '',
        start: item?.start || '',
        end: item?.end || '',
        reason: item?.reason || '',
    }));
    
    const formInputBaseClasses = "w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500";


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'officerId' && value ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.officerId) {
            alert("Please select an officer.");
            return;
        }
        onSave('Time Off', formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{item?.id ? 'Edit' : 'Add'} Time Off</h2>
            <div>
                <label htmlFor="officerId" className="block text-sm font-medium text-gray-700 mb-1">Officer</label>
                <select name="officerId" id="officerId" value={formData.officerId} onChange={handleChange} className={formInputBaseClasses} required>
                    <option value="">-- Select Officer --</option>
                    {officers.map(o => <option key={o.id} value={o.id}>{o.name} (Badge: {o.badge})</option>)}
                </select>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" name="start" id="start" value={formData.start} onChange={handleChange} className={formInputBaseClasses} required />
                </div>
                <div>
                    <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" name="end" id="end" value={formData.end} onChange={handleChange} className={formInputBaseClasses} required />
                </div>
            </div>
             <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input type="text" name="reason" id="reason" placeholder="e.g., Vacation, Sick Leave" value={formData.reason} onChange={handleChange} className={formInputBaseClasses} />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Save Time Off</button>
            </div>
        </form>
    );
};
