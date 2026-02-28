import { format, parseISO } from 'date-fns';

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy hh:mm a');
  } catch (error) {
    return dateString;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'hh:mm a');
  } catch (error) {
    return dateString;
  }
};

export const toISOString = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    return '';
  }
};
