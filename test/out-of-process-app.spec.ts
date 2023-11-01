import { applicationTest } from "./application-test";
import { OutOfProcessTestApplication } from "./OutOfProcessTestApplication";

const myTestApp = new OutOfProcessTestApplication();

describe("out-of-process app @out-of-process", () => {
  applicationTest(myTestApp, 100, 10);
});
