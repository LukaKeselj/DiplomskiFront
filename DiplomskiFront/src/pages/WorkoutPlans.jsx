import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Plus } from "lucide-react"

import { getWorkoutPlansRequest } from "@/api/workoutPlans"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function WorkoutPlans() {
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getWorkoutPlansRequest()
      .then(setPlans)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje planova")
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AppLayout breadcrumb="Planovi treninga">
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/workout-plans/new">
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
            <Link key={plan._id} to={`/workout-plans/${plan._id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.days.length} {plan.days.length === 1 ? "dan" : "dana"}
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
