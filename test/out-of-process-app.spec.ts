import { applicationTest } from "./application-test";
import { OutOfProcessTestApplication } from "./OutOfProcessTestApplication";

const myTestApp = new OutOfProcessTestApplication();

describe("out-of-process app", () => {
  applicationTest(myTestApp, 100);
});
