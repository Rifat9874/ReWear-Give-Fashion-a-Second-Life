import Link from 'next/link';

export const metadata = { title: 'About ReWear' };

export default function AboutPage() {
  return (
    <div className="container page page-narrow prose">
      <h1>About ReWear</h1>
      <p className="lead">
        Plenty of good clothes sit unworn in wardrobes while other people look for affordable things to wear. ReWear puts both
        sides in one organised place.
      </p>

      <h2>What ReWear is</h2>
      <p>
        ReWear is a discovery and contact platform for pre-loved clothing. You can browse listings, filter by size, condition,
        price and location, save favorites, and message sellers. Sellers can list items, manage them and answer inquiries.
      </p>

      <h2>What ReWear is not</h2>
      <p>
        ReWear does not take payments, hold money, run a shopping cart or deliver parcels. Buyers and sellers agree on payment and
        handover between themselves, so please read our <Link href="/guidelines">safety guidelines</Link> before you meet.
        We do not verify who sellers are and we cannot guarantee the quality of any item.
      </p>

      <h2>Who it is for</h2>
      <p>Students, budget-conscious shoppers, fashion enthusiasts, and anyone who likes the idea of clothes getting more than one owner.</p>

      <h2>About this project</h2>
      <p>
        ReWear is a portfolio project built with Next.js, React and MongoDB. It is a demonstration of a full-stack marketplace, not a
        commercial service.
      </p>
      <p>
        <Link href="/browse" className="btn btn-primary">Start browsing</Link>
      </p>
    </div>
  );
}
