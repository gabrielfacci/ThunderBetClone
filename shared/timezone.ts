// Timezone utilities for São Paulo, Brazil
export const SAO_PAULO_TIMEZONE = 'America/Sao_Paulo';

export function formatDateBrazil(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatDateTimeBrazil(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateShortBrazil(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTimeOnlyBrazil(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getNowBrazil(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: SAO_PAULO_TIMEZONE }));
}

export function getNowBrazilISO(): string {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: SAO_PAULO_TIMEZONE }));
  return brazilTime.toISOString();
}