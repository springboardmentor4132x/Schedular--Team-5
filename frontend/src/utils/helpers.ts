import { Facebook, Instagram, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

export const platformConfig = {
  facebook: { name: 'Facebook', icon: Facebook, color: '#1877F2', bgColor: 'bg-[#1877F2]' },
  instagram: { name: 'Instagram', icon: Instagram, color: '#E1306C', bgColor: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
  twitter: { name: 'Twitter', icon: Twitter, color: '#1DA1F2', bgColor: 'bg-[#1DA1F2]' },
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', bgColor: 'bg-[#0A66C2]' },
  youtube: { name: 'YouTube', icon: Youtube, color: '#FF0000', bgColor: 'bg-[#FF0000]' },
  pinterest: { name: 'Pinterest', icon: Globe, color: '#E60023', bgColor: 'bg-[#E60023]' },
};

export const getPlatformConfig = (platform: string) => {
  return (platformConfig as any)[platform] || { name: platform, icon: Globe, color: '#6B7280', bgColor: 'bg-gray-500' };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
