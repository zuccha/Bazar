import * as Chakra from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';

interface DrawerProps {
  buttons: ReactNode;
  children: ReactNode;
  onClose: () => void;
  title: string;
}

export default function Drawer({
  buttons,
  children,
  onClose,
  title,
}: DrawerProps): ReactElement {
  return (
    <Chakra.Drawer isOpen placement='right' onClose={onClose} size='sm'>
      <Chakra.DrawerOverlay />
      <Chakra.DrawerContent>
        <Chakra.DrawerCloseButton />
        <Chakra.DrawerHeader borderBottomWidth='1px'>
          {title}
        </Chakra.DrawerHeader>

        <Chakra.DrawerBody p={4}>{children}</Chakra.DrawerBody>

        <Chakra.DrawerFooter borderTopWidth='1px'>
          {buttons}
        </Chakra.DrawerFooter>
      </Chakra.DrawerContent>
    </Chakra.Drawer>
  );
}
