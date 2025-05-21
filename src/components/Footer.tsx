import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full py-6 mt-8 border-t border-gray-800 bg-background text-center text-sm text-gray-400">
    <div>
      <Link to="/terms-of-service" className="hover:underline">
        Terms of Service
      </Link>
      <span className="mx-2">|</span>
      <a
        href="https://discord.com/channels/1374554309596938271/1374554311215808544"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Discord
      </a>
      <span className="mx-2">|</span>
      <a
        href="https://www.etsy.com/shop/StellarScreens"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Etsy
      </a>
      <span className="mx-2">|</span>
      <a
        href="mailto:michael@stellarscreens.shop"
        className="hover:underline"
      >
        Email
      </a>
      <span className="mx-2">|</span>
      <Link to="/support" className="hover:underline">
        Support
      </Link>
      {/* Add more footer links here as needed */}
    </div>
  </footer>
);

export default Footer;