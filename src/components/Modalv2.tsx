import { ReactNode } from 'react';
import Modal from '@/shared/ui/Modal';

export type CustomModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onAccept: () => void;
  acceptText?: string;
  variant?: 'primary' | 'danger';
};

const CustomModal = ({ title, children, onClose, onAccept, acceptText = 'Aceptar', variant = 'primary' }: CustomModalProps) => {
  return (
    <Modal
      isOpen
      title={title}
      description={children}
      onCancel={onClose}
      onAccept={onAccept}
      acceptText={acceptText}
      variant={variant}
    />
  );
};

export default CustomModal;
