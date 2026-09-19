import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function RouteMap({ 
  routes = [], 
  selectedVan = 'all', 
  depot = { latitude: 30.484, longitude: 76.594, name: 'Rajpura Milk Chilling Centre' },
  showFixedComparison = false,
  fixedRoutes = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [depot.latitude, depot.longitude],
        zoom: 11,
        zoomControl: true,
      });

      // Dark/Clean modern tile layer (CartoDB Dark Matter / Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    layers.clearLayers();

    // 1. Plot Depot
    const depotIcon = L.divIcon({
      className: 'custom-depot-marker',
      html: `
        <div style="
          background: #0f172a;
          color: #38bdf8;
          border: 2px solid #38bdf8;
          border-radius: 8px;
          padding: 4px 6px;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.4);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        ">
          🏭 <span>MCC Rajpura Depot</span>
        </div>
      `,
      iconSize: [120, 30],
      iconAnchor: [60, 15],
    });

    const depotMarker = L.marker([depot.latitude, depot.longitude], { icon: depotIcon }).addTo(layers);
    depotMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
        <strong style="font-size: 14px; color: #0284c7;">${depot.name}</strong><br/>
        Central Chilling & Processing Hub<br/>
        Departure: 05:00 AM | Fleet capacity: 5,000 L
      </div>
    `);

    // Van route colors
    const vanColors = {
      'VAN_01': { hex: '#2563eb', border: '#1d4ed8', text: 'Van 1' },
      'VAN_02': { hex: '#059669', border: '#047857', text: 'Van 2' },
    };

    const allPoints = [[depot.latitude, depot.longitude]];

    // If showing Fixed Route baseline for comparison
    if (showFixedComparison && fixedRoutes.length > 0) {
      fixedRoutes.forEach((route) => {
        const polyCoords = [[depot.latitude, depot.longitude]];
        route.stop_details?.forEach((s) => {
          polyCoords.push([s.latitude, s.longitude]);
        });
        polyCoords.push([depot.latitude, depot.longitude]);

        L.polyline(polyCoords, {
          color: '#ef4444',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.65,
        }).addTo(layers).bindPopup(`<b>Legacy Fixed Route (${route.vehicle_id})</b><br/>Distance: ${route.distance_km} km<br/>Late Stops: ${route.late_stops}`);
      });
    }

    // 2. Plot Optimized Routes
    routes.forEach((route) => {
      if (selectedVan !== 'all' && route.vehicle_id !== selectedVan) return;

      const vanStyle = vanColors[route.vehicle_id] || { hex: '#8b5cf6', border: '#6d28d9', text: route.vehicle_name };
      const polyCoords = [[depot.latitude, depot.longitude]];

      route.stop_details?.forEach((stop, index) => {
        const pt = [stop.latitude, stop.longitude];
        polyCoords.push(pt);
        allPoints.push(pt);

        // Marker for each stop
        const isCompleted = stop.is_completed;
        const isAtRisk = stop.predicted_litres >= 450;

        const stopIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: `
            <div style="
              background: ${isCompleted ? '#10b981' : isAtRisk ? '#f59e0b' : vanStyle.hex};
              color: white;
              border: 2px solid white;
              border-radius: 50%;
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker(pt, { icon: stopIcon }).addTo(layers);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; min-width: 170px; color: #0f172a;">
            <div style="font-weight: bold; font-size: 13px; color: ${vanStyle.hex}; margin-bottom: 4px;">
              Stop ${index + 1}: ${stop.name}
            </div>
            <div><strong>Vehicle:</strong> ${route.vehicle_name}</div>
            <div><strong>Expected Litres:</strong> <span style="color: #0284c7; font-weight: bold;">${stop.predicted_litres} L</span></div>
            <div><strong>Arrival Window:</strong> ${stop.arrival_window}</div>
            <div><strong>Est. Arrival:</strong> ${stop.estimated_arrival}</div>
            <div><strong>Cumulative Load:</strong> ${stop.current_load_litres} / ${stop.vehicle_capacity} L</div>
            ${stop.is_completed ? `<div style="color: #10b981; font-weight: bold; margin-top: 4px;">✓ Collected: ${stop.actual_litres || stop.predicted_litres} L</div>` : ''}
            ${stop.warning ? `<div style="color: #ea580c; font-size: 11px; margin-top: 4px;">⚠️ ${stop.warning}</div>` : ''}
          </div>
        `);
      });

      polyCoords.push([depot.latitude, depot.longitude]);

      // Draw polyline for optimized route
      L.polyline(polyCoords, {
        color: vanStyle.hex,
        weight: 4,
        opacity: 0.9,
      }).addTo(layers);
    });

    // Auto-fit bounds
    if (allPoints.length > 1) {
      map.fitBounds(allPoints, { padding: [40, 40] });
    }

  }, [routes, selectedVan, depot, showFixedComparison, fixedRoutes]);

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs shadow-lg flex flex-col gap-1.5">
        <div className="font-semibold text-slate-200 mb-0.5">Route Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-slate-300">Van 1 (Eicher Pro)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
          <span className="text-slate-300">Van 2 (Tata 407)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-300">High Yield Surge (&ge;450L)</span>
        </div>
        {showFixedComparison && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-red-500 inline-block"></span>
            <span className="text-red-400">Legacy Fixed Route</span>
          </div>
        )}
      </div>
    </div>
  );
}
