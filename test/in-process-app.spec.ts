import { applicationTest } from "./application-test";
import { MyApp } from "../src/MyApp";
import { InProcessTestApplication } from "./InProcessTestApplication";

export const myApp = new MyApp();

const myTestApp = new InProcessTestApplication(myApp);

describe.skip("in-process app", () => {
  applicationTest(myTestApp, 100);
});
