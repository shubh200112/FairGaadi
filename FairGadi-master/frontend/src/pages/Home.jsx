import React, { useState } from "react";
import axios from "axios";
import { Map } from "../components/Map";
import { CabList } from "../components/CabList";
import { fetchFareEstimates } from "../api/fare";

export function Home() {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showPrices, setShowPrices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchPrices = async () => {
    if (!pickup?.address || !dropoff?.address) return;

    setLoading(true);
    setError("");
    try {
      // 1. Fetch fares from your backend
      const data = await fetchFareEstimates(pickup.address, dropoff.address);
      setPrices(data.fares);
      setFilteredPrices(data.fares); 
      setShowPrices(true);

      // 2. ML surge prediction
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday

      const response = await axios.post("http://127.0.0.1:8000/predict/", {
        hour,
        day_of_week: day,
      });

      const { surge, minutes_to_surge } = response.data;

      if (surge) {
        const message =
          minutes_to_surge > 0
            ? `🚨 Surge is expected in ${minutes_to_surge} minutes! Book now.`
            : `🚨 No Surge in price`;

        window.alert(message); // You can replace this with a toast or ShadCN alert
      }

    } catch (err) {
      console.error("Error fetching fares or surge prediction:", err);
      setError("Failed to fetch fare estimates or surge prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (type) => {
    setSelectedType(type);
    if (type === "") {
      setFilteredPrices(prices);
    } else {
      setFilteredPrices(prices.filter((fare) => fare.type === type));
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
              Find Your Ride
            </h2>
            <Map
              pickup={pickup}
              dropoff={dropoff}
              onPickupSelect={setPickup}
              onDropoffSelect={setDropoff}
            />
            <div className="mt-6">
              <button
                onClick={handleFetchPrices}
                disabled={!pickup?.address || !dropoff?.address || loading}
                className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Fetching..." : "Compare Prices"}
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          {showPrices ? (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {["All", "Auto", "Bike", "Sedan", "XL"].map((type) => {
                  const typeValue = type === "All" ? "" : type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleFilter(typeValue)}
                      className={`px-4 py-2 rounded-full border ${
                        selectedType === typeValue
                          ? "bg-primary-600 text-blue-500"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              <CabList prices={filteredPrices} />
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-lg">Enter pickup and dropoff locations</p>
              <p className="text-sm mt-2">We'll find the best rides for you</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
