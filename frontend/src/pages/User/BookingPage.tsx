import type React from "react"
import { useEffect, useRef, useState } from "react"
import { fetchAddress, fetchWorkersByService } from "../../services/userService"
import { useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { FaUserTie } from "react-icons/fa"

interface Worker {
  _id: string
  name: string
  profilePic?: string
  hourlyRate?: number
  status: string
}

export interface WorkerAddress extends Worker {
  address: string
  distance?: number
  location?: { lat: number; lng: number }
}

interface ServiceDetails {
  name: string
  image: string
  description: string
}

const BookingPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { serviceName, serviceImage, serviceDescription } = location.state || {}
  const mapRef = useRef<HTMLDivElement | null>(null)
  const autocompleteRef = useRef<HTMLInputElement | null>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  

  const [error, setError] = useState<string | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [sortedWorkers, setSortedWorkers] = useState<WorkerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [locationSource, setLocationSource] = useState<string | null>(null) // Added state for location source
  const [searchQuery, setSearchQuery] = useState("") // Added state for search query

  const userId = localStorage.getItem("user_Id")

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180
    const R = 6371
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!serviceName) return
      setLoading(true)
      try {
        const data = await fetchWorkersByService(serviceName)

        setWorkers(data)
        console.log("workers..", workers)
      } catch (err: any) {
        console.error("Error fetching workers:", err)
        toast.error("Failed to fetch workers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkers()
  }, [serviceName])

  useEffect(() => {
    const fetchUserAddressAndGeocode = async () => {
      if (!userId) {
        setError("User ID not found.");
        return;
      }
      
      try {
        const address = await fetchAddress(userId);
        if (!address) {
          toast.error("Complete your profile to book workers.");
          navigate("/user/profile");
        } else {
          if (address.area !== userAddress) { // Check if address has changed
            const location = await geocodeAddress(address.area);
            setUserAddress(address.area);
            setUserLocation(location);
          }
        }
      } catch (err: any) {
        console.error("Error fetching or geocoding user address:", err);
        setError("Failed to fetch or geocode user address. Please try again later.");
      }
    };
  
    fetchUserAddressAndGeocode();
  }, [navigate, userId, userAddress]); // Include userAddress in the dependency array to prevent infinite loops
  

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_GOOGLE_MAPS_API_URL}?address=${encodeURIComponent(address)}&key=${apiKey}`,
      )
      const data = await response.json()
      if (data.status === "OK") {
        return data.results[0].geometry.location
      } else {
        throw new Error(`Geocoding failed: ${data.status}`)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      throw error
    }
  }

  const updateWorkerDistances = async (location: { lat: number; lng: number }) => {
    if (workers.length > 0) {
      const workerLocations = await Promise.all(
        workers.map(async (worker) => {
          try {
            const workerAddress = await fetchAddress(worker._id)
            if (workerAddress?.area) {
              const workerLocation = await geocodeAddress(workerAddress.area)
              const distance = calculateDistance(location.lat, location.lng, workerLocation.lat, workerLocation.lng)
              return { ...worker, address: workerAddress.area, distance, location: workerLocation }
            }
          } catch (error) {
            console.error(`Failed to fetch address for worker ${worker._id}:`, error)
          }
          return null
        }),
      )

      const filteredWorkers = workerLocations.filter((worker) => worker !== null) as WorkerAddress[]
      filteredWorkers.sort((a, b) => a.distance! - b.distance!)
      setSortedWorkers(filteredWorkers)
    }
  }

  useEffect(() => {
    const loadMap = async () => {
      if (!userLocation) return

      try {
        if (!mapInstance.current) {
          const google = window.google
          mapInstance.current = new google.maps.Map(mapRef.current!, {
            center: userLocation,
            zoom: 14,
          })

          // Create the user location marker
          markerRef.current = new google.maps.Marker({
            position: userLocation,
            map: mapInstance.current,
            title: "Your Location",
          })
        } else {
          // Update the marker position when userLocation changes
          if (markerRef.current) {
            markerRef.current.setPosition(userLocation)
            mapInstance.current.setCenter(userLocation)
          }
        }

        setMapLoaded(true)

        if (workers.length > 0) {
          updateWorkerDistances(userLocation)

          sortedWorkers.forEach((worker) => {
            new google.maps.Marker({
              position: worker.location!,
              map: mapInstance.current!,
              title: `Worker: ${worker.name}`,
              icon: {
                url: "/map.png",
                scaledSize: new google.maps.Size(30, 30),
              },
            })
          })
        }
      } catch (err) {
        console.error("Error loading map:", err)
        setError("Failed to load map. Please try again later.")
      }
    }

    if (window.google && userLocation) {
      loadMap()
    } else if (userLocation) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = loadMap
      script.onerror = () =>
        setError("Failed to load Google Maps. Please check your internet connection and try again.")
      document.body.appendChild(script)
    }
  }, [userLocation, mapLoaded])

  const loadAutocomplete = () => {
    const google = window.google
    const input = autocompleteRef.current!
    const autocomplete = new google.maps.places.Autocomplete(input)

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (place.geometry) {
        const location = place.geometry.location
        const lat = location?.lat()
        const lng = location?.lng()
        if (lat && lng) {
          setUserLocation({ lat, lng })
          mapInstance.current?.setCenter({ lat, lng })
        }
      }
    })
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setLocationSource("current")
          if (markerRef.current) {
            markerRef.current.setPosition({ lat: latitude, lng: longitude })
          } else if (mapInstance.current) {
            markerRef.current = new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: mapInstance.current,
              title: "Your Current Location",
            })
          }
          mapInstance.current?.setCenter({ lat: latitude, lng: longitude })
          updateWorkerDistances({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error("Error fetching current location:", error)
          toast.error("Failed to fetch current location.")
        },
      )
    } else {
      toast.error("Geolocation is not supported by your browser.")
    }
  }
  
  const handleSearchLocation = async () => {
    if (!searchQuery) return
    try {
      const location = await geocodeAddress(searchQuery)
      setUserLocation(location)
      setLocationSource("search")
      updateWorkerDistances(location)
    } catch (error) {
      console.error("Error searching location:", error)
      toast.error("Failed to search location.")
    }
  }
  
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen text-gray-900 bg-white">
      <h1 className="text-4xl font-bold text-center m-4 flex items-center justify-center blink">
        Select Your Worker <FaUserTie className="text-3xl ml-2" />
      </h1>
      <style>{`
              @keyframes blink {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.5;
                }
              }
              .blink {
                animation: blink 1.5s infinite;
              }
            `}</style>
      <div className="container mx-auto px-4 py-8 bg-gray-200  mt-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side: Map and Service Info */}
          <div className="lg:w-1/2">
            <div className="bg-gray-100 shadow-lg rounded-xl overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  {serviceImage && (
                    <div className="mr-6 ">
                      <img
                        src={serviceImage || "/placeholder.svg"}
                        alt={serviceName}
                        className="w-24 h-24 object-cover rounded-lg shadow-md "
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-black">{serviceName}</h1>
                    <p className="text-gray-800 mt-2">{serviceDescription || "Service description not available"}</p>
                  </div>
                </div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Select Location</h2>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => {
                        setLocationSource("database")
                        if (userAddress) {
                          geocodeAddress(userAddress).then((location) => {
                            setUserLocation(location)
                            updateWorkerDistances(location)
                          })
                        }
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        locationSource === "database" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      Use Address from Database
                    </button>
                    <button
                      onClick={handleCurrentLocation}
                      className={`px-4 py-2 rounded-lg ${
                        locationSource === "current" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      Use Current Location
                    </button>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search location"
                        className="p-2 border border-gray-300 rounded-lg flex-grow"
                      />
                      <button
                        onClick={handleSearchLocation}
                        className={`px-4 py-2 rounded-lg ${
                          locationSource === "search" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
                <div ref={mapRef} className="w-full h-96 rounded-lg shadow-inner mb-4 bg-gray-800" />
                {!mapLoaded && <div className="text-center text-gray-400">Loading map...</div>}
              </div>
            </div>
            {/*<h1>According to your location you </h1>
            <button>Change Location</button>*/}
          </div>

          {/* Right side: Worker List */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Available Workers</h2>
            {sortedWorkers.length === 0 ? (
              <div className="text-center text-gray-400 bg-black p-8 rounded-xl shadow-md">
                No workers available for this service in your area.
              </div>
            ) : (
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
                {sortedWorkers.map((worker) => (
                  <div
                    key={worker._id}
                    className="bg-black shadow-lg rounded-xl overflow-hidden transition duration-300 hover:bg-gray-800"
                  >
                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <img
                          src={worker.profilePic || "/avathar.jpeg"}
                          alt="Profile"
                          className="h-20 w-20 object-cover rounded-full border-4 border-gray-700 shadow-lg mr-4"
                        />
                        <div>
                          <h3 className="text-xl font-semibold mb-1 text-gray-100">{worker.name}</h3>
                          <p className="text-gray-400 text-sm">
                            Distance: <span className="text-gray-200 font-bold">{worker.distance?.toFixed(2)} km</span>
                          </p>
                          <p className="text-gray-400 text-sm">
                            Rate: <span className="text-gray-200 font-bold">₹{worker.hourlyRate || "N/A"}/hr</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => navigate(`/view-worker/profile?workerId=${worker._id}`)}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 text-sm"
                        >
                          View Profile
                        </button>
                        {worker.status === "Unavailable" ? (
                          <p className="text-red-400 font-bold self-center text-sm">Unavailable</p>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/confirm-booking/${worker._id}`, {
                                state: {
                                  workerName: worker.name,
                                  workerLocation: worker.location,
                                  workerRate: worker.hourlyRate,
                                  workerDistance: worker.distance,
                                  workerPic: worker.profilePic,
                                  workerId: worker._id,
                                  serviceName: serviceName,
                                  serviceImage: serviceImage,
                                },
                              })
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 text-sm"
                          >
                            Select Worker
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage

