uniform sampler2D globeTexture; //uniform can be seen as import in js or property in vue

varying vec2 vertexUV; 
varying vec3 vertexNormal;

void main(){
    float intensity = 1.05 - dot(vertexNormal,vec3(0,0,1)); //dot returns produce (*) of two vectors

    vec3 atmosphere = vec3(0.3,0.6,1.0) * pow(intensity,1.5); //Return the value of the first parameter raised to the power of the second.

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture,vertexUV).xyz, 1.0);

}