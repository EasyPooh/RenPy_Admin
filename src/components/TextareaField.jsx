import FormLabel from "./FormLabel";

const TextareaField = ({ label, placeholder, value, onChange, ...props }) => (
  <div className="w-full">
    <FormLabel label={label} />
    <textarea
      rows="5"
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-300 resize-none"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  </div>
);

export default TextareaField;
