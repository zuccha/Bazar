import * as Chakra from '@chakra-ui/react';
import { ReactElement, useRef } from 'react';
import Button from '../input/Button';

interface AlertDeleteProps {
  onClose: () => void;
  onDelete: () => void;
  title: string;
}

export default function AlertDelete({
  onClose,
  onDelete,
  title,
}: AlertDeleteProps): ReactElement {
  const cancelRef = useRef(null);

  return (
    <Chakra.AlertDialog
      isOpen
      onClose={onClose}
      leastDestructiveRef={cancelRef}
    >
      <Chakra.AlertDialogOverlay>
        <Chakra.AlertDialogContent>
          <Chakra.AlertDialogHeader>{title}</Chakra.AlertDialogHeader>

          <Chakra.AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </Chakra.AlertDialogBody>

          <Chakra.AlertDialogFooter>
            <Button
              label='Cancel'
              onClick={onClose}
              ref={cancelRef}
              variant='outline'
            />
            <Button
              label='Delete'
              onClick={() => {
                onDelete();
                onClose();
              }}
              scheme='destructive'
              ml={3}
            />
          </Chakra.AlertDialogFooter>
        </Chakra.AlertDialogContent>
      </Chakra.AlertDialogOverlay>
    </Chakra.AlertDialog>
  );
}
