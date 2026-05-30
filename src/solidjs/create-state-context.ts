import {
  createComponent,
  createContext,
  type ParentProps,
  splitProps,
  useContext,
} from "solid-js";

export function createStateContext<P extends Record<string, unknown>, V>(
  factory: (props: P) => V
) {
  const Ctx = createContext<V>();

  const Provider = (props: ParentProps<P>) => {
    const [local, rest] = splitProps(props, ["children"]);

    return createComponent(Ctx.Provider, {
      value: factory(rest as P),
      get children() {
        return local.children;
      },
    });
  };

  function useStateContext() {
    return useContext(Ctx);
  }

  return [Provider, useStateContext] as const;
}
