import React, { useEffect, useState } from 'react';
import "../../CSS/cards.css";
import { useToast } from "../Toast/ToastContext";

const Scanner = ({ onScanComplete }) => {
  const showToast = useToast();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const elements = ["Cardboard", "Glass", "Metal", "Paper", "Plastic", "Trash"];

  const elementPoints = [12, 20, 25, 10, 15, 5];

  const modelApiUrl = process.env.REACT_APP_MODEL_API_URL || "http://localhost:4000";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = async (event) => {
    if (loading) return;

    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setLastResult(null);
    setLoading(true);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image_file", file);

    try {
      const response = await fetch(`${modelApiUrl}/detect`, {
        method: "POST",
        body: formData
      });

      const detected = (await response.json())[0];
      const index = elements.indexOf(detected);

      if (index !== -1) {
        const itemPoints = elementPoints[index];
        const token = localStorage.getItem("token");

        const pointsRes = await fetch("/api/points", {
          method: "POST",
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ points: itemPoints })
        });

        if (!pointsRes.ok) {
          const errData = await pointsRes.json().catch(() => ({}));
          setError(errData.error || "Failed to save points — try again");
          showToast(errData.error || "Failed to save points", "error");
        } else {
          setLastResult({ name: detected, points: itemPoints });
          onScanComplete?.();

          try {
            await fetch("/api/scan-history", {
              method: "POST",
              headers: {
                "x-access-token": token,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ itemName: detected, points: itemPoints })
            });
          } catch (historyErr) {
            console.error('Failed to save scan history:', historyErr);
          }
        }
      } else {
        setError("Unknown item detected");
      }
    } catch (err) {
      setError("Error detecting object");
    }

    setLoading(false);
  };

  return (
    <div className="dash-card">
      <div className="dash-card-inner">
        <h3 className="text-white font-bold text-xl mb-1">Scan an Item</h3>
        <p className="text-zinc-400 text-sm mb-5">
          Upload a photo of your waste item to identify it and earn points.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Scanned item preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-500 text-xs text-center px-2">No image scanned yet</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 w-fit">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Scanning...
                </>
              ) : (
                <>📷 Scan Item</>
              )}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} style={{ display: "none" }} />
            </label>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {!loading && lastResult && (
              <div className="text-sm text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-fit">
                {lastResult.name} — <span className="font-semibold text-purple-300">{lastResult.points} pts</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
