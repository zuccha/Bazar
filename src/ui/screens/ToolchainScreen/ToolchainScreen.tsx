import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import {
  useNavigateToolchain,
  useToolchainRoute,
} from '../../../navigation/hooks';
import { ToolchainRouteName } from '../../../navigation/Navigation';
import ListNavigator from '../../../ui-atoms/display/ListNavigator';
import CustomToolsPage from './pages/CustomToolsPage';
import EmbeddedToolsPage from './pages/EmbeddedToolsPage';

const pages = [
  {
    id: ToolchainRouteName.Embedded,
    label: 'Embedded',
    content: <EmbeddedToolsPage />,
  },
  {
    id: ToolchainRouteName.Custom,
    label: 'Custom',
    content: <CustomToolsPage />,
  },
];

export default function ToolchainScreen(): ReactElement {
  const toolchainRoute = useToolchainRoute();
  const navigateToolchain = useNavigateToolchain();

  return (
    <Flex flex={1} h='100%' p={10} justifyContent='center'>
      <Flex w='100%' minW={600} maxW={800} position='relative'>
        <ListNavigator
          selectedPage={toolchainRoute}
          pages={pages}
          onSelectPage={navigateToolchain}
          height='100%'
          width='100%'
        />
      </Flex>
    </Flex>
  );
}
