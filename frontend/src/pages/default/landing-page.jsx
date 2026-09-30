import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../../components/default/site-header";
import { usePageTitle } from "../../hooks/pageTitle";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/navigation.js";

const NAV_LINKS = [
  { href: "#about", label: "About Us" },
  {
    href: "#announcements",
    label: "Announcements",
    children: [
      { href: "#announcements", label: "All Announcements" },
      { href: "#facilities-events", label: "Facilities & Events" },
    ],
  },
  { href: "#contact", label: "Contact Us" },
];

const ABOUT_CARDS = [
  {
    title: "Our Story",
    text: "Learn more about the community and the people who make Magallanes Village a place to call home.",
  },
  {
    title: "Our Mission",
    text: "To support an organized, responsive, and well-managed community through accessible services and information.",
  },
  {
    title: "Our Vision",
    text: "To build a connected community where residents can stay informed and participate in neighborhood affairs.",
  },
];

const FACILITIES = [
  {
    id: 1,
    name: "Clubhouse",
    image: "/assets/facilities/clubhouse.jpg",
    tag: "Facility",
    blurb: "Function hall available for resident events and gatherings.",
  },
  {
    id: 2,
    name: "Swimming Pool",
    image: "/assets/facilities/swimming-pool.jpg",
    tag: "Facility",
    blurb: "Open daily for residents and their registered guests.",
  },
  {
    id: 3,
    name: "Basketball Court",
    image: "/assets/facilities/basketball-court.jpg",
    tag: "Facility",
    blurb: "Covered court open for scheduled games and practice.",
  },
  {
    id: 4,
    name: "Community Garden",
    image: "/assets/facilities/community-garden.jpg",
    tag: "Facility",
    blurb: "Shared green space maintained by resident volunteers.",
  },
  {
    id: 5,
    name: "Sports Fest",
    image: "/assets/facilities/sports-fest.jpg",
    tag: "Event",
    blurb: "Annual inter-phase sports competition every summer.",
  },
  {
    id: 6,
    name: "Community Day",
    image: "/assets/facilities/community-day.jpg",
    tag: "Event",
    blurb: "A day of activities, food, and games for all residents.",
  },
];

const FEATURED_ANNOUNCEMENT = {
  category: "Featured Notice",
  title: "Important Guidelines for Community Residents & Visitors",
  date: "October 14, 2026",
  author: "Management",
  image: "/assets/announcement/announcement1.jpg",
  description:
    "Please review the latest community guidelines and reminders regarding residents, visitors, and access to shared community areas.",
};

const SIDE_ANNOUNCEMENTS = [
  {
    id: 1,
    category: "Community",
    title: "Annual General Assembly Meeting Schedule",
    date: "Oct 12, 2026",
    author: "HOA Board",
    image: "/assets/announcement/announcement.jpg",
  },
  {
    id: 2,
    category: "Security",
    title: "Updated RFID Gate Pass Guidelines for Vehicles",
    date: "Oct 08, 2026",
    author: "Security Team",
    image: "/assets/announcement/announcement.jpg",
  },
  {
    id: 3,
    category: "Maintenance",
    title: "Scheduled Water Service Interruption Advisory",
    date: "Oct 01, 2026",
    author: "Management",
    image: "/assets/announcement/announcement.jpg",
  },
];

const FOOTER_LINKS = [
  {
    heading: "Quick Links",
    items: ["About Us", "Announcements", "Facilities"],
  },
  {
    heading: "Support",
    items: ["Contact Management", "Security Office", "FAQ"],
  },
];

function XIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17.5A2.5 2.5 0 0 0 5 20h14a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 19 4H5a2.5 2.5 0 0 0-2.5 2.5z" />
      <polygon points="10,8 16,12 10,16" />
    </svg>
  );
}

const SOCIAL_ICONS = [XIcon, InstagramIcon, YoutubeIcon];

