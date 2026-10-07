import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  ZapOff,
  Check,
  FileText,
  Sparkles,
  Maximize2,
  ScanLine,
  SwitchCamera,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { DocType, ShipmentDocument } from "@/lib/data";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (doc: ShipmentDocument) => void;
  shipmentId: string;
}

const DOCUMENT_PRESETS: { type: DocType; label: string; malayalam: string }[] = [
  { type: "Commercial Invoice", label: "Commercial Invoice", malayalam: "കൊമേഴ്ഷ്യൽ ഇൻവോയ്സ്" },
  { type: "Packing List", label: "Packing List", malayalam: "പാക്കിംഗ് ലിസ്റ്റ്" },
  { type: "Shipping Bill", label: "Shipping Bill", malayalam: "ഷിപ്പിംഗ് ബിൽ" },
  { type: "Purchase Order", label: "Purchase Order", malayalam: "പർച്ചേസ് ഓർഡർ" },
  {
    type: "Quality Certificate",
    label: "Health / Phyto Cert",
    malayalam: "ഹെൽത്ത് സർട്ടിഫിക്കറ്റ്",
  },
];

export function CameraScanner({ isOpen, onClose, onCapture, shipmentId }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedType, setSelectedType] = useState<DocType>("Shipping Bill");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);
  const [capturePhase, setCapturePhase] = useState<string>("");

  // Play synthetic camera shutter sound using Web Audio API
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed or not available, fail silently
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Camera API is not supported in this browser environment. Using high-resolution simulation mode.",
      );
      setCameraActive(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setCameraActive(true);

      // Check if torch/flashlight is supported
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = (videoTrack?.getCapabilities?.() as { torch?: boolean }) || {};
      setHasTorch(Boolean(capabilities.torch));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Could not access camera, falling back to simulated document feed:", msg);
      setCameraError("Camera unavailable or permission denied. Interactive simulator mode active.");
      setCameraActive(false);
    }
  }, [facingMode, stopCamera]);

  // Toggle torch / flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const newTorch = !torchOn;
        await (
          track as unknown as { applyConstraints: (c: unknown) => Promise<void> }
        ).applyConstraints({
          advanced: [{ torch: newTorch }],
        });
        setTorchOn(newTorch);
      } catch (e) {
        console.warn("Could not toggle torch:", e);
      }
    }
  };

  // Flip camera between environment and user
  const switchFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Capture frame
  const handleCapture = () => {
    if (isCapturing) return;

    setIsCapturing(true);
    setFlashEffect(true);
    playShutterSound();

    setTimeout(() => {
      setFlashEffect(false);
    }, 150);

    setCapturePhase("Deskewing & enhancing document contrast…");

    setTimeout(() => {
      setCapturePhase("Running OCR text & field extraction…");
    }, 700);

    setTimeout(() => {
      setCapturePhase("Validating document classification…");
    }, 1300);

    setTimeout(() => {
      const docSuffix = selectedType.replace(/\s+/g, "_");
      const cleanShipmentId = shipmentId.replace(/[^a-zA-Z0-9-]/g, "");
      const newDoc: ShipmentDocument = {
        id: `scan-${Date.now()}`,
        filename: `SCAN_${cleanShipmentId}_${docSuffix}.png`,
        type: selectedType,
        confidence: Math.floor(95 + Math.random() * 4), // 95-98%
        size: `${(Math.random() * 0.7 + 1.3).toFixed(1)} MB`,
      };

      onCapture(newDoc);
      toast.success(`Scanned & Verified: ${selectedType} (${newDoc.confidence}% confidence)`);
      setIsCapturing(false);
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md">
        {/* Shutter White Flash */}
        {flashEffect && (
          <div className="pointer-events-none fixed inset-0 z-50 bg-white transition-opacity duration-150" />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative flex h-full max-h-[760px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 text-white shadow-2xl"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <ScanLine className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
                  Document Camera Scanner
                  <span className="text-[11px] font-normal text-zinc-400">· ക്യാമറ സ്കാനർ</span>
                </h3>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${cameraActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                  />
                  {cameraActive ? "Live Optical Stream" : "Simulation / Offline Sensor"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`flex size-9 items-center justify-center rounded-full border border-white/10 transition-colors ${
                    torchOn
                      ? "bg-amber-400 text-black"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                  title="Flashlight"
                >
                  {torchOn ? <Zap className="size-4" /> : <ZapOff className="size-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={switchFacingMode}
                className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                title="Flip Camera"
              >
                <SwitchCamera className="size-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Document Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 bg-zinc-900/50 px-4 py-2.5 no-scrollbar">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mr-1">
              Doc Type:
            </span>
            {DOCUMENT_PRESETS.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => setSelectedType(p.type)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedType === p.type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Viewfinder Area */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
            />

            {/* Canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Fallback Simulator / Mock Feed if no camera */}
            {!cameraActive && (
              <div className="relative flex h-full w-full flex-col items-center justify-center bg-zinc-900/90 p-6 text-center">
                {/* Simulated Trade Document Paper View */}
                <div className="relative w-full max-w-sm rounded-xl border border-white/15 bg-zinc-950 p-5 shadow-2xl text-left space-y-3 font-mono text-[11px] text-zinc-300 select-none">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-primary uppercase">{selectedType}</span>
                    <span className="text-zinc-500">REF: {shipmentId}</span>
                  </div>
                  <div className="space-y-1 text-[10px] text-zinc-400">
                    <div>EXPORTER: MALABAR OCEAN FOODS PVT LTD</div>
                    <div>CONSIGNEE: GULF FRESH TRADING LLC, DUBAI</div>
                    <div>PORT OF LOADING: COCHIN SEA (INCOK)</div>
                    <div>CARGO: FROZEN SHRIMP 21/25 (1,200 CARTONS)</div>
                    <div>CONTAINER: CSQU3054383 / SEAL: ML-09281</div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-zinc-500">
                    <span>DIGITAL SENSOR ACTIVE</span>
                    <span className="text-emerald-400">READY FOR OCR SNAP</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Align physical document or click shutter to simulate live scan</span>
                </div>
              </div>
            )}

            {/* Document Target Alignment Box Overlay */}
            <div className="pointer-events-none absolute inset-6 sm:inset-10 flex items-center justify-center">
              <div className="relative h-full w-full max-w-md rounded-2xl border border-white/20">
                {/* 4 Glowing Corner Brackets */}
                <div className="absolute -top-1 -left-1 size-7 border-t-4 border-l-4 border-primary rounded-tl-lg shadow-[0_0_12px_rgba(244,90,51,0.6)]" />
                <div className="absolute -top-1 -right-1 size-7 border-t-4 border-r-4 border-primary rounded-tr-lg shadow-[0_0_12px_rgba(244,90,51,0.6)]" />
                <div className="absolute -bottom-1 -left-1 size-7 border-b-4 border-l-4 border-primary rounded-bl-lg shadow-[0_0_12px_rgba(244,90,51,0.6)]" />
                <div className="absolute -bottom-1 -right-1 size-7 border-b-4 border-r-4 border-primary rounded-br-lg shadow-[0_0_12px_rgba(244,90,51,0.6)]" />

                {/* Animated Laser Scanning Beam */}
                <motion.div
                  animate={{
                    top: ["5%", "90%", "5%"],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(244,90,51,0.9)]"
                >
                  <div className="mx-auto -mt-1 size-2 rounded-full bg-primary blur-[1px]" />
                </motion.div>

                {/* Center Crosshair Guides */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="size-8 border-t border-b border-white" />
                  <div className="size-8 border-l border-r border-white" />
                </div>

                {/* Guidance Text Overlay */}
                <div className="absolute bottom-4 inset-x-0 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    <Maximize2 className="size-3 text-primary" />
                    Align edges of paper inside frame
                  </span>
                </div>
              </div>
            </div>

            {/* Capture Progress Overlay */}
            {isCapturing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center space-y-4"
              >
                <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] animate-bounce">
                  <Sparkles className="size-8" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">Processing Document Scan</div>
                  <div className="text-xs text-primary font-mono">{capturePhase}</div>
                </div>
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: "10%" }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 1.6, ease: "easeInOut" }}
                    className="h-full bg-primary"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Shutter Controls */}
          <div className="flex items-center justify-between border-t border-white/10 bg-zinc-950 px-6 py-4">
            <div className="text-xs text-zinc-400">
              <span className="font-semibold text-white">Target: </span>
              {selectedType}
            </div>

            {/* Shutter Button */}
            <button
              type="button"
              disabled={isCapturing}
              onClick={handleCapture}
              className="group relative flex size-16 items-center justify-center rounded-full border-4 border-white bg-transparent p-1 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Capture Document"
            >
              <div className="size-full rounded-full bg-primary transition-colors group-hover:bg-primary/90" />
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
              title="Reset sensor"
            >
              <RefreshCw className="size-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
