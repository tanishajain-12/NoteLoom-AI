function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white border border-[#e4e2e1] shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
