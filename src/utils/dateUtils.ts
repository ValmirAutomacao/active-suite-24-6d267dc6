/**
 * Utilitários para manipulação de datas no timezone do Brasil
 * Timezone: America/Sao_Paulo (UTC-3)
 */

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';
export const BRAZIL_LOCALE = 'pt-BR';

/**
 * Formata data para o padrão brasileiro (dd/mm/yyyy)
 */
export const formatDateBR = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Formata data para input HTML (yyyy-mm-dd)
 */
export const formatDateForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('sv-SE', { // formato yyyy-mm-dd
    timeZone: BRAZIL_TIMEZONE
  }).format(dateObj);
};

/**
 * Formata horário para o padrão brasileiro (HH:mm)
 */
export const formatTimeBR = (time: string | Date): string => {
  if (typeof time === 'string') {
    // Se já está no formato HH:mm, retorna direto
    if (/^\d{2}:\d{2}$/.test(time)) return time;

    // Se é um timestamp, converte para Date
    const date = new Date(time);
    return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
      timeZone: BRAZIL_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(time);
};

/**
 * Obtém a data atual no timezone do Brasil
 */
export const getCurrentDateBrazil = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
};

/**
 * Obtém a data atual formatada para input (yyyy-mm-dd)
 */
export const getCurrentDateForInput = (): string => {
  return formatDateForInput(getCurrentDateBrazil());
};

/**
 * Converte data do input (yyyy-mm-dd) para Date no timezone do Brasil
 */
export const parseInputDate = (inputDate: string): Date => {
  const [year, month, day] = inputDate.split('-').map(Number);

  // Cria data no timezone do Brasil
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return date;
};

/**
 * Verifica se uma data é hoje no timezone do Brasil
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = getCurrentDateBrazil();

  return dateObj.toDateString() === today.toDateString();
};

/**
 * Verifica se uma data é no passado no timezone do Brasil
 */
export const isPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = getCurrentDateBrazil();
  today.setHours(0, 0, 0, 0);

  return dateObj < today;
};

/**
 * Verifica se uma data é no futuro no timezone do Brasil
 */
export const isFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = getCurrentDateBrazil();
  today.setHours(23, 59, 59, 999);

  return dateObj > today;
};

/**
 * Formata data e hora completa para exibição brasileira
 */
export const formatDateTimeBR = (date: Date | string, time?: string): string => {
  const dateFormatted = formatDateBR(date);

  if (time) {
    return `${dateFormatted} às ${time}`;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const timeFormatted = formatTimeBR(dateObj);

  return `${dateFormatted} às ${timeFormatted}`;
};

/**
 * Obtém nome do dia da semana em português
 */
export const getDayOfWeekBR = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    weekday: 'long'
  }).format(dateObj);
};

/**
 * Obtém nome do mês em português
 */
export const getMonthNameBR = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    month: 'long'
  }).format(dateObj);
};

/**
 * Adiciona dias a uma data no timezone do Brasil
 */
export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Calcula diferença em dias entre duas datas
 */
export const diffInDays = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Formata período de tempo (ex: "14:00 às 16:00")
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} às ${endTime}`;
};

/**
 * Valida se horário está no formato correto (HH:mm)
 */
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Converte minutos para formato HH:mm
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Converte formato HH:mm para minutos
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Verifica se um horário é anterior a outro
 */
export const isTimeBefore = (time1: string, time2: string): boolean => {
  return timeToMinutes(time1) < timeToMinutes(time2);
};

/**
 * Verifica se um horário é posterior a outro
 */
export const isTimeAfter = (time1: string, time2: string): boolean => {
  return timeToMinutes(time1) > timeToMinutes(time2);
};

/**
 * Array com nomes dos meses em português
 */
export const MONTHS_BR = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Array com nomes dos dias da semana em português
 */
export const DAYS_OF_WEEK_BR = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

/**
 * Array com abreviações dos dias da semana
 */
export const DAYS_OF_WEEK_SHORT_BR = [
  'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
];

/**
 * Mapeamento de valores de frequência para português
 */
export const FREQUENCY_LABELS = {
  daily: 'Único',
  weekly: 'Semanal',
  monthly: 'Mensal'
} as const;

/**
 * Mapeamento de tipos de evento para português
 */
export const EVENT_TYPE_LABELS = {
  training: 'Treino',
  match: 'Jogo/Partida',
  evaluation: 'Avaliação',
  meeting: 'Reunião',
  special: 'Evento Especial',
  inaugural: 'Aula Inaugural'
} as const;