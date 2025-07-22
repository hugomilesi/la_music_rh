
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PermissionAlertProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  action?: string;
  variant?: 'warning' | 'error' | 'info';
  showContactAdmin?: boolean;
  onContactAdmin?: () => void;
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({
  open,
  onOpenChange,
  title = 'Acesso Restrito',
  description = 'Você não tem permissão para realizar esta ação.',
  action,
  variant = 'warning',
  showContactAdmin = true,
  onContactAdmin
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <Lock className="h-4 w-4" />;
      case 'info':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertClass = () => {
    switch (variant) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    }
  };

  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
              {action && ` Para ${action}, `}
              {showContactAdmin && 'entre em contato com um administrador do sistema.'}
            </DialogDescription>
          </DialogHeader>
          {showContactAdmin && onContactAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onContactAdmin}
              className="mt-2"
            >
              Solicitar Acesso
            </Button>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Alert className={getAlertClass()}>
      {getIcon()}
      <AlertDescription>
        <div className="space-y-2">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm">
              {description}
              {action && ` Para ${action}, `}
              {showContactAdmin && 'entre em contato com um administrador do sistema.'}
            </p>
          </div>
          {showContactAdmin && onContactAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onContactAdmin}
              className="mt-2"
            >
              Solicitar Acesso
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PermissionAlert;
