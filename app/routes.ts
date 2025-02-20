import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  index("routes/landing-page/landing-page.tsx"),
  route("/login", "routes/login.tsx"),
  layout("./routes/protected-routes.tsx", [route("/app", "routes/protected/_index.tsx")]),
] satisfies RouteConfig
