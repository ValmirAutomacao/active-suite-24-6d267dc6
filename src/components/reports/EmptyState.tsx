import React from 'react';
import { AlertCircle, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'database' | 'alert' | 'refresh';
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'database',
  actionLabel,
  onAction
}) => {
  const IconComponent = icon === 'alert' ? AlertCircle : icon === 'refresh' ? RefreshCw : Database;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8">
        <IconComponent className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-center mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;