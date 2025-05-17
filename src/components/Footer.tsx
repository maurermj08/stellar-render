import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full py-6 mt-8 border-t border-gray-800 bg-background text-center text-sm text-gray-400">
    <div>
      <Link to="/terms-of-service" className="hover:underline">
        Terms of Service
      </Link>
      {/* Add more footer links here as needed */}
    </div>
  </footer>
);

export default Footer;