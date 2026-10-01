export const formatOrderTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  // The Vercel backend sends "YYYY-MM-DDTHH:mm:ss.sssZ" where the time is actually local time (e.g. IST).
  // Stripping the 'Z' forces JavaScript to evaluate it as local time instead of converting it from UTC.
  const localDateStr = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString;
  const d = new Date(localDateStr);
  
  // If parsing fails, fallback
  if (isNaN(d.getTime())) return new Date(dateString).toLocaleString();
  
  return d.toLocaleString();
};

export const formatOrderTimeOnly = (dateString) => {
  if (!dateString) return 'N/A';
  const localDateStr = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString;
  const d = new Date(localDateStr);
  
  if (isNaN(d.getTime())) return new Date(dateString).toLocaleTimeString();
  
  return d.toLocaleTimeString();
};
