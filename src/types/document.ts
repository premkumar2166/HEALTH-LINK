export interface DocumentMetadata {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string; // userId
  uploadedByName: string;
  uploadedAt: string;
  patientId: string; // The patient this document belongs to
  documentType: 'Lab Report' | 'Prescription' | 'Imaging' | 'Clinical Note' | 'Other';
}

export interface AccessEvent {
  id: string;
  documentId: string;
  accessedBy: string;
  accessedByName: string;
  role: string;
  accessedAt: string;
  action: 'UPLOAD' | 'VIEW' | 'DOWNLOAD';
}
