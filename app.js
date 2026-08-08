// --- 1. COMUNICAÇÃO COM O TASKER ---
function sendToTasker(command) {
    if (typeof AutoTools !== 'undefined') {
        AutoTools.sendCommand(command);
    } else {
        console.log("[DEBUG] Comando simulado: " + command);
        updateRealDiag("> Executando via proxy: " + command); // Joga no painel pra você ver no PC
    }
}
// --- 5. INJEÇÃO DINÂMICA DO ID DO CHIP ---
function setChipId(realId) {
    const displayElement = document.getElementById('chip-id-display');
    if (displayElement) {
        // Formata o ID injetado mantendo a estética
        displayElement.innerText = "CHIP_ID: " + realId + "_HUD";
    }
}


// --- 2. GERENCIAMENTO DA NAVEGAÇÃO ---
function handleAction(command, element) {
    if (navigator.vibrate) navigator.vibrate(50);
    
    // Reseta visual de todos os botões
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active', 'bg-[#00eefc]', 'text-[#00686f]', 'shadow-[inset_0_0_0_1px_#d3fbff]');
        el.classList.add('text-[#ccc7ab]/60');
    });
    
    // Aplica visual ativo no clicado
    if (element) {
        element.classList.remove('text-[#ccc7ab]/60');
        element.classList.add('active', 'bg-[#00eefc]', 'text-[#00686f]', 'shadow-[inset_0_0_0_1px_#d3fbff]');
    }
    
    sendToTasker(command);
}

// --- 3. RECEPTOR DE DADOS DO TERMUX ---
function updateRealDiag(termuxOutput) {
    const diagScroll = document.getElementById('diag-scroll');
    const newLine = document.createElement('div');
    newLine.textContent = termuxOutput; 
    
    diagScroll.insertBefore(newLine, diagScroll.firstChild);
    
    // Mantém 20 linhas já que o terminal agora é o foco da tela
    if(diagScroll.children.length > 20) {
        diagScroll.removeChild(diagScroll.lastChild);
    }
}

// --- 4. RENDERIZAÇÃO DO SHADER DE FUNDO ---
(function() {
    const canvas = document.getElementById('shader-canvas');
    if (!canvas) return;
    
    function syncSize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w; canvas.height = h;
        }
    }
    
    window.addEventListener('resize', syncSize);
    syncSize();
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    
    const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fs = `precision highp float; varying vec2 v_texCoord; uniform float u_time; float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); } void main() { vec2 uv = v_texCoord; float scanline = sin(uv.y * 800.0 + u_time * 5.0) * 0.04; float glitch = step(0.98, random(vec2(floor(uv.x * 20.0), u_time * 0.1))) * 0.05; vec3 color = vec3(0.02, 0.02, 0.02); float d = length(uv - 0.5); float vignette = smoothstep(0.8, 0.4, d); vec2 grid = fract(uv * 40.0); float gridLine = step(0.98, grid.x) + step(0.98, grid.y); color += gridLine * vec3(0.05, 0.05, 0.05); float flicker = 0.95 + 0.05 * sin(u_time * 100.0) * random(vec2(u_time)); color += scanline; color += glitch * vec3(0.0, 0.94, 1.0); gl_FragColor = vec4(color * vignette * flicker, 1.0); }`;
    
    function cs(type, src) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs)); 
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    
    const uTime = gl.getUniformLocation(prog, 'u_time');
    
    function render(t) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render(0);
})();
