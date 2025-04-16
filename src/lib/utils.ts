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

