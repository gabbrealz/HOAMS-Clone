const ROLE_PRIORITY = {
  user_administrator: 3,
  board_member: 2,
  administrative_staff: 2,
  resident: 1,
};

const ROLE_TO_PAGE_MAPPING = {
  user_administrator: "/user-admin/list",
  board_member: "/admin/dashboard",
  administrative_staff: "/admin/dashboard",
  resident: "/resident/dashboard"
}

export const getDashboardPath = (user) => {
  if (!user || !user.roles) return '/login';
  const roles = user.roles;

  const highestRole = roles.reduce(
    (prev, role) => ROLE_PRIORITY[role] > ROLE_PRIORITY[prev] ? role : prev,
    roles[0] || ""
  );

  return ROLE_TO_PAGE_MAPPING[highestRole];
};
