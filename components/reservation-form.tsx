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

export default function ReservationForm() {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [passengers, setPassengers] = useState<string>('');
  const [pricingType, setPricingType] = useState<string>('fixed');
  const [destination, setDestination] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [packageType, setPackageType] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [babySeat, setBabySeat] = useState<boolean>(false);
  const [booster, setBooster] = useState<boolean>(false);
  const [vehicle, setVehicle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassengers('');
    setPricingType('fixed');
    setDestination('');
    setHours('');
    setPackageType('');
    setPickupAddress('');
    setDate(undefined);
    setTime('');
    setBabySeat(false);
    setBooster(false);
    setVehicle('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !name ||
      !phone ||
      !date ||
      !time ||
      (pricingType === 'fixed' && !destination) ||
      (pricingType === 'hourly' && !hours) ||
      (pricingType === 'package' && !packageType) ||
      (pricingType !== 'fixed' && !pickupAddress)
    ) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const phoneNumber = '+33624117756';

    let message = `Nouvelle réservation VTC Paris Premium :\n`;
    message += `--------------------------------------\n`;
    message += `Nom : ${name}\n`;
    message += `Téléphone : ${phone}\n`;
    if (email) message += `Email : ${email}\n`;
    if (passengers) message += `Passagers : ${passengers}\n`;
    message += `--------------------------------------\n`;

    let serviceDetails = '';
    if (pricingType === 'fixed') {
      serviceDetails = `Forfait destination : ${destination.split(' (')[0]}\n`;
      serviceDetails += `Adresse de prise en charge: ${
        pickupAddress || 'Non spécifiée (aéroport/gare?)'
      }\n`;
    } else if (pricingType === 'hourly') {
      serviceDetails = `Mise à disposition : ${hours} heure(s)\n`;
      serviceDetails += `Adresse de prise en charge : ${pickupAddress}\n`;
    } else if (pricingType === 'package') {
      serviceDetails = `Forfait : ${
        packageType === 'half' ? 'Demi-journée (4h)' : 'Journée complète'
      }\n`;
      serviceDetails += `Adresse de prise en charge : ${pickupAddress}\n`;
    }
    message += serviceDetails;

    message += `Date : ${
      date ? format(date, 'dd/MM/yyyy') : 'Non spécifiée'
    }\n`;
    message += `Heure : ${time || 'Non spécifiée'}\n`;
    message += `--------------------------------------\n`;
    message += `Options :\n`;
    message += `  - Siège bébé : ${babySeat ? 'Oui (+10€)' : 'Non'}\n`;
    message += `  - Rehausseur : ${booster ? 'Oui (Gratuit)' : 'Non'}\n`;
    message += `Véhicule préféré : ${vehicle || 'Pas de préférence'}\n`;
    if (notes)
      message += `--------------------------------------\nNotes : ${notes}\n`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank');

    alert(
      'Merci pour votre réservation ! Nous vous contacterons bientôt. Vous allez être redirigé vers WhatsApp pour envoyer le récapitulatif.'
    );
    resetForm();
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
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger id='passengers'>
                    <SelectValue placeholder='Sélectionnez' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>1 passager</SelectItem>
                    <SelectItem value='2'>2 passagers</SelectItem>
                    <SelectItem value='3'>3 passagers</SelectItem>
                    <SelectItem value='4'>4 passagers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Type de service *</Label>
              <RadioGroup value={pricingType} onValueChange={setPricingType}>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='fixed' id='fixed' />
                  <Label htmlFor='fixed'>Forfait destination</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='hourly' id='hourly' />
                  <Label htmlFor='hourly'>Mise à disposition (horaire)</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='package' id='package' />
                  <Label htmlFor='package'>Forfait demi-journée/journée</Label>
                </div>
              </RadioGroup>
            </div>

            {pricingType === 'fixed' && (
              <div className='space-y-2'>
                <Label htmlFor='destination'>Destination *</Label>
                <Select
                  value={destination}
                  onValueChange={setDestination}
                  required
                >
                  <SelectTrigger id='destination'>
                    <SelectValue placeholder='Sélectionnez une destination' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Paris - Disney (120€)'>
                      Paris - Disney (120€)
                    </SelectItem>
                    <SelectItem value='Paris rive gauche - Orly (70€)'>
                      Paris rive gauche - Orly (70€)
                    </SelectItem>
                    <SelectItem value='Paris rive droite - Orly (60€)'>
                      Paris rive droite - Orly (60€)
                    </SelectItem>
                    <SelectItem value='Paris rive gauche - Roissy (80€)'>
                      Paris rive gauche - Roissy (80€)
                    </SelectItem>
                    <SelectItem value='Paris rive droite - Roissy (90€)'>
                      Paris rive droite - Roissy (90€)
                    </SelectItem>
                    <SelectItem value='Paris - Parc Astérix (110€)'>
                      Paris - Parc Astérix (110€)
                    </SelectItem>
                    <SelectItem value='Paris - Marne-la-Vallée village (110€)'>
                      Paris - Marne-la-Vallée village (110€)
                    </SelectItem>
                    <SelectItem value='Paris - Château de Versailles (80€)'>
                      Paris - Château de Versailles (80€)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className='space-y-2 pt-4'>
                  <Label htmlFor='pickup-fixed'>
                    Adresse de prise en charge *
                  </Label>
                  <Input
                    id='pickup-fixed'
                    placeholder='Adresse complète (ex: Aéroport Orly, Terminal 4)'
                    required={pricingType === 'fixed'}
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                  />
                </div>
              </div>
            )}

            {pricingType === 'hourly' && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='hours'>Nombre d'heures *</Label>
                  <Select value={hours} onValueChange={setHours} required>
                    <SelectTrigger id='hours'>
                      <SelectValue placeholder='Sélectionnez' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1 heure (70€)</SelectItem>
                      <SelectItem value='2'>2 heures (140€)</SelectItem>
                      <SelectItem value='3'>3 heures (210€)</SelectItem>
                      <SelectItem value='4'>4 heures (280€)</SelectItem>
                      <SelectItem value='5'>5 heures (350€)</SelectItem>
                      <SelectItem value='6'>6 heures (420€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='pickup-hourly'>
                    Adresse de prise en charge *
                  </Label>
                  <Input
                    id='pickup-hourly'
                    placeholder='Adresse complète'
                    required={pricingType === 'hourly'}
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            {pricingType === 'package' && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='package-type'>Type de forfait *</Label>
                  <Select
                    value={packageType}
                    onValueChange={setPackageType}
                    required
                  >
                    <SelectTrigger id='package-type'>
                      <SelectValue placeholder='Sélectionnez' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='half'>
                        Demi-journée - 4 heures (250€)
                      </SelectItem>
                      <SelectItem value='full'>
                        Journée complète (450€)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='pickup-package'>
                    Adresse de prise en charge *
                  </Label>
                  <Input
                    id='pickup-package'
                    placeholder='Adresse complète'
                    required={pricingType === 'package'}
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date'>Date *</Label>
                <DatePicker selected={date} onSelect={setDate} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='time'>Heure *</Label>
                <TimePicker
                  value={time}
                  onChange={value => setTime(value || '')}
                />
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
              <Select value={vehicle} onValueChange={setVehicle}>
                <SelectTrigger id='vehicle'>
                  <SelectValue placeholder='Sélectionnez' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Mercedes C300E'>Mercedes C300E</SelectItem>
                  <SelectItem value='Tesla Model Y'>Tesla Model Y</SelectItem>
                  <SelectItem value='any'>Pas de préférence</SelectItem>
                </SelectContent>
              </Select>
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
