// Decorative ripples run only while a mouse is active on a visible page.
(() => {
  const canvas = document.querySelector("#liquid-background");
  const allowed = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false });
  if (!gl) return;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `);
  const fragment = compile(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec2 resolution;
    uniform vec3 drops[8];
    uniform float time;
    uniform float dark;
    void main() {
      vec2 point = gl_FragCoord.xy / resolution;
      point.x *= resolution.x / resolution.y;
      float ripple = 0.0;
      float glow = 0.0;
      for (int i = 0; i < 8; i++) {
        float age = time - drops[i].z;
        vec2 center = drops[i].xy;
        center.x *= resolution.x / resolution.y;
        float distance = length(point - center);
        float alive = step(0.0, age) * (1.0 - smoothstep(1.0, 2.4, age));
        float wave = distance - age * 0.18;
        ripple += exp(-wave * wave * 1400.0) * alive;
        glow += exp(-distance * distance * 35.0) * alive * 0.2;
      }
      vec3 warm = vec3(0.77, 0.37, 0.21);
      vec3 cool = vec3(0.14, 0.25, 0.30);
      vec3 color = mix(cool, warm, clamp(glow * 2.0, 0.0, 1.0));
      float alpha = min(0.08, ripple * 0.035);
      gl_FragColor = vec4(color, alpha);
    }
  `);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(["resolution", "drops[0]", "time", "dark"].map(name => [name, gl.getUniformLocation(program, name)]));
  const drops = new Float32Array(24);
  for (let i = 2; i < drops.length; i += 3) drops[i] = -100;
  let frame = 0;
  let nextDrop = 0;
  let lastDrop = -100;
  let lastDraw = 0;

  const resize = () => {
    // Half-resolution rendering keeps the full-screen shader inexpensive.
    canvas.width = Math.max(1, Math.round(innerWidth * 0.6));
    canvas.height = Math.max(1, Math.round(innerHeight * 0.6));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  const draw = (now) => {
    if (!allowed.matches || document.hidden || now / 1000 - lastDrop > 2.5) {
      stop();
      return;
    }
    if (now - lastDraw >= 32) {
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform3fv(uniforms["drops[0]"], drops);
      gl.uniform1f(uniforms.time, now / 1000);
      gl.uniform1f(uniforms.dark, document.documentElement.dataset.theme === "dark" ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      lastDraw = now;
    }
    frame = requestAnimationFrame(draw);
  };
  window.addEventListener("pointermove", (event) => {
    if (!allowed.matches || document.hidden || event.pointerType !== "mouse") return;
    const now = performance.now() / 1000;
    if (now - lastDrop < 0.09) return;
    const offset = nextDrop * 3;
    drops[offset] = event.clientX / innerWidth;
    drops[offset + 1] = 1 - event.clientY / innerHeight;
    drops[offset + 2] = now;
    nextDrop = (nextDrop + 1) % 8;
    lastDrop = now;
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", stop);
  allowed.addEventListener("change", stop);
  canvas.addEventListener("webglcontextlost", stop);
  resize();
})();
