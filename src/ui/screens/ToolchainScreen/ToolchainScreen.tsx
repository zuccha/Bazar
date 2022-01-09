import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import {
  useNavigateToolchain,
  useToolchainRoute,
} from '../../../navigation/hooks';
import { ToolchainRouteName } from '../../../navigation/Navigation';
import Header from '../../../ui-atoms/Header';
import NavigatorWithList from '../../../ui-atoms/NavigatorWithList';
import AssetsPage from './pages/AssetsPage';
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
  {
    id: ToolchainRouteName.Assets,
    label: 'Assets',
    content: <AssetsPage />,
  },
];

export default function ToolchainScreen(): ReactElement {
  const toolchainRoute = useToolchainRoute();
  const navigateToolchain = useNavigateToolchain();

  return (
    <Flex flex={1} h='100%' p={10} justifyContent='center'>
      <Flex w='100%' minW={600} maxW={800} flexDir='column'>
        <Header title='Tools' hideBorderBottom />
        <NavigatorWithList
          selectedPage={toolchainRoute}
          pages={pages}
          onSelectPage={navigateToolchain}
          flex={1}
          height={1}
          width='100%'
        />
      </Flex>
    </Flex>
  );
}
