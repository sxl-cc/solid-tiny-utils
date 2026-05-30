import {
  createComponent,
  createContext,
  type ParentComponent,
  type ParentProps,
  useContext,
} from "solid-js";
import { isUndefined } from "~/utils";

export interface EasyContext<V, P extends object> {
  initial: (params: P) => {
    value: V;
    Provider: ParentComponent;
  };
  useContext: () => V;
}

export function createEasyContext<V, P extends object>(
  factory: (params: P) => V
): EasyContext<V, P> {
  const ctx = createContext<V | undefined>();
  const initial = (params: P) => {
    const value = factory(params);

    const Provider = (props: ParentProps) =>
      createComponent(ctx.Provider, {
        value,
        get children() {
          return props.children;
        },
      });

    return {
      value,
      Provider,
    };
  };

  const useThisContext = () => {
    const value = useContext(ctx);

    if (isUndefined(value)) {
      throw new Error("createEasyContext: missing context provider");
    }

    return value;
  };

  return {
    initial,
    useContext: useThisContext,
  };
}
