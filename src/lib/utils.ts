import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(number: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export type StoreType = 'retail' | 'printing' | 'general';

export function getStoreType(email: string): StoreType {
  if (email.includes('@arjuna.digital')) {
    return 'printing';
  } 
  if (email.includes('@arjuna.seragam')) {
    return 'retail';
  }
  return 'general'; 
}