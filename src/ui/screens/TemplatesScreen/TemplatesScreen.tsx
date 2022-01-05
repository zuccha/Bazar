import { Flex, Heading } from '@chakra-ui/react';
import { ReactElement, useMemo } from 'react';
import {
  useNavigateTemplates,
  useTemplatesRoute,
} from '../../../navigation/hooks';
import { TemplatesRouteName } from '../../../navigation/Navigation';
import ComingSoon from '../../../ui-atoms/ComingSoon';
import Header from '../../../ui-atoms/Header';
import NavigatorWithList from '../../../ui-atoms/NavigatorWithList';

export default function TemplatesScreen(): ReactElement {
  const projectRoute = useTemplatesRoute();
  const navigateTemplates = useNavigateTemplates();

  const pages = useMemo(
    () => [
      {
        id: TemplatesRouteName.Projects,
        label: 'Projects',
        content: <ComingSoon title='Projects' />,
      },
      {
        id: TemplatesRouteName.Blocks,
        label: 'Blocks',
        content: <ComingSoon title='Blocks' />,
        isDisabled: true,
      },
      {
        id: TemplatesRouteName.Music,
        label: 'Music',
        content: <ComingSoon title='Music' />,
        isDisabled: true,
      },
      {
        id: TemplatesRouteName.Patches,
        label: 'Patches',
        content: <ComingSoon title='Patches' />,
        isDisabled: true,
      },
      {
        id: TemplatesRouteName.Sprites,
        label: 'Sprites',
        content: <ComingSoon title='Sprites' />,
        isDisabled: true,
      },
      {
        id: TemplatesRouteName.UberAsm,
        label: 'UberAsm',
        content: <ComingSoon title='UberAsm' />,
        isDisabled: true,
      },
      {
        id: TemplatesRouteName.GFX,
        label: 'GFX',
        content: <ComingSoon title='GFX' />,
        isDisabled: true,
      },
      {
        id: TemplatesRouteName.ExGFX,
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
