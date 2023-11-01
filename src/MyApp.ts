import {
  FeedEntry,
  Session,
  SessionInternal,
  Subscriber,
  TwitterFeed,
  User,
  UserInternal,
} from "./model";

export interface TwitterInterface {
  register(username: string, password: string): Promise<User>;
  authenticate(
    username: string,
    password: string
  ): Promise<Session | undefined>;
  getFeed(token: string): Promise<TwitterFeed | undefined>;
  postMessage(token: string, message: string): Promise<void>;
  subscribe(token: string, username: string): Promise<void>;
}

export class MyApp implements TwitterInterface {
  private users: UserInternal[] = [];
  private sessions: SessionInternal[] = [];

  async authenticate(
    username: string,
    password: string
  ): Promise<Session | undefined> {
    const maybeUser = this.users.find(
      (u) => u.user.username === username && u.password === password
    )?.user;
    if (!maybeUser) {
      return;
    }
    const session: SessionInternal = {
      token: `${Date.now()}+${maybeUser.username}`,
      userId: maybeUser.userId,
    };
    this.sessions.push(session);
    return {
      token: session.token,
    };
  }

  async getFeed(token: string): Promise<TwitterFeed | undefined> {
    const session = this.sessions.find((s) => s.token === token);
    if (!session) {
      return;
    }
    const entries = this.users.find(
      (u) => u.user.userId === session.userId
    )?.feed;
    if (!entries) {
      return;
    }
    return {
      entries,
    };
  }

  async postMessage(token: string, message: string): Promise<void> {
    const session = this.sessions.find((s) => s.token === token);
    if (!session) {
      return;
    }
    const { userId } = session;
    const user = this.users.find((u) => u.user.userId === userId);

    if (!user) {
      return;
    }

    const subscribers = this.users.filter((u) =>
      u.subscribers.find((s) => s.userId === userId)
    );

    const entry: FeedEntry = {
      message,
      userId,
      username: user?.user.username,
    };
    subscribers.map((s) => s.feed.unshift(entry));
  }

  async register(username: string, password: string): Promise<User> {
    const userId = `id+${this.users.length + 1}`;
    const user: User = {
      username,
      userId,
    };
    this.users.push({ user, password, feed: [], subscribers: [] });
    return user;
  }

  async subscribe(token: string, username: string): Promise<void> {
    const session = this.sessions.find((s) => s.token === token);
    if (!session) {
      return;
    }
    const userId = session.userId;
    const otherUser = this.users.find((u) => u.user.username === username);
    const subscriber: Subscriber = { userId };
    otherUser?.subscribers.push(subscriber);
  }
}
