import { useState } from 'react';

export const useImageCompressor = () => {
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = (file, targetHeight = 1080) => {
    return new Promise((resolve, reject) => {
      // ตรวจสอบก่อนว่าใช่ไฟล์รูปภาพไหม ถ้าไม่ใช่ไม่ต้องบีบอัด
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      setIsCompressing(true);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // ถ้าความสูงของภาพไม่เกินเป้าหมาย ไม่ต้องย่อขนาด ให้ใช้ไฟล์เดิมได้เลย
          if (img.height <= targetHeight) {
            setIsCompressing(false);
            resolve(file);
            return;
          }

          // คำนวณอัตราส่วน (Aspect Ratio)
          const scaleFactor = targetHeight / img.height;
          const newWidth = img.width * scaleFactor;
          const newHeight = targetHeight;

          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setIsCompressing(false);
                reject(new Error('Canvas is empty'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              setIsCompressing(false);
              resolve(compressedFile);
            },
            file.type,
            0.85 // บีบอัดคุณภาพเหลือ 85% (รูปยังชัด แต่ไฟล์เล็กลงมาก)
          );
        };
      };
      reader.onerror = (error) => {
        setIsCompressing(false);
        reject(error);
      };
    });
  };

  return { compressImage, isCompressing };
};