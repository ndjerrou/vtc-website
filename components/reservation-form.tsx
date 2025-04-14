'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/date-picker';
import { TimePicker } from '@/components/time-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ChevronDown, LocateFixed, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Loader, Libraries } from '@googlemaps/js-api-loader';

const passengerOptions = [
  { value: '1', label: '1 passager' },
  { value: '2', label: '2 passagers' },
  { value: '3', label: '3 passagers' },
  { value: '4', label: '4 passagers' },
];

const destinationOptions = [
  {
    value: 'Disneyland Paris, Marne-la-Vallée',
    label: 'Paris - Disney (120€)',
    price: 120,
  },
  {
    value: "Aéroport d'Orly",
    label: 'Paris rive gauche - Orly (70€)',
    price: 70,
  },
  {
    value: "Aéroport d'Orly",
    label: 'Paris rive droite - Orly (60€)',
    price: 60,
  },
  {
    value: 'Aéroport Paris-Charles de Gaulle',
    label: 'Paris rive gauche - Roissy (80€)',
    price: 80,
  },
  {
    value: 'Aéroport Paris-Charles de Gaulle',
    label: 'Paris rive droite - Roissy (90€)',
    price: 90,
  },
  {
    value: 'Parc Astérix, Plailly',
    label: 'Paris - Parc Astérix (110€)',
    price: 110,
  },
  {
    value: 'La Vallée Village, Serris',
    label: 'Paris - Marne-la-Vallée village (110€)',
    price: 110,
  },
  {
    value: 'Château de Versailles',
    label: 'Paris - Château de Versailles (80€)',
    price: 80,
  },
  { value: 'other', label: 'Autre (préciser ci-dessous)', price: null },
];

const hourOptions = [
  { value: '1', label: '1 heure (70€)', price: 70 },
  { value: '2', label: '2 heures (140€)', price: 140 },
  { value: '3', label: '3 heures (210€)', price: 210 },
  { value: '4', label: '4 heures (280€)', price: 280 },
  { value: '5', label: '5 heures (350€)', price: 350 },
  { value: '6', label: '6 heures (420€)', price: 420 },
];

const packageTypeOptions = [
  { value: 'half', label: 'Demi-journée - 4 heures (250€)', price: 250 },
  { value: 'full', label: 'Journée complète (450€)', price: 450 },
];

const vehicleOptions = [
  { value: 'Mercedes C300E', label: 'Mercedes C300E' },
  { value: 'Tesla Model Y', label: 'Tesla Model Y' },
];

const KM_PRICE = 2;
const BABY_SEAT_PRICE = 10;
const GPS_PLACEHOLDER = '[Position GPS actuelle]';

interface Coordinates {
  lat: number;
  lon: number;
}

interface BookingDetails {
  name: string;
  phone: string;
  email?: string;
  passengers: string;
  pricingType: string;
  displayPickupAddress: string;
  pickupMapsUrl?: string;
  displayDestination: string;
  destinationMapsUrl?: string;
  durationLabel?: string;
  date: string;
  time: string;
  babySeat: boolean;
  booster: boolean;
  vehicle: string;
  notes?: string;
  targetWhatsAppNumber: string;
  price: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export default function ReservationForm() {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [passengers, setPassengers] = useState<string>('');
  const [pricingType, setPricingType] = useState<string>('fixed');
  const [destination, setDestination] = useState<string>('');
  const [manualDestination, setManualDestination] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [packageType, setPackageType] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupCoordinates, setPickupCoordinates] =
    useState<Coordinates | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [babySeat, setBabySeat] = useState<boolean>(false);
  const [booster, setBooster] = useState<boolean>(false);
  const [vehicle, setVehicle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'delivery' | 'card'>(
    'card'
  );
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRedirectingToStripe, setIsRedirectingToStripe] =
    useState<boolean>(false);

