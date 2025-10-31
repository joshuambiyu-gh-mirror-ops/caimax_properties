"use client";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./map"), { ssr: false });

import type { MapProps } from './map';

export default function MapClient(props: MapProps) {
  return <DynamicMap {...props} />;
}
