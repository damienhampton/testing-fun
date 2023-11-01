import {
  Message,
  TestResponse,
  TestSession,
  TwitterTestInterface,
} from "./application-test";
import { TwitterFeed, TwitterToken, TwitterUsername } from "../src/model";
import { TwitterInterface } from "../src/MyApp";

const password = "pwd";
export class MyTestApp implements TwitterTestInterface {
  constructor(private myApp: TwitterInterface) {}

  async createAuthenticatedUsers(
    username: string
  ): Promise<TestResponse<TestSession>> {
    const user = await this.myApp.register(username, password);
    const session = await this.myApp.authenticate(username, password);
    if (!session) {
      throw new Error("Could not create user");
    }
    return {
      success: true,
      data: {
        ...session,
        ...user,
      },
    };
  }

  async getFeed(token: TwitterToken): Promise<TestResponse<TwitterFeed>> {
    const feed = await this.myApp.getFeed(token);
    return {
      success: true,
      data: feed,
    };
  }

  async postMessage(
    token: TwitterToken,
    message: Message
  ): Promise<TestResponse<null>> {
    await this.myApp.postMessage(token, message);
    return {
      success: true,
    };
  }

  async subscribe(
    token: TwitterToken,
    username: TwitterUsername
  ): Promise<TestResponse<null>> {
    await this.myApp.subscribe(token, username);
    return {
      success: true,
    };
  }
}
