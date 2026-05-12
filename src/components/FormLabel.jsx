const FormLabel = ({ label, required }) => (
  <label className="block text-slate-700 font-bold mb-2">
    {label} {required && <span className="text-red-500">*</span>}
  </label>
);

export default FormLabel;
