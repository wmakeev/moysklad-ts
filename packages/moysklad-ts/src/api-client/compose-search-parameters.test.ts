import { describe, it, expect } from "vitest";
import { composeSearchParameters } from "./compose-search-parameters";

describe("composeSearchParameters", () => {
  it("should return undefined if no options are provided", () => {
    expect(composeSearchParameters({})).toBeUndefined();
  });

  describe("pagination", () => {
    it("should return a URLSearchParams object with 'limit' parameter if 'limit' is provided in pagination options", () => {
      const pagination = { limit: 10 };
      const searchParameters = composeSearchParameters({ pagination });
      expect(searchParameters?.get("limit")).toBe("10");
    });

    it("should return a URLSearchParams object with 'offset' parameter if 'offset' is provided in pagination options", () => {
      const pagination = { offset: 20 };
      const searchParameters = composeSearchParameters({ pagination });
      expect(searchParameters?.get("offset")).toBe("20");
    });

    it("should return a URLSearchParams object with both 'limit' and 'offset' parameters if both are provided in pagination options", () => {
      const pagination = { limit: 10, offset: 20 };
      const searchParameters = composeSearchParameters({ pagination });
      expect(searchParameters?.get("limit")).toBe("10");
      expect(searchParameters?.get("offset")).toBe("20");
    });
  });

  describe("expand", () => {
    it("should not add 'expand' parameter if 'expand' is an empty object", () => {
      const searchParameters = composeSearchParameters({ expand: {} });
      expect(searchParameters).toBeUndefined();
    });

    it("should add 'expand' parameter with correct fields if 'expand' is not empty", () => {
      const expand = {
        owner: false,
        group: true,
        demand: {},
        agent: {
          owner: true,
          account: {
            group: true,
          },
        },
      };
      const searchParameters = composeSearchParameters({ expand });
      expect(searchParameters?.toString().replaceAll("%2C", ",")).toBe(
        "expand=group,demand,agent.owner,agent.account.group",
      );
    });

    it("should throw an error if 'expand' is nested more than 3 levels deep", () => {
      const expand = {
        level1: {
          level2: {
            level3: {
              level4: true,
            },
          },
        },
      };
      expect(() => composeSearchParameters({ expand })).toThrow(
        "Expand depth cannot be more than 3",
      );
    });
  });
});
