import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ================= 1. CONFIGURATION =================
// Ensure these match your actual Supabase project
const SUPABASE_URL = "https://vsfssnuczhqoqvjrerbw.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZnNzbnVjemhxb3F2anJlcmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTc3NjYsImV4cCI6MjA4NDY3Mzc2Nn0.H-6DGXy48pKg7-mFZ8EaToUo1D3xLhPllsmz2gn1FdI";
const BUCKET_NAME = "odesa";

// Initialize the Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AdminDashboard = () => {
  // ================= 2. STATE HOOKS =================
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ================= 3. FETCH LOGIC (FIXED) =================
  const fetchImages = async () => {
    setLoading(true);
    try {
      // List all files in the bucket
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) throw listError;

      if (files && files.length > 0) {
        // Generate secure Signed URLs so images are viewable
        const fileNames = files.map((f) => f.name);
        const { data: signedData, error: signedError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrls(fileNames, 3600); // Links work for 1 hour

        if (signedError) throw signedError;

        // Combine file metadata with the new viewable URLs
        const combinedData = files.map((file, index) => ({
          ...file,
          url: signedData[index].signedUrl,
        }));

        setImages(combinedData);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error("Error fetching images:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // ================= 4. ACTIONS =================
  const downloadImage = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Download failed");
    }
  };

  const deleteImage = async (fileName) => {
    if (!window.confirm("Delete this capture?")) return;
    setDeletingId(fileName);
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);
      if (error) throw error;
      setImages(images.filter((img) => img.name !== fileName));
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ================= 5. RENDER UI =================
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Monitor</h1>
          <button
            onClick={fetchImages}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Loading secure data...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((img) => (
              <div
                key={img.name}
                className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700"
              >
                <img
                  src={img.url}
                  alt="Capture"
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-mono text-blue-400 truncate">
                    {img.name}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => downloadImage(img.url, img.name)}
                      className="flex-1 bg-slate-700 py-2 rounded text-xs hover:bg-slate-600"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => deleteImage(img.name)}
                      className="flex-1 bg-red-900/30 text-red-400 py-2 rounded text-xs border border-red-900/50"
                    >
                      {deletingId === img.name ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
