"use client";
import React, { useState } from "react";

export type Filters = {
  propertyType?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedrooms?: number | null;
  facilities: string[];
};

interface MapFiltersProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  compact?: boolean;
}

const PROPERTY_TYPES = [
  'HOUSE', 'APARTMENT', 'VILLA', 'TOWNHOUSE', 'CONDO', 'DUPLEX', 'STUDIO', 'LAND', 'OTHER'
];

const FACILITIES = [
  'LAUNDRY', 'SWIMMING_POOL', 'WIFI', 'PET_FRIENDLY', 'PARKING', 'GYM'
];

export default function MapFilters({ filters, onChange, compact = true }: MapFiltersProps) {
  const [collapsed, setCollapsed] = useState(true);

  function toggleFacility(fac: string) {
    const next = filters.facilities.includes(fac)
      ? filters.facilities.filter(x => x !== fac)
      : [...filters.facilities, fac];
    onChange({ ...filters, facilities: next });
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-100 shadow-sm ${compact ? 'p-2' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-medium ${compact ? 'text-sm' : 'text-lg'}`}>Filters</h3>
        <button
          aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
          onClick={() => setCollapsed(v => !v)}
          className="text-xs text-gray-500 px-2 py-1"
        >{collapsed ? 'Expand' : 'Collapse'}</button>
      </div>

      {!collapsed && (
        <div className="mt-2 space-y-2 text-sm">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Property</label>
            <select
              value={filters.propertyType ?? ''}
              onChange={(e) => onChange({ ...filters, propertyType: e.target.value || undefined })}
              className="w-full rounded-md border-gray-200 text-sm py-1 px-2"
            >
              <option value="">Any</option>
              {PROPERTY_TYPES.map(pt => (
                <option key={pt} value={pt}>{pt.charAt(0) + pt.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min</label>
              <input
                type="number"
                value={filters.minPrice ?? ''}
                onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="w-full rounded-md border-gray-200 p-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max</label>
              <input
                type="number"
                value={filters.maxPrice ?? ''}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })}
                placeholder="No max"
                className="w-full rounded-md border-gray-200 p-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Bedrooms</label>
            <select
              value={filters.bedrooms ?? ''}
              onChange={(e) => onChange({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-md border-gray-200 text-sm py-1 px-2"
            >
              <option value="">Any</option>
              {[0,1,2,3,4,5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Facilities</label>
            <div className="flex flex-wrap gap-1">
              {FACILITIES.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${filters.facilities.includes(f) ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {f.replace('_', ' ').toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => onChange({ propertyType: undefined, minPrice: null, maxPrice: null, bedrooms: null, facilities: [] })}
              className="w-full text-sm rounded-md border bg-white py-1"
            >Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
