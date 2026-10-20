import { Link } from "react-router-dom";
import { Camera, Mail, MapPin, MessageCircle, Phone, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Daily Drape"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-cream/25 shadow-md"
              />
              <span className="font-serif-display text-2xl font-semibold tracking-wide">Daily Drape</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              Everyday, elegant fashion rooted in Indian craft — handpicked
              sarees, kurtas, dresses and accessories for every story you
              tell through what you wear.
            </p>
            <div className="mt-5 flex gap-3">
              {[Camera, Users, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-cream/20 transition hover:border-primary-light hover:text-primary-light"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "Women", to: "/products?category=women" },
              { label: "Men", to: "/products?category=men" },
              { label: "Kids", to: "/products?category=kids" },
              { label: "Accessories", to: "/products?category=accessories" },
              { label: "Sale", to: "/products?category=sale" },
            ]}
          />

          <FooterCol
            title="Help"
            links={[
              { label: "Contact Us", to: "/contact" },
              { label: "FAQs", to: "/faq" },
              { label: "Shipping Policy", to: "/shipping" },
              { label: "Returns & Refunds", to: "/returns" },
              { label: "Track Order", to: "/orders" },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              { label: "About Us", to: "/about" },
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms & Conditions", to: "/terms" },
              { label: "Delivery Partner Login", to: "/delivery/login" },
              { label: "Admin", to: "/admin" },
            ]}
          />
        </div>

        <div className="mt-10 grid gap-3 border-t border-cream/10 pt-8 text-sm text-cream/70 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Phone size={15} /> +91 98XXXXXX10 <span className="text-cream/40">(sample)</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={15} /> support@dailydrape.example
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} /> Mumbai, Maharashtra, India
          </div>
        </div>

        <p className="mt-6 text-xs text-cream/40">
          © {new Date().getFullYear()} Daily Drape. All rights reserved. Contact
          details above are placeholders — update with your real business
          information before going live.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="font-serif-display text-sm font-semibold tracking-wide">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-cream/70 transition hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
