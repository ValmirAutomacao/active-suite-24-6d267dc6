import React from 'react';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue' | 'active' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    paid: { label: 'Pago', bgColor: 'bg-success', textColor: 'text-success-foreground' },
    pending: { label: 'Pendente', bgColor: 'bg-warning', textColor: 'text-warning-foreground' },
    overdue: { label: 'Atrasado', bgColor: 'bg-destructive', textColor: 'text-destructive-foreground' },
    active: { label: 'Ativo', bgColor: 'bg-success', textColor: 'text-success-foreground' },
    inactive: { label: 'Inativo', bgColor: 'bg-muted', textColor: 'text-muted-foreground' }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = configs[status];

  // Se status não for reconhecido, usar um padrão
  if (!config) {
    return (
      <span className={`
        bg-gray-100 text-gray-800 ${sizeClasses[size]}
        rounded-lg font-medium inline-flex items-center transition-all
      `}>
        {status || 'Unknown'}
      </span>
    );
  }

  return (
    <span className={`
      ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
      rounded-lg font-medium inline-flex items-center transition-all
    `}>
      {config.label}
    </span>
  );
};

export default StatusBadge;