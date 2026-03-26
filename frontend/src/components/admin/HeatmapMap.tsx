import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

// Use placeholder token if not provided
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTNyZzR4ZGowMGwxMm1zZ2R4ZG94ZG94In0.U2FmZ2R4ZG94ZG94ZG94ZG94";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface HeatmapPoint {
  id: string;
  type: string;
  coordinates: [number, number];
  severity: number;
  timestamp: string;
}

interface HeatmapZone {
  id: string;
  name: string;
  coords: [number, number];
  metrics: {
    rain: number;
    drainBlockage: number;
    history: number;
    complaints: number;
    elevation: number;
  };
  floodRisk: number;
  priority: number;
  level: string;
  recommendation: string;
  insight: string;
  prediction: string | null;
}

interface DataType {
  points: HeatmapPoint[];
  zones: HeatmapZone[];
}

interface HeatmapMapProps {
  data: DataType;
  onZoneClick: (zoneId: string) => void;
  activeLayers: string[];
}

export default function HeatmapMap({ data, onZoneClick, activeLayers }: HeatmapMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [85.32, 23.34],
      zoom: 12,
      pitch: 45,
    });

    mapRef.current.on("load", () => {
      const map = mapRef.current!;

      // 1. COMPLAINTS SOURCE
      map.addSource("complaints", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: data.points
            .filter(p => p.coordinates && p.coordinates[0] != null && p.coordinates[1] != null)
            .map(p => ({
              type: "Feature",
              properties: p,
              geometry: { type: "Point", coordinates: p.coordinates }
            })) as any
        }
      });

      // 1.1 HEATMAP LAYER
      map.addLayer({
        id: "complaints-heatmap",
        type: "heatmap",
        source: "complaints",
        layout: { visibility: activeLayers.includes('complaints') ? 'visible' : 'none' },
        paint: {
          "heatmap-intensity": 1.5,
          "heatmap-radius": 25,
          "heatmap-opacity": 0.8,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0, 0, 255, 0)",
            0.2, "rgba(0, 255, 255, 0.5)",
            0.4, "rgba(0, 255, 0, 0.6)",
            0.6, "rgba(255, 255, 0, 0.7)",
            0.8, "rgba(255, 165, 0, 0.8)",
            1, "rgba(255, 0, 0, 1)"
          ]
        }
      });

      // 1.2 POINT MARKER LAYER
      map.addLayer({
        id: "complaints-points",
        type: "circle",
        source: "complaints",
        layout: { visibility: activeLayers.includes('garbage') || activeLayers.includes('drainage') ? 'visible' : 'none' },
        paint: {
          "circle-radius": 6,
          "circle-color": "#fff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000"
        }
      });

      // 2. ZONES SOURCE
      map.addSource("zones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: data.zones
            .filter(z => z.coords && z.coords[0] != null && z.coords[1] != null)
            .map(z => ({
              type: "Feature",
              properties: z,
              geometry: {
                 type: "Polygon",
                 coordinates: [[
                  [z.coords[0] - 0.015, z.coords[1] - 0.015],
                  [z.coords[0] + 0.015, z.coords[1] - 0.015],
                  [z.coords[0] + 0.015, z.coords[1] + 0.015],
                  [z.coords[0] - 0.015, z.coords[1] + 0.015],
                  [z.coords[0] - 0.015, z.coords[1] - 0.015]
                 ]]
              }
            })) as any
        }
      });

      // 2.1 CHOROPLETH LAYER (FLOOD RISK)
      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        layout: { visibility: activeLayers.includes('flood') ? 'visible' : 'none' },
        paint: {
          "fill-color": [
            "interpolate", ["linear"], ["get", "floodRisk"],
            0, "#10b981", 
            40, "#f59e0b",
            70, "#f97316",
            90, "#ef4444"
          ],
          "fill-opacity": 0.5
        }
      });

      map.addLayer({
        id: "zones-outline",
        type: "line",
        source: "zones",
        paint: { "line-color": "#fff", "line-width": 2, "line-opacity": 0.3 }
      });

      // INTERACTION
      map.on("click", "zones-fill", (e) => {
        if (e.features && e.features.length > 0) {
          onZoneClick(String(e.features[0].properties?.id));
        }
      });

      map.on("mouseenter", "zones-fill", () => map.getCanvas().style.cursor = "pointer");
      map.on("mouseleave", "zones-fill", () => map.getCanvas().style.cursor = "");
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [data, onZoneClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (map.getLayer("complaints-heatmap")) {
      map.setLayoutProperty("complaints-heatmap", "visibility", activeLayers.includes('complaints') ? 'visible' : 'none');
    }
    if (map.getLayer("zones-fill")) {
      map.setLayoutProperty("zones-fill", "visibility", activeLayers.includes('flood') ? 'visible' : 'none');
    }
    if (map.getLayer("complaints-points")) {
      map.setLayoutProperty("complaints-points", "visibility", activeLayers.includes('garbage') || activeLayers.includes('drainage') ? 'visible' : 'none');
    }
  }, [activeLayers]);

  return <div ref={containerRef} className="w-full h-full rounded-3xl overflow-hidden border border-border/40 shadow-glow-sm" />;
}
