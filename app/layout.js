import './globals.css';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata = {
  title: { default: 'ReWear - Pre-Loved Fashion Discovery', template: '%s | ReWear' },
  description: 'Discover, list and exchange pre-loved clothing. Affordable second-hand fashion from people near you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <ToastProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
