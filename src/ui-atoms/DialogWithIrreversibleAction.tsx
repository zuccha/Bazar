import { ReactElement, useRef } from 'react';
import Button from './Button';
import Dialog from './Dialog';

interface DialogWithIrreversibleActionProps {
  action: string;
  description?: string;
  isDisabled?: boolean;
  onClose: () => void;
  onDelete: () => Promise<unknown>;
  title: string;
}

export default function DialogWithIrreversibleAction({
  action,
  description = "Are you sure? You can't undo this action afterwards.",
  isDisabled,
  onClose,
  onDelete,
  title,
}: DialogWithIrreversibleActionProps): ReactElement {
  const cancelRef = useRef(null);

  return (
    <Dialog
      onClose={onClose}
      footer={
        <>
          <Button
            isDisabled={isDisabled}
            label='Cancel'
            onClick={onClose}
            ref={cancelRef}
            variant='outline'
          />
          <Button
            isDisabled={isDisabled}
            label={action}
            onClick={async () => {
              await onDelete();
              onClose();
            }}
            scheme='destructive'
            ml={3}
          />
        </>
      }
      leastDestructiveRef={cancelRef}
      title={title}
    >
      {description}
    </Dialog>
  );
}
