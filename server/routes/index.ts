import { Express } from "express";
import TEST_ROUTER from "./test";
// import MODBUS_ROUTER from "./modbus"
const routes = [...TEST_ROUTER];
export const connectRoute = (app: Express) => {
  routes.map((route) => {
    if (route.middleware) {
      switch (route.method) {
        case "GET":
          app.get(route.path, route.middleware, route.handler);
          break;
        case "POST":
          app.post(route.path, route.middleware, route.handler);
          break;
        case "DELETE":
          app.delete(route.path, route.middleware, route.handler);
          break;
        case "PUT":
          app.put(route.path, route.middleware, route.handler);
      }
    } else {
      switch (route.method) {
        case "GET":
          app.get(route.path, route.handler);
          break;
        case "POST":
          app.post(route.path, route.handler);
          break;
        case "DELETE":
          app.delete(route.path, route.handler);
          break;
        case "PUT":
          app.put(route.path, route.handler);
      }
    }
  });
};
