import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { createEasyContext } from "~/solidjs";

describe("createEasyContext", () => {
  it("initializes a provider and exposes its value", () => {
    const context = createEasyContext(({ count }: { count: number }) => ({
      count,
    }));
    const { Provider, value } = context.initial({ count: 1 });

    const Consumer = () => {
      const state = context.useContext();
      return <div data-testid="count">{state.count}</div>;
    };

    const { getByTestId } = render(() => (
      <Provider>
        <Consumer />
      </Provider>
    ));

    expect(value.count).toBe(1);
    expect(getByTestId("count")).toHaveTextContent("1");
  });

  it("throws when used outside its provider", () => {
    const context = createEasyContext(() => ({ count: 1 }));
    const Consumer = () => {
      context.useContext();
      return null;
    };

    expect(() => render(() => <Consumer />)).toThrow(
      "createEasyContext: missing context provider"
    );
  });
});
