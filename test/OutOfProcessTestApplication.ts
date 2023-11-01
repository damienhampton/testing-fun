import {
  Message,
  TestResponse,
  TestSession,
  TwitterTestInterface,
} from "./application-test";
import {
  TwitterFeed,
  TwitterToken,
  TwitterUsername,
  User,
  Session,
} from "../src/model";
import axios from "axios";

const password = "pwd";

const testAxios = axios.create({ baseURL: "http://localhost:3000" });
export class OutOfProcessTestApplication implements TwitterTestInterface {
  async createAuthenticatedUsers(
    username: string
  ): Promise<TestResponse<TestSession>> {
    const user = (
      await testAxios.post<User>("/register", { username, password })
    ).data;
    const session = (
      await testAxios.post<Session>("/authenticate", {
        username,
        password,
      })
    ).data;
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
    const feed = (
      await testAxios.get<TwitterFeed>("/feed", { headers: { token } })
    ).data;
    return {
      success: true,
      data: feed,
    };
  }

  async postMessage(
    token: TwitterToken,
    message: Message
  ): Promise<TestResponse<null>> {
    await testAxios.post("/post-message", { message }, { headers: { token } });
    return {
      success: true,
    };
  }

  async subscribe(
    token: TwitterToken,
    username: TwitterUsername
  ): Promise<TestResponse<null>> {
    await testAxios.post("/subscribe", { username }, { headers: { token } });
    return {
      success: true,
    };
  }
}
