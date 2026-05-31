import Link from "next/link";

const footerLinks = [
  { label: "PRIVACY", href: "#" },
  { label: "TERMS", href: "#" },
  { label: "SECURITY", href: "#" },
  { label: "STATUS", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto gap-8">
        <Link href="/" className="type-headline-sm font-bold text-primary">
          NEXORA
        </Link>

        <div className="flex flex-wrap justify-center gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="type-telemetry-sm text-on-secondary-container hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="type-telemetry-sm text-on-secondary-container opacity-80">
          © 2024 NEXORA SYSTEMS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
