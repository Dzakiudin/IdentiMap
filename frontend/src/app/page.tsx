"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, Fingerprint, MapPin, Calendar, Smartphone, User, Github, Twitter, Instagram, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./components/MapComponent"), { ssr: false });
const GraphComponent = dynamic(() => import("./components/GraphComponent"), { ssr: false });

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    dob: "",
    address: "",
    email: "",
    image_url: ""
  });

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    const activeParams = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v.trim() !== "")
    );

    if (Object.keys(activeParams).length === 0) {
      setError("Provide at least one parameter to scan.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          real_name: formData.name,
          username: formData.username,
          phone: formData.phone,
          dob: formData.dob,
          address: formData.address,
          email: formData.email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Scanning failed");

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const input = document.getElementById("report-content");
    if (!input) return;
    
    try {
      const canvas = await html2canvas(input, {
        backgroundColor: "#050505",
        scale: 2 // Higher resolution
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`IdentiMap_Report_${formData.name || "Target"}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export PDF report.");
    }
  };

  const getPlatformIcon = (site: string) => {
    switch (site.toLowerCase()) {
      case "github": return <Github className="w-5 h-5" />;
      case "twitter": return <Twitter className="w-5 h-5" />;
      case "instagram": return <Instagram className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-grid p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center space-x-3">
          <Fingerprint className="w-10 h-10 text-cyan-400 glow-text" />
          <h1 className="text-4xl font-bold text-cyan-400 glow-text tracking-widest uppercase">
            IdentiMap
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT: FORM */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-6 rounded-xl glow">
              <h2 className="text-xl font-bold mb-6 text-neon-green flex items-center gap-2">
                <Search className="w-5 h-5" />
                Target Input
              </h2>

              <form onSubmit={handleScan} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" /> Real Name
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. James Mcgill"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" /> Email Address
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. target@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <Fingerprint className="w-4 h-4" /> Username(s)
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. james, jimmy"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4" /> Phone Number
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. +62838..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" /> Date of Birth
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. 01 january 2001"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" /> Address
                  </label>
                  <textarea
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700 resize-none"
                    placeholder="e.g. Amerika"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4" /> Image URL
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. https://example.com/photo.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4" /> Image URL
                  </label>
                  <input
                    className="w-full bg-black border border-cyan-900/50 rounded-none p-3 text-cyan-50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
                    placeholder="e.g. https://example.com/photo.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm flex items-center gap-2 bg-red-900/20 p-2 rounded">
                    <ShieldAlert className="w-4 h-4" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500 font-bold tracking-widest py-4 px-4 uppercase transition-all flex justify-center items-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-cyan-400/20 w-0 group-hover:w-full transition-all duration-300 ease-out" />
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Fingerprint className="w-5 h-5 relative z-10" />
                    </motion.div>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">START SEQUENCE <Search className="w-4 h-4"/></span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="md:col-span-2">
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-cyan-400 space-y-4"
                >
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <ShieldAlert className="w-20 h-20 opacity-50" />
                  </motion.div>
                  <p className="text-lg tracking-widest uppercase animate-pulse">Running OSINT Correlation Engine...</p>
                </motion.div>
              )}

              {results && !loading && (
                <motion.div
                  id="report-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 bg-[#050505] p-2"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-cyan-500">Intel Dashboard</h2>
                    <button 
                      onClick={exportToPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-800 transition-colors uppercase text-xs font-bold tracking-widest border border-cyan-800 group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform"/> Export PDF
                    </button>
                  </div>
                  
                  {/* Score Card and Graph Array */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-black/40 border border-cyan-900/50 p-8 relative overflow-hidden group hover:border-cyan-500/50 transition-colors flex flex-col justify-center">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-neon-green to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-400">Match Confidence</h2>
                      <div className="text-8xl font-black text-cyan-400 glow-text flex items-baseline gap-2">
                        {results.overall_confidence_score}
                        <span className="text-4xl text-cyan-800">%</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                       <GraphComponent results={results} />
                    </div>
                  </div>

                  {/* Accounts Found */}
                  {results.findings.usernames?.found_count > 0 && (
                    <div className="bg-black/40 border border-cyan-900/50 p-6">
                      <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Fingerprint className="w-5 h-5"/> Verified Identities
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.findings.usernames.accounts.map((acc: any, i: number) => (
                          <motion.a
                            key={i}
                            href={acc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col gap-2 p-4 bg-gray-900/30 border border-gray-800 hover:border-cyan-500/80 transition-all group"
                          >
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-cyan-400">
                              {getPlatformIcon(acc.site)}
                              <span className="text-xs uppercase tracking-wider font-bold">{acc.site}</span>
                            </div>
                            <p className="text-xs text-cyan-200/50 truncate drop-shadow-md">{acc.url}</p>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email & Image Info Array */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Info */}
                    {results.findings.email_info && results.findings.email_info.registered_sites?.length > 0 && (
                       <div className="bg-black/40 border border-cyan-900/50 p-6 h-full flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Search className="w-5 h-5"/> Email Registered Footprints
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {results.findings.email_info.registered_sites.map((site: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-cyan-900/30 border border-cyan-800 text-cyan-300 text-xs uppercase tracking-wider rounded">
                              {site}
                            </span>
                          ))}
                        </div>
                       </div>
                    )}

                    {/* Image Intel */}
                    {results.findings.image_intel && (results.findings.image_intel.has_exif || results.findings.image_intel.reverse_search_dorks?.length > 0) && (
                      <div className="bg-black/40 border border-cyan-900/50 p-6 flex flex-col justify-between h-full">
                         <div>
                          <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5"/> Photographic Intelligence
                          </h3>
                          <div className="flex flex-col gap-2 mb-4 text-xs font-mono text-gray-400">
                             <div><span className="text-cyan-600 uppercase">Dimensions:</span> {results.findings.image_intel.dimensions || "N/A"}</div>
                             <div><span className="text-cyan-600 uppercase">Format:</span> {results.findings.image_intel.format || "Unknown"}</div>
                             {results.findings.image_intel.has_exif ? (
                                <div className="text-neon-green mt-2 font-bold animate-pulse">EXIF METADATA DETECTED</div>
                             ) : (
                                <div className="text-gray-600 mt-2">NO EXIF DATA FOUND</div>
                             )}
                          </div>
                          
                          {results.findings.image_intel.has_exif && (
                             <div className="bg-black border border-cyan-900/30 p-2 font-mono text-[10px] max-h-32 overflow-y-auto mb-4">
                                {Object.entries(results.findings.image_intel.exif_data).map(([key, val]: any, i) => (
                                   <div key={i} className="flex justify-between border-b border-cyan-900/20 py-1">
                                      <span className="text-cyan-600">{key}</span>
                                      <span className="text-cyan-300 truncate max-w-[150px]">{val}</span>
                                   </div>
                                ))}
                             </div>
                          )}
                         </div>

                         {results.findings.image_intel.reverse_search_dorks?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-cyan-900/30">
                               <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Reverse Image Dorks</p>
                               <div className="flex flex-col gap-2">
                                  {results.findings.image_intel.reverse_search_dorks.map((dork: string, i: number) => (
                                     <a key={i} href={dork} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 p-2 border border-cyan-900/50 truncate w-full block transition-colors">
                                        {dork}
                                     </a>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>
                    )}
                  </div>

                  {/* Breach Warning */}
                  {results.findings.breach_info && results.findings.breach_info.breaches_found && (
                     <div className="bg-red-950/20 border border-red-900/50 p-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-red-600 animate-pulse" />
                      <h3 className="text-lg font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5"/> Data Breach Detection
                      </h3>
                      <p className="text-red-300/80 text-sm mb-4">
                        Critical Alert: <strong className="text-red-400">{results.findings.breach_info.leak_count}</strong> isolated leak instances located within the requested database.
                      </p>
                      
                      {results.findings.breach_info.leaked_data?.length > 0 && (
                        <div className="bg-black/60 border border-red-900/30 p-4 font-mono text-xs max-h-40 overflow-y-auto">
                           {results.findings.breach_info.leaked_data.map((leak: any, i: number) => (
                             <div key={i} className="flex justify-between border-b border-red-900/20 py-1">
                               <span className="text-red-400">{leak.email}</span>
                               <span className="text-red-500 font-bold opacity-75">{leak.compromised_data}</span>
                             </div>
                           ))}
                        </div>
                      )}
                     </div>
                  )}

                  {/* Phone Info & Map Array */}
                  {results.findings.phone_info && results.findings.phone_info.is_valid && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-black/40 border border-cyan-900/50 p-6 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Smartphone className="w-5 h-5"/> Telecom Footprint
                        </h3>
                        <div className="flex flex-col gap-6 text-sm">
                          <div className="border-l-2 border-cyan-900 pl-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Carrier</p>
                            <p className="font-mono text-cyan-300">{results.findings.phone_info.info.carrier || "Unknown"}</p>
                          </div>
                          <div className="border-l-2 border-cyan-900 pl-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Country</p>
                            <p className="font-mono text-cyan-300">{results.findings.phone_info.info.country || "Unknown"}</p>
                          </div>
                          <div className="border-l-2 border-cyan-900 pl-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Formatted</p>
                            <p className="font-mono text-cyan-300">{results.findings.phone_info.info.formatted}</p>
                          </div>
                        </div>
                       </div>
                       
                       <div className="h-[300px]">
                          <MapComponent phoneInfo={results.findings.phone_info.info} />
                       </div>
                     </div>
                  )}

                   {/* Dork Findings */}
                   {results.findings.web_footprints && results.findings.web_footprints.found_links?.length > 0 && (
                     <div className="bg-black/40 border border-cyan-900/50 p-6">
                      <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Search className="w-5 h-5"/> Dorking Network
                      </h3>
                      <ul className="space-y-3">
                        {results.findings.web_footprints.found_links.map((link: string, i: number) => (
                          <li key={i} className="text-xs truncate font-mono border-b border-gray-800/50 pb-2">
                            <span className="text-neon-green mr-2">[{i}]</span>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">{link}</a>
                          </li>
                        ))}
                      </ul>
                     </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {!results && !loading && (
              <div className="h-full flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl p-10 text-center">
                Initialize scan sequence by entering target parameters on the left.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto mt-12 py-6 border-t border-cyan-900/40 text-xs font-mono text-gray-500 uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
        <div>&copy; 2026 IdentiMap OSINT Framework</div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <span>Developed by <span className="text-cyan-500 font-bold">Ahmad dzakiudin</span></span>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/jakijekiiii" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">Instagram</a>
            <a href="https://www.facebook.com/jakijekijuki" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">Facebook</a>
            <a href="https://github.com/Dzakiudin" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
