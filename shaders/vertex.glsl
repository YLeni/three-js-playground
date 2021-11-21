varying vec2 vertexUV;  // every data passed to fragment has to be declared in vertex.glsl
varying vec3 vertexNormal;

void main(){
    vertexUV = uv; // uv is provided default by three.js
    vertexNormal = normalize(normalMatrix*normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    // must end with ;
}