import type { ReactNode } from 'react';
import {
  Modal as HModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';

/** Modal do design system (encapsula HeroUI Modal). */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <HModal isOpen={isOpen} onClose={onClose} placement="center" backdrop="blur">
      <ModalContent>
        {title && <ModalHeader className="text-lg font-semibold">{title}</ModalHeader>}
        <ModalBody className="pb-2">{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </HModal>
  );
}
