import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Complaint } from '@/types/database';
import StatusBadge from './StatusBadge';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function FitBounds({ complaints }: { complaints: Complaint[] }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length > 0) {
      const bounds = L.latLngBounds(complaints.map(c => [c.latitude, c.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [complaints, map]);
  return null;
}

interface Props {
  complaints: Complaint[];
  height?: string;
}

export default function ComplaintMap({ complaints, height = '400px' }: Props) {
  const center: [number, number] = complaints.length > 0
    ? [complaints[0].latitude, complaints[0].longitude]
    : [20.5937, 78.9629]; // Default India center

  return (
    <div style={{ height }} className="relative z-0 overflow-hidden rounded-lg border">
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds complaints={complaints} />
        {complaints.map(c => (
          <Marker key={c.id} position={[c.latitude, c.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold capitalize">{c.issue_type.replace('_', ' ')}</p>
                <p className="text-muted-foreground">{c.description?.slice(0, 80)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
