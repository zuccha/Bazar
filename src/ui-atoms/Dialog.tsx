import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
} from '@chakra-ui/react';
import { ReactElement, ReactNode, useRef } from 'react';

interface DialogProps {
  children: ReactNode;
  footer: ReactNode;
  leastDestructiveRef: AlertDialogProps['leastDestructiveRef'];
  onClose: () => void;
  title: string;
}

export default function Dialog({
  children,
  footer,
  leastDestructiveRef,
  onClose,
  title,
}: DialogProps): ReactElement {
  const cancelRef = useRef(null);

  return (
    <AlertDialog
      isOpen
      onClose={onClose}
      leastDestructiveRef={leastDestructiveRef}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogBody>{children}</AlertDialogBody>
          <AlertDialogFooter>{footer}</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
