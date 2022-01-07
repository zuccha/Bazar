import { useRef } from 'react';

const compareListItems = (list1: unknown[], list2: unknown[]) => {
  if (list1.length !== list2.length) return false;
  for (let i = 0; i < list1.length; i++) {
    if (list1[i] !== list2[i]) return false;
  }
  return true;
};

export default function useListUpdatesCount(list: unknown[]): number {
  const count = useRef(0);
  const prevList = useRef(list);

  if (!compareListItems(list, prevList.current)) {
    count.current++;
    prevList.current = list;
  }

  return count.current;
}
