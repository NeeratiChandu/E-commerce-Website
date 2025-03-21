import { Link } from "wouter";
import { Container } from "@/components/ui/container";
import { ShoppingCart, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-md flex items-center justify-center text-white font-bold mr-2">
                <ShoppingCart size={18} />
              </div>
              <span className="text-xl font-semibold">ShopSmart</span>
            </div>
            <p className="mt-4 text-gray-300 text-sm">
              Revolutionizing the way you shop online with personalized recommendations, seamless checkout, and exclusive deals.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FacebookIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <TwitterIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <InstagramIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <LinkedinIcon size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Press</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">FAQs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Shipping Info</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Accessibility</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} ShopSmart, Inc. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <svg className="h-6" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="40" rx="4" fill="#252525"/>
              <path d="M20 14H40V26H20V14Z" fill="#2596FF"/>
            </svg>
            <svg className="h-6" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="40" rx="4" fill="#252525"/>
              <circle cx="30" cy="20" r="8" fill="#FF5F00"/>
              <path d="M26 20C26 17.8 27.2 15.8 29 14.7C27.7 13.6 26 13 24.2 13C20.3 13 17 16.1 17 20C17 23.9 20.3 27 24.2 27C26 27 27.7 26.4 29 25.3C27.2 24.2 26 22.2 26 20Z" fill="#EB001B"/>
              <path d="M43 20C43 23.9 39.7 27 35.8 27C34 27 32.3 26.4 31 25.3C32.8 24.2 34 22.2 34 20C34 17.8 32.8 15.8 31 14.7C32.3 13.6 34 13 35.8 13C39.7 13 43 16.1 43 20Z" fill="#F79E1B"/>
            </svg>
            <svg className="h-6" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="40" rx="4" fill="#252525"/>
              <path d="M18 26V14L30 26V14" stroke="white" strokeWidth="2"/>
              <path d="M32 14H44L32 26H44" stroke="#9DB2FF" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </Container>
    </footer>
  );
}
