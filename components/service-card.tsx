import type { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface ServiceCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-center text-primary mb-2">{icon}</div>
        <h3 className="text-xl font-bold text-center">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-center">{description}</p>
      </CardContent>
    </Card>
  )
}

