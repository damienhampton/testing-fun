import { applicationTest } from "./application-test";
import { MyApp } from "../src/MyApp";
import { MyTestApp } from "./TestApplication";

export const myApp = new MyApp();

const myTestApp = new MyTestApp(myApp);

applicationTest(myTestApp, 1000);
