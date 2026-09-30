export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: BedStatus;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: 'General' | 'ICU' | 'Maternity' | 'Pediatrics' | 'Isolation' | 'Operation Theater';
  department: string;
  capacity: number;
  status: RoomStatus;
}

export enum AdmissionStatus {
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
  TRANSFERRED = 'TRANSFERRED'
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  roomId: string;
  bedId: string;
  admissionDate: string;
  dischargeDate?: string;
  dischargeSummary?: string;
  dischargeDocuments?: string[];
  status: AdmissionStatus;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  admissionId?: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  paymentReference?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medicine' | 'Equipment' | 'Consumable' | 'Other';
  quantity: number;
  lowStockThreshold: number;
  supplierInformation: string;
  lastRestocked: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'Admission' | 'Discharge' | 'Bed' | 'Room' | 'Billing' | 'Inventory';
  entityId: string;
  details: string;
}
