import { Flex, Heading } from '@chakra-ui/react';
import { ReactElement, useMemo } from 'react';
import {
  useNavigateTemplates,
  useTemplatesRoute,
} from '../../../navigation/hooks';
import { CollectionRouteName } from '../../../navigation/Navigation';
import ComingSoon from '../../../ui-atoms/ComingSoon';
import Header from '../../../ui-atoms/Header';
import NavigatorWithList from '../../../ui-atoms/NavigatorWithList';
import ProjectsCollectionPage from './pages/ProjectsCollectionPage';

export default function CollectionScreen(): ReactElement {
  const projectRoute = useTemplatesRoute();
  const navigateTemplates = useNavigateTemplates();

  const pages = useMemo(
    () => [
      {
        id: CollectionRouteName.Projects,
        label: 'Projects',
        content: <ProjectsCollectionPage />,
      },
      {
        id: CollectionRouteName.Blocks,
        label: 'Blocks',
        content: <ComingSoon title='Blocks' />,
        isDisabled: true,
      },
      {
        id: CollectionRouteName.Music,
        label: 'Music',
        content: <ComingSoon title='Music' />,
        isDisabled: true,
      },
      {
        id: CollectionRouteName.Patches,
        label: 'Patches',
        content: <ComingSoon title='Patches' />,
        isDisabled: true,
      },
      {
        id: CollectionRouteName.Sprites,
        label: 'Sprites',
        content: <ComingSoon title='Sprites' />,
        isDisabled: true,
      },
      {
        id: CollectionRouteName.UberAsm,
        label: 'UberAsm',
        content: <ComingSoon title='UberAsm' />,
        isDisabled: true,
      },
      {
        id: CollectionRouteName.GFX,
        label: 'GFX',
        content: <ComingSoon title='GFX' />,
        isDisabled: true,
      },
      {
        id: CollectionRouteName.ExGFX,
        label: 'ExGFX',
        content: <ComingSoon title='ExGFX' />,
        isDisabled: true,
      },
    ],
    [],
  );

  return (
    <Flex flex={1} h='100%' p={10} justifyContent='center'>
      <Flex w='100%' minW={600} maxW={800} flexDir='column'>
        <Header title='Templates' hideBorderBottom />
        <NavigatorWithList
          selectedPage={projectRoute}
          pages={pages}
          onSelectPage={navigateTemplates}
          flex={1}
          height={1}
        />
      </Flex>
    </Flex>
  );
}
