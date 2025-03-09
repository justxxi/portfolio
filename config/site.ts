export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "xxi",
  description: "just a personal website.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/justxxi",
    discord: "https://discord.gg/P6KNvueA89",
    sponsor: "https://donatello.to/xxii",
  },
};
