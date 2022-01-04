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

interface AlertDeleteProps {
  children: ReactNode;
  footer: ReactNode;
  leastDestructiveRef: AlertDialogProps['leastDestructiveRef'];
  onClose: () => void;
  title: string;
}

export default function DialogWithDeletion({
  children,
  footer,
  leastDestructiveRef,
  onClose,
  title,
}: AlertDeleteProps): ReactElement {
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
