import * as Chakra from '@chakra-ui/react';
import { ReactElement, useRef } from 'react';
import Button from './Button';

interface AlertDeleteProps {
  isDisabled?: boolean;
  onClose: () => void;
  onDelete: () => Promise<unknown>;
  title: string;
}

export default function DialogWithDeletion({
  isDisabled,
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
              isDisabled={isDisabled}
              label='Cancel'
              onClick={onClose}
              ref={cancelRef}
              variant='outline'
            />
            <Button
              isDisabled={isDisabled}
              label='Delete'
              onClick={async () => {
                await onDelete();
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
