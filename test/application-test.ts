import { performance, PerformanceObserver } from "perf_hooks";
import { expect } from "chai";
import {
  TwitterFeed,
  TwitterToken,
  TwitterUsername,
  User,
  Session,
} from "../src/model";
import { mapLimit } from "async";

export type TestSession = Session & User;

export type TestResponse<A> = {
  success: boolean;
  data?: A;
  error?: Error;
};

export type Message = string;

export interface TwitterTestInterface {
  createAuthenticatedUsers(
    username: string
  ): Promise<TestResponse<TestSession>>;
  subscribe(
    token: TwitterToken,
    username: TwitterUsername
  ): Promise<TestResponse<null>>;
  postMessage(
    token: TwitterToken,
    message: Message
  ): Promise<TestResponse<null>>;
  getFeed(token: TwitterToken): Promise<TestResponse<TwitterFeed>>;
}

export function applicationTest(
  testApplication: TwitterTestInterface,
  numUsers: number,
  concurrency = 1
) {
  const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
      console.log(entry);
    });
  });

  perfObserver.observe({ entryTypes: ["measure"], buffered: true });

  describe("twitter-clone", () => {
    context(`given ${numUsers} users`, () => {
      context("and each user is subscribed to the rest", () => {
        context("and each user posts one message", () => {
          it(`should return a feed for each user with ${
            numUsers - 1
          } entries`, async () => {
            perfStart("session-create");
            const userSessions: TestSession[] = (
              await mapLimit<number, TestResponse<TestSession>>(
                range(numUsers),
                concurrency,
                async (ii: number, callback) =>
                  callback(
                    null,
                    await testApplication.createAuthenticatedUsers(
                      `username-${ii}`
                    )
                  )
              )
            )
              .filter((response) => response.success && response.data)
              .map((response) => response.data as TestSession);
            perfEnd("session-create");

            perfStart("subscriptions");
            await mapLimit<TestSession, null>(
              userSessions,
              concurrency,
              async (session, callback) => {
                await mapLimit<TestSession, null>(
                  userSessions,
                  concurrency,
                  async ({ username }, callback2) => {
                    await testApplication.subscribe(session.token, username);
                    callback2(null);
                  }
                );
                callback(null);
              }
            );
            perfEnd("subscriptions");

            perfStart("postMessage");
            await mapLimit<TestSession, null>(
              userSessions,
              concurrency,
              async (session, callback) => {
                await testApplication.postMessage(
                  session.token,
                  `Message by user ${session.username}`
                );
                callback(null);
              }
            );
            perfEnd("postMessage");

            perfStart("getFeed");
            const responses = await mapLimit<
              TestSession,
              TestResponse<TwitterFeed>
            >(userSessions, concurrency, async (session, callback) => {
              const response = await testApplication.getFeed(session.token);

              callback(null, response);
            });
            perfEnd("getFeed");

            responses.map((response) =>
              expect(response.data?.entries.length).to.equal(numUsers - 1)
            );
          });
        });
      });
    });
  });
}

const range = (n: number) =>
  Array(n)
    .fill(0)
    .map((_, ii) => ii);

const perfStart = (name: string) => performance.mark(`${name}-start`);
const perfEnd = (name: string) => {
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
};
