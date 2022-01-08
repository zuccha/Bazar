import * as Chakra from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';
import ErrorReport from '../utils/ErrorReport';
import Alert from './Alert';
import FormError from './FormError';

interface DrawerProps {
  buttons: ReactNode;
  children: ReactNode;
  error?: ErrorReport | undefined;
  info?: string;
  onClose: () => void;
  title: string;
}

export default function Drawer({
  buttons,
  children,
  error,
  info,
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

        <Chakra.DrawerBody
          p={4}
          w='100%'
          display='flex'
          flexDir='column'
          flex={1}
        >
          <Flex w='100%' flex={1}>
            {children}
          </Flex>
          <Flex flex={1} />
          <Chakra.VStack>
            {info && <Alert status='info'>{info}</Alert>}
            {error && <FormError errorReport={error} />}
          </Chakra.VStack>
        </Chakra.DrawerBody>

        <Chakra.DrawerFooter borderTopWidth='1px'>
          {buttons}
        </Chakra.DrawerFooter>
      </Chakra.DrawerContent>
    </Chakra.Drawer>
  );
}
