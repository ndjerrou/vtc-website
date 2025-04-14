import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Define metadata for the application
export const metadata: Metadata = {
  title: {
    default: 'VTC Paris Premium - Réservation Chauffeur', // Default title for the site
    template: '%s | VTC Paris Premium', // Template for subpages (e.g., "Contact | VTC Paris Premium")
  },
  description:
    'Réservez votre chauffeur VTC privé à Paris et Île-de-France. Service premium, véhicules Mercedes et Tesla.',
  icons: {
    icon: '/favicon.ico', // Specifies the path to the favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
