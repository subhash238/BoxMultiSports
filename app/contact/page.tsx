"use client";

import { FormEvent, useState } from "react";
import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Reveal,
  Stagger,
  StaggerItem,
  TextReveal,
  FloatingBlob,
} from "@/components/motion/Motion";

const PHONE_DISPLAY = "+91 90310 17884";
const PHONE_LINK = "tel:+919031017884";
const EMAIL = "uniturf231@gmail.com";

const WHATSAPP_BASE_URL =
  "https://wa.me/919031017884";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=25.5540556,85.1492778";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const handleWhatsAppEnquiry = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormSuccess("");

    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedMessage = message.trim();

    if (
      !trimmedName ||
      !trimmedMobile ||
      !trimmedMessage
    ) {
      setFormError(
        "Please enter your name, mobile number and message."
      );
      return;
    }

    setFormError("");
    setSending(true);

    // Email the enquiry to the venue inbox (best effort),
    // then continue on WhatsApp as before.
    let emailed = false;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          mobile: trimmedMobile,
          message: trimmedMessage,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429) {
        setSending(false);
        setFormError(
          data?.message || "Too many enquiries. Please try again in a few minutes."
        );
        return;
      }
      emailed = Boolean(res.ok && data?.emailed);
    } catch {
      emailed = false;
    }
    setSending(false);

    if (emailed) {
      setFormSuccess(
        "Enquiry sent! We'll get back to you shortly. Opening WhatsApp too…"
      );
      setName("");
      setMobile("");
      setMessage("");
    }

    const enquiryMessage = [
      "Hello UniTurf,",
      "",
      "I would like to make an enquiry.",
      "",
      `Name: ${trimmedName}`,
      `Mobile: ${trimmedMobile}`,
      "",
      `Message: ${trimmedMessage}`,
    ].join("\n");

    const whatsappUrl =
      `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(
        enquiryMessage
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="min-h-screen bg-[#050705] text-white">
      {/* ==================================================
          HERO
      ================================================== */}

      <section
        className="
          relative
          isolate
          overflow-hidden
          border-b
          border-white/[0.07]
          px-4
          pb-16
          pt-32
          sm:px-6
          sm:pb-20
          sm:pt-36
          lg:px-8
        "
      >
        <FloatingBlob
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-[420px]
            w-[760px]
            -translate-x-1/2
            rounded-full
            bg-[#B6F000]/[0.05]
            blur-[140px]
          "
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal immediate>
            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#B6F000]
              "
            >
              Contact UniTurf
            </span>
          </Reveal>

          <TextReveal
            text="We're Here to Help."
            delay={0.1}
            className="
              mt-5
              text-4xl
              font-semibold
              tracking-[-0.045em]
              sm:text-5xl
              lg:text-6xl
            "
          />

          <Reveal immediate delay={0.35}>
            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-sm
                leading-7
                text-white/50
                sm:text-base
              "
            >
              Need help with a booking, sports
              availability or anything else? Call,
              WhatsApp or send us a quick enquiry.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================================================
          CONTACT CONTENT
      ================================================== */}

      <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="
            mx-auto
            grid
            max-w-6xl
            grid-cols-1
            gap-6
            lg:grid-cols-[0.9fr_1.1fr]
          "
        >
          {/* ==============================================
              CONTACT DETAILS
          ============================================== */}

          <Stagger className="space-y-4">
            <ContactCard
              icon={<Phone size={20} />}
              label="Call Us"
              value={PHONE_DISPLAY}
              href={PHONE_LINK}
            />

            <ContactCard
              icon={<FaWhatsapp size={20} />}
              label="WhatsApp"
              value="Chat with UniTurf"
              href={WHATSAPP_BASE_URL}
              external
            />

            <ContactCard
              icon={<Mail size={20} />}
              label="Email"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />

            <ContactCard
              icon={<Clock3 size={20} />}
              label="Opening Hours"
              value="Open 24 Hours"
            />

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                flex
                items-center
                justify-between
                rounded-[22px]
                border
                border-white/[0.09]
                bg-gradient-to-br
                from-[#101310]
                to-[#080a08]
                p-5
                transition
                hover:border-[#B6F000]/30
              "
            >
              <div className="flex items-center gap-4">
                <span
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#B6F000]/10
                    text-[#B6F000]
                  "
                >
                  <MapPin size={20} />
                </span>

                <div>
                  <p className="text-xs text-white/40">
                    Find Us
                  </p>

                  <p className="mt-1 font-semibold">
                    Open in Google Maps
                  </p>
                </div>
              </div>

              <span
                className="
                  text-sm
                  text-[#B6F000]
                  transition-transform
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </a>
          </Stagger>

          {/* ==============================================
              QUICK ENQUIRY
          ============================================== */}

          <Reveal
            delay={0.15}
            y={40}
            className="
              rounded-[28px]
              border
              border-white/[0.09]
              bg-gradient-to-br
              from-[#111611]
              via-[#090b09]
              to-[#070807]
              p-5
              shadow-[0_30px_90px_rgba(0,0,0,0.35)]
              sm:p-7
              lg:p-8
            "
          >
            <div className="flex items-start gap-4">
              <span
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#B6F000]/10
                  text-[#B6F000]
                "
              >
                <MessageCircle size={21} />
              </span>

              <div>
                <h2 className="text-xl font-semibold sm:text-2xl">
                  Quick Enquiry
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Fill in the details — we get it by
                  email and you continue on WhatsApp.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleWhatsAppEnquiry}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="contact-name"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-white/50
                  "
                >
                  Your Name
                </label>

                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.035]
                    px-4
                    py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/25
                    focus:border-[#B6F000]/50
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="contact-mobile"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-white/50
                  "
                >
                  Mobile Number
                </label>

                <input
                  id="contact-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value)
                  }
                  placeholder="Enter your mobile number"
                  autoComplete="tel"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.035]
                    px-4
                    py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/25
                    focus:border-[#B6F000]/50
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-white/50
                  "
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="How can we help you?"
                  rows={5}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.035]
                    px-4
                    py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/25
                    focus:border-[#B6F000]/50
                  "
                />
              </div>

              {formSuccess && (
                <p
                  role="status"
                  className="
                    rounded-xl
                    border
                    border-[#B6F000]/25
                    bg-[#B6F000]/[0.08]
                    px-4
                    py-3
                    text-sm
                    text-[#B6F000]
                  "
                >
                  {formSuccess}
                </p>
              )}

              {formError && (
                <p
                  role="alert"
                  className="
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/[0.08]
                    px-4
                    py-3
                    text-sm
                    text-red-400
                  "
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="
                  flex
                  w-full
                  disabled:cursor-wait
                  disabled:opacity-60
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#B6F000]
                  px-5
                  py-4
                  text-sm
                  font-bold
                  text-[#080a08]
                  transition
                  hover:brightness-105
                  active:scale-[0.99]
                "
              >
                <Send size={17} />
                {sending ? "Sending…" : "Send Enquiry"}
              </button>

              <p className="text-center text-xs leading-5 text-white/30">
                We&apos;ll receive your enquiry by email and
                it will also open in WhatsApp.
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

interface ContactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

function ContactCard({
  icon,
  label,
  value,
  href,
  external = false,
}: ContactCardProps) {
  const content = (
    <>
      <span
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#B6F000]/10
          text-[#B6F000]
        "
      >
        {icon}
      </span>

      <div>
        <p className="text-xs text-white/40">
          {label}
        </p>

        <p className="mt-1 font-semibold text-white">
          {value}
        </p>
      </div>
    </>
  );

  const className =
    "flex items-center gap-4 rounded-[22px] border border-white/[0.09] bg-gradient-to-br from-[#101310] to-[#080a08] p-5 transition hover:border-[#B6F000]/30";

  if (!href) {
    return (
      <StaggerItem lift>
        <div className={className}>{content}</div>
      </StaggerItem>
    );
  }

  return (
    <StaggerItem lift>
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      className={className}
    >
      {content}
    </a>
    </StaggerItem>
  );
}
