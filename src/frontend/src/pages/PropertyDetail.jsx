import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../utils/api";
import { MapPin, Shield, Home, Maximize, Bath, Building, Info, CheckCircle } from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  // Fetch discussions when property loads
  useEffect(() => {
    if (property) {
      const society = property.dynamic_facts?.["Society"] !== "N/A" ? property.dynamic_facts?.["Society"] : null;
      const title = property.title;
      const query = `${title} Greater Noida`;

      if (query) {
        setLoadingDiscussions(true);
        API.get(`/scrape/discussions?query=${encodeURIComponent(query)}`)
          .then(res => setDiscussions(res.data))
          .catch(err => console.error("Failed to fetch discussions", err))
          .finally(() => setLoadingDiscussions(false));
      }
    }
  }, [property]);

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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );

  if (!property)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold text-gray-800">Property Not Found</h2>
        <p className="text-gray-500 mt-2">The property you are looking for does not exist or has been removed.</p>
      </div>
    );

  const {
    title,
    description,
    price,
    address,
    city,
    images,
    features,
    safety_score,
    bhk,
    area,
    dynamic_facts,
    isScraped
  } = property;

  const displayImage = images && images.length > 0
    ? (images[0].startsWith("http") ? images[0] : `http://localhost:5000${images[0]}`)
    : "https://via.placeholder.com/800x500?text=No+Image";

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const society = dynamic_facts?.["Society"] !== "N/A" ? dynamic_facts?.["Society"] : null;
  const propType = dynamic_facts?.["Property Type"] || "Apartment";
  const bathrooms = dynamic_facts?.["Bathrooms"];



  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          {/* Society Name as Main Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {society || title}
          </h1>

          {/* Subtitle: BHK + Type */}
          {society && bhk && (
            <div className="text-2xl text-gray-600 font-semibold mt-2">
              {bhk} {propType}
            </div>
          )}

          {/* Address */}
          <div className="flex items-center text-gray-500 mt-3 text-xl">
            <MapPin className="w-6 h-6 mr-2 text-blue-600" />
            <span>{address || city}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-4xl font-bold text-gray-900">{formatPrice(price)}</div>
          {isScraped && <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md mt-2 font-medium">Scraped Listing</span>}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* Left Column: Main Info (Takes up 8/12 columns on XL screens) */}
        <div className="xl:col-span-8 space-y-10">

          {/* Image Gallery (Hero) */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative group">
            <img
              src={displayImage}
              alt={title}
              className="w-full h-[450px] md:h-[600px] object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              {images?.length || 1} Photos
            </div>
          </div>

          {/* Key Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-blue-100 hover:shadow-md transition-shadow">
              <Home className="w-8 h-8 text-blue-600 mb-3" />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Configuration</span>
              <span className="text-xl font-bold text-gray-900 mt-1">{bhk || "N/A"}</span>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-green-100 hover:shadow-md transition-shadow">
              <Maximize className="w-8 h-8 text-green-600 mb-3" />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Area</span>
              <span className="text-xl font-bold text-gray-900 mt-1">
                {area || dynamic_facts?.["Super Area"] || dynamic_facts?.["Carpet Area"] || "N/A"}
              </span>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-purple-100 hover:shadow-md transition-shadow">
              <Building className="w-8 h-8 text-purple-600 mb-3" />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Type</span>
              <span className="text-xl font-bold text-gray-900 mt-1">{propType}</span>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-orange-100 hover:shadow-md transition-shadow">
              <Bath className="w-8 h-8 text-orange-600 mb-3" />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Bathrooms</span>
              <span className="text-xl font-bold text-gray-900 mt-1">{bathrooms || "N/A"}</span>
            </div>
          </div>

          {/* 1. Amenities Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="w-7 h-7 mr-3 text-gray-400" />
              Amenities
            </h2>
            <div className="flex flex-wrap gap-4">
              {features && features.length > 0 ? (
                features.map((feature, i) => (
                  <span key={i} className="px-5 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-100 transition-colors">
                    {feature}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific amenities listed.</p>
              )}
            </div>
          </div>

          {/* 2. Explore Project Card */}
          {society && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Building className="w-7 h-7 mr-3 text-gray-400" />
                Explore Project
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-4 rounded-xl mr-5">
                    <Building className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{society}</h3>
                    <p className="text-gray-500 text-lg">{address || city}</p>
                  </div>
                </div>

                {dynamic_facts?.["Project Amenities"] && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-3">Project Amenities</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {dynamic_facts["Project Amenities"]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Description Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Info className="w-7 h-7 mr-3 text-gray-400" />
              Description
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line font-medium">
              {description || "No description available for this property."}
            </p>
          </div>

          {/* 4. More Details Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">More Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Render dynamic facts in a grid of cards */}
              {Object.entries(dynamic_facts || {}).map(([key, value]) => {
                // Skip fields we've already highlighted elsewhere
                if (["Society", "Address", "Property Type", "Bathrooms", "Super Area", "Carpet Area", "BHK", "Price", "Project Amenities"].includes(key)) return null;

                return (
                  <div key={key} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col hover:border-gray-300 transition-colors">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{key.replace(/_/g, " ")}</span>
                    <span className="text-gray-900 font-bold text-lg break-words">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Community Discussions (New) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-orange-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z" /></svg>
              </span>
              Community Discussions
            </h3>

            {loadingDiscussions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-500">Searching for discussions...</span>
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.map((disc, idx) => (
                  <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-orange-300 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                      <a
                        href={disc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-gray-900 group-hover:text-orange-700 text-lg leading-snug hover:underline"
                      >
                        {disc.title}
                      </a>
                      <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full flex-shrink-0 self-start">
                        {disc.source}
                      </span>
                    </div>

                    {/* AI Analysis Section */}
                    {disc.analysis ? (
                      <div className="bg-white p-4 rounded-lg border border-orange-100 mb-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">AI Insight:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${disc.analysis.sentiment === 'Positive' ? 'bg-green-50 text-green-700 border-green-200' :
                              disc.analysis.sentiment === 'Negative' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }`}>
                              {disc.analysis.sentiment}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-800 text-sm mb-3 font-medium leading-relaxed">
                          {disc.analysis.summary}
                        </p>

                        {disc.analysis.key_points && disc.analysis.key_points.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Key Takeaways:</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {disc.analysis.key_points.map((point, i) => (
                                <li key={i} className="pl-1">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4 text-sm text-gray-500 italic">
                        No AI analysis available for this thread.
                      </div>
                    )}

                    {/* Raw Comments Section (Collapsible or just listed below) */}
                    {disc.comments && disc.comments.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Relevant Comments</h5>
                        <div className="space-y-2">
                          {disc.comments.slice(0, 3).map((comment, cIdx) => (
                            <div key={cIdx} className="bg-white p-3 rounded border border-gray-100 text-sm text-gray-600 italic relative">
                              <span className="text-gray-300 absolute top-1 left-2 text-xl">"</span>
                              <p className="pl-4">{comment.length > 150 ? comment.substring(0, 150) + "..." : comment}</p>
                            </div>
                          ))}
                          {disc.comments.length > 3 && (
                            <p className="text-xs text-gray-400 italic pl-1">
                              + {disc.comments.length - 3} more comments
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <a
                        href={disc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-600 font-bold hover:text-orange-800 flex items-center transition-colors"
                      >
                        Read full discussion on Reddit <span className="ml-1">→</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No recent discussions found on Reddit.</p>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent((society || title) + " reviews reddit")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 font-bold hover:underline"
                >
                  Search manually on Google
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sidebar Info (Takes up 4/12 columns on XL screens) */}
        <div className="xl:col-span-4 space-y-8">

          {/* Safety & Rating Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-28">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Safety & Insights</h3>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 flex items-center font-medium"><Shield className="w-5 h-5 mr-2 text-green-600" /> Safety Score</span>
                <span className="font-bold text-2xl text-green-600">{safety_score || "N/A"}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(safety_score || 5) * 10}%` }}></div>
              </div>
              <p className="text-sm text-gray-400 mt-3">Based on AI analysis of crime data and locality safety.</p>
            </div>



            {/* Contact / Action Button */}
            <button className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xl hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-1">
              Contact Owner / Agent
            </button>
          </div>

        </div>
      </div>
    </div >
  );
}
