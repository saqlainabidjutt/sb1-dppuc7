export const formatDate = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date input:', dateString);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Date parsing error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date input:', dateString);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('Date parsing error:', error);
    return 'Invalid Date';
  }
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const getDefaultDateRange = () => {
  const timeZone = 'Europe/Madrid';

  // Get current date in Madrid time zone
  const now = new Date();
  //now.setDate(now.getDate() - 30);
  // Get the current date components in Madrid time zone
  const madridNow = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const [year, month, day] = madridNow.split('-').map(Number);

  // First day of the current month in Madrid time zone
  const firstDay = new Date(Date.UTC(year, month - 1, 1));

  // Last day of the current month in Madrid time zone
  const lastDay = new Date(Date.UTC(year, month, 0));

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
};
