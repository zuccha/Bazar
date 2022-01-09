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
import ReleasesTab from './tabs/ReleasesTab';

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
        isDisabled: true,
      },
      {
        id: ProjectRouteName.Music,
        label: 'Music',
        content: <ComingSoon title='Music' />,
        isDisabled: true,
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
        isDisabled: true,
      },
      {
        id: ProjectRouteName.UberAsm,
        label: 'UberAsm',
        content: <ComingSoon title='UberAsm' />,
        isDisabled: true,
      },
      {
        id: ProjectRouteName.GFX,
        label: 'GFX',
        content: <ComingSoon title='GFX' />,
        isDisabled: true,
      },
      {
        id: ProjectRouteName.ExGFX,
        label: 'ExGFX',
        content: <ComingSoon title='ExGFX' />,
        isDisabled: true,
      },
      {
        id: ProjectRouteName.Backups,
        label: 'Backups',
        content: <BackupsTab project={project} />,
      },
      {
        id: ProjectRouteName.Releases,
        label: 'Releases',
        content: <ReleasesTab project={project} />,
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
      contentStyle={{ m: 3 }}
    />
  );
}
