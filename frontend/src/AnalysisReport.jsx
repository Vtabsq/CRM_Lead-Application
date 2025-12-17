import React from "react";

const POWER_BI_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiNDlkOTM5NGEtYTYxMy00MzI5LTk3YWEtZjgxY2M2ZjhmN2MyIiwidCI6ImQ5NmNiMzRlLTc0YmUtNDAyZS04M2Y4LWIyZDUwNGM0YmNmYSJ9";

const ZOOM = 0.85;
const INVERSE_SCALE = `${(1 / ZOOM) * 100}%`;

export default function AnalyticsReport() {
  return (
    <div className="w-full h-[calc(100vh-120px)] p-2 overflow-hidden">
      <h1 className="text-2xl font-semibold text-green-700 mb-2">
        Analytics Dashboard
      </h1>

      <div className="w-full h-[calc(100%-48px)] bg-white rounded-xl shadow-lg overflow-hidden">
        <div
          style={{
            transform: `scale(${ZOOM})`,
            transformOrigin: "top left",
            width: INVERSE_SCALE,
            height: INVERSE_SCALE
          }}
        >
          <iframe
            title="Power BI Report"
            src={POWER_BI_URL}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
            style={{ border: "none" }}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
