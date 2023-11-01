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
  describe("twitter-clone", async () => {
    context(`given ${numUsers} users`, async () => {
      const userSessions: TestSession[] = (
        await Promise.all(
          range(numUsers).map((ii) =>
            testApplication.createAuthenticatedUsers(`username-${ii}`)
          )
        )
      )
        .filter((response) => response.success && response.data)
        .map((response) => response.data as TestSession);

      context("and each user is subscribed to the rest", async () => {
        await Promise.all(
          userSessions.map((session) =>
            userSessions.map(({ username }) =>
              testApplication.subscribe(session.token, username)
            )
          )
        );

        context("add each user posts one message", async () => {
          await Promise.all(
            userSessions.map((session) =>
              testApplication.postMessage(
                session.token,
                `Message by user ${session.username}`
              )
            )
          );

          it(`should return a feed for each user with ${
            numUsers - 1
          } entries`, async () => {
            await Promise.all(
              userSessions.map(async (session) => {
                const response = await testApplication.getFeed(session.token);

                expect(response.data?.entries.length).to.equal(numUsers - 1);
              })
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
