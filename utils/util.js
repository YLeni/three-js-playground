import * as THREE from 'three';
import { geoInterpolate } from 'd3-geo';
import { GLOBE_RADIUS, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE } from './constants';

const DEGREE_TO_RADIAN = Math.PI / 180;

export function clamp(num, min, max) {
  return num <= min ? min : (num >= max ? max : num);
}

// 从三维地理位置转换到球面坐标位置，一个起点/一个终点就要计算位置
// export function coordinateToPosition(lat, lng, radius) {
//   const phi = (90 - lat) * DEGREE_TO_RADIAN;
//   const theta = (180 + lng) * DEGREE_TO_RADIAN;

//   return new THREE.Vector3(
//     - radius * Math.sin(phi) * Math.cos(theta),
//     radius * Math.cos(phi),
//     radius * Math.sin(phi) * Math.sin(theta)
//   );
// }

export function coordinateToPosition(lat, lng, r = 0) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (90 - lng) * Math.PI / 180;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta), // x
    r * Math.cos(phi), // y
    r * Math.sin(phi) * Math.sin(theta) // z
  );
}

//构建line, 确认line的位置和弧度，一个line的位置由起点和终点的位置决定
export function getSplineFromCoords(coords) {
  const startLat = coords[0];
  const startLng = coords[1];
  const endLat = coords[2];
  const endLng = coords[3];

  // spline vertices
  const start = coordinateToPosition(startLat, startLng, GLOBE_RADIUS);
  const end = coordinateToPosition(endLat, endLng, GLOBE_RADIUS);

  const altitude = clamp(start.distanceTo(end) * .75, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE);
  const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat]); //链接起点和终点，沿着地球表面的弧线段

  const midCoord1 = interpolate(0.25); //在沿着地球表面的弧线段上找 25% 处点的经纬度
  const midCoord2 = interpolate(0.75);  //在沿着地球表面的弧线段上找 75% 处点的经纬度
  const mid1 = coordinateToPosition(midCoord1[1], midCoord1[0], GLOBE_RADIUS + altitude); // mid 比起起点和终点，假设其在的圆球的半径更长，以根据它的经纬度计算位置
  const mid2 = coordinateToPosition(midCoord2[1], midCoord2[0], GLOBE_RADIUS + altitude); // 因此， altitude 决定了弧线的拱度

  return {
    start,
    end,
    spline: new THREE.CubicBezierCurve3(start, mid1, mid2, end)
  };
}