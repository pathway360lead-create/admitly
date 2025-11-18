import { FC } from 'react';
import { Mail, Twitter, Facebook, Instagram } from 'lucide-react';
import admitlyIcon from '@/assets/images/admitly-icon.png';

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Institutions', href: '/institutions' },
      { name: 'Programs', href: '/programs' },
      { name: 'Compare', href: '/compare' },
      { name: 'Deadlines', href: '/deadlines' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/admitly' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/admitly' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/admitly' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@admitly.com.ng' },
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={admitlyIcon} alt="Admitly" className="h-10 w-10 sm:h-12 sm:w-12" />
              <span className="text-xl font-bold">Admitly</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering Nigerian students to make informed decisions about their educational
              future. Discover, compare, and plan your journey with confidence.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {currentYear} Admitly. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for Nigerian students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
