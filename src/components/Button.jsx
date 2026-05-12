const Button = ({ children, variant = "primary", onClick, icon: Icon }) => {
  // กำหนดสไตล์ตาม Variant
  const baseStyles =
    "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95";

  const variants = {
    primary:
      "bg-[#B197FC] hover:bg-[#9677fa] text-white shadow-md shadow-purple-100",
    ghost: "bg-transparent hover:bg-gray-50 text-gray-500",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
