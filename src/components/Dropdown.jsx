const Dropdown = ({ isOpen, onToggle, buttonText, buttonClass = '', children, containerRef }) => {
  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={onToggle}
        className={buttonClass}
      >
        {buttonText}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownItem = ({ onClick, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${className}`}
    >
      {children}
    </button>
  )
}

export default Dropdown
