import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PricingItem {
  name: string
  price: string
}

interface PricingTableProps {
  title: string
  description: string
  items: PricingItem[]
}

export default function PricingTable({ title, description, items }: PricingTableProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
              <span>{item.name}</span>
              <span className="font-semibold">{item.price}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

