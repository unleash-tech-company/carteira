import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/landing-page/landing-page.tsx"),
  route("/dashboard", "routes/dashboard/App.tsx"),
] satisfies RouteConfig
