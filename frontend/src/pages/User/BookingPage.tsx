import React, { useEffect, useRef, useState } from 'react';
import { fetchAddress, fetchWorkersByService } from '../../services/userService';
import { useLocation } from 'react-router-dom';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const { serviceName } = location.state || {};
  const mapRef = useRef<HTMLDivElement | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [workers, setWorkers] = useState<any[]>([]); // Use a proper type for workers
  const [workerAddresses, setWorkerAddresses] = useState<any[]>([]); // To hold workers' addresses
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('user_Id');

  // Fetch workers based on service
  useEffect(() => {
    const fetchWorkers = async () => {
      if (!serviceName) return; // Ensure serviceName is valid
      try {
        const data = await fetchWorkersByService(serviceName);
        setWorkers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch workers');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [serviceName]);
console.log("wwwwww",workers)
  // Fetch user's address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!userId) {
        setError('User ID not found');
        return;
      }

      try {
        const address = await fetchAddress(userId);
        setUserAddress(address.area); // Adjust based on the response structure
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch address');
      }
    };

    fetchUserAddress();
  }, [userId]);

  // Fetch worker addresses based on worker IDs
  useEffect(() => {
    const fetchWorkerAddresses = async () => {
      try {
        const addresses = await Promise.all(
          workers.map(async (worker) => {
            // Assuming each worker has a `addressId` to fetch its address
            const address = await fetchAddress(worker._id);
            return {  address: address.area }; // Adjust according to your address structure
          })
        );
        console.log("ooooo",addresses)
        setWorkerAddresses(addresses);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch worker addresses');
      }
    };

    console.log("waaaaaaaa",workerAddresses)

    if (workers.length > 0) {
      fetchWorkerAddresses();
    }
  }, [workers]);

  // Load Google Maps and geocode addresses
  useEffect(() => {
    const loadMap = async () => {
      if (!userAddress || workerAddresses.length === 0) return;

      const geocodeAddress = async (address: string) => {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK') {
          return data.results[0].geometry.location;
        } else {
          throw new Error('Failed to geocode address');
        }
      };

      try {
        // Geocode user's address
        const userLocation = await geocodeAddress(userAddress);
        
        // Create map
        const google = window.google;
        const map = new google.maps.Map(mapRef.current!, {
          center: userLocation,
          zoom: 14,
        });

        // Marker for user's location
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
        });

        // Geocode and add markers for each worker's address
        await Promise.all(
          workerAddresses.map(async (workerAddress,index) => {
            try {
              const location = await geocodeAddress(workerAddress.address);
              const worker = workers[index]; 
              new google.maps.Marker({
                position: location,
                map: map,
                title: `Worker: ${worker.name}`, // Use worker ID or name if available
                icon: {
                  url: '/map.png', // Change to your worker's marker image path
                  scaledSize: new google.maps.Size(30, 30), // Adjust size as needed
                },
              });
            } catch (err) {
              console.error(`Error geocoding worker ${workerAddress.workerId}:`, err);
            }
          })
        );

      } catch (err) {
        setError('Failed to load map or geocode address');
      }
    };

    const loadGoogleMapsAPI = () => {
      if (window.google) {
        loadMap();
      } else {
        const existingScript = document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"]`);
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
          script.async = true;
          script.defer = true;
          script.onload = loadMap;
          document.body.appendChild(script);
        } else {
          existingScript.addEventListener('load', loadMap);
        }
      }
    };

    loadGoogleMapsAPI();
  }, [userAddress, workerAddresses, apiKey]);

  if (loading) return <div>Loading...</div>; // Show loading state
  if (error) return <div>Error: {error}</div>; // Show error state
  if (!workers.length) return <div>No workers found for this service.</div>; // Handle empty workers

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
      {/* Optionally render the workers' details below the map */}
    </div>
  );
};

export default BookingPage;
