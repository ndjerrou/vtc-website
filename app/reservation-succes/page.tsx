'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

// Interface for booking details stored in localStorage
interface BookingDetails {
  name: string;
  phone: string;
  email?: string;
  passengers: string;
  pricingType: string;
  displayPickupAddress: string;
  pickupMapsUrl?: string;
  displayDestination?: string; // Only for fixed type
  destinationMapsUrl?: string; // Only for fixed type
  durationLabel?: string; // Only for hourly/package
  date: string;
  time: string;
  babySeat: boolean;
  booster: boolean;
  vehicle: string;
  notes?: string;
  targetWhatsAppNumber: string; // Which number to send to
  // Add any other details needed for the message
}

// Define the actual page content as a separate component
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<
    'verifying' | 'success' | 'error' | 'missing_details'
  >('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(10);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('ID de session de paiement manquant.');
      return;
    }

    // ---- SIMPLIFIED VERIFICATION ----
    // In real production: verify session_id with Stripe API on backend
    // For now: assume session_id means success, try to get details

    // Use the correct key to retrieve details
    const storedDetails = localStorage.getItem('bookingDetails');
    // Use the correct key to remove details after reading
    localStorage.removeItem('bookingDetails');

    if (!storedDetails) {
      console.error('Booking details not found in localStorage.');
      setStatus('missing_details');
      return;
    }

    try {
      const details: BookingDetails = JSON.parse(storedDetails);

      // Reconstruct WhatsApp Message
      let message = `Paiement Réussi - Nouvelle réservation VTC :
`;
      message += `--------------------------------------
`;
      message += `Nom : ${details.name}\n`;
      message += `Téléphone : ${details.phone}\n`;
      if (details.email) message += `Email : ${details.email}\n`;
      message += `Passagers : ${details.passengers}\n`; // Assuming label was stored or reconstructing is too complex here
      message += `--------------------------------------
`;
      message += `Adresse Prise en Charge : ${details.displayPickupAddress}\n`;
      if (details.pickupMapsUrl) {
        message += `Lien GPS (Prise en charge) : ${details.pickupMapsUrl}\n`;
      }

      if (details.pricingType === 'fixed') {
        message += `Type : Forfait destination\n`;
        message += `Destination : ${details.displayDestination || 'N/A'}\n`;
        if (details.destinationMapsUrl) {
          message += `Lien GPS (Destination) : ${details.destinationMapsUrl}\n`;
        }
      } else if (details.pricingType === 'hourly') {
        message += `Type : Mise à disposition\n`;
        message += `Durée : ${details.durationLabel || 'N/A'}\n`;
      } else if (details.pricingType === 'package') {
        message += `Type : Forfait journée/demi-journée\n`;
        message += `Forfait : ${details.durationLabel || 'N/A'}\n`;
      }

      message += `--------------------------------------\n`;
      message += `Date : ${details.date}\n`;
      message += `Heure : ${details.time}\n`;
      message += `--------------------------------------\n`;
      message += `Options :
`;
      message += `  - Siège bébé : ${
        details.babySeat ? 'Oui (+10€)' : 'Non'
      }\n`;
      message += `  - Rehausseur : ${
        details.booster ? 'Oui (Gratuit)' : 'Non'
      }\n`;
      message += `Véhicule préféré : ${details.vehicle || 'Non spécifié'}\n`; // Assuming label stored or reconstructing too complex
      if (details.notes)
        message += `--------------------------------------\nNotes : ${details.notes}\n`;

      // Trigger WhatsApp
      const whatsappUrlGenerated = `https://wa.me/${
        details.targetWhatsAppNumber
      }?text=${encodeURIComponent(message)}`;

      // Store the URL and set status to success to start countdown
      setWhatsappUrl(whatsappUrlGenerated);
      setStatus('success');

      // ---- START COUNTDOWN ----
      const intervalId = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);

      // Cleanup function for the interval
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error('Error processing booking details:', error);
      setStatus('error');
      setErrorMessage('Impossible de traiter les détails de la réservation.');
    }
  }, [sessionId]); // Rerun effect if sessionId changes

  // Effect to handle redirection when countdown reaches 0
  useEffect(() => {
    if (status === 'success' && countdown === 0 && whatsappUrl) {
      window.location.href = whatsappUrl;
    }
    // We don't need to clean up interval here, it's handled above
  }, [countdown, status, whatsappUrl]);

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
      {status === 'verifying' && (
        <>
          <Loader2 className='w-16 h-16 text-blue-500 mb-4 animate-spin' />
          <h1 className='text-2xl font-bold mb-2'>
            Vérification du paiement...
          </h1>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className='w-16 h-16 text-green-500 mb-4' />
          <h1 className='text-3xl font-bold mb-2'>
            Merci pour votre réservation !
          </h1>
          <p className='text-lg text-muted-foreground mb-6'>
            Votre paiement a été effectué avec succès.
          </p>
          <p className='mb-4'>
            Nous allons vous rediriger vers WhatsApp dans{' '}
            <span className='font-bold'>
              {countdown} seconde{countdown > 1 ? 's' : ''}
            </span>{' '}
            pour envoyer les détails de votre réservation au chauffeur.
          </p>
          <p className='text-sm text-muted-foreground mb-8'>
            (Si la redirection automatique échoue après le décompte, vous pouvez{' '}
            <a
              href={whatsappUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='underline'
            >
              cliquer ici
            </a>
            .)
          </p>
          <Button asChild>
            <Link href='/'>Retour à l'accueil</Link>
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertTriangle className='w-16 h-16 text-red-500 mb-4' />
          <h1 className='text-3xl font-bold mb-2'>Erreur de Paiement</h1>
          <p className='text-lg text-muted-foreground mb-6'>
            {errorMessage ||
              'Un problème est survenu lors de la vérification du paiement.'}
          </p>
          <Button asChild variant='secondary'>
            <Link href='/'>Retour au formulaire</Link>
          </Button>
        </>
      )}
      {status === 'missing_details' && (
        <>
          <AlertTriangle className='w-16 h-16 text-yellow-500 mb-4' />
          <h1 className='text-3xl font-bold mb-2'>
            Détails de réservation manquants
          </h1>
          <p className='text-lg text-muted-foreground mb-6'>
            Nous n'avons pas pu récupérer les détails de votre réservation après
            le paiement. Veuillez contacter le support.
          </p>
          <Button asChild variant='secondary'>
            <Link href='/'>Retour à l'accueil</Link>
          </Button>
        </>
      )}
    </div>
  );
}

// The default export now wraps the content component in Suspense
export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
}

// Simple fallback component to show while loading
function LoadingFallback() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
      <Loader2 className='w-16 h-16 text-gray-400 mb-4 animate-spin' />
      <p className='text-lg text-muted-foreground'>Chargement...</p>
    </div>
  );
}
