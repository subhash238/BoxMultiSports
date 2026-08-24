
"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Clock3,
  ExternalLink,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

export default function Footer() {
  // ==========================================================
  // EXTERNAL LINKS
  // ==========================================================

  const googleMapsUrl =
    "https://maps.app.goo.gl/awyLTrP8RHETjCrq8?g_st=awb";

  const whatsappUrl =
    "https://wa.me/919031017884";

  const instagramUrl =
    "https://www.instagram.com/uni_.turf/";

  const facebookUrl =
    "https://www.facebook.com/profile.php?id=61593432292070";

  return (
    <footer
      className="
        relative
        overflow-hidden
        border-t
        border-white/[0.08]
        bg-[#050705]
        text-white
      "
    >
      {/* ==================================================
          BACKGROUND ATMOSPHERE
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          h-[420px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-[#B6F000]/[0.035]
          blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-40
          h-[400px]
          w-[400px]
          rounded-full
          bg-[#B6F000]/[0.02]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/3
          h-[400px]
          w-[400px]
          rounded-full
          bg-[#B6F000]/[0.018]
          blur-[120px]
        "
      />

      {/* ==================================================
          MAIN FOOTER
      ================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-6
          py-16
          sm:px-8
          lg:px-10
          lg:py-20
        "
      >
        {/* ==================================================
            TOP BRAND ROW
        ================================================== */}

        <div
          className="
            mb-14
            grid
            gap-10
            border-b
            border-white/[0.08]
            pb-12
            lg:grid-cols-[1.4fr_1fr_1fr]
            lg:items-end
          "
        >
          {/* ==================================================
              BRAND
          ================================================== */}

          <div className="max-w-xl">
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-3
                transition-opacity
                hover:opacity-80
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-[#B6F000]/20
                  bg-black
                  shadow-[0_0_25px_rgba(182,240,0,0.08)]
                "
              >
                {/* Replace with your actual logo later */}

                <span
                  className="
                    text-sm
                    font-black
                    tracking-tight
                    text-[#B6F000]
                  "
                >
                  UT
                </span>
              </div>

              <div>
                <div
                  className="
                    text-xl
                    font-black
                    tracking-tight
                  "
                >
                  UNI
                  <span className="text-[#B6F000]">
                    TURF
                  </span>
                </div>

                <div
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-white/30
                  "
                >
                  Play · Improve · Connect
                </div>
              </div>
            </Link>

            <p
              className="
                mt-5
                max-w-md
                text-sm
                leading-6
                text-white/45
              "
            >
              Premium multi-sport turf experience
              built for players, teams and communities.
              Book your game, bring your team and play
              your best.
            </p>

            {/* ==================================================
                SOCIAL MEDIA
            ================================================== */}

            <div className="mt-6 flex items-center gap-3">
              {/* WhatsApp */}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/[0.10]
                  bg-white/[0.035]
                  text-white/55
                  transition-all
                  duration-300
                  hover:border-[#B6F000]/40
                  hover:bg-[#B6F000]/10
                  hover:text-[#B6F000]
                  hover:shadow-[0_0_20px_rgba(182,240,0,0.12)]
                "
              >
                <FaWhatsapp size={18} />
              </a>

              {/* Instagram */}

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/[0.10]
                  bg-white/[0.035]
                  text-white/55
                  transition-all
                  duration-300
                  hover:border-[#B6F000]/40
                  hover:bg-[#B6F000]/10
                  hover:text-[#B6F000]
                  hover:shadow-[0_0_20px_rgba(182,240,0,0.12)]
                "
              >
                <FaInstagram size={17} />
              </a>

              {/* Facebook */}

              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/[0.10]
                  bg-white/[0.035]
                  text-white/55
                  transition-all
                  duration-300
                  hover:border-[#B6F000]/40
                  hover:bg-[#B6F000]/10
                  hover:text-[#B6F000]
                  hover:shadow-[0_0_20px_rgba(182,240,0,0.12)]
                "
              >
                <FaFacebookF size={16} />
              </a>
            </div>
          </div>

          {/* ==================================================
              CTA
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              border-[#B6F000]/15
              bg-gradient-to-br
              from-[#B6F000]/[0.08]
              to-transparent
              p-6
            "
          >
            <div
              className="
                mb-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-[#B6F000]
              "
            >
              Ready to play?
            </div>

            <h3
              className="
                text-xl
                font-semibold
                tracking-tight
              "
            >
              Book your next game.
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-5
                text-white/40
              "
            >
              Choose your sport and reserve your
              preferred slot online.
            </p>

            <Link
              href="/#booking"
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#B6F000]
                px-5
                py-2.5
                text-sm
                font-bold
                text-black
                transition-all
                hover:scale-[1.02]
                hover:shadow-[0_0_30px_rgba(182,240,0,0.22)]
              "
            >
              Book Now
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* ==================================================
              LOCATION
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              p-6
            "
          >
            <div
              className="
                mb-4
                flex
                items-center
                gap-2
              "
            >
              <MapPin
                size={16}
                className="text-[#B6F000]"
              />

              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white/60
                "
              >
                Visit UniTurf
              </span>
            </div>

            <p
              className="
                text-sm
                leading-6
                text-white/50
              "
            >
              Jaganpura Road,
              <br />
              Near Shemford School,
              <br />
              Udaini, Ektapuram,
              <br />
              Bihar 804453
            </p>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-[#B6F000]
                transition-opacity
                hover:opacity-75
              "
            >
              Open in Google Maps
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* ==================================================
            LINK COLUMNS
        ================================================== */}

        <div
          className="
            grid
            gap-10
            sm:grid-cols-2
            lg:grid-cols-[1fr_1fr_1fr_1.5fr]
          "
        >
          {/* ==================================================
              QUICK LINKS
          ================================================== */}

          <div>
            <h4
              className="
                mb-5
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-white
              "
            >
              Quick Links
            </h4>

            <ul className="space-y-3">
              <FooterLink
                href="/"
                label="Home"
              />

              <FooterLink
                href="/sports"
                label="Sports"
              />

              <FooterLink
                href="/facilities"
                label="Facilities"
              />

              <FooterLink
                href="/gallery"
                label="Gallery"
              />

              <FooterLink
                href="/pricing"
                label="Pricing"
              />

              <FooterLink
                href="/contact"
                label="Contact"
              />
            </ul>
          </div>

          {/* ==================================================
              SPORTS
          ================================================== */}

          <div>
            <h4
              className="
                mb-5
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-white
              "
            >
              Sports
            </h4>

            <ul className="space-y-3">
              <FooterLink
                href="/?sport=cricket#booking"
                label="Box Cricket"
              />

              <FooterLink
                href="/?sport=football#booking"
                label="Football"
              />

              <FooterLink
                href="/?sport=pickleball#booking"
                label="Pickleball"
              />

              <FooterLink
                href="/?sport=badminton#booking"
                label="Badminton"
              />

              <FooterLink
                href="/?sport=net-practice#booking"
                label="Net Practice"
              />
            </ul>
          </div>

          {/* ==================================================
              CONTACT
          ================================================== */}

          <div>
            <h4
              className="
                mb-5
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-white
              "
            >
              Contact
            </h4>

            <ul className="space-y-4">
              {/* Phone */}

              <li>
                <a
                  href="tel:+919031017884"
                  className="
                    group
                    flex
                    items-start
                    gap-3
                    text-sm
                    text-white/45
                    transition-colors
                    hover:text-white
                  "
                >
                  <Phone
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-[#B6F000]
                    "
                  />

                  <span>
                    +91 90310 17884
                  </span>
                </a>
              </li>

              {/* WhatsApp */}

              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    flex
                    items-start
                    gap-3
                    text-sm
                    text-white/45
                    transition-colors
                    hover:text-white
                  "
                >
                  <FaWhatsapp
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-[#B6F000]
                    "
                  />

                  <span>
                    WhatsApp Us
                  </span>
                </a>
              </li>

              {/* Email */}

              <li>
                <a
                  href="mailto:info@uniturf.in"
                  className="
                    flex
                    items-start
                    gap-3
                    text-sm
                    text-white/45
                    transition-colors
                    hover:text-white
                  "
                >
                  <Mail
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-[#B6F000]
                    "
                  />

                  <span>
                    info@uniturf.in
                  </span>
                </a>
              </li>

              {/* Opening Hours */}

              <li>
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    text-sm
                    text-white/45
                  "
                >
                  <Clock3
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-[#B6F000]
                    "
                  />

                  <span>
                    Open 24 Hours
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* ==================================================
              MAP
          ================================================== */}

          <div>
            <h4
              className="
                mb-5
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-white
              "
            >
              Find Us
            </h4>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open UniTurf location in Google Maps"
              className="
                group
                relative
                block
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0e0b]
              "
            >
              {/* ==================================================
                  MAP STYLE
              ================================================== */}

              <div
                className="
                  relative
                  h-[150px]
                  overflow-hidden
                  bg-gradient-to-br
                  from-[#111811]
                  via-[#0b100b]
                  to-[#070907]
                "
              >
                {/* Map grid */}

                <div
                  className="
                    absolute
                    inset-0
                    opacity-20
                    [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]
                    [background-size:32px_32px]
                  "
                />

                {/* Roads */}

                <div
                  className="
                    absolute
                    left-[-10%]
                    top-[55%]
                    h-2
                    w-[120%]
                    rotate-[-12deg]
                    bg-white/[0.06]
                  "
                />

                <div
                  className="
                    absolute
                    left-[45%]
                    top-[-20%]
                    h-[150%]
                    w-2
                    rotate-[18deg]
                    bg-white/[0.05]
                  "
                />

                {/* Location marker */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    flex
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                  "
                >
                  <span
                    className="
                      absolute
                      h-12
                      w-12
                      animate-ping
                      rounded-full
                      bg-[#B6F000]/20
                    "
                  />

                  <span
                    className="
                      relative
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border-4
                      border-[#B6F000]/30
                      bg-[#B6F000]
                      text-black
                      shadow-[0_0_30px_rgba(182,240,0,0.4)]
                    "
                  >
                    <MapPin size={17} />
                  </span>
                </div>

                {/* Open map label */}

                <div
                  className="
                    absolute
                    bottom-3
                    left-3
                    rounded-full
                    border
                    border-white/10
                    bg-black/70
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    text-white/70
                    backdrop-blur-md
                  "
                >
                  Open in Google Maps
                </div>

                {/* Hover overlay */}

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-[#B6F000]/0
                    transition-all
                    duration-300
                    group-hover:bg-[#B6F000]/[0.05]
                  "
                >
                  <span
                    className="
                      translate-y-2
                      rounded-full
                      border
                      border-[#B6F000]/30
                      bg-black/70
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-[#B6F000]
                      opacity-0
                      backdrop-blur-md
                      transition-all
                      duration-300
                      group-hover:translate-y-0
                      group-hover:opacity-100
                    "
                  >
                    View Location
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* ==================================================
            BOTTOM BAR
        ================================================== */}

        <div
          className="
            mt-14
            flex
            flex-col
            gap-5
            border-t
            border-white/[0.08]
            pt-6
            text-xs
            text-white/30
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            © {new Date().getFullYear()} UniTurf.
            All rights reserved.
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-5
            "
          >
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms & Conditions
            </Link>

            <span
              className="
                flex
                items-center
                gap-1.5
                text-white/20
              "
            >
              Made by Vishal Kumar Rai

              <span className="text-[#B6F000]">
                ●
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================
   FOOTER LINK COMPONENT
========================================================== */

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="
          group
          inline-flex
          items-center
          gap-1.5
          text-sm
          text-white/40
          transition-all
          duration-200
          hover:translate-x-1
          hover:text-white
        "
      >
        <span>{label}</span>

        <ArrowUpRight
          size={12}
          className="
            opacity-0
            transition-opacity
            group-hover:opacity-60
          "
        />
      </Link>
    </li>
  );
}
