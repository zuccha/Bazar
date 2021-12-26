import { Box, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectInfo } from '../../../../core/Project';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import { AppDispatch } from '../../../../store';
import {
  getProjectInfo,
  setProjectInfo,
} from '../../../../store/slices/core/slices/project';
import ProjectScreenSidebarActions from './ProjectScreenSidebarActions';
import ProjectScreenSidebarInfo from './ProjectScreenSidebarInfo';

const defaultInfo = {
  name: 'No project',
  author: '',
};

export default function ProjectScreenSidebar(): ReactElement {
  const dispatch = useDispatch<AppDispatch>();

  const info = useSelector(getProjectInfo());

  const handleEditInfo = useAsyncCallback(
    (newConfig: ProjectInfo) => dispatch(setProjectInfo(newConfig)),
    [dispatch],
  );

  return (
    <VStack
      bg='app.bg2'
      w='256px'
      h='100%'
      p={6}
      spacing={6}
      alignItems='flex-start'
    >
      <ProjectScreenSidebarInfo
        info={info ?? defaultInfo}
        isDisabled={!info || handleEditInfo.isLoading}
        onEdit={handleEditInfo.call}
      />
      <Box w='100%' h='1px' bg='app.fg3' />
      <ProjectScreenSidebarActions />
    </VStack>
  );
}
