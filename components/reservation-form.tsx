'use client';

import { useState } from 'react';
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
import { ChevronDown, LocateFixed } from 'lucide-react';

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
  },
  { value: "Aéroport d'Orly", label: 'Paris rive gauche - Orly (70€)' },
  { value: "Aéroport d'Orly", label: 'Paris rive droite - Orly (60€)' },
  {
    value: 'Aéroport Paris-Charles de Gaulle',
    label: 'Paris rive gauche - Roissy (80€)',
  },
  {
    value: 'Aéroport Paris-Charles de Gaulle',
    label: 'Paris rive droite - Roissy (90€)',
  },
  { value: 'Parc Astérix, Plailly', label: 'Paris - Parc Astérix (110€)' },
  {
    value: 'La Vallée Village, Serris',
    label: 'Paris - Marne-la-Vallée village (110€)',
  },
  {
    value: 'Château de Versailles',
    label: 'Paris - Château de Versailles (80€)',
  },
  { value: 'other', label: 'Autre (préciser ci-dessous)' },
];

const hourOptions = [
  { value: '1', label: '1 heure (70€)' },
  { value: '2', label: '2 heures (140€)' },
  { value: '3', label: '3 heures (210€)' },
  { value: '4', label: '4 heures (280€)' },
  { value: '5', label: '5 heures (350€)' },
  { value: '6', label: '6 heures (420€)' },
];

const packageTypeOptions = [
  { value: 'half', label: 'Demi-journée - 4 heures (250€)' },
  { value: 'full', label: 'Journée complète (450€)' },
];

const vehicleOptions = [
  { value: 'Mercedes C300E', label: 'Mercedes C300E' },
  { value: 'Tesla Model Y', label: 'Tesla Model Y' },
  { value: 'any', label: 'Pas de préférence' },
];

// Type for coordinates state
interface Coordinates {
  lat: number;
  lon: number;
}

