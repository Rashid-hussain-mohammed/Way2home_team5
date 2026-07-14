import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-white bg-black">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-wrap justify-between">
          {/* Logo and Description */}
          <div className="w-full mb-3 md:w-1/3 md:mb-0">
            <h1 className="text-xl font-bold">Way2Home</h1>
            <p className="mt-2 text-sm text-gray-400">
              Helping you find reliable housing with ease.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="w-full mb-3 md:w-1/3 md:mb-0">
            <h2 className="mb-2 text-lg font-bold ">Quick Links</h2>
            <ul className="space-y-1 text-sm">
              <li><a href="/" className="hover:text-yellow-600">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-600">About Us</a></li>
              <li><a href="/privacy" className="hover:text-yellow-600">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="w-full md:w-1/3">
            <h2 className="mb-2 text-lg font-bold">Contact Us</h2>
            <p className="text-sm text-gray-400">
              Email: <a href="mailto:support@way2home.com" className="hover:text-yellow-600">support@way2home.com</a>
            </p>
            <p className="text-sm text-gray-400">Phone: +49-123-456-789</p>
            <p className="text-sm text-gray-400">
              Address: Fulda University, Germany
            </p>
          </div>
        </div>

        <div className="pt-4 mt-6 text-sm text-center text-gray-500 border-t border-gray-700">
          © GDSD Project from Hochschule Fulda (Educational purposes)
        </div>
      </div>
    </footer>
  );
};

export default Footer;
