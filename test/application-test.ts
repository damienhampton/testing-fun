import { performance, PerformanceObserver } from "perf_hooks";
import { expect } from "chai";
import {
  TwitterFeed,
  TwitterToken,
  TwitterUsername,
  User,
  Session,
} from "../src/model";

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
  numUsers: number
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
              await Promise.all(
                range(numUsers).map((ii) =>
                  testApplication.createAuthenticatedUsers(`username-${ii}`)
                )
              )
            )
              .filter((response) => response.success && response.data)
              .map((response) => response.data as TestSession);
            perfEnd("session-create");

            perfStart("subscriptions");
            await Promise.all(
              userSessions.map((session) =>
                userSessions.map(({ username }) =>
                  testApplication.subscribe(session.token, username)
                )
              )
            );
            perfEnd("subscriptions");

            perfStart("postMessage");
            await Promise.all(
              userSessions.map((session) =>
                testApplication.postMessage(
                  session.token,
                  `Message by user ${session.username}`
                )
              )
            );
            perfEnd("postMessage");

            perfStart("getFeed");
            await Promise.all(
              userSessions.map(async (session) => {
                const response = await testApplication.getFeed(session.token);

                expect(response.data?.entries.length).to.equal(numUsers - 1);
              })
            );
            perfEnd("getFeed");
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