const GPS_PLACEHOLDER = '[Position GPS actuelle]'; // Define placeholder

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
    useState<Coordinates | null>(null); // State for GPS coords
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [babySeat, setBabySeat] = useState<boolean>(false);
  const [booster, setBooster] = useState<boolean>(false);
  const [vehicle, setVehicle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const isMobile = useIsMobile();

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
    setPickupCoordinates(null); // Reset coordinates
    setDate(undefined);
    setTime('');
    setBabySeat(false);
    setBooster(false);
    setVehicle('');
    setNotes('');
  };

  // Function to get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setPickupCoordinates(coords);
        setPickupAddress(GPS_PLACEHOLDER); // Set placeholder text
        alert('Position actuelle récupérée !');
      },
      error => {
        console.error('Error getting location: ', error);
        let message = 'Impossible de récupérer votre position actuelle.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Vous avez refusé la permission de géolocalisation.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Information de localisation non disponible.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Timeout lors de la récupération de la position.';
        }
        alert(message);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation updates
    const isDestinationInvalid =
      pricingType === 'fixed' && destination === '' && manualDestination === '';
    const isManualDestinationInvalid =
      pricingType === 'fixed' &&
      destination === 'other' &&
      manualDestination === '';
    // Check if pickup is valid (either text address provided OR GPS coords exist)
    const isPickupAddressValid =
      (pickupAddress !== '' && pickupAddress !== GPS_PLACEHOLDER) ||
      pickupCoordinates !== null;

    if (
      !name ||
      !phone ||
      !date ||
      !time ||
      !isPickupAddressValid || // Updated pickup validation
      (pricingType === 'hourly' && !hours) ||
      (pricingType === 'package' && !packageType) ||
      isDestinationInvalid ||
      isManualDestinationInvalid
    ) {
      alert(
        "Veuillez remplir tous les champs obligatoires (*), y compris l'adresse de prise en charge (manuellement ou via GPS)."
      );
      return;
    }

    const phoneNumber = '+33624117756';

    // Determine Destinations & Generate Links
    let displayDestination = '';
    let mapQueryDestination = '';
    let destinationMapsUrl = '';
    let displayPickupAddress = pickupAddress; // Default to text input
    let pickupMapsUrl = '';

    // Destination Logic (for fixed price only)
    if (pricingType === 'fixed') {
      if (destination === 'other') {
        displayDestination = manualDestination;
        mapQueryDestination = manualDestination;
      } else {
        const selectedOption = destinationOptions.find(
          opt => opt.value === destination
        );
        displayDestination = selectedOption
          ? selectedOption.label
          : destination;
        mapQueryDestination = selectedOption
          ? selectedOption.value
          : destination;
      }
      if (mapQueryDestination) {
        const encodedDestination = encodeURIComponent(mapQueryDestination);
        destinationMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
      }
    }

    // Pickup Logic
    if (pickupCoordinates) {
      displayPickupAddress = GPS_PLACEHOLDER; // Keep placeholder for display
      pickupMapsUrl = `https://www.google.com/maps?q=${pickupCoordinates.lat},${pickupCoordinates.lon}`;
    } else if (pickupAddress) {
      // displayPickupAddress remains pickupAddress
      const encodedPickup = encodeURIComponent(pickupAddress);
      pickupMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedPickup}`;
    }

    // Build WhatsApp Message
    let message = `Nouvelle réservation VTC Paris Premium :\n`;
    message += `--------------------------------------\n`;
    message += `Nom : ${name}\n`;
    message += `Téléphone : ${phone}\n`;
    if (email) message += `Email : ${email}\n`;
    message += `Passagers : ${
      passengerOptions.find(p => p.value === passengers)?.label || passengers
    }\n`;
    message += `--------------------------------------\n`;

    // Add Service Details
    message += `Adresse Prise en Charge : ${displayPickupAddress}\n`; // Use determined display text
    if (pickupMapsUrl) {
      message += `Lien GPS (Prise en charge) : ${pickupMapsUrl}\n`; // Add pickup map link
    }

    if (pricingType === 'fixed') {
      message += `Type : Forfait destination\n`;
      message += `Destination : ${displayDestination}\n`;
      if (destinationMapsUrl) {
        message += `Lien GPS (Destination) : ${destinationMapsUrl}\n`; // Add destination map link
      }
    } else if (pricingType === 'hourly') {
      message += `Type : Mise à disposition\n`;
      message += `Durée : ${
        hourOptions.find(h => h.value === hours)?.label || hours + ' heure(s)'
      }\n`;
      // Pickup address already added above
    } else if (pricingType === 'package') {
      message += `Type : Forfait journée/demi-journée\n`;
      message += `Forfait : ${
        packageTypeOptions.find(p => p.value === packageType)?.label ||
        packageType
      }\n`;
      // Pickup address already added above
    }

    // Add Date, Time, Options
    message += `--------------------------------------\n`;
    message += `Date : ${
      date ? format(date, 'dd/MM/yyyy') : 'Non spécifiée'
    }\n`;
    message += `Heure : ${time || 'Non spécifiée'}\n`;
    message += `--------------------------------------\n`;
    message += `Options :
