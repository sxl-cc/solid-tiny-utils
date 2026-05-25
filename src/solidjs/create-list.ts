import { createStore, type SetStoreFunction, unwrap } from "solid-js/store";
import { inRange } from "~/utils";

function createInsertHelper<T>(setList: SetStoreFunction<T[]>) {
  return (item: T, at?: number) => {
    setList((list) => {
      let atIdx = at ?? list.length;
      if (atIdx < 0 || atIdx > list.length) {
        atIdx = list.length;
      }
      const newList = [...list];
      newList.splice(atIdx, 0, item);
      return newList;
    });
  };
}

function createRemoveHelper<T>(setList: SetStoreFunction<T[]>) {
  return (at?: number) => {
    setList((list) => {
      const atIdx = at ?? list.length - 1;
      if (atIdx < 0 || atIdx >= list.length) {
        return list;
      }
      const newList = [...list];
      newList.splice(atIdx, 1);
      return newList;
    });
  };
}

function createSwapHelper<T>(setList: SetStoreFunction<T[]>) {
  return (indexA: number, indexB: number) => {
    setList((list) => {
      if (
        indexA === indexB ||
        !inRange(indexA, 0, list.length - 1) ||
        !inRange(indexB, 0, list.length - 1)
      ) {
        return list;
      }
      const newList = [...list];
      [newList[indexA], newList[indexB]] = [newList[indexB], newList[indexA]];
      return newList;
    });
  };
}

function createMoveHelper<T>(setList: SetStoreFunction<T[]>) {
  return (from: number, to: number) => {
    setList((list) => {
      if (
        from === to ||
        !inRange(from, 0, list.length - 1) ||
        !inRange(to, 0, list.length - 1)
      ) {
        return list;
      }
      const newList = [...list];
      const [item] = newList.splice(from, 1);
      newList.splice(to, 0, item);
      return newList;
    });
  };
}

function createSortHelper<T>(setList: SetStoreFunction<T[]>) {
  return (compareFn: (a: T, b: T) => number) => {
    setList((list) => {
      const newList = [...list];
      newList.sort(compareFn);
      return newList;
    });
  };
}

function createIsSortedHelper<T>(list: T[], compareFn: (a: T, b: T) => number) {
  for (let i = 1; i < list.length; i++) {
    if (compareFn(list[i - 1], list[i]) > 0) {
      return false;
    }
  }
  return true;
}

export function createList<T>(initialValue?: T[]) {
  const [list, setList] = createStore<T[]>(unwrap(initialValue) || []);

  return [
    list,
    {
      setList,
      insert: createInsertHelper<T>(setList),
      remove: createRemoveHelper<T>(setList),
      swap: createSwapHelper<T>(setList),
      move: createMoveHelper<T>(setList),
      sort: createSortHelper<T>(setList),
      isSortedBy: (compareFn: (a: T, b: T) => number) =>
        createIsSortedHelper<T>(list, compareFn),
    },
  ] as const;
}
