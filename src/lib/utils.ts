import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Human readable status labels for loads
// Updated human readable labels per latest product terminology
// accepted in transit mark as delivered delivery accepted
const LOAD_STATUS_LABELS: Record<string, string> = {
  posted: 'Posted',
  assigned: 'Accepted',
  in_transit: 'In Transit',
  delivered_pending: 'Marked as Delivered', // Carrier marked delivered – awaiting shipper approval
  delivered: 'Delivery Accepted',           // Shipper approved delivery
  cancelled: 'Cancelled'
};

export function formatLoadStatus(status: string): string {
  return LOAD_STATUS_LABELS[status] || status.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
