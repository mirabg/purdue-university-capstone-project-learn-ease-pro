import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo.svg"
              alt="LearnEase Pro"
              className="h-24 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
