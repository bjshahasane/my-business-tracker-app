'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', href: '/pages/dashboard' },
  { name: 'Products', href: '/pages/productCatalogue' },
  { name: 'Orders', href: '/pages/orders' },
  { name: 'Products to Make', href: '/pages/productsToMake' },
  { name: 'Expenses', href: '/pages/expenses' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/">My App</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {navLinks.map((link) => (
              <li key={link.href} className="nav-item">
                <Link
                  className={`nav-link ${pathname === link.href ? 'active fw-semibold text-primary' : ''}`}
                  href={link.href}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
