import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Plus } from "lucide-react"

import { getNutritionPlansRequest } from "@/api/nutritionPlans"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

function itemCount(plan) {
  return plan.days.reduce((total, day) => total + day.items.length, 0)
}

export default function NutritionPlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getNutritionPlansRequest()
      .then(setPlans)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje planova ishrane")
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AppLayout breadcrumb="Planovi ishrane">
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/nutrition-plans/new">
            <Plus />
            Novi plan
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje planova...</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema planova za prikaz</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Link key={plan._id} to={`/nutrition-plans/${plan._id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {user?.activeNutritionPlan === plan._id && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Aktivan
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {itemCount(plan)} {itemCount(plan) === 1 ? "namirnica" : "namirnica"} u nedelji
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
