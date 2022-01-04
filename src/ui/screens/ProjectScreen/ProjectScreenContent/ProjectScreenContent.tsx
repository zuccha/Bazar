import { ReactElement, useMemo } from 'react';
import { useProjectLatestSnapshot } from '../../../../core-hooks/Project';
import Project from '../../../../core/Project';
import {
  useNavigateProject,
  useProjectRoute,
} from '../../../../navigation/hooks';
import { ProjectRouteName } from '../../../../navigation/Navigation';
import ComingSoon from '../../../../ui-atoms/ComingSoon';
import NavigatorWithTabs from '../../../../ui-atoms/NavigatorWithTabs';
import BackupsTab from './tabs/BackupsTab/BackupsTab';
import PatchesTab from './tabs/PatchesTab';

interface ProjectScreenContent {
  project: Project;
}

export default function ProjectScreenContent({
  project,
}: ProjectScreenContent): ReactElement {
  const latestSnapshot = useProjectLatestSnapshot(project);

  const projectRoute = useProjectRoute();
  const navigateProject = useNavigateProject();

  const pages = useMemo(
    () => [
      {
        id: ProjectRouteName.Blocks,
        label: 'Blocks',
        content: <ComingSoon title='Blocks' />,
      },
      {
        id: ProjectRouteName.Music,
        label: 'Music',
        content: <ComingSoon title='Music' />,
      },
      {
        id: ProjectRouteName.Patches,
        label: 'Patches',
        content: <PatchesTab projectSnapshot={latestSnapshot} />,
      },
      {
        id: ProjectRouteName.Sprites,
        label: 'Sprites',
        content: <ComingSoon title='Sprites' />,
      },
      {
        id: ProjectRouteName.UberAsm,
        label: 'UberAsm',
        content: <ComingSoon title='UberAsm' />,
      },
      {
        id: ProjectRouteName.GFX,
        label: 'GFX',
        content: <ComingSoon title='GFX' />,
      },
      {
        id: ProjectRouteName.ExGFX,
        label: 'ExGFX',
        content: <ComingSoon title='ExGFX' />,
      },
      {
        id: ProjectRouteName.Backups,
        label: 'Backups',
        content: <BackupsTab project={project} />,
      },
      {
        id: ProjectRouteName.Releases,
        label: 'Releases',
        content: <ComingSoon title='Releases' />,
      },
    ],
    [latestSnapshot],
  );

  return (
    <NavigatorWithTabs
      selectedPage={projectRoute}
      pages={pages}
      onSelectPage={navigateProject}
      flex={1}
    />
  );
}
