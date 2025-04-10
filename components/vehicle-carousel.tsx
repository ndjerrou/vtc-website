"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VehicleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = [
    { src: "/images/car1.jpeg", alt: "Tesla Model Y - Vue extérieure" },
    { src: "/images/car2.jpeg", alt: "Tesla Model Y - Vue de côté" },
    { src: "/images/car3.jpeg", alt: "Mercedes C300E - Vue avant" },
    { src: "/images/car4.jpeg", alt: "Tesla - Intérieur" },
    { src: "/images/car5.jpeg", alt: "Mercedes C300E - Intérieur" },
    { src: "/images/car6.jpeg", alt: "Tesla Model Y - Vue de côté" },
    { src: "/images/car7.jpeg", alt: "Mercedes C300E - Vue avant" },
    { src: "/images/car8.jpeg", alt: "Tesla Model Y - Vue extérieure" },
    { src: "/images/car9.jpeg", alt: "Tesla Model Y - Vue arrière" },
    { src: "/images/car10.jpeg", alt: "Tesla Model Y - Vue de côté" },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl aspect-[16/9] bg-gray-100">
        <div className="relative h-full">
          <Image
            src={images[currentIndex].src || "/placeholder.svg"}
            alt={images[currentIndex].alt}
            fill
            className="object-cover transition-all duration-500"
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Précédent</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Suivant</span>
      </Button>

      <div className="flex justify-center mt-4 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentIndex ? "bg-primary w-5" : "bg-gray-300"
            }`}
            aria-label={`Aller à l'image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

