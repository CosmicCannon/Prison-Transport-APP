
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Availability {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  [key: string]: string; // For dynamic access
}

export interface Officer {
  id: number;
  name: string;
  badge: string;
  contact: string;
  lastTransport: string; // Could be date string or 'N/A'
  totalTransports: number;
  availability: Availability;
}

export type TransportStatus = 'Scheduled' | 'Completed' | 'Canceled';

export interface ScheduleItem {
  id: number;
  date: string; // YYYY-MM-DD
  prisonerName: string;
  prisonerId: string;
  pickup: string;
  destination: string;
  officers: string[]; // Array of officer names
  status: TransportStatus;
  notes: string;
  scheduledPickupTime: string; // HH:mm
  actualPickupTime: string;    // HH:mm
  actualDropoffTime: string;   // HH:mm
}

export interface TimeOffItem {
  id: number;
  officerId: number | string; // string when empty in form, number otherwise
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  reason: string;
}

export interface ModalContent {
  type: 'Schedule' | 'Roster' | 'Time Off' | '';
  data: ScheduleItem | Officer | TimeOffItem | null;
}

export interface NotificationPayload {
  title: string;
  message: string;
}

export interface ConfirmationPayload {
  message: string;
  onConfirm: () => void;
}

export type ViewType = 'Schedule' | 'Roster' | 'Time Off' | 'Archived';

// Props for Icon components
export interface IconProps extends React.SVGProps<SVGSVGElement> {}
