import { clsx, type ClassValue } from "clsx"
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  addYears,
  addMonths,
} from "date-fns"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeDifference(startDate: Date, endDate: Date) {
  const totalSeconds = Math.max(0, differenceInSeconds(endDate, startDate))
  const years = differenceInYears(endDate, startDate)
  const months = differenceInMonths(endDate, addYears(startDate, years))
  const days = differenceInDays(endDate, addMonths(addYears(startDate, years), months))
  const hours = differenceInHours(endDate, addMonths(addYears(startDate, years), months)) % 24
  const minutes = differenceInMinutes(endDate, addMonths(addYears(startDate, years), months)) % 60
  const seconds = totalSeconds % 60

  return {
    total: totalSeconds * 1000,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  }
}

// Function to sanitize HTML content
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_TAGS: ['img'],
    ADD_ATTR: ['target'],
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
  })
}

/**
 * Decode JWT token and extract payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if JWT token is expired or will expire soon
 * @param token - JWT token string
 * @param bufferMinutes - Minutes before expiration to consider token as "expiring soon" (default: 5)
 * @returns true if token is expired or expiring soon, false otherwise
 */
export function isTokenExpiringSoon(token: string, bufferMinutes: number = 5): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // If we can't decode or no exp, consider it expired
  }
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = bufferMinutes * 60 * 1000; // Convert buffer to milliseconds
  
  // Token is expiring soon if expiration is within the buffer time
  return expirationTime - currentTime <= bufferTime;
}

