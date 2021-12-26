import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import Core from '../core/Core';

const CoreContext = createContext(Core.create());

export default CoreContext;

export function CoreContextProvider(props: {
  children: ReactNode;
}): ReactElement {
  const coreRef = useRef(Core.create());
  return (
    <CoreContext.Provider value={coreRef.current}>
      {props.children}
    </CoreContext.Provider>
  );
}

export const useCore = (): Core => {
  return useContext(CoreContext);
};
