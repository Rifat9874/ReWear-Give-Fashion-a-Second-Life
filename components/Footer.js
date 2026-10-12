import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">ReWear</p>
          <p className="footer-text">
            A community marketplace for pre-loved clothing. ReWear connects buyers and sellers; it does not process payments or deliver items.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="footer-heading">Explore</h2>
          <ul>
            <li><Link href="/browse">Browse clothing</Link></li>
            <li><Link href="/sell">Sell an item</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/guidelines">Guidelines</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="footer-heading">Contact</h2>
          <p className="footer-text">
            Questions or problems with a listing?
            <br />
            <a href="mailto:support@rewear.example">support@rewear.example</a>
          </p>
          <p className="footer-text">Dhaka, Bangladesh</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} ReWear. A student portfolio project.</p>
      </div>
    </footer>
  );
}
