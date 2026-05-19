'use client'

export default function EarthBlobs() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Fossil amber / gold ore — top left */}
      <div style={{
        position: 'absolute',
        width: '680px',
        height: '580px',
        top: '-170px',
        left: '-190px',
        background: '#f59e0b',
        opacity: 0.055,
        filter: 'blur(95px)',
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        animation: 'blob-1 28s ease-in-out infinite',
      }} />

      {/* Malachite / emerald crystal — top right */}
      <div style={{
        position: 'absolute',
        width: '520px',
        height: '560px',
        top: '-110px',
        right: '-160px',
        background: '#10b981',
        opacity: 0.042,
        filter: 'blur(85px)',
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        animation: 'blob-2 36s ease-in-out infinite',
      }} />

      {/* Amethyst geode — bottom right */}
      <div style={{
        position: 'absolute',
        width: '550px',
        height: '480px',
        bottom: '-130px',
        right: '-120px',
        background: '#a855f7',
        opacity: 0.048,
        filter: 'blur(90px)',
        borderRadius: '50% 50% 40% 60% / 60% 40% 50% 50%',
        animation: 'blob-3 32s ease-in-out infinite',
      }} />

      {/* Underground spring / turquoise — center */}
      <div style={{
        position: 'absolute',
        width: '360px',
        height: '340px',
        top: '36%',
        left: '37%',
        background: '#0891b2',
        opacity: 0.030,
        filter: 'blur(72px)',
        borderRadius: '70% 30% 40% 60% / 50% 60% 40% 50%',
        animation: 'blob-4 44s ease-in-out infinite',
      }} />

      {/* Iron oxide / cinnabar sediment — bottom left */}
      <div style={{
        position: 'absolute',
        width: '440px',
        height: '400px',
        bottom: '-100px',
        left: '-120px',
        background: '#c2410c',
        opacity: 0.040,
        filter: 'blur(78px)',
        borderRadius: '30% 70% 60% 40% / 50% 40% 60% 50%',
        animation: 'blob-1 34s ease-in-out infinite reverse',
      }} />

      {/* Quartz vein / pale crystal — center upper right */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '270px',
        top: '20%',
        right: '20%',
        background: '#fcd34d',
        opacity: 0.020,
        filter: 'blur(62px)',
        borderRadius: '55% 45% 35% 65% / 45% 55% 45% 55%',
        animation: 'blob-3 40s ease-in-out infinite reverse',
      }} />

      {/* Deep sapphire / lapis lazuli — left mid */}
      <div style={{
        position: 'absolute',
        width: '280px',
        height: '320px',
        top: '50%',
        left: '-60px',
        background: '#3b82f6',
        opacity: 0.025,
        filter: 'blur(65px)',
        borderRadius: '45% 55% 50% 50% / 60% 40% 55% 45%',
        animation: 'blob-2 38s ease-in-out infinite reverse',
      }} />
    </div>
  )
}
