"use client";

import Link from 'next/link';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Caimax Properties</h3>
            <p className="text-sm text-gray-400">Defined by Service and Expertise</p>
            <div className="flex items-center gap-4">
              <Link href="https://facebook.com/judith.mbiyu" target="_blank" rel="noopener noreferrer" 
                className="hover:text-white transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="https://instagram.com/judymbiyu" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="https://www.youtube.com/@judywinstonknights355" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Property Management</li>
              <li>Property Development</li>
              <li>Land Sales</li>
              <li>Residential Sales</li>
              <li>Mixed Use Properties</li>
              <li>Warehouse Solutions</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <Link href="tel:+254700000000" className="hover:text-white transition-colors">
                  +254 700 000 000
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <Link href="mailto:info@caimaxproperties.com" className="hover:text-white transition-colors">
                  info@caimaxproperties.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Caimax Properties. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}