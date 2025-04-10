import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, MapPin, Phone, Clock, Shield, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ServiceCard from "@/components/service-card"
import ReservationForm from "@/components/reservation-form"
import VehicleCarousel from "@/components/vehicle-carousel"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <span className="font-bold">VTC Paris Premium</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4 md:space-x-6">
            <Link href="#services" className="text-sm font-medium transition-colors hover:text-primary">
              Services
            </Link>
            <Link href="#vehicles" className="text-sm font-medium transition-colors hover:text-primary">
              Véhicules
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Tarifs
            </Link>
            <Link href="#reservation" className="text-sm font-medium transition-colors hover:text-primary">
              Réservation
            </Link>
            <Link href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073')] bg-cover bg-center text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 bg-black/50 p-6 rounded-xl backdrop-blur-sm">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Service de transport VTC professionnel à Paris
                </h1>
                <p className="max-w-[600px] text-gray-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Voyagez en toute sérénité avec notre service de VTC premium. Véhicules Mercedes et Tesla, chauffeurs
                  professionnels, tarifs transparents.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-200">
                    <Link href="#reservation">Réserver maintenant</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    <Link href="#pricing">Voir les tarifs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nos Services</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Un service sur mesure pour un transport de qualité
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <ServiceCard
                icon={<Car className="h-10 w-10" />}
                title="Transport privé"
                description="Service de transport personnalisé pour tous vos déplacements dans Paris et sa région avec chauffeur professionnel."
              />
              <ServiceCard
                icon={<MapPin className="h-10 w-10" />}
                title="Transferts aéroports & gares"
                description="Forfaits spéciaux pour vos transferts vers Orly, Roissy CDG et les gares parisiennes, sans stress et à l'heure."
              />
              <ServiceCard
                icon={<Clock className="h-10 w-10" />}
                title="Mise à disposition"
                description="Réservez un chauffeur à l'heure, demi-journée ou journée complète selon vos besoins."
              />
              <ServiceCard
                icon={<Shield className="h-10 w-10" />}
                title="Sécurité & confort"
                description="Véhicules Mercedes et Tesla récents, chauffeurs professionnels pour votre sécurité et votre confort."
              />
              <ServiceCard
                icon={<Star className="h-10 w-10" />}
                title="Destinations touristiques"
                description="Forfaits pour Disneyland, Parc Astérix, Château de Versailles et autres destinations touristiques."
              />
              <ServiceCard
                icon={<Phone className="h-10 w-10" />}
                title="Réservation facile"
                description="Réservez en ligne ou par téléphone, 24h/24 et 7j/7 pour tous vos déplacements."
              />
            </div>
          </div>
        </section>

        <section id="vehicles" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nos Véhicules</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Voyagez avec style et confort dans nos véhicules premium
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl mt-8">
              <VehicleCarousel />

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Mercedes C300E</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Intérieur cuir luxueux</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Climatisation bi-zone</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Espace pour 3 passagers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Prises USB et chargeurs</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Tesla Model Y</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Véhicule 100% électrique</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Intérieur minimaliste et spacieux</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Grand écran tactile central</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <span>Toit panoramique en verre</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nos Tarifs</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tarification transparente et adaptée à vos besoins
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 mt-8">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Forfaits destinations</CardTitle>
                  <CardDescription>Prix fixes pour les destinations populaires depuis Paris</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris - Disney</span>
                      <span className="font-semibold">120€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris rive gauche - Orly</span>
                      <span className="font-semibold">70€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris rive droite - Orly</span>
                      <span className="font-semibold">60€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris rive gauche - Roissy</span>
                      <span className="font-semibold">80€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris rive droite - Roissy</span>
                      <span className="font-semibold">90€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris - Parc Astérix</span>
                      <span className="font-semibold">110€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Paris - Marne-la-Vallée village</span>
                      <span className="font-semibold">110€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2 last:border-0">
                      <span>Paris - Château de Versailles</span>
                      <span className="font-semibold">80€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Forfaits horaires et options</CardTitle>
                  <CardDescription>Tarifs pour mise à disposition et options supplémentaires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Mise à disposition</span>
                      <span className="font-semibold">70€/heure</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Forfait journée complète</span>
                      <span className="font-semibold">450€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Forfait demi-journée (4h)</span>
                      <span className="font-semibold">250€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Option siège bébé</span>
                      <span className="font-semibold">+10€</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2 last:border-0">
                      <span>Option rehausseur enfant</span>
                      <span className="font-semibold">Gratuit</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="reservation" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Réservation</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Réservez votre trajet en quelques clics
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-8">
              <ReservationForm />
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Contactez-nous</h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Notre équipe est disponible 24h/24 et 7j/7 pour répondre à toutes vos questions.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>123 Avenue des Champs-Élysées, 75008 Paris</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.142047342144!2d2.3002721156744847!3d48.87378857928921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4a3e1e3e3%3A0x9a0f0e5d0b0e9e0!2sArc%20de%20Triomphe!5e0!3m2!1sfr!2sfr!4v1617289283686!5m2!1sfr!2sfr"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-xl"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-gray-500">© 2024 VTC Paris Premium. Tous droits réservés.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Mentions légales
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Politique de confidentialité
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              CGV
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

