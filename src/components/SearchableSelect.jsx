import React from "react";
import Select from "react-select";

// 1. เก็บชุดสไตล์สีม่วงที่คุณตั้งค่าไว้ทั้งหมด
const commonSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? "#a855f7" : "#e5e7eb",
    boxShadow: "none",
    "&:hover": {
      borderColor: state.isFocused ? "#a855f7" : "#d1d5db",
    },
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontFamily: "sans-serif",
    paddingTop: "1px",
    paddingBottom: "1px",
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    fontSize: "0.875rem",
    borderRadius: "0.5rem",
    zIndex: 50,
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999,
  }),
};

// 2. เก็บฟังก์ชันกรองคำค้นหา (Case-insensitive)
const defaultFilterOption = (option, rawInput) => {
  const labelText = option.label ? String(option.label).toLowerCase() : "";
  const searchInput = rawInput ? String(rawInput).toLowerCase() : "";
  return labelText.includes(searchInput);
};

// 3. ตัว Component หลักที่พร้อมให้ไฟล์อื่นดึงไปใช้
const SearchableSelect = (props) => {
  return (
    <Select
      isSearchable={true}
      isClearable={true}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      filterOption={defaultFilterOption}
      styles={commonSelectStyles}
      {...props} // พ่น Props อื่นๆ (options, value, onChange) ที่ส่งมาจากไฟล์ปลายทางเข้าตรงนี้
    />
  );
};

export default SearchableSelect;
