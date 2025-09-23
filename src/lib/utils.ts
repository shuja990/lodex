import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Human readable status labels for loads
const LOAD_STATUS_LABELS: Record<string, string> = {
  posted: 'Posted',
  assigned: 'Assigned',
  in_transit: 'In Transit',
  delivered_pending: 'Awaiting Approval',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function formatLoadStatus(status: string): string {
  return LOAD_STATUS_LABELS[status] || status.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
