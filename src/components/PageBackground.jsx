const BG = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80'

export default function PageBackground({ image }) {
  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${image || BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center 60%',
        filter: 'brightness(0.7)'
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.4)' }} />
    </>
  )
}