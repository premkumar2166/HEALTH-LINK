import { 
  Room, Bed, Admission, Invoice, InventoryItem, AuditLog, 
  BedStatus, RoomStatus, AdmissionStatus, InvoiceStatus 
} from '@/types/hospital';

declare global {
  var __mockRooms: Room[] | undefined;
  var __mockBeds: Bed[] | undefined;
  var __mockAdmissions: Admission[] | undefined;
  var __mockInvoices: Invoice[] | undefined;
  var __mockInventory: InventoryItem[] | undefined;
  var __mockAuditLogs: AuditLog[] | undefined;
}

if (!global.__mockRooms) {
  global.__mockRooms = [];
}

if (!global.__mockBeds) {
  global.__mockBeds = [];
}

if (!global.__mockAdmissions) {
  global.__mockAdmissions = [];
}

if (!global.__mockInvoices) {
  global.__mockInvoices = [];
}

if (!global.__mockInventory) {
  global.__mockInventory = [];
}

if (!global.__mockAuditLogs) {
  global.__mockAuditLogs = [];
}

export const mockRooms = global.__mockRooms;
export const mockBeds = global.__mockBeds;
export const mockAdmissions = global.__mockAdmissions;
export const mockInvoices = global.__mockInvoices;
export const mockInventory = global.__mockInventory;
export const mockAuditLogs = global.__mockAuditLogs;

export function addAuditLog(userId: string, userName: string, action: string, entityType: AuditLog['entityType'], entityId: string, details: string) {
  global.__mockAuditLogs?.push({
    id: `log_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    entityType,
    entityId,
    details
  });
}
