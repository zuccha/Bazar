import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import Navigation from '../navigation/Navigation';

const NavigationContext = createContext(Navigation.create());

export default NavigationContext;

export function NavigationContextProvider(props: {
  children: ReactNode;
}): ReactElement {
  const coreRef = useRef(Navigation.create());
  return (
    <NavigationContext.Provider value={coreRef.current}>
      {props.children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = (): Navigation => {
  return useContext(NavigationContext);
};
