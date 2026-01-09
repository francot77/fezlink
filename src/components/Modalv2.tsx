import { ReactNode } from 'react';
import Modal from '@/shared/ui/Modal';

export type CustomModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onAccept: () => void;
  acceptText?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
};

const CustomModal = ({ title, children, onClose, onAccept, acceptText = 'Aceptar', variant = 'primary', isLoading = false, disabled = false }: CustomModalProps) => {
  return (
    <Modal
      isOpen
      title={title}
      description={children}
      onCancel={onClose}
      onAccept={onAccept}
      acceptText={acceptText}
      variant={variant}
      isLoading={isLoading}
      disabled={disabled}
    />
  );
};

export default CustomModal;