  // Refs for Autocomplete input elements
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Refs for Autocomplete instances (to manage cleanup)
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(
    null
  );
  const destinationAutocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);

  const isMobile = useIsMobile();

  // Effect for Google Maps Autocomplete Initialization
  useEffect(() => {
    let googleMapsApi: typeof google | null = null;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error(
        'API Key Error: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.'
      );
      setSubmitError('Erreur de configuration serveur.');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places'] as Libraries,
    });

    loader
      .load()
      .then(google => {
        googleMapsApi = google;
        if (!google?.maps?.places) {
          console.error('Google Maps Places library failed to load.');
          setSubmitError('Erreur: Service Google Places indisponible.');
          return;
        }

        const autocompleteOptions: google.maps.places.AutocompleteOptions = {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry'],
          types: ['address'],
        };

        // Initialize Pickup Autocomplete
        if (pickupInputRef.current && !pickupAutocompleteRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(
            pickupInputRef.current,
            autocompleteOptions
          );
          pickupAutocompleteRef.current = autocomplete;
          google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setPickupAddress(place.formatted_address);
              setPickupCoordinates(null);
              setSubmitError(null);
            } else {
              console.warn(
                'Autocomplete selected place has no formatted_address:',
                place
              );
            }
          });
        }

        // Initialize Destination Autocomplete (only if manual destination is visible)
        if (
          destinationInputRef.current &&
          pricingType === 'fixed' &&
          destination === 'other-Autre (préciser ci-dessous)' &&
          !destinationAutocompleteRef.current
        ) {
          const autocomplete = new google.maps.places.Autocomplete(
            destinationInputRef.current,
            autocompleteOptions
          );
          destinationAutocompleteRef.current = autocomplete;
          google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setManualDestination(place.formatted_address);
              setSubmitError(null);
            } else {
              console.warn(
                'Autocomplete selected place has no formatted_address:',
                place
              );
            }
          });
        } else if (
          destinationAutocompleteRef.current &&
          (pricingType !== 'fixed' ||
            destination !== 'other-Autre (préciser ci-dessous)')
        ) {
          // Cleanup destination autocomplete if the input is no longer visible
          if (google && google.maps && google.maps.event) {
            google.maps.event.clearInstanceListeners(
              destinationAutocompleteRef.current
            );
          }
          destinationAutocompleteRef.current = null;
          // Attempt to remove pac-container if it remains
          const pacContainers = document.querySelectorAll('.pac-container');
          pacContainers.forEach(container => container.remove());
        }
      })
      .catch(e => {
        console.error('Error loading Google Maps API:', e);
        setSubmitError('Erreur chargement Google Maps.');
      });

    // General Cleanup function for component unmount
    return () => {
      if (googleMapsApi && googleMapsApi.maps && googleMapsApi.maps.event) {
        const mapsEvent = googleMapsApi.maps.event;
        if (pickupAutocompleteRef.current)
          mapsEvent.clearInstanceListeners(pickupAutocompleteRef.current);
        if (destinationAutocompleteRef.current)
          mapsEvent.clearInstanceListeners(destinationAutocompleteRef.current);
      }
      pickupAutocompleteRef.current = null;
      destinationAutocompleteRef.current = null;
      // Attempt to remove pac-container if it remains on unmount
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach(container => container.remove());
    };
  }, [pricingType, destination]);

  useEffect(() => {
    const calculateDynamicPrice = async () => {
      let basePrice: number | null = null;
      let needsDistanceCalc = false;
      let originForCalc: string | google.maps.LatLngLiteral | null = null;
      let destForCalc: string | null = null;

      if (pricingType === 'fixed') {
        if (destination === 'other-Autre (préciser ci-dessous)') {
          if (manualDestination && (pickupAddress || pickupCoordinates)) {
            needsDistanceCalc = true;
            originForCalc = pickupCoordinates
              ? { lat: pickupCoordinates.lat, lng: pickupCoordinates.lon }
              : pickupAddress;
            destForCalc = manualDestination;
          }
        } else {
          basePrice =
            destinationOptions.find(
              opt => `${opt.value}-${opt.label}` === destination
            )?.price ?? null;
        }
      } else if (pricingType === 'hourly') {
        basePrice = hourOptions.find(opt => opt.value === hours)?.price ?? null;
      } else if (pricingType === 'package') {
        basePrice =
          packageTypeOptions.find(opt => opt.value === packageType)?.price ??
          null;
      }

      if (needsDistanceCalc && destForCalc && originForCalc) {
        setIsCalculatingPrice(true);
        setCalculatedPrice(null);
        let distanceError = null;

        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error('Google Maps API key is missing.');
          }

          const loader = new Loader({
            apiKey: apiKey,
            version: 'weekly',
            libraries: ['places'] as Libraries,
          });

          const google = await loader.load();
          if (!google?.maps?.DirectionsService) {
            throw new Error('Google Maps Directions Service failed to load.');
          }
          const directionsService = new google.maps.DirectionsService();

          console.log(
            'Calculating distance from:',
            originForCalc,
            'to:',
            destForCalc
          );

          const request: google.maps.DirectionsRequest = {
            origin: originForCalc,
            destination: destForCalc,
            travelMode: google.maps.TravelMode.DRIVING,
          };

          const response = await directionsService.route(request);

          if (
            response.routes.length > 0 &&
            response.routes[0].legs.length > 0 &&
            response.routes[0].legs[0].distance
          ) {
            const distanceInMeters = response.routes[0].legs[0].distance.value;
            const distanceInKm = distanceInMeters / 1000;
            basePrice = Math.round(distanceInKm * KM_PRICE);
            console.log(
              `Distance: ${distanceInKm.toFixed(
                2
              )} km, Calculated Price: ${basePrice}€`
            );
          } else {
            throw new Error(
              'Could not calculate distance. Check addresses or route feasibility.'
            );
          }
        } catch (error: any) {
          console.error('Error calculating distance with Google Maps:', error);
          distanceError = `Erreur calcul: ${error.message}`;
          basePrice = null;
        } finally {
          setIsCalculatingPrice(false);
          setSubmitError(distanceError);
        }
      } else if (needsDistanceCalc) {
        setCalculatedPrice(null);
      }

      let finalPrice = basePrice;
      if (finalPrice !== null && babySeat) {
        finalPrice += BABY_SEAT_PRICE;
      }

      if (!isCalculatingPrice || !needsDistanceCalc) {
        setCalculatedPrice(finalPrice);
        if (!needsDistanceCalc) {
          setSubmitError(null);
        }
      }
    };

    const timer = setTimeout(() => {
      calculateDynamicPrice();
    }, 800);

    return () => clearTimeout(timer);
  }, [
    pricingType,
    destination,
    manualDestination,
    pickupAddress,
    pickupCoordinates,
    hours,
    packageType,
    babySeat,
    booster,
  ]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassengers('');
    setPricingType('fixed');
    setDestination('');
    setManualDestination('');
    setHours('');
    setPackageType('');
    setPickupAddress('');
    setPickupCoordinates(null);
    setDate(undefined);
    setTime('');
    setBabySeat(false);
    setBooster(false);
    setVehicle('');
    setNotes('');
    setPaymentMethod('card');
    setCalculatedPrice(null);
    setIsCalculatingPrice(false);
    setSubmitError(null);
    // Clear autocomplete inputs visually (refs handle instances)
    if (pickupInputRef.current) pickupInputRef.current.value = '';
    if (destinationInputRef.current) destinationInputRef.current.value = '';
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setPickupCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setPickupAddress(GPS_PLACEHOLDER);
          setSubmitError(null);
          // Clear potential error from autocomplete failure
          if (pickupInputRef.current)
            pickupInputRef.current.value = GPS_PLACEHOLDER; // Update input visually
        },
        error => {
          console.error('Error getting location', error);
          setSubmitError("Impossible d'obtenir la position GPS.");
        }
      );
    } else {
      setSubmitError(
        "La géolocalisation n'est pas supportée par ce navigateur."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const selectedDate = date
      ? format(date, 'dd/MM/yyyy')
      : 'Date non spécifiée';
    const selectedTime = time || 'Heure non spécifiée';
    const selectedVehicle =
      vehicleOptions.find(opt => opt.value === vehicle)?.label ||
      'Véhicule non spécifié';
    const passengerCount =
      passengerOptions.find(opt => opt.value === passengers)?.label ||
      'Nombre non spécifié';

    const targetWhatsAppNumber =
      vehicle === 'Tesla Model Y' ? '+33611700973' : '+33624117756';

    let displayDestination = 'N/A';
    let destinationMapsUrl: string | undefined = undefined;
    let durationLabel: string | undefined = undefined;
    let finalPriceDescription = 'Non calculé';

    if (pricingType === 'fixed') {
      if (destination === 'other-Autre (préciser ci-dessous)') {
        displayDestination = manualDestination;
        destinationMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          manualDestination
        )}`;
      } else {
        const selectedOpt = destinationOptions.find(
          opt => `${opt.value}-${opt.label}` === destination
        );
        displayDestination = selectedOpt?.label || 'Destination non spécifiée';
        if (selectedOpt?.value) {
          destinationMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            selectedOpt.value
          )}`;
        }
      }
      if (calculatedPrice !== null) {
        finalPriceDescription = `${calculatedPrice}€`;
      }
    } else if (pricingType === 'hourly') {
      durationLabel =
        hourOptions.find(opt => opt.value === hours)?.label ||
        'Durée non spécifiée';
      displayDestination = `Mise à disposition (${durationLabel})`;
      if (calculatedPrice !== null) {
        finalPriceDescription = `${calculatedPrice}€`;
      }
    } else if (pricingType === 'package') {
      durationLabel =
        packageTypeOptions.find(opt => opt.value === packageType)?.label ||
        'Forfait non spécifié';
      displayDestination = `Forfait (${durationLabel})`;
      if (calculatedPrice !== null) {
        finalPriceDescription = `${calculatedPrice}€`;
      }
    }

    let displayPickupAddress = pickupAddress;
    let pickupMapsUrl: string | undefined = undefined;

    if (pickupCoordinates) {
      displayPickupAddress = 'Position GPS actuelle';
      pickupMapsUrl = `https://www.google.com/maps?q=${pickupCoordinates.lat},${pickupCoordinates.lon}`;
    } else if (pickupAddress) {
      pickupMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        pickupAddress
      )}`;
    }

    const bookingDetails: BookingDetails = {
      name,
      phone,
      email,
      passengers: passengerCount,
      pricingType,
      displayPickupAddress,
      pickupMapsUrl,
      displayDestination,
      destinationMapsUrl,
      durationLabel,
      date: selectedDate,
      time: selectedTime,
      babySeat,
      booster,
      vehicle: selectedVehicle,
      notes,
      targetWhatsAppNumber,
      price: finalPriceDescription,
    };

    if (paymentMethod === 'delivery') {
      // Generate WhatsApp message for 'Payer à bord'
      const deliveryMessage = `Nouvelle réservation VTC Paris Premium :
      ------------------------------------
      Client : ${bookingDetails.name}
      Téléphone : ${bookingDetails.phone}
      ${bookingDetails.email ? `Email : ${bookingDetails.email}` : ''}
      Passagers : ${bookingDetails.passengers}
      ------------------------------------
      Prise en charge : ${bookingDetails.displayPickupAddress}
      ${
        bookingDetails.pickupMapsUrl
          ? `Lien Maps : ${bookingDetails.pickupMapsUrl}`
          : ''
      }
      Destination : ${bookingDetails.displayDestination || 'N/A'}
      ${
        bookingDetails.destinationMapsUrl
          ? `Lien Maps : ${bookingDetails.destinationMapsUrl}`
          : ''
      }
      ------------------------------------
      Date : ${bookingDetails.date}
      Heure : ${bookingDetails.time}
      Véhicule : ${bookingDetails.vehicle}
      ${bookingDetails.babySeat ? 'Options : Siège bébé (+10€)\n' : ''}${
        bookingDetails.booster ? 'Options : Réhausseur (Gratuit)\n' : ''
      }
      ${bookingDetails.notes ? `Notes : ${bookingDetails.notes}` : ''}
      ------------------------------------
      Mode de paiement : Payer à bord
      Prix estimé : ${bookingDetails.price}
      `;

      const whatsappUrl = `https://wa.me/${
        bookingDetails.targetWhatsAppNumber
      }?text=${encodeURIComponent(deliveryMessage)}`;

      window.open(whatsappUrl, '_blank');
      alert(
        'Votre réservation a été enregistrée ! Vous allez être redirigé vers WhatsApp pour envoyer le récapitulatif.'
      );
      resetForm();
    } else if (paymentMethod === 'card') {
      // Handle card payment
      if (calculatedPrice === null || isCalculatingPrice) {
        setSubmitError(
          "Le prix n'est pas encore calculé ou une erreur est survenue. Veuillez vérifier les détails."
        );
        return;
      }

      setIsRedirectingToStripe(true); // Start redirection loader
      setSubmitError(null); // Clear previous errors before starting

      try {
        // 1. Store booking details temporarily (e.g., localStorage)
        localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

        // 2. Call the API route to create a checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price: calculatedPrice * 100, // Price in cents
            productDescription: `Réservation VTC: ${displayPickupAddress} -> ${displayDestination}`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Échec de la création de la session de paiement.'
          );
        }

        const { sessionId } = await response.json();

        // 3. Redirect to Stripe Checkout
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe.js n'a pas pu être chargé.");
        }
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
          throw error;
        }
        // No need to reset form here, redirection handles it.
        // If redirection fails, the error is caught below.
      } catch (error: any) {
        // Log the full error object for detailed debugging
        console.error('Caught payment error object:', error);

        // Construct a more informative error message
        let errorMessage = 'Une erreur inconnue est survenue lors du paiement.';
        if (error instanceof Error && error.message) {
          errorMessage = error.message;
          // Handle the specific case where message itself is [object Object]
          if (errorMessage === '[object Object]') {
            errorMessage = `Erreur technique (détails dans la console).`;
          }
        } else if (typeof error === 'object' && error !== null) {
          // Attempt to get Stripe error type or stringify
          errorMessage = error.type || error.code || JSON.stringify(error);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        setSubmitError(
          `Erreur lors de la préparation du paiement : ${errorMessage}`
        );

        // Clean up localStorage if payment setup failed
        // REMOVED: localStorage.removeItem('bookingDetails');
        setIsRedirectingToStripe(false); // Stop redirection loader on error
      }
    }
  };

  // --- Modified onChange Handlers ---
  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickupAddress(e.target.value);
    // If user types manually after selecting GPS or Autocomplete, clear GPS coords
    if (pickupCoordinates) {
      setPickupCoordinates(null);
    }
  };

  const handleManualDestinationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setManualDestination(e.target.value);
  };

  // --- Helper function for Select/Drawer labels ---
  const getLabel = (
    value: string,
    options: ReadonlyArray<{ value: string; label: string }>,
    placeholder: string = 'Sélectionnez'
  ): string => {
    if (!value) return placeholder;

    let selectedOption: { value: string; label: string } | undefined;

    if (options === destinationOptions) {
      // Handle specific display value for 'other' destination key
      if (value === 'other-Autre (préciser ci-dessous)')
        return 'Autre (préciser ci-dessous)';
      // Find based on the unique 'value-label' key
      selectedOption = options.find(
        opt => `${opt.value}-${opt.label}` === value
      );
    } else {
      // For other option types, find based on simple value
      selectedOption = options.find(opt => opt.value === value);
    }

    // Return label, fallback to value itself, then placeholder
    return selectedOption?.label || value || placeholder;
  };

  // --- JSX --- //
  return (
    <Card>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nom</Label>
              <Input
                id='name'
                placeholder='Votre nom complet'
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Téléphone</Label>
              <Input
                id='phone'
                placeholder='Votre numéro de téléphone'
                type='tel'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email (Optionnel)</Label>
            <Input
              id='email'
              placeholder='Votre adresse email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='passengers'>Nombre de passagers</Label>
              {isMobile ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-between'
                    >
                      {getLabel(
                        passengers,
                        passengerOptions,
                        'Choisir le nombre'
                      )}
                      <ChevronDown className='ml-2 h-4 w-4' />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Nombre de passagers</DrawerTitle>
                    </DrawerHeader>
                    <div className='p-4'>
                      {passengerOptions.map(option => (
                        <DrawerClose asChild key={option.value}>
                          <Button
                            variant='ghost'
                            className='w-full justify-start mb-2'
                            onClick={() => setPassengers(option.value)}
                          >
                            {option.label}
                          </Button>
                        </DrawerClose>
                      ))}
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant='outline'>Fermer</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Select
                  value={passengers}
                  onValueChange={setPassengers}
                  required
                >
                  <SelectTrigger id='passengers'>
                    <SelectValue placeholder='Choisir le nombre' />
                  </SelectTrigger>
                  <SelectContent>
                    {passengerOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Type de tarification</Label>
              <RadioGroup
                value={pricingType}
                onValueChange={setPricingType}
                className='flex flex-col sm:flex-row sm:gap-4 pt-2'
                required
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='fixed' id='fixed' />
                  <Label htmlFor='fixed'>Tarif Fixe</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='hourly' id='hourly' />
                  <Label htmlFor='hourly'>Par Heure</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='package' id='package' />
                  <Label htmlFor='package'>Forfait</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Conditional Fields Container */}
          <div className='border-l-2 border-primary pl-4 space-y-4 mt-4'>
            {pricingType === 'fixed' && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='destination'>Destination</Label>
                  {isMobile ? (
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-between'
                        >
                          {getLabel(
                            destination,
                            destinationOptions,
                            'Choisir la destination'
                          )}
                          <ChevronDown className='ml-2 h-4 w-4' />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Destination</DrawerTitle>
                        </DrawerHeader>
                        <div className='p-4'>
                          {destinationOptions.map(option => {
                            const generatedKey = `${option.value}-${option.label}`;
                            return (
                              <DrawerClose asChild key={generatedKey}>
                                <Button
                                  variant='ghost'
                                  className='w-full justify-start mb-2'
                                  onClick={() => setDestination(generatedKey)}
                                >
                                  {option.label}
                                </Button>
                              </DrawerClose>
                            );
                          })}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant='outline'>Fermer</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Select
                      value={destination}
                      onValueChange={setDestination}
                      required
                    >
                      <SelectTrigger id='destination'>
                        <SelectValue placeholder='Choisir la destination' />
                      </SelectTrigger>
                      <SelectContent>
                        {destinationOptions.map(option => {
                          const generatedKey = `${option.value}-${option.label}`;
                          return (
                            <SelectItem key={generatedKey} value={generatedKey}>
                              {option.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {destination === 'other-Autre (préciser ci-dessous)' && (
                  <div className='space-y-2'>
                    <Label htmlFor='manualDestination'>
                      Adresse de destination complète*
                    </Label>
                    <Input
                      id='manualDestination'
                      ref={destinationInputRef}
                      placeholder="Entrez l'adresse de destination"
                      value={manualDestination}
                      onChange={handleManualDestinationChange}
                      required
                    />
                  </div>
                )}
              </>
            )}
            {pricingType === 'hourly' && (
              <div className='space-y-2'>
                <Label htmlFor='hours'>Nombre d'heures</Label>
                {isMobile ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-between'
                      >
                        {getLabel(hours, hourOptions, 'Choisir la durée')}
                        <ChevronDown className='ml-2 h-4 w-4' />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Nombre d'heures</DrawerTitle>
                      </DrawerHeader>
                      <div className='p-4'>
                        {hourOptions.map(option => (
                          <DrawerClose asChild key={option.value}>
                            <Button
                              variant='ghost'
                              className='w-full justify-start mb-2'
                              onClick={() => setHours(option.value)}
                            >
                              {option.label}
                            </Button>
                          </DrawerClose>
                        ))}
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant='outline'>Fermer</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Select value={hours} onValueChange={setHours} required>
                    <SelectTrigger id='hours'>
                      <SelectValue placeholder='Choisir la durée' />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {pricingType === 'package' && (
              <div className='space-y-2'>
                <Label htmlFor='packageType'>Type de forfait</Label>
                {isMobile ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-between'
                      >
                        {getLabel(
                          packageType,
                          packageTypeOptions,
                          'Choisir le forfait'
                        )}
                        <ChevronDown className='ml-2 h-4 w-4' />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Type de forfait</DrawerTitle>
                      </DrawerHeader>
                      <div className='p-4'>
                        {packageTypeOptions.map(option => (
                          <DrawerClose asChild key={option.value}>
                            <Button
                              variant='ghost'
                              className='w-full justify-start mb-2'
                              onClick={() => setPackageType(option.value)}
                            >
                              {option.label}
                            </Button>
                          </DrawerClose>
                        ))}
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant='outline'>Fermer</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Select
                    value={packageType}
                    onValueChange={setPackageType}
                    required
                  >
                    <SelectTrigger id='packageType'>
                      <SelectValue placeholder='Choisir le forfait' />
                    </SelectTrigger>
                    <SelectContent>
                      {packageTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          {/* Pickup Address (Always Visible) */}
          <div className='space-y-1 pt-4'>
            <Label htmlFor='pickupAddress'>Adresse de prise en charge*</Label>
            <div className='flex items-center gap-2'>
              <Input
                id='pickupAddress'
                ref={pickupInputRef}
                placeholder="Entrez l'adresse de prise en charge"
                value={pickupAddress}
                onChange={handlePickupChange}
                required
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={handleGetCurrentLocation}
                title='Utiliser ma position'
                aria-label='Utiliser ma position actuelle'
              >
                <LocateFixed className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Date and Time Pickers */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Date*</Label>
              <DatePicker onDateSelect={setDate} />
            </div>
            <div className='space-y-2'>
              <Label>Heure*</Label>
              <TimePicker onTimeChange={newTime => setTime(newTime || '')} />
            </div>
          </div>

          <div className='space-y-4'>
            <Label>Options supplémentaires</Label>
            <div className='flex flex-col sm:flex-row sm:gap-6'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='babySeat'
                  checked={babySeat}
                  onCheckedChange={checked => setBabySeat(Boolean(checked))}
                />
                <Label htmlFor='babySeat'>
                  Siège bébé (+{BABY_SEAT_PRICE}€)
                </Label>
              </div>
              <div className='flex items-center space-x-2 mt-2 sm:mt-0'>
                <Checkbox
                  id='booster'
                  checked={booster}
                  onCheckedChange={checked => setBooster(Boolean(checked))}
                />
                <Label htmlFor='booster'>Réhausseur enfant (Gratuit)</Label>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='vehicle'>Véhicule souhaité</Label>
            {isMobile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant='outline' className='w-full justify-between'>
                    {getLabel(vehicle, vehicleOptions, 'Choisir le véhicule')}
                    <ChevronDown className='ml-2 h-4 w-4' />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Véhicule souhaité</DrawerTitle>
                  </DrawerHeader>
                  <div className='p-4'>
                    {vehicleOptions.map(option => (
                      <DrawerClose asChild key={option.value}>
                        <Button
                          variant='ghost'
                          className='w-full justify-start mb-2'
                          onClick={() => setVehicle(option.value)}
                        >
                          {option.label}
                        </Button>
                      </DrawerClose>
                    ))}
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant='outline'>Fermer</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <Select value={vehicle} onValueChange={setVehicle} required>
                <SelectTrigger id='vehicle'>
                  <SelectValue placeholder='Choisir le véhicule' />
                </SelectTrigger>
                <SelectContent>
                  {vehicleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes (Optionnel)</Label>
            <Textarea
              id='notes'
              placeholder='Informations supplémentaires pour le chauffeur'
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className='space-y-4'>
            <Label>Mode de paiement</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={value =>
                setPaymentMethod(value as 'delivery' | 'card')
              }
              className='flex flex-col sm:flex-row sm:gap-4'
              required
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='card' id='card' />
                <Label htmlFor='card'>Payer par Carte</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='delivery' id='delivery' />
                <Label htmlFor='delivery'>Payer à bord</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Detailed Price Display Area */}
          <div className='mt-4 rounded-md border bg-muted p-4 text-sm'>
            <h4 className='mb-2 font-medium'>Récapitulatif du Prix Estimé</h4>
            <div className='space-y-1'>
              {isCalculatingPrice ? (
                <div className='flex items-center text-muted-foreground'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Calcul en cours...
                </div>
              ) : calculatedPrice !== null ? (
                <>
                  {(() => {
                    const displayBasePrice =
                      calculatedPrice - (babySeat ? BABY_SEAT_PRICE : 0);
                    let baseLabel = 'Tarif de base';
                    if (pricingType === 'fixed')
                      baseLabel = 'Forfait Destination';
                    if (pricingType === 'hourly') baseLabel = 'Forfait Horaire';
                    if (pricingType === 'package')
                      baseLabel = 'Forfait Journée';
                    return (
                      <div className='flex justify-between'>
                        <span>{baseLabel} :</span>
                        <span>{displayBasePrice} €</span>
                      </div>
                    );
                  })()}
                  {babySeat && (
                    <div className='flex justify-between text-muted-foreground'>
                      <span>Option Siège Bébé :</span>
                      <span>+ {BABY_SEAT_PRICE} €</span>
                    </div>
                  )}
                  {booster && (
                    <div className='flex justify-between text-muted-foreground'>
                      <span>Option Réhausseur :</span>
                      <span>Gratuit</span>
                    </div>
                  )}
                  <div className='mt-2 flex justify-between border-t pt-2 font-semibold'>
                    <span>Prix Total Estimé :</span>
                    <span>{calculatedPrice} €</span>
                  </div>
                </>
              ) : destination === 'other-Autre (préciser ci-dessous)' &&
                (!pickupAddress || !manualDestination) ? (
                <span className='text-sm text-gray-500 font-normal'>
                  Veuillez renseigner les adresses pour calculer le prix.
                </span>
              ) : destination === 'other-Autre (préciser ci-dessous)' ? (
                <span className='text-sm text-gray-500 font-normal'>
                  Impossible de calculer. Vérifiez les adresses ou
                  contactez-nous.
                </span>
              ) : (
                <span className='text-sm text-gray-500 font-normal'>
                  Veuillez compléter les informations requises.
                </span>
              )}
            </div>
          </div>

          {submitError && <p className='text-sm text-red-600'>{submitError}</p>}

          <Button
            type='submit'
            className='w-full'
            disabled={
              isCalculatingPrice ||
              isRedirectingToStripe || // Disable while redirecting
              (!calculatedPrice && paymentMethod === 'card')
            }
          >
            {isCalculatingPrice ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Calcul en
                cours...
              </>
            ) : isRedirectingToStripe ? ( // Show redirection state
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Redirection
                vers le paiement...
              </>
            ) : paymentMethod === 'delivery' ? (
              'Réserver (Paiement à bord)'
            ) : (
              'Procéder au Paiement par Carte'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