`;
    message += `  - Siège bébé : ${babySeat ? 'Oui (+10€)' : 'Non'}\n`;
    message += `  - Rehausseur : ${booster ? 'Oui (Gratuit)' : 'Non'}\n`;
    message += `Véhicule préféré : ${
      vehicleOptions.find(v => v.value === vehicle)?.label || vehicle
    }\n`;
    if (notes)
      message += `--------------------------------------\nNotes : ${notes}\n`;

    // Generate WhatsApp URL and Open
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');

    alert(
      'Merci pour votre réservation ! Nous vous contacterons bientôt. Vous allez être redirigé vers WhatsApp pour envoyer le récapitulatif.'
    );
    resetForm();
  };

  const getLabel = (
    value: string,
    options: { value: string; label: string }[]
  ) => {
    if (value === 'other') return 'Autre (préciser ci-dessous)';
    return options.find(opt => opt.value === value)?.label || `Sélectionnez`;
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nom complet *</Label>
                <Input
                  id='name'
                  placeholder='Votre nom'
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Téléphone *</Label>
                <Input
                  id='phone'
                  placeholder='Votre numéro de téléphone'
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Votre email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='passengers'>Nombre de passagers</Label>
                {isMobile ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-between font-normal'
                      >
                        {getLabel(passengers, passengerOptions)}
                        <ChevronDown className='h-4 w-4 opacity-50' />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Nombre de passagers</DrawerTitle>
                      </DrawerHeader>
                      <div className='p-4 pb-0 grid grid-cols-1 gap-2'>
                        {passengerOptions.map(option => (
                          <DrawerClose key={option.value} asChild>
                            <Button
                              variant={
                                passengers === option.value
                                  ? 'secondary'
                                  : 'ghost'
                              }
                              className='w-full justify-start text-left h-auto py-2'
                              onClick={() => setPassengers(option.value)}
                            >
                              {option.label}
                            </Button>
                          </DrawerClose>
                        ))}
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant='outline'>Annuler</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger id='passengers'>
                      <SelectValue placeholder='Sélectionnez' />
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
            </div>

            <div className='space-y-2'>
              <Label>Type de service *</Label>
              <RadioGroup value={pricingType} onValueChange={setPricingType}>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='fixed' id='fixed' />
                  <Label htmlFor='fixed' className='font-normal'>
                    Forfait destination
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='hourly' id='hourly' />
                  <Label htmlFor='hourly' className='font-normal'>
                    Mise à disposition (horaire)
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='package' id='package' />
                  <Label htmlFor='package' className='font-normal'>
                    Forfait demi-journée/journée
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {pricingType === 'fixed' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='destination'>Destination *</Label>
                  {isMobile ? (
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-between font-normal'
                        >
                          {getLabel(destination, destinationOptions)}
                          <ChevronDown className='h-4 w-4 opacity-50' />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Destination</DrawerTitle>
                        </DrawerHeader>
                        <div className='p-4 pb-0 grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto'>
                          {destinationOptions.map(option => (
                            <DrawerClose key={option.value} asChild>
                              <Button
                                variant={
                                  destination === option.value
                                    ? 'secondary'
                                    : 'ghost'
                                }
                                className='w-full justify-start text-left h-auto py-2'
                                onClick={() => {
                                  setDestination(option.value);
                                  if (option.value !== 'other')
                                    setManualDestination('');
                                }}
                              >
                                {option.label}
                              </Button>
                            </DrawerClose>
                          ))}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant='outline'>Annuler</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Select
                      value={destination}
                      onValueChange={value => {
                        setDestination(value);
                        if (value !== 'other') setManualDestination('');
                      }}
                      required={pricingType === 'fixed'}
                    >
                      <SelectTrigger id='destination'>
                        <SelectValue placeholder='Sélectionnez une destination'>
                          {getLabel(destination, destinationOptions) ===
                          'Sélectionnez'
                            ? null
                            : getLabel(destination, destinationOptions)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {destinationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {destination === 'other' && (
                  <div className='space-y-2'>
                    <Label htmlFor='manual-destination'>
                      Précisez la destination *
                    </Label>
                    <Input
                      id='manual-destination'
                      placeholder='Adresse complète de destination'
                      value={manualDestination}
                      onChange={e => setManualDestination(e.target.value)}
                      required={destination === 'other'}
                    />
                  </div>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='pickup-fixed'>
                    Adresse de prise en charge *
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='pickup-fixed'
                      placeholder='Adresse complète ou utilisez le GPS'
                      value={pickupAddress}
                      onChange={e => {
                        setPickupAddress(e.target.value);
                        setPickupCoordinates(null); // Clear coords if user types manually
                      }}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={handleGetCurrentLocation}
                      aria-label='Utiliser la position actuelle'
                    >
                      <LocateFixed className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {pricingType === 'hourly' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='hours'>Nombre d'heures *</Label>
                  {isMobile ? (
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-between font-normal'
                        >
                          {getLabel(hours, hourOptions)}
                          <ChevronDown className='h-4 w-4 opacity-50' />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Nombre d'heures</DrawerTitle>
                        </DrawerHeader>
                        <div className='p-4 pb-0 grid grid-cols-1 gap-2'>
                          {hourOptions.map(option => (
                            <DrawerClose key={option.value} asChild>
                              <Button
                                variant={
                                  hours === option.value ? 'secondary' : 'ghost'
                                }
                                className='w-full justify-start text-left h-auto py-2'
                                onClick={() => setHours(option.value)}
                              >
                                {option.label}
                              </Button>
                            </DrawerClose>
                          ))}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant='outline'>Annuler</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Select
                      value={hours}
                      onValueChange={setHours}
                      required={pricingType === 'hourly'}
                    >
                      <SelectTrigger id='hours'>
                        <SelectValue placeholder='Sélectionnez' />
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
                <div className='space-y-2'>
                  <Label htmlFor='pickup-hourly'>
                    Adresse de prise en charge *
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='pickup-hourly'
                      placeholder='Adresse complète ou utilisez le GPS'
                      value={pickupAddress}
                      onChange={e => {
                        setPickupAddress(e.target.value);
                        setPickupCoordinates(null); // Clear coords if user types manually
                      }}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={handleGetCurrentLocation}
                      aria-label='Utiliser la position actuelle'
                    >
                      <LocateFixed className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {pricingType === 'package' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='package-type'>Type de forfait *</Label>
                  {isMobile ? (
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-between font-normal'
                        >
                          {getLabel(packageType, packageTypeOptions)}
                          <ChevronDown className='h-4 w-4 opacity-50' />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Type de forfait</DrawerTitle>
                        </DrawerHeader>
                        <div className='p-4 pb-0 grid grid-cols-1 gap-2'>
                          {packageTypeOptions.map(option => (
                            <DrawerClose key={option.value} asChild>
                              <Button
                                variant={
                                  packageType === option.value
                                    ? 'secondary'
                                    : 'ghost'
                                }
                                className='w-full justify-start text-left h-auto py-2'
                                onClick={() => setPackageType(option.value)}
                              >
                                {option.label}
                              </Button>
                            </DrawerClose>
                          ))}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant='outline'>Annuler</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Select
                      value={packageType}
                      onValueChange={setPackageType}
                      required={pricingType === 'package'}
                    >
                      <SelectTrigger id='package-type'>
                        <SelectValue placeholder='Sélectionnez' />
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
                <div className='space-y-2'>
                  <Label htmlFor='pickup-package'>
                    Adresse de prise en charge *
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='pickup-package'
                      placeholder='Adresse complète ou utilisez le GPS'
                      value={pickupAddress}
                      onChange={e => {
                        setPickupAddress(e.target.value);
                        setPickupCoordinates(null); // Clear coords if user types manually
                      }}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={handleGetCurrentLocation}
                      aria-label='Utiliser la position actuelle'
                    >
                      <LocateFixed className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date'>Date *</Label>
                <DatePicker onDateSelect={setDate} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='time'>Heure *</Label>
                <TimePicker onTimeChange={newTime => setTime(newTime || '')} />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Options supplémentaires</Label>
              <div className='flex items-center space-x-2 mt-2'>
                <Checkbox
                  id='baby-seat'
                  checked={babySeat}
                  onCheckedChange={checked => setBabySeat(Boolean(checked))}
                />
                <Label htmlFor='baby-seat' className='text-sm font-normal'>
                  Siège bébé (+10€)
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='booster'
                  checked={booster}
                  onCheckedChange={checked => setBooster(Boolean(checked))}
                />
                <Label htmlFor='booster' className='text-sm font-normal'>
                  Rehausseur enfant (gratuit)
                </Label>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='vehicle'>Véhicule préféré</Label>
              {isMobile ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-between font-normal'
                    >
                      {getLabel(vehicle, vehicleOptions)}
                      <ChevronDown className='h-4 w-4 opacity-50' />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Véhicule préféré</DrawerTitle>
                    </DrawerHeader>
                    <div className='p-4 pb-0 grid grid-cols-1 gap-2'>
                      {vehicleOptions.map(option => (
                        <DrawerClose key={option.value} asChild>
                          <Button
                            variant={
                              vehicle === option.value ? 'secondary' : 'ghost'
                            }
                            className='w-full justify-start text-left h-auto py-2'
                            onClick={() => setVehicle(option.value)}
                          >
                            {option.label}
                          </Button>
                        </DrawerClose>
                      ))}
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant='outline'>Annuler</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Select value={vehicle} onValueChange={setVehicle}>
                  <SelectTrigger id='vehicle'>
                    <SelectValue placeholder='Sélectionnez' />
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
              <Label htmlFor='notes'>Notes supplémentaires</Label>
              <Textarea
                id='notes'
                placeholder='Informations complémentaires pour votre trajet'
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button type='submit' className='w-full'>
            Envoyer la réservation
          </Button>
          <p className='text-xs text-muted-foreground text-center pt-2'>
            * Champs obligatoires. Après avoir cliqué sur Envoyer, vous serez
            redirigé vers WhatsApp pour confirmer l'envoi du récapitulatif.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
