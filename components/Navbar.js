import Link from 'next/link';
import { connection } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { CATEGORIES } from '@/lib/constants';
import { SearchIcon } from './Icons';
import NavMenu from './NavMenu';

export default async function Navbar() {
  await connection(); // the header depends on the logged-in user, so never prerender it
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null; // if the database is down, the site still renders for visitors
  }

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="logo" aria-label="ReWear home">
          <span className="logo-mark" aria-hidden="true">R</span>
          <span className="logo-text">ReWear</span>
        </Link>

        <form className="nav-search" action="/browse" role="search">
          <label htmlFor="nav-q" className="sr-only">Search listings</label>
          <input id="nav-q" name="q" type="search" placeholder="Search jeans, brands, kurta…" maxLength={100} />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <NavMenu user={user ? { name: user.name, isAdmin: user.isAdmin } : null} />
      </div>
      <nav className="category-bar" aria-label="Categories">
        <div className="container category-bar-inner">
          {CATEGORIES.map((category) => (
            <Link key={category} href={`/browse?category=${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
