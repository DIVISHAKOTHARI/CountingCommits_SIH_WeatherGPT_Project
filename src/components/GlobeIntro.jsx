import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowRight, User, Lock, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function GlobeIntro({ onEnterPlatform }) {
  const mountRef = useRef(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 3D Scene Setup - Realistic Earth Globe
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // Base fallback texture canvas in case offline/loading delay
    const createFallbackCanvas = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(0, 0, 1024, 512);
      return new THREE.CanvasTexture(canvas);
    };

    // Earth Mesh
    const globeGeometry = new THREE.SphereGeometry(2.3, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: createFallbackCanvas(),
      shininess: 15,
      specular: new THREE.Color(0x224466),
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);

    const isDesktop = window.innerWidth >= 768;
    globeMesh.position.x = isDesktop ? 1.3 : 0;
    scene.add(globeMesh);

    // Load High-Res Realistic Earth Texture
    const earthTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    const earthBumpUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

    textureLoader.load(
      earthTextureUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        globeMaterial.map = texture;
        globeMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        // Backup CDN if primary fails
        textureLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg', (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          globeMaterial.map = tex;
          globeMaterial.needsUpdate = true;
        });
      }
    );

    textureLoader.load(earthBumpUrl, (bumpTex) => {
      globeMaterial.bumpMap = bumpTex;
      globeMaterial.bumpScale = 0.04;
      globeMaterial.needsUpdate = true;
    });

    // Cloud Layer
    const cloudGeometry = new THREE.SphereGeometry(2.33, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.position.x = globeMesh.position.x;
    scene.add(cloudMesh);

    // Load Cloud Texture
    const cloudTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-clouds.png';
    textureLoader.load(
      cloudTextureUrl,
      (cloudTex) => {
        cloudMaterial.map = cloudTex;
        cloudMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        textureLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_2048.png', (cTex) => {
          cloudMaterial.map = cTex;
          cloudMaterial.needsUpdate = true;
        });
      }
    );

    // Atmosphere Fresnel Glow Shader
    const atmosphereGeometry = new THREE.SphereGeometry(2.44, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.22, 0.65, 0.98, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMesh.position.x = globeMesh.position.x;
    scene.add(atmosphereMesh);

    // Stars Particles
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = (Math.random() - 0.5) * 120;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.12, transparent: true, opacity: 0.75 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    globeMesh.rotation.y = -Math.PI * 0.45;
    globeMesh.rotation.x = 0.15;
    cloudMesh.rotation.y = -Math.PI * 0.45;

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      globeMesh.rotation.y += 0.0012;
      cloudMesh.rotation.y += 0.0016; // Clouds rotate slightly faster
      atmosphereMesh.rotation.y += 0.0012;
      starField.rotation.y -= 0.0003;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      const posX = newW >= 768 ? 1.3 : 0;
      globeMesh.position.x = posX;
      cloudMesh.position.x = posX;
      atmosphereMesh.position.x = posX;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'signup' && password && confirmPassword && password !== confirmPassword) {
      alert("Passwords do not match. Please verify your password.");
      return;
    }
    onEnterPlatform();
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-hidden select-none font-sans text-white flex items-center justify-between">
      
      {/* 3D Canvas Mount - Background */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-8 pointer-events-none">
        
        {/* Left Side: Authentication Panel (Login / Sign Up) */}
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-sky-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-sky-950/80 pointer-events-auto transition-all">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Weather<span className="text-sky-400">GPT</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login' ? 'Welcome back! Log in to access your platform.' : 'Create an account to explore live satellite weather.'}
              </p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username or Email</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-sky-400 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Confirm Password (Only for Sign Up) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-sky-400 absolute left-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{authMode === 'login' ? 'Log In to WeatherGPT' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or continue with</span></div>
          </div>

          {/* Sign Up / Sign In with Google Option */}
          <button
            type="button"
            onClick={() => onEnterPlatform()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
          </button>

          {/* Guest Direct Entry Option */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onEnterPlatform()}
              className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
            >
              Continue as Guest & Explore WeatherGPT →
            </button>
          </div>

        </div>

        {/* Right Side Info (Over Globe) */}
        <div className="hidden lg:block max-w-sm text-right pointer-events-none pr-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">
            Real-Time Satellite Telemetry
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1 mb-2">
            3D Earth Radar & Climate Intelligence
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrating INSAT-3DR cloud sensing, Sentinel-5P AQI telemetry, and RainViewer precipitation overlays.
          </p>
        </div>

      </div>

      {/* Bottom Atmosphere Glow */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-sky-500/20 blur-[120px] pointer-events-none rounded-full"></div>
    </div>
  );
}
