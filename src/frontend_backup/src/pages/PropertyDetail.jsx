import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../utils/api";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  // ✅ Fetch property by ID (from backend)
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await API.get(`/properties/${id}`);
        setProperty(res.data);
      } catch (error) {
        console.error("Error fetching property:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading)
    return <p className="text-center py-20 text-gray-500">Loading property...</p>;

  if (!property)
    return <p className="text-center py-20 text-gray-500">Property not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 🏠 Image Section */}
      {/* 🏠 Image Section */}
      {/* 🏠 Image Slider Section */}
      <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg group">
        {property.images && property.images.length > 0 ? (
          <>
            <img
              src={
                property.images[currentImageIndex].startsWith("http")
                  ? property.images[currentImageIndex]
                  : `http://localhost:5000${property.images[currentImageIndex]}`
              }
              alt={`View ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ❮
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ❯
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p>No images available</p>
          </div>
        )}
      </div>

      {/* 🏷️ Title & Location */}
      <h1 className="text-3xl font-bold mt-6 text-gray-800">{property.title}</h1>
      <p className="text-gray-500 mt-1">
        {property.address}, {property.city}
      </p>

      {/* 💰 Price */}
      <p className="text-blue-600 font-bold text-2xl mt-4">
        ₹{property.price}/month
      </p>

      <div className="border-t my-6"></div>

      {/* 📝 Description */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <p className="text-gray-700 mt-2 leading-relaxed">
          {property.description ||
            "Spacious, well-lit flat in a great neighborhood. Perfect for working professionals or families looking for comfort and convenience."}
        </p>
      </div>

      {/* 🧩 Features (✅ from backend) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Core Details */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Property Details</h2>
          <ul className="space-y-2 text-gray-700">
            {property.bhk && <li><strong>Configuration:</strong> {property.bhk}</li>}
            {property.area && <li><strong>Area:</strong> {property.area}</li>}
            {property.price && <li><strong>Price:</strong> ₹{property.price}</li>}
            {property.city && <li><strong>City:</strong> {property.city}</li>}
          </ul>
        </div>

        {/* Features List */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.features && property.features.length > 0 ? (
              property.features.map((feature, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-100"
                >
                  {feature}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No amenities listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* 📋 Dynamic Facts (Scraped Data) */}
      {property.dynamic_facts && Object.keys(property.dynamic_facts).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Additional Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-xl border">
            {Object.entries(property.dynamic_facts).map(([key, value], i) => (
              // Filter out long text or irrelevant keys if needed
              value && typeof value === 'string' && value.length < 100 && (
                <div key={i} className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{key}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* 🛡️ Safety Score */}
      {property.safety_score !== null && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Safety Score</h2>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${property.safety_score >= 7
                ? "bg-green-500"
                : property.safety_score >= 4
                  ? "bg-yellow-400"
                  : "bg-red-500"
                }`}
              style={{ width: `${(property.safety_score / 10) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-2">
            {property.safety_score}/10 – Based on AI safety analysis
          </p>
        </div>
      )}

      {/* 💬 Reviews */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">User Reviews</h2>
        {property.reviews && property.reviews.length > 0 ? (
          property.reviews.map((review, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg shadow-sm mb-3 border"
            >
              <p className="italic text-gray-700">“{review.comment}”</p>
              <p className="text-sm text-gray-500 mt-2">
                – {review.user || "Anonymous"}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="italic text-gray-600">
              “Peaceful area, near market and metro. Safe for families.”
            </p>
            <p className="text-sm text-gray-500 mt-2">– A Verified Tenant</p>
          </div>
        )}
      </div>
    </div>
  );
}
