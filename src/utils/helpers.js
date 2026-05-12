import { format, formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd/MM/yyyy HH:mm', locale = 'vi') => {
  if (!date) return '';
  const d = new Date(date);
  
  // Chuyển đổi timestamp để date-fns format theo múi giờ UTC+7 thay vì múi giờ local của trình duyệt
  const utc7Epoch = d.getTime() + (d.getTimezoneOffset() * 60000) + (7 * 3600000);
  const dateInUTC7 = new Date(utc7Epoch);

  return format(dateInUTC7, formatStr, { locale: locale === 'vi' ? vi : enUS });
};

export const formatDateRelative = (date, locale = 'vi') => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: locale === 'vi' ? vi : enUS });
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0 phút';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
};

export const formatPrice = (price, currency = 'VND') => {
  if (!price || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(price);
};

export const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (firstName, lastName, name, fullName) => {
  // Support firstName/lastName pair OR combined name/fullName string
  if (firstName || lastName) {
    const f = firstName ? firstName[0].toUpperCase() : '';
    const l = lastName ? lastName[0].toUpperCase() : '';
    return `${f}${l}` || '?';
  }
  const combinedName = fullName || name;
  if (combinedName) {
    const parts = combinedName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
  }
  return '?';
};

export const getDisplayName = (user) => {
  if (!user) return '';
  if (user.fullName) return user.fullName.trim();
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return user.name || user.email || '';
};

export const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${import.meta.env.VITE_API_BASE_URL}/uploads/${avatar}`;
};

export const getStarArray = (rating) => {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });
};
