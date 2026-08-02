import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Accessibility, MapPin, SquareArrowOutUpRight } from "lucide-react"
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const SEARCH_RADIUS_METERS = 5000

function googleMapsPlaceUrl(gym) {
  const query = encodeURIComponent(gym.displayName ?? gym.formattedAddress ?? "")
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${gym.id}`
}

function GymMarkers({ userLocation, gyms, setGyms, setIsSearching, selectedGymId, setSelectedGymId }) {
  const { t } = useTranslation()
  const map = useMap()
  const placesLib = useMapsLibrary("places")

  useEffect(() => {
    if (!placesLib || !userLocation) return

    let cancelled = false
    setIsSearching(true)

    placesLib.Place.searchNearby({
      fields: [
        "id",
        "displayName",
        "location",
        "formattedAddress",
        "rating",
        "accessibilityOptions",
      ],
      locationRestriction: {
        center: userLocation,
        radius: SEARCH_RADIUS_METERS,
      },
      includedPrimaryTypes: ["gym"],
      maxResultCount: 20,
      rankPreference: placesLib.SearchNearbyRankPreference.DISTANCE,
      language: "sr",
    })
      .then(({ places }) => {
        if (!cancelled) setGyms(places ?? [])
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(error)
          toast.error(t("gyms.errors.loadFailed"))
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false)
      })

    return () => {
      cancelled = true
    }
  }, [placesLib, userLocation, setGyms, setIsSearching, t])

  const selectedGym = gyms.find((gym) => gym.id === selectedGymId) ?? null

  useEffect(() => {
    if (selectedGym && map) {
      map.panTo({ lat: selectedGym.location.lat(), lng: selectedGym.location.lng() })
    }
  }, [selectedGym, map])

  return (
    <>
      <AdvancedMarker position={userLocation}>
        <Pin background="#2563eb" borderColor="#1d4ed8" glyphColor="#ffffff" />
      </AdvancedMarker>
      {gyms.map((gym) => (
        <AdvancedMarker
          key={gym.id}
          position={{ lat: gym.location.lat(), lng: gym.location.lng() }}
          onClick={() => setSelectedGymId(gym.id)}
        />
      ))}
      {selectedGym && (
        <InfoWindow
          position={{ lat: selectedGym.location.lat(), lng: selectedGym.location.lng() }}
          onCloseClick={() => setSelectedGymId(null)}
        >
          <div className="w-60 pr-0.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-snug font-medium text-gray-900">
                {selectedGym.displayName}
              </p>
              <a
                href={googleMapsPlaceUrl(selectedGym)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("gyms.openInGoogleMaps")}
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <SquareArrowOutUpRight className="size-3.5" />
              </a>
            </div>
            {selectedGym.formattedAddress && (
              <p className="mt-1 text-xs leading-snug text-gray-600">
                {selectedGym.formattedAddress}
              </p>
            )}
            {selectedGym.accessibilityOptions?.wheelchairAccessibleEntrance && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                <Accessibility className="size-3.5" />
                {t("gyms.wheelchairAccessible")}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  )
}

function NearbyGymsView({ userLocation }) {
  const { t } = useTranslation()
  const [gyms, setGyms] = useState([])
  const [isSearching, setIsSearching] = useState(true)
  const [selectedGymId, setSelectedGymId] = useState(null)

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="h-[70vh] overflow-hidden rounded-xl border">
        <Map
          defaultCenter={userLocation}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={() => setSelectedGymId(null)}
        >
          <GymMarkers
            userLocation={userLocation}
            gyms={gyms}
            setGyms={setGyms}
            setIsSearching={setIsSearching}
            selectedGymId={selectedGymId}
            setSelectedGymId={setSelectedGymId}
          />
        </Map>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {isSearching ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : gyms.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("gyms.emptyState.title")}
            description={t("gyms.emptyState.description", {
              radius: SEARCH_RADIUS_METERS / 1000,
            })}
          />
        ) : (
          <CardGrid className="flex flex-col gap-2">
            {gyms.map((gym) => (
              <CardGridItem key={gym.id}>
                <Card
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    selectedGymId === gym.id && "bg-muted/50"
                  )}
                  onClick={() => setSelectedGymId(gym.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-sm">{gym.displayName}</CardTitle>
                    {gym.formattedAddress && (
                      <CardDescription>{gym.formattedAddress}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </CardGridItem>
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  )
}

function isGeolocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator
}

export default function NearbyGyms() {
  const { t } = useTranslation()
  const [status, setStatus] = useState(() => (isGeolocationSupported() ? "loading" : "unsupported"))
  const [userLocation, setUserLocation] = useState(null)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    if (!isGeolocationSupported()) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setStatus("granted")
      },
      () => {
        setStatus("denied")
        toast.error(t("gyms.errors.locationDenied"))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [requestId, t])

  function handleRetry() {
    setStatus("loading")
    setRequestId((id) => id + 1)
  }

  return (
    <AppLayout breadcrumb={t("gyms.breadcrumb")}>
      {!GOOGLE_MAPS_API_KEY ? (
        <p className="text-sm text-muted-foreground">{t("gyms.apiKeyMissing")}</p>
      ) : status === "unsupported" ? (
        <p className="text-sm text-muted-foreground">{t("gyms.unsupported")}</p>
      ) : status === "loading" ? (
        <p className="text-sm text-muted-foreground">{t("gyms.locating")}</p>
      ) : status === "denied" ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">{t("gyms.locationDeniedMessage")}</p>
          <Button onClick={handleRetry}>{t("gyms.retry")}</Button>
        </div>
      ) : (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places", "marker"]}>
          <NearbyGymsView userLocation={userLocation} />
        </APIProvider>
      )}
    </AppLayout>
  )
}
