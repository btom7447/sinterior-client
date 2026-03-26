import Link from "next/link";

const Footer = () => {
  const footerLinks = {
    platform: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Artisan", href: "/artisan" },
      { label: "Real Estate", href: "/real-estate" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Feed", href: "/feed"}
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-xl">Sinterior</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Connecting suppliers, artisans, and clients across the construction industry.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-background/70 hover:text-background text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-background/70 hover:text-background text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-background/70 hover:text-background text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">© 2025 Sinterior. Sitam Integrated Resource Limited.</p>
          <div className="flex items-center gap-4">
            <span className="text-background/60 text-sm">Made in Nigeria 🇳🇬</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
