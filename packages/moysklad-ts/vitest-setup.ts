import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { rest } from "msw";

const posts = [
  {
    userId: 1,
    id: 1,
    title: "first post title",
    body: "first post body",
  },
];

export const restHandlers = [
  rest.all(
    "https://online.moysklad.ru/api/remap/1.2",
    (_, response, context) => {
      return response(
        context.status(200),
        context.json({ moysklad: "default api endpoint" }),
      );
    },
  ),
  rest.get("https://example.com/api", (_, response, context) => {
    return response(context.status(200), context.json({ example: "api" }));
  }),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());