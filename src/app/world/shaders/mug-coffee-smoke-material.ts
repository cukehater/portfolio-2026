import * as THREE from 'three';

/**
 * Three.js Journey 스타일 커피 연기 (`32-coffee-smoke-shader-final` 참고).
 * `vertex.glsl` / `fragment.glsl` / `rotate2D.glsl` 내용을 인라인(Three chunk 제거).
 */
const ROTATE2D_GLSL = `
vec2 rotate2D(vec2 value, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  mat2 m = mat2(c, s, -s, c);
  return m * value;
}
`;

const COFFEE_SMOKE_VERTEX = `${ROTATE2D_GLSL}
uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {
  vec3 newPosition = position;

  float twistPerlin = texture(
    uPerlinTexture,
    vec2(0.5, uv.y * 0.2 - uTime * 0.005)
  ).r;
  float angle = twistPerlin * 10.0;
  newPosition.xz = rotate2D(newPosition.xz, angle);

  vec2 windOffset = vec2(
    texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
    texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
  );
  windOffset *= pow(uv.y, 2.0) * 10.0;
  newPosition.xz += windOffset;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  vUv = uv;
}
`;

const COFFEE_SMOKE_FRAGMENT = `
uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {
  vec2 smokeUv = vUv;
  smokeUv.x *= 0.5;
  smokeUv.y *= 0.3;
  smokeUv.y -= uTime * 0.03;

  float smoke = texture(uPerlinTexture, smokeUv).r;

  smoke = smoothstep(0.4, 1.0, smoke);

  smoke *= smoothstep(0.0, 0.1, vUv.x);
  smoke *= smoothstep(1.0, 0.9, vUv.x);
  smoke *= smoothstep(0.0, 0.1, vUv.y);
  smoke *= smoothstep(1.0, 0.4, vUv.y);

  gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);
}
`;

export function createCoffeeSmokeShaderMaterial(
  perlinTexture: THREE.Texture
): THREE.ShaderMaterial {
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  return new THREE.ShaderMaterial({
    vertexShader: COFFEE_SMOKE_VERTEX,
    fragmentShader: COFFEE_SMOKE_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uPerlinTexture: { value: perlinTexture },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

/** 참조 프로젝트와 동일: Plane(16×64), pivot 위로, 이후 `mesh.scale`로 머그에 맞춤 */
export function createCoffeeSmokePlaneGeometry(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(1, 1, 16, 64);
  geo.translate(0, 0.5, 0);
  return geo;
}
