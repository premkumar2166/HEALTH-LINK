import { DocumentMetadata, AccessEvent } from '@/types/document';

declare global {
  var __mockDocuments: DocumentMetadata[] | undefined;
  var __mockAccessEvents: AccessEvent[] | undefined;
}

if (!global.__mockDocuments) {
  global.__mockDocuments = [];
}

if (!global.__mockAccessEvents) {
  global.__mockAccessEvents = [];
}

export const mockDocuments = global.__mockDocuments;
export const mockAccessEvents = global.__mockAccessEvents;
