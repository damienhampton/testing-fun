export type TwitterUsername = string;
export type UserId = string;

export type User = {
  userId: UserId;
  username: TwitterUsername;
};

export type Subscriber = {
  userId: UserId;
};

export type UserInternal = {
  user: User;
  password: string;
  feed: FeedEntry[];
  subscribers: Subscriber[];
};

export type TwitterToken = string;

export type SessionInternal = {
  token: TwitterToken;
  userId: UserId;
};

export type Session = {
  token: TwitterToken;
};

export type FeedEntry = {
  message: string;
  userId: UserId;
  username: TwitterUsername;
};

export type TwitterFeed = {
  entries: FeedEntry[];
};

export type Message = string;
