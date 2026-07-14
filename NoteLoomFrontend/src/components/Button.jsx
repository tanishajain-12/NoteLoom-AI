import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-[#8a4d4e] text-white hover:bg-[#6e3637] shadow-sm shadow-[#8a4d4e]/20',
  secondary: 'bg-[#d9e4ec] text-[#121d23] hover:bg-[#bdc8d0]',
  outline: 'border border-[#857372] text-[#1b1c1c] hover:bg-[#f0eded]',
  ghost: 'text-[#1b1c1c] hover:bg-[#f0eded]',
  danger: 'bg-[#ba1a1a] text-white hover:bg-[#93000a]',
  soft: 'bg-[#ffdad9] text-[#592628] hover:bg-[#ffb3b3]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export default Button
