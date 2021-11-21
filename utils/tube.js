import * as THREE from 'three';
import { getSplineFromCoords } from './util.js';
import { CURVE_SEGMENTS } from './constants.js';

// tube draws thicker lines
const TUBE_RADIUS_SEGMENTS = 2;
const DEFAULT_TUBE_RADIUS = 1;

export default function Tube(coords, material) {
  const { spline } = getSplineFromCoords(coords);
  const geometry = new THREE.TubeBufferGeometry(
    spline,
    CURVE_SEGMENTS,
    DEFAULT_TUBE_RADIUS,
    TUBE_RADIUS_SEGMENTS,
    false
  );

  geometry.setDrawRange(0, 2);

  this.mesh = new THREE.Mesh(geometry, material);
}