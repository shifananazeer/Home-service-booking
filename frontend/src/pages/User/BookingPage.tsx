import React, { useEffect, useRef, useState } from 'react';
import { fetchAddress, fetchWorkersByService } from '../../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Worker {
  _id: string;
  name: string;
  profilePic?:string;
  hourlyRate?:number;

}

export interface WorkerAddress extends Worker {
  address: string;
  distance?: number;
  location?: { lat: number; lng: number };
}

interface ServiceDetails {
  name: string;
  image: string;
  description: string;
}

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceName, serviceImage, serviceDescription } = location.state || {};
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sortedWorkers, setSortedWorkers] = useState<WorkerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('user_Id');

  useEffect(() => {
    if (!token) {
      toast.error('For booking, you need to login.');
      navigate('/login');
    }
  }, [navigate, token]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Distance in km
  };

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!serviceName) return;
      setLoading(true);
      try {
        const data = await fetchWorkersByService(serviceName);
      
        setWorkers(data);
        console.log("workers..", workers)
      } catch (err: any) {
        console.error('Error fetching workers:', err);
        toast.error('Failed to fetch workers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [serviceName]);

  useEffect(() => {
    const fetchUserAddressAndGeocode = async () => {
      if (!userId) {
        setError('User ID not found.');
        return;
      }
      try {
        const address = await fetchAddress(userId);
        if (!address) {
          toast.error('Complete your profile to book workers.');
          navigate('/user/profile');
        } else {
          setUserAddress(address.area);
          const location = await geocodeAddress(address.area);
          setUserLocation(location);
        }
      } catch (err: any) {
        console.error('Error fetching or geocoding user address:', err);
        setError('Failed to fetch or geocode user address. Please try again later.');
      }
    };

    fetchUserAddressAndGeocode();
  }, [navigate, userId]);

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        return data.results[0].geometry.location;
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadMap = async () => {
      if (!userLocation) return;

      try {
        if (!mapInstance.current) {
          const google = window.google;
          mapInstance.current = new google.maps.Map(mapRef.current!, {
            center: userLocation,
            zoom: 14,
            
          });

          new google.maps.Marker({
            position: userLocation,
            map: mapInstance.current,
            title: 'Your Location',
          });
        }

        setMapLoaded(true);

        if (workers.length > 0) {
          const workerLocations = await Promise.all(
            workers.map(async (worker) => {
              try {
                const workerAddress = await fetchAddress(worker._id);
                if (workerAddress?.area) {
                  const location = await geocodeAddress(workerAddress.area);
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    location.lat,
                    location.lng
                  );
                  return { ...worker, address: workerAddress.area, distance, location };
                }
              } catch (error) {
                console.error(`Failed to fetch address for worker ${worker._id}:`, error);
              }
              return null;
            })
          );

          const filteredWorkers = workerLocations.filter((worker) => worker !== null) as WorkerAddress[];
          filteredWorkers.sort((a, b) => a.distance! - b.distance!);
          setSortedWorkers(filteredWorkers);

          filteredWorkers.forEach((worker) => {
            new google.maps.Marker({
              position: worker.location!,
              map: mapInstance.current!,
              title: `Worker: ${worker.name}`,
              icon: {
                url: '/map.png',
                scaledSize: new google.maps.Size(30, 30),
              },
            });
          });
        }
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map. Please try again later.');
      }
    };

    if (window.google && userLocation) {
      loadMap();
    } else if (userLocation) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = loadMap;
      script.onerror = () => setError('Failed to load Google Maps. Please check your internet connection and try again.');
      document.body.appendChild(script);
    }
  }, [userLocation, workers, apiKey]);

  

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen  text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900 shadow-lg rounded-xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center mb-6">
              {serviceImage && (
                <div className="mb-4 md:mb-0 md:mr-6">
                  <img 
                    src={serviceImage} 
                    alt={serviceName} 
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-100">{serviceName}</h1>
                <p className="text-gray-400 mt-2 max-w-2xl">{serviceDescription || 'Service description not available'}</p>
              </div>
            </div>
            <div ref={mapRef} className="w-full h-80 rounded-lg shadow-inner mb-4" />
            {!mapLoaded && <div className="text-center text-gray-400">Loading map...</div>}
          </div>
        </div>
      
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Available Workers</h2>
        {workers.length === 0 ? (
          <div className="text-center text-gray-400 bg-gray-900 p-8 rounded-xl shadow-md">No workers available for this service in your area.</div>
        ) : (
          <div className="space-y-6">
            {sortedWorkers.map((worker) => (
              <div key={worker._id} className="bg-gray-900 shadow-lg rounded-xl overflow-hidden transition duration-300 hover:bg-gray-800">
                <div className="p-6 flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <img
                      src={worker.profilePic || '/avathar.jpeg'}
                      alt="Profile"
                      className="h-24 w-24 object-cover rounded-full border-4 border-gray-700 shadow-lg mr-6"
                    />
                    <div>
                      <h3 className="text-2xl font-semibold mb-2 text-gray-100">{worker.name}</h3>
                      <p className="text-gray-400 mb-2">Distance: <span className='text-gray-200 font-bold'> {worker.distance?.toFixed(2)} km</span></p>
                      <p className="text-gray-400">Rate Per Hour: <span className='text-gray-200 font-bold'>{worker.hourlyRate || "Not Specified"}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/confirm-booking/${worker._id}`, {
                      state: {
                        workerName: worker.name,
                        workerLocation: worker.location,
                        workerRate: worker.hourlyRate,
                        workerDistance: worker.distance,
                        workerPic: worker.profilePic,
                        workerId: worker._id,
                        serviceName: serviceName,
                        serviceImage: serviceImage,
                      }
                    })}
                    className="bg-gray-200 hover:bg-gray-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    Select Worker
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default BookingPage;

