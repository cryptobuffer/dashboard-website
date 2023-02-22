export default [
  {
    path: "/account/member",
    component: () => import("./member"),
    meta: {
      title: "Member Management",
      isTab: 1,
    },
  },
  {
    path: "/account/config",
    components: {
      cache: () => import("./config"),
    },
    meta: {
      title: "Collaborative account configuration",
      isTab: 1,
    },
  },
  {
    path: "/account/operation-log",
    component: () => import("./operation-log"),
    meta: {
      title: "Operation log of collaborative account",
    },
  },
];