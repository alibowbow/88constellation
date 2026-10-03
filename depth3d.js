/* 별자리의 깊이 — 이음선 별들을 실제 거리(광년)로 보여주는 3D 보기
 * 순수 WebGL(외부 라이브러리 없음). 거리 데이터: depth-data.js (window.SKY_DEPTH)
 * 공개 API: Depth3D.mount(options) → { go, setK, getState, select, destroy } | null
 *
 * 카메라 모델: k = 0 은 지구에서 본 모양(앱의 2D 성도와 같은 방향), k = 1 은 옆에서 본 모양.
 * 궤도 회전(forward 의 구면 보간)과 화면 회전(roll)을 분리해 어떤 각도에서도 위쪽 벡터가 뒤집히지 않는다.
 * 그리는 것은 화면 안에 있고, 보는 중이거나 움직일 때뿐이다(배터리 보호). */
(function () {
    'use strict';

    const UNIT = 100;            // 3D 한 단위 = 100광년
    const K_MAX = 1.2;           // 끌어서 돌릴 수 있는 한계 (1 = 옆모습 프리셋)
    const FOV_SIDE = 0.9;        // 옆모습 시야각(rad)
    const ELEVATION = 0.3;       // 옆모습에서 살짝 내려다보는 각도(rad)
    const FONT = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif';
    const HANGUL = /[가-힣]/;

    // ── 벡터·행렬 (열 우선, WebGL 규약) ─────────────────────────────────
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const mix = (a, b, t) => a + (b - a) * t;
    const mixv = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
    const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
    const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const wrapAngle = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; };

    function vecFor(ra, dec) {
        const a = ra * Math.PI / 180, d = dec * Math.PI / 180, c = Math.cos(d);
        return [c * Math.cos(a), c * Math.sin(a), Math.sin(d)];
    }
    function perspective(fovy, aspect, near, far) {
        const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
        return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    }
    // 시선 f 와 위쪽 up(직교 아니어도 됨)으로 뷰 행렬을 만든다
    function viewMatrix(eye, f, up) {
        const z = scl(f, -1);
        const x = norm(cross(f, up));
        const y = cross(x, f);
        return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    }
    function mul(a, b) {
        const o = new Array(16);
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                let s = 0;
                for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
                o[c * 4 + r] = s;
            }
        }
        return o;
    }
    function clip(m, p) {
        return [
            m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
            m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
            m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]
        ];
    }
    // 시선 축 수직 성분만 g 배 — 셰이더의 warp 와 동일
    function warp(p, cd, g) {
        const a = dot(p, cd);
        return [cd[0] * a + (p[0] - cd[0] * a) * g, cd[1] * a + (p[1] - cd[1] * a) * g, cd[2] * a + (p[2] - cd[2] * a) * g];
    }
    function toNDC(m, p) {
        const c = clip(m, p);
        return c[2] > 1e-6 ? [c[0] / c[2], c[1] / c[2]] : null;
    }
    function toScreen(m, p, w, h) {
        const c = clip(m, p);
        if (c[2] <= 1e-6) return null;
        return [(c[0] / c[2] * 0.5 + 0.5) * w, (1 - (c[1] / c[2] * 0.5 + 0.5)) * h, c[2]];
    }

    // B-V 색지수 → 별 색 (청백 → 백 → 황 → 주황)
    const STOPS = [[-0.35, [0.61, 0.71, 1]], [0, [0.79, 0.85, 1]], [0.3, [0.97, 0.97, 1]], [0.58, [1, 0.96, 0.88]],
        [0.85, [1, 0.9, 0.73]], [1.2, [1, 0.82, 0.59]], [1.6, [1, 0.74, 0.52]], [2.2, [1, 0.65, 0.47]]];
    function bvColor(b) {
        if (!(b > STOPS[0][0])) return STOPS[0][1];
        for (let i = 1; i < STOPS.length; i++) {
            if (b <= STOPS[i][0]) return mixv(STOPS[i - 1][1], STOPS[i][1], (b - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0]));
        }
        return STOPS[STOPS.length - 1][1];
    }

    // ── 표시용 문구 ─────────────────────────────────────────────────────
    // 시차 오차가 커서 먼 별일수록 거칠게 반올림하고 '약'을 붙인다
    function lyValue(ly) {
        const n = Math.abs(ly);
        return n < 100 ? Math.round(n) : n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100;
    }
    function format(ly, est) {
        const n = Math.abs(ly);
        const approx = n >= 100 || est ? '약 ' : '';
        const value = lyValue(ly).toLocaleString('ko-KR');
        return { ly: `${approx}${value}광년${est ? '(추정)' : ''}`, years: `${approx}${value}년 전` };
    }
    const lyText = (ly, est) => format(ly, est).ly;

    // ── 셰이더 ──────────────────────────────────────────────────────────
    const POINT_VS = `
        attribute vec3 a_pos; attribute vec3 a_col; attribute vec2 a_sa;
        uniform mat4 u_mvp; uniform float u_dpr; uniform float u_alpha; uniform float u_maxPoint;
        uniform vec3 u_cd; uniform float u_g;
        varying vec3 v_col; varying float v_a;
        vec3 warp(vec3 p) { float a = dot(p, u_cd); return u_cd * a + (p - u_cd * a) * u_g; }
        void main() {
            gl_Position = u_mvp * vec4(warp(a_pos), 1.0);
            v_col = a_col; v_a = a_sa.y * u_alpha;
            gl_PointSize = clamp(a_sa.x * u_dpr, 1.0, u_maxPoint);
        }`;
    const POINT_FS = `
        precision mediump float; varying vec3 v_col; varying float v_a;
        void main() {
            vec2 d = gl_PointCoord - 0.5; float r2 = dot(d, d) * 4.0; if (r2 > 1.0) discard;
            float a = (exp(-r2 * 10.0) + exp(-r2 * 3.0) * 0.45) * v_a;
            gl_FragColor = vec4(v_col * a, a);
        }`;
    // 화면 공간 굵은 선: 선분마다 사각형 2개. 카메라 평면을 가로지르는 선분은 근평면에서 잘라 그린다.
    const LINE_VS = `
        attribute vec3 a_p0; attribute vec3 a_p1; attribute vec2 a_c; attribute vec4 a_col;
        uniform mat4 u_mvp; uniform vec2 u_vp; uniform mediump float u_half; uniform float u_alpha;
        uniform vec3 u_cd; uniform float u_g;
        varying vec4 v_col; varying float v_d;
        vec3 warp(vec3 p) { float a = dot(p, u_cd); return u_cd * a + (p - u_cd * a) * u_g; }
        void main() {
            vec4 c0 = u_mvp * vec4(warp(a_p0), 1.0);
            vec4 c1 = u_mvp * vec4(warp(a_p1), 1.0);
            float nw = 0.02;
            if (c0.w < nw && c1.w < nw) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); v_col = vec4(0.0); v_d = 0.0; return; }
            if (c0.w < nw) c0 = mix(c0, c1, (nw - c0.w) / (c1.w - c0.w));
            if (c1.w < nw) c1 = mix(c1, c0, (nw - c1.w) / (c0.w - c1.w));
            vec2 n0 = c0.xy / c0.w; vec2 n1 = c1.xy / c1.w;
            vec2 dir = (n1 - n0) * u_vp * 0.5;
            float len = length(dir);
            vec2 d = len > 0.0001 ? dir / len : vec2(1.0, 0.0);
            vec2 nrm = vec2(-d.y, d.x);
            vec4 c = a_c.y < 0.5 ? c0 : c1;
            float pad = u_half + 1.5;
            vec2 px = nrm * a_c.x * pad + d * (a_c.y < 0.5 ? -1.0 : 1.0) * pad * 0.5;
            vec2 ndc = c.xy / c.w + px * 2.0 / u_vp;
            gl_Position = vec4(ndc * c.w, c.z, c.w);
            v_col = vec4(a_col.rgb, a_col.a * u_alpha);
            v_d = a_c.x * pad;
        }`;
    const LINE_FS = `
        precision mediump float; varying vec4 v_col; varying float v_d;
        uniform mediump float u_half; uniform mediump float u_glow;
        void main() {
            float d = abs(v_d); float a;
            if (u_glow > 0.5) {
                float s = u_half * 0.38;
                a = exp(-(d * d) / (2.0 * s * s)) * (1.0 - smoothstep(u_half * 0.8, u_half + 1.5, d));
            } else {
                a = clamp(u_half + 0.5 - d, 0.0, 1.0);
            }
            a *= v_col.a;
            gl_FragColor = vec4(v_col.rgb * a, a);
        }`;

    function makeProgram(gl, vs, fs) {
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
            return s;
        };
        const p = gl.createProgram();
        gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
        gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
        const loc = {}, uni = {};
        for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); i++) {
            const a = gl.getActiveAttrib(p, i);
            loc[a.name] = gl.getAttribLocation(p, a.name);
        }
        for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
            const u = gl.getActiveUniform(p, i);
            uni[u.name] = gl.getUniformLocation(p, u.name);
        }
        return { p, loc, uni };
    }

    // 정점 버퍼 한 덩어리. layout: [[속성이름, 크기], ...]
    function makeLayer(gl, prog, layout, mode) {
        const buf = gl.createBuffer();
        const stride = layout.reduce((s, l) => s + l[1], 0);
        let count = 0;
        return {
            set(data) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
                count = data.length / stride;
            },
            draw() {
                if (!count) return;
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                let offset = 0;
                const used = [];
                layout.forEach(([name, size]) => {
                    const l = prog.loc[name];
                    if (l !== undefined && l >= 0) {
                        gl.enableVertexAttribArray(l);
                        gl.vertexAttribPointer(l, size, gl.FLOAT, false, stride * 4, offset * 4);
                        used.push(l);
                    }
                    offset += size;
                });
                gl.drawArrays(mode, 0, count);
                used.forEach((l) => gl.disableVertexAttribArray(l));
            },
            dispose() { gl.deleteBuffer(buf); }
        };
    }

    // 선분 목록 [[p0, p1, [r,g,b,a]], ...] → 사각형 정점 배열
    const QUAD = [[-1, 0], [1, 0], [1, 1], [-1, 0], [1, 1], [-1, 1]];   // [옆(-1/+1), 끝(0/1)] 삼각형 2개
    function segmentsToQuads(segs) {
        const out = [];
        segs.forEach(([p0, p1, col]) => {
            QUAD.forEach(([side, end]) => {
                out.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], side, end, col[0], col[1], col[2], col[3]);
            });
        });
        return out;
    }

    // ── 별자리 기하 ─────────────────────────────────────────────────────
    function buildGeometry(data) {
        const S = data.s;
        const n = S.length;
        const dirs = S.map((s) => vecFor(s[0], s[1]));
        const lyAbs = S.map((s) => Math.abs(s[2]));
        const est = S.map((s) => s[2] < 0);
        const pos = dirs.map((v, i) => scl(v, lyAbs[i] / UNIT));

        // 하늘에서의 중심 방향 cd, 위쪽(북) u, 오른쪽(서) r — 지구에서 바깥을 볼 때 동쪽이 왼쪽
        let cd = [0, 0, 0];
        dirs.forEach((v) => { cd = add(cd, v); });
        cd = norm(cd);
        let ref = [0, 0, 1];
        if (Math.abs(dot(ref, cd)) > 0.96) ref = [1, 0, 0];
        const u = norm(sub(ref, scl(cd, dot(ref, cd))));
        const r = norm(cross(cd, u));

        const sortedLy = lyAbs.slice().sort((a, b) => a - b);
        const D0 = Math.max(0.5, sortedLy[Math.floor(n / 2)] / UNIT);
        let maxA = D0;
        pos.forEach((p) => { maxA = Math.max(maxA, dot(p, cd)); });

        // 지구에서 본 모양의 접평면 범위 → 지구 시점 시야각
        let tx = 0, ty = 0;
        dirs.forEach((v) => {
            const z = dot(v, cd);
            if (z > 0.05) {
                tx = Math.max(tx, Math.abs(dot(v, r) / z));
                ty = Math.max(ty, Math.abs(dot(v, u) / z));
            }
        });

        // 옆모습 방향: 별들이 가장 넓게 퍼진 가로 방향(주축)이 화면 가로가 되도록 고른다
        let sxx = 0, syy = 0, sxy = 0;
        pos.forEach((p) => {
            const xr = dot(p, r), xu = dot(p, u);
            sxx += xr * xr; syy += xu * xu; sxy += xr * xu;
        });
        const psi = 0.5 * Math.atan2(2 * sxy, sxx - syy);
        const sigma0 = Math.atan2(Math.cos(psi), -Math.sin(psi));
        const axisR = Math.cos(psi), axisU = Math.sin(psi);
        let halfWidth = 0;
        pos.forEach((p) => { halfWidth = Math.max(halfWidth, Math.abs(dot(p, r) * axisR + dot(p, u) * axisU)); });

        const all = S.map((s, i) => i);
        const known = all.filter((i) => !est[i]);
        const pool = known.length ? known : all;
        let nearI = pool[0], farI = pool[0];
        pool.forEach((i) => {
            if (lyAbs[i] < lyAbs[nearI]) nearI = i;
            if (lyAbs[i] > lyAbs[farI]) farI = i;
        });
        const nearLy = lyAbs[nearI], farLy = lyAbs[farI];

        // 거리 눈금: 1·2·5 × 10^n 중 4개 이하가 되는 가장 작은 간격
        const maxLy = maxA * UNIT;
        let step = 10;
        const steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
        for (let i = 0; i < steps.length; i++) { step = steps[i]; if (maxLy / step <= 4) break; }
        const ticks = [];
        for (let t = step; t <= maxLy * 1.05; t += step) ticks.push(t);

        const named = all.filter((i) => HANGUL.test(S[i][5]) && i !== nearI && i !== farI)
            .sort((a, b) => S[a][3] - S[b][3]);

        const exag = clamp(0.34 * maxA / Math.max(halfWidth, 1e-3), 1, 5);
        return {
            S, n, dirs, lyAbs, est, pos, cd, u, r, D0, maxA, tx, ty, sigma0, nearI, farI, ticks, named, exag,
            fitPts: pos.concat([[0, 0, 0]]),
            summary: {
                exag: Math.round(exag * 10) / 10,
                near: { name: S[nearI][5], ly: nearLy, est: est[nearI] },
                far: { name: S[farI][5], ly: farLy, est: est[farI] },
                ratio: nearLy > 0 ? farLy / nearLy : 1,
                count: n
            }
        };
    }

    // ── 마운트 ──────────────────────────────────────────────────────────
    function mount(options) {
        const host = options && options.host;
        const data = options && options.data;
        const fail = () => { if (options && options.onFail) options.onFail(); return null; };
        if (!host || !data || !data.s || !data.s.length) return fail();

        const reduce = !!options.reduceMotion;
        const glCanvas = document.createElement('canvas');
        const ovCanvas = document.createElement('canvas');
        glCanvas.className = 'depth-gl';
        ovCanvas.className = 'depth-ov';
        ovCanvas.setAttribute('aria-hidden', 'true');
        glCanvas.tabIndex = 0;
        glCanvas.setAttribute('role', 'img');
        if (options.label) glCanvas.setAttribute('aria-label', options.label);

        let gl = null;
        try {
            const attrs = { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: 'low-power' };
            gl = glCanvas.getContext('webgl2', attrs) || glCanvas.getContext('webgl', attrs);
        } catch (error) { gl = null; }
        if (!gl) return fail();

        let G, programs, layers, maxPoint;
        try {
            G = buildGeometry(data);
            programs = { point: makeProgram(gl, POINT_VS, POINT_FS), line: makeProgram(gl, LINE_VS, LINE_FS) };
            maxPoint = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1] || 64;
            const P = programs.point, L = programs.line;
            const pl = [['a_pos', 3], ['a_col', 3], ['a_sa', 2]];
            const ll = [['a_p0', 3], ['a_p1', 3], ['a_c', 2], ['a_col', 4]];
            layers = {
                stars: makeLayer(gl, P, pl, gl.POINTS),
                marks: makeLayer(gl, P, pl, gl.POINTS),
                core: makeLayer(gl, L, ll, gl.TRIANGLES),
                glow: makeLayer(gl, L, ll, gl.TRIANGLES),
                sight: makeLayer(gl, L, ll, gl.TRIANGLES),
                axis: makeLayer(gl, L, ll, gl.TRIANGLES)
            };
        } catch (error) {
            if (window.console && console.warn) console.warn('[Depth3D]', error);
            return fail();
        }

        // 정점 데이터 채우기
        const stars = [];
        G.S.forEach((s, i) => {
            const c = bvColor(s[4]);
            stars.push(G.pos[i][0], G.pos[i][1], G.pos[i][2], c[0], c[1], c[2],
                clamp(10.6 - s[3] * 1.45, 3.4, 11.5), G.est[i] ? 0.55 : 1);
        });
        layers.stars.set(stars);
        const segs = [];
        data.p.forEach((poly) => {
            for (let i = 0; i < poly.length - 1; i++) segs.push([G.pos[poly[i]], G.pos[poly[i + 1]]]);
        });
        layers.core.set(segmentsToQuads(segs.map(([a, b]) => [a, b, [0.46, 0.83, 0.94, 0.95]])));
        layers.glow.set(segmentsToQuads(segs.map(([a, b]) => [a, b, [0.28, 0.74, 0.89, 0.42]])));
        layers.sight.set(segmentsToQuads(G.pos.map((p) => [[0, 0, 0], p, [0.85, 0.9, 1, 1]])));
        layers.axis.set(segmentsToQuads([[[0, 0, 0], scl(G.cd, G.maxA * 1.08), [0.62, 0.74, 0.8, 1]]]));
        const marks = [0, 0, 0, 0.56, 0.76, 1, 13, 1];
        G.ticks.forEach((t) => marks.push(...scl(G.cd, t / UNIT), 0.7, 0.8, 0.86, 4.5, 0.85));
        [[G.nearI, [0.57, 0.87, 0.66]], [G.farI, [1, 0.82, 0.4]]].forEach(([i, c]) => {
            marks.push(...G.pos[i], c[0], c[1], c[2], 22, 0.5);
        });
        layers.marks.set(marks);

        // 상태
        const st = { k: 0, spin: 0, anim: null, selected: -1, view: null, visible: false, raf: 0, dirty: true, dead: false };
        const dprNow = () => Math.min(window.devicePixelRatio || 1, 2.5);
        let W = 1, H = 1, dpr = 1;
        const ctx = ovCanvas.getContext('2d');
        let screenPts = [];

        function resize() {
            const rect = host.getBoundingClientRect();
            if (rect.width < 2 || rect.height < 2) return;
            W = rect.width; H = rect.height; dpr = dprNow();
            [glCanvas, ovCanvas].forEach((c) => {
                c.width = Math.round(W * dpr);
                c.height = Math.round(H * dpr);
            });
            gl.viewport(0, 0, glCanvas.width, glCanvas.height);
            invalidate();
        }

        // ── 카메라 ──
        function rigAt(k, portrait) {
            const sigma = G.sigma0 + st.spin;
            const L = add(scl(G.r, Math.cos(sigma)), scl(G.u, Math.sin(sigma)));
            const P = add(scl(G.u, -Math.cos(sigma)), scl(G.r, Math.sin(sigma)));
            const f0 = G.cd;
            const f1 = norm(scl(add(scl(L, Math.cos(ELEVATION)), scl(P, Math.sin(ELEVATION))), -1));
            const axis = norm(cross(f0, f1));
            const theta = Math.acos(clamp(dot(f0, f1), -1, 1));
            const sinT = Math.sin(theta) || 1;
            // 시선: 지구 방향 → 옆 방향의 구면 보간(k > 1 은 같은 원호를 연장)
            const f = norm(add(scl(f0, Math.sin((1 - k) * theta) / sinT), scl(f1, Math.sin(k * theta) / sinT)));
            const right0 = cross(f0, axis), right1 = cross(f1, axis);
            const rho0 = Math.atan2(dot(G.u, right0), dot(G.u, axis));
            const rho1 = portrait ? Math.atan2(dot(G.cd, right1), dot(G.cd, axis)) : 0;
            const delta = wrapAngle(rho1 - rho0);
            const rollT = smooth((Math.min(k, 1) - 0.1) / 0.9);
            const rho = rho0 + delta * rollT;
            const rightK = cross(f, axis);
            const up = add(scl(axis, Math.cos(rho)), scl(rightK, Math.sin(rho)));
            return { f, up };
        }

        function camera() {
            const aspect = W / H;
            const portrait = aspect < 0.95;
            const s = smooth(Math.min(st.k, 1));
            const g = mix(1, G.exag, s);
            const fit = G.fitPts.map((p) => warp(p, G.cd, g));
            const rig = rigAt(st.k, portrait);
            const fovE = clamp(2 * Math.atan(Math.max(G.ty, G.tx / aspect) * 1.25 + 0.02), 0.12, 2.1);
            const fov = mix(fovE, FOV_SIDE, s);
            const target = mixv(scl(G.cd, G.D0), scl(G.cd, G.maxA / 2), s);
            // 별과 지구가 모두 화면 안에 들어오는 거리를 반복해서 맞춘다
            const limX = 0.78, limY = portrait ? 0.62 : 0.68;
            let R = Math.max(G.D0, G.maxA * 1.5);
            for (let it = 0; it < 5; it++) {
                const eye = sub(target, scl(rig.f, R));
                const m = mul(perspective(fov, aspect, Math.max(0.002, R * 0.003), R * 30 + G.maxA * 4), viewMatrix(eye, rig.f, rig.up));
                let mx = 0, my = 0;
                fit.forEach((p) => {
                    const q = toNDC(m, p);
                    if (q) { mx = Math.max(mx, Math.abs(q[0])); my = Math.max(my, Math.abs(q[1])); }
                });
                R *= clamp(Math.max(mx / limX, my / limY), 0.3, 3);
            }
            R = mix(G.D0, R, s);
            const eye = sub(target, scl(rig.f, R));
            const mvp = mul(perspective(fov, aspect, Math.max(0.002, R * 0.003), R * 30 + G.maxA * 4), viewMatrix(eye, rig.f, rig.up));
            return { mvp, eye, s, portrait, g };
        }

        // ── 그리기 ──
        function setUniforms(prog, cam, extra) {
            gl.useProgram(prog.p);
            const u = prog.uni;
            if (u.u_mvp) gl.uniformMatrix4fv(u.u_mvp, false, new Float32Array(cam.mvp));
            if (u.u_dpr) gl.uniform1f(u.u_dpr, dpr);
            if (u.u_maxPoint) gl.uniform1f(u.u_maxPoint, maxPoint);
            if (u.u_vp) gl.uniform2f(u.u_vp, glCanvas.width, glCanvas.height);
            if (u.u_alpha) gl.uniform1f(u.u_alpha, extra.alpha == null ? 1 : extra.alpha);
            if (u.u_half) gl.uniform1f(u.u_half, extra.half || 1);
            if (u.u_glow) gl.uniform1f(u.u_glow, extra.glow ? 1 : 0);
            if (u.u_cd) gl.uniform3fv(u.u_cd, G.cd);
            if (u.u_g) gl.uniform1f(u.u_g, cam.g);
        }

        function render(now) {
            if (st.anim) {
                const t = clamp((now - st.anim.start) / st.anim.dur, 0, 1);
                st.k = mix(st.anim.from, st.anim.to, ease(t));
                if (t >= 1) st.anim = null;
            }
            const cam = camera();
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);

            const L = programs.line, P = programs.point;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            setUniforms(L, cam, { alpha: cam.s * 0.16, half: 0.5 * dpr });
            layers.sight.draw();
            setUniforms(L, cam, { alpha: cam.s * 0.5, half: 0.5 * dpr });
            layers.axis.draw();
            gl.blendFunc(gl.ONE, gl.ONE);
            // 옆모습일수록 선이 촘촘히 겹치므로 글로우를 줄이고 선을 가늘게 해 번짐을 막는다
            setUniforms(L, cam, { alpha: mix(1, 0.4, cam.s), half: mix(9, 6, cam.s) * dpr, glow: true });
            layers.glow.draw();
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            setUniforms(L, cam, { alpha: mix(1, 0.85, cam.s), half: mix(0.8, 0.62, cam.s) * dpr });
            layers.core.draw();
            gl.blendFunc(gl.ONE, gl.ONE);
            setUniforms(P, cam, { alpha: 1 });
            layers.stars.draw();
            setUniforms(P, cam, { alpha: Math.max(0, (cam.s - 0.15) / 0.85) });
            layers.marks.draw();

            drawOverlay(cam);
            reportView();
            return !!st.anim;
        }

        function drawLabel(text, x, y, o) {
            ctx.save();
            ctx.globalAlpha = clamp(o.alpha == null ? 1 : o.alpha, 0, 1);
            ctx.font = `${o.weight || 650} ${o.size || 12}px ${FONT}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = 'rgba(3, 10, 18, 0.85)';
            ctx.strokeText(text, x, y);
            ctx.fillStyle = o.color;
            ctx.fillText(text, x, y);
            ctx.restore();
        }

        // 우선순위 순으로 놓고, 겹치면 건너뛰며, 오른쪽이 넘치면 점의 왼쪽으로 뒤집는다
        function placeLabels(items) {
            const placed = [];
            items.forEach((it) => {
                const size = it.size || 12;
                ctx.font = `${it.weight || 650} ${size}px ${FONT}`;
                const w = ctx.measureText(it.text).width;
                const h = size + 6;
                let left;
                if (it.center) left = it.x - w / 2;
                else { left = it.x + 9; if (left + w > W - 6) left = it.x - 9 - w; }
                left = clamp(left, 6, Math.max(6, W - 6 - w));
                const top = clamp(it.y - h / 2, 2, Math.max(2, H - h - 2));
                const box = [left - 3, top, w + 6, h];
                const hit = placed.some((b) => !(box[0] > b[0] + b[2] || box[0] + box[2] < b[0] || box[1] > b[1] + b[3] || box[1] + box[3] < b[1]));
                if (hit && !it.force) return;
                placed.push(box);
                drawLabel(it.text, left, top + h / 2, it);
            });
        }

        function drawOverlay(cam) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);
            screenPts = G.pos.map((p) => toScreen(cam.mvp, warp(p, G.cd, cam.g), W, H));
            const side = cam.s > 0.35;
            const showDist = clamp((cam.s - 0.35) / 0.65, 0, 1);
            const items = [];
            const starItem = (i, color, fallback, force) => {
                const p = screenPts[i];
                if (!p) return;
                const name = HANGUL.test(G.S[i][5]) || i === st.selected ? G.S[i][5] : fallback || G.S[i][5];
                const text = side ? `${name} · ${lyText(G.S[i][2], G.est[i])}` : name;
                items.push({ text, x: p[0], y: p[1] - 9, color, size: 12, alpha: 0.97, force });
            };
            // 고리 표시: 가장 가까운 별(초록)·가장 먼 별(금색)·선택한 별(흰색)
            const ring = (i, color, radius) => {
                const p = screenPts[i];
                if (!p) return;
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            };
            if (st.selected >= 0) { starItem(st.selected, 'rgba(255,255,255,0.98)', null, true); ring(st.selected, 'rgba(255,255,255,0.9)', 11); }
            if (side) {
                if (G.farI !== st.selected) starItem(G.farI, 'rgba(255,209,102,0.98)', '가장 먼 별');
                if (G.nearI !== st.selected) starItem(G.nearI, 'rgba(145,221,169,0.98)', '가장 가까운 별');
                ctx.globalAlpha = showDist;
                ring(G.farI, 'rgba(255,209,102,0.75)', 10);
                ring(G.nearI, 'rgba(145,221,169,0.75)', 10);
                ctx.globalAlpha = 1;
                const earth = toScreen(cam.mvp, [0, 0, 0], W, H);
                if (earth) items.push({ text: '지구', x: earth[0], y: earth[1] + 16, center: true, color: 'rgba(143,194,255,0.98)', weight: 750, alpha: showDist });
            }
            G.named.filter((i) => i !== st.selected).slice(0, side ? 5 : 7).forEach((i) => starItem(i, 'rgba(255,249,238,0.92)'));
            if (side) {
                G.ticks.forEach((t) => {
                    const p = toScreen(cam.mvp, scl(G.cd, t / UNIT), W, H);
                    if (p) items.push({ text: `${t.toLocaleString('ko-KR')}광년`, x: p[0], y: p[1] + 14, center: true, color: 'rgba(182,195,198,0.9)', size: 10.5, weight: 500, alpha: showDist * 0.85 });
                });
            }
            placeLabels(items);
        }

        // ── 상태 알림·재그리기 ──
        function reportView() {
            const view = st.k < 0.04 ? 'earth' : (st.k > 0.96 && st.k < 1.04 ? 'side' : null);
            if (view !== st.view) {
                st.view = view;
                if (options.onView) options.onView(view);
            }
        }
        function loop(now) {
            st.raf = 0;
            if (st.dead || !st.visible) return;
            st.dirty = false;
            const keep = render(now);
            if (keep || st.dirty) st.raf = requestAnimationFrame(loop);
        }
        function invalidate() {
            st.dirty = true;
            if (!st.raf && st.visible && !st.dead) st.raf = requestAnimationFrame(loop);
        }

        // ── 조작 ──
        function go(view, animate) {
            const to = view === 'side' ? 1 : 0;
            if (reduce || animate === false) { st.anim = null; st.k = to; invalidate(); return; }
            st.anim = { from: st.k, to, start: performance.now(), dur: clamp(Math.abs(to - st.k) * 1700, 500, 1800) };
            invalidate();
        }
        function setK(k) { st.anim = null; st.k = clamp(k, 0, K_MAX); invalidate(); }

        function hit(x, y, radius) {
            let best = -1, bestD = radius;
            screenPts.forEach((p, i) => {
                if (!p) return;
                const d = Math.hypot(p[0] - x, p[1] - y);
                if (d < bestD) { bestD = d; best = i; }
            });
            return best;
        }
        function select(i) {
            st.selected = i >= 0 && i < G.n ? i : -1;
            invalidate();
            if (options.onSelect) {
                options.onSelect(st.selected < 0 ? null : {
                    name: G.S[i][5], ly: G.lyAbs[i], est: G.est[i], mag: G.S[i][3], index: i
                });
            }
        }

        const pointers = new Map();
        let moved = 0, downAt = 0;
        const onDown = (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            try { glCanvas.setPointerCapture(e.pointerId); } catch (error) { /* 무시 */ }
            pointers.set(e.pointerId, [e.clientX, e.clientY]);
            moved = 0; downAt = performance.now();
            st.anim = null;
        };
        const onMove = (e) => {
            const prev = pointers.get(e.pointerId);
            if (!prev) return;
            const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
            pointers.set(e.pointerId, [e.clientX, e.clientY]);
            moved += Math.abs(dx) + Math.abs(dy);
            if (moved < 3) return;
            st.k = clamp(st.k + dx / (W * 0.55), 0, K_MAX);       // 좌우로 끌면 지구 시점 ↔ 옆모습
            if (e.pointerType === 'mouse') st.spin += dy * 0.01;    // 마우스는 세로로 끌어 축을 돌린다(터치의 세로 끌기는 스크롤)
            invalidate();
        };
        const onUp = (e) => {
            if (!pointers.has(e.pointerId)) return;
            pointers.delete(e.pointerId);
            if (e.type === 'pointerup' && moved < 6 && performance.now() - downAt < 600) {
                const rect = glCanvas.getBoundingClientRect();
                const i = hit(e.clientX - rect.left, e.clientY - rect.top, e.pointerType === 'mouse' ? 16 : 26);
                select(i === st.selected ? -1 : i);
            }
        };
        const onKey = (e) => {
            const step = e.shiftKey ? 0.25 : 0.1;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setK(st.k + step);
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setK(st.k - step);
            else if (e.key === 'Home') go('earth');
            else if (e.key === 'End') go('side');
            else if (e.key === 'Escape') select(-1);
            else return;
            e.preventDefault();
        };
        const onLost = (e) => { e.preventDefault(); fail(); };

        glCanvas.addEventListener('pointerdown', onDown);
        glCanvas.addEventListener('pointermove', onMove);
        glCanvas.addEventListener('pointerup', onUp);
        glCanvas.addEventListener('pointercancel', onUp);
        glCanvas.addEventListener('keydown', onKey);
        glCanvas.addEventListener('webglcontextlost', onLost);

        host.appendChild(glCanvas);
        host.appendChild(ovCanvas);

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        const intersection = new IntersectionObserver((entries) => {
            st.visible = entries[0].isIntersecting;
            if (st.visible) invalidate();
        }, { threshold: 0.05 });
        intersection.observe(host);
        resize();

        function destroy() {
            if (st.dead) return;
            st.dead = true;
            if (st.raf) cancelAnimationFrame(st.raf);
            resizeObserver.disconnect();
            intersection.disconnect();
            glCanvas.removeEventListener('webglcontextlost', onLost);
            try {
                Object.keys(layers).forEach((key) => layers[key].dispose());
                const lose = gl.getExtension('WEBGL_lose_context');
                if (lose) lose.loseContext();
            } catch (error) { /* 무시 */ }
            glCanvas.remove();
            ovCanvas.remove();
        }

        return {
            go, setK, select, destroy,
            screenOf: (i) => (screenPts[i] ? [screenPts[i][0], screenPts[i][1]] : null),
            summary: G.summary,
            getState: () => ({ k: st.k, spin: st.spin, selected: st.selected, view: st.view, visible: st.visible })
        };
    }

    window.Depth3D = { mount, format, version: 1 };
})();