function DesktopNavLink({ link }) {
  const { href, label, children } = link;

  if (!children) {
    return (
      <a
        href={href}
        className="relative py-2 text-sm font-medium text-[#252A67] transition-colors hover:text-[#2E3192]"
      >
        {label}
      </a>
    );
  }

  return (
    <div className="group relative py-2">
      <a
        href={href}
        className="text-sm font-medium text-[#252A67] transition-colors hover:text-[#2E3192]"
      >
        {label}
      </a>

      <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-1.5 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
        {children.map((child) => (
          <a
            key={child.href}
            href={child.href}
            className="block rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2E3192]"
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileNavLink({ link, onNavigate }) {
  return (
    <div>
      <a
        href={link.href}
        onClick={onNavigate}
        className="block py-2.5 text-sm font-medium text-gray-800"
      >
        {link.label}
      </a>

      {link.children?.map((child) => (
        <a
          key={child.href}
          href={child.href}
          onClick={onNavigate}
          className="block py-2 pl-4 text-sm text-gray-500"
        >
          {child.label}
        </a>
      ))}
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const [open, setOpen] = useState(false);

  const mobilePanel = (
    <div
      className={`border-t border-gray-100 bg-white md:hidden ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="px-6 py-4">
        <nav className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <MobileNavLink
              key={link.label}
              link={link}
              onNavigate={() => setOpen(false)}
            />
          ))}

          <button
            onClick={() => {
              setOpen(false);
              user ? handleLogout() : navigate("/login");
            }}
            className="mt-3 w-full rounded-md bg-[#2E3192] px-5 py-3 text-sm font-semibold text-white"
          >
            {user ? "Logout" : "Login"}
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <SiteHeader
      logoImage="/assets/logo_1.png"
      below={mobilePanel}
    >
      <nav className="hidden items-center gap-7 md:flex">
        {NAV_LINKS.map((link) => (
          <DesktopNavLink key={link.label} link={link} />
        ))}

        <button
          onClick={() => (user ? handleLogout() : navigate("/login"))}
          className="rounded-md bg-[#2E3192] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#25276F]"
        >
          {user ? "Logout" : "Login"}
        </button>
      </nav>

      <button
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-[#2E3192] md:hidden"
      >
        {open ? <CloseIcon size={21} /> : <Menu size={21} />}
      </button>
    </SiteHeader>
  );
}

function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative flex min-h-[680px] items-center overflow-hidden border-b border-[#20215E]">
      {}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
        style={{
          backgroundImage:
            "url('/assets/magallanes-village.jpg')",
        }}
      />

      {}
      <div className="absolute inset-0 bg-[#17184A]/70" />

      {}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F2266]/80 via-[#2E3192]/55 to-[#4B4FC4]/45" />

      {}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#F5D000]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />

      {}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20 pt-36 text-center sm:pb-24 sm:pt-40">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F5D000] sm:text-sm">
          Magallanes Village Association
        </p>

        <h1 className="mt-5 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl md:text-7xl">
          HOAMS
        </h1>

        <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-white/70 sm:text-base">
          Homeowners Association Management System
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
          Stay informed, manage community concerns, and access important
          information through one centralized system for Magallanes Village.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate(user ? getDashboardPath(user) : "/login")}
            className="w-full rounded-md bg-[#F5D000] px-7 py-3.5 text-sm font-bold text-[#1A1A2E] shadow-lg transition-all hover:scale-[1.02] hover:bg-[#FFD91A] sm:w-auto"
          >
            Access Dashboard
          </button>

          { !user &&
          <button
            onClick={() => navigate("/register")}
            className="w-full rounded-md border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto"
          >
            Register Account
          </button>
          }

          { !user &&
          <button
            onClick={() => navigate("/registration-status")}
            className="w-full rounded-md border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto"
          >
            Registration Status
          </button>
          }
        </div>
      </div>
    </section>
  );
}

function AboutUs() {
  return (
    <section id="about" className="scroll-mt-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B69A00]">
            About the Community
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl ">
            Get to Know Us
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base ">
            Magallanes Village is a community built around shared spaces,
            neighborhood relationships, and responsible community management.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 border-t border-gray-200 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_CARDS.map((card) => (
            <article
              key={card.title}
              className="group relative rounded-lg border-b border-gray-200 px-1 py-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-transparent hover:bg-gray-50/80 hover:shadow-md sm:px-6 sm:py-10 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="h-1 w-10 bg-[#B69A00] transition-all duration-300 group-hover:w-16 group-hover:bg-[#1A1A2E]" />

              <h3 className="mt-6 text-xl font-bold text-[#1A1A2E] transition-colors duration-300 group-hover:text-[#B69A00]">
                {card.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600 transition-colors duration-300 group-hover:text-gray-900">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilitiesCarousel() {
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  const totalPages = Math.ceil(FACILITIES.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const scrollToPage = (pageIndex) => {
    if (trackRef.current) {
      const firstCard = trackRef.current.querySelector('[data-carousel-card]');
      if (firstCard) {
        const gap = 20;
        const cardWidth = firstCard.offsetWidth + gap;
        const targetScrollLeft = pageIndex * cardWidth * itemsPerPage;
        trackRef.current.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }
    }
  };

  const nextPage = () => {
    const next = (currentPage + 1) % totalPages;
    setCurrentPage(next);
    scrollToPage(next);
  };

  const previousPage = () => {
    const prev = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    setCurrentPage(prev);
    scrollToPage(prev);
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const firstCard = trackRef.current.querySelector('[data-carousel-card]');
      if (firstCard) {
        const gap = 20;
        const cardWidth = firstCard.offsetWidth + gap;
        const scrollLeft = trackRef.current.scrollLeft;
        const pageWidth = cardWidth * itemsPerPage;
        const newIndex = Math.round(scrollLeft / pageWidth);
        if (newIndex !== currentPage && newIndex >= 0 && newIndex < totalPages) {
          setCurrentPage(newIndex);
        }
      }
    }
  };

  return (
    <section
      id="facilities-events"
      className="border-y border-gray-100 bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#4B4FC4]">
              Facilities & Events
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#1A1A2E]">
              Community Spaces
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Explore the facilities and shared spaces available within the
              community.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={previousPage}
              aria-label="Previous facilities"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-[#2E3192] transition-colors hover:border-[#2E3192] hover:bg-[#2E3192] hover:text-white cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={nextPage}
              aria-label="Next facilities"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-[#2E3192] transition-colors hover:border-[#2E3192] hover:bg-[#2E3192] hover:text-white cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
          >
            {FACILITIES.map((facility) => (
              <article
                key={facility.id}
                data-carousel-card
                className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.33px)] flex-shrink-0 snap-start border border-gray-200 bg-white"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#E9EBF5]">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-[#1A1A2E]">
                    {facility.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {facility.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setCurrentPage(index);
                scrollToPage(index);
              }}
              aria-label={`Go to facilities page ${index + 1}`}
              className={`h-1.5 transition-all cursor-pointer ${
                currentPage === index
                  ? "w-8 bg-[#2E3192]"
                  : "w-4 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentAnnouncements() {
  return (
    <section
      id="announcements"
      className="scroll-mt-20 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B69A00]">
              Community Updates
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl">
              Recent Announcements
            </h2>
          </div>

          <button className="self-start text-sm font-semibold text-[#2E3192] hover:underline sm:self-auto">
            View All Announcements →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <article className="border border-gray-200 bg-white lg:col-span-2">
            <div className="aspect-[16/9] overflow-hidden bg-[#E9EBF5]">
              <img
                src={FEATURED_ANNOUNCEMENT.image}
                alt={FEATURED_ANNOUNCEMENT.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B69A00]">
                  Featured Notice
                </span>

                <span className="text-xs text-gray-500">
                  October 14, 2026 · Management
                </span>
              </div>

              <h3 className="mt-3 text-xl font-bold leading-snug text-[#1A1A2E] sm:text-2xl">
                Important Guidelines for Community Residents & Visitors
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Please review the latest community guidelines and reminders
                regarding residents, visitors, and access to shared community
                areas.
              </p>

              <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#2E3192] hover:underline">
                Read announcement
                <ArrowRight size={14} />
              </button>
            </div>
          </article>

          <div className="border-t border-gray-200">
            {SIDE_ANNOUNCEMENTS.map((item) => (
              <article
                key={item.id}
                className="group flex gap-3 border-b border-gray-200 py-4 sm:gap-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#E9EBF5] sm:h-24 sm:w-24">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#B69A00] sm:text-[11px]">
                    {item.category}
                  </p>

                  <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#1A1A2E] group-hover:text-[#2E3192]">
                    {item.title}
                  </h4>

                  <p className="mt-1.5 text-xs text-gray-500">
                    {item.date}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-20 border-t border-[#20215E] bg-[#17184A] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-bold">HOAMS</h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              The Homeowners Association Management System of Magallanes
              Village Association. A centralized place for community
              information, announcements, and resident services.
            </p>

            <div className="mt-6 flex gap-3">
              {SOCIAL_ICONS.map((Icon, index) => (
                <button
                  key={index}
                  className="flex h-9 w-9 items-center justify-center border border-white/20 text-gray-300 transition-colors hover:border-white hover:text-white"
                  aria-label="Social media"
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {group.heading}
              </h3>

              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <button
                    key={item}
                    className="block text-left text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs leading-5 text-gray-400">
            © 2026 Magallanes Village Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  usePageTitle("Home");

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#1A1A2E]">
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <FacilitiesCarousel />
        <RecentAnnouncements />
      </main>
      <Footer />
    </div>
  );
}
