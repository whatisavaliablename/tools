import { useState } from "react";
import FileUploader from "./FileUploader";
import JSZip from "jszip";

export default function ImgResizer() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [converting, setConverting] = useState(false);
  const [clearFiles, setClearFiles] = useState(false);
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  const [originalWidth, setOriginalWidth] = useState<number | null>(null);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);
  const [keepRatio, setKeepRatio] = useState(false);

  const handleFilesUpload = async (files: File[]) => {
    const validFiles = files.filter(file =>
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg") ||
      file.name.toLowerCase().endsWith(".png")
    );

    if (validFiles.length !== files.length) {
      alert("JPG 또는 PNG 파일만 업로드 가능합니다.");
      return;
    }

    setSelectedFiles(validFiles);
    setUploadCompleted(true);
    setClearFiles(false);

    // 첫 번째 이미지 기준 비율 저장
    const img = new Image();
    const url = URL.createObjectURL(validFiles[0]);
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleWidthChange = (value: string) => {
    const newWidth = parseInt(value);
    if (keepRatio && originalWidth && originalHeight) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(newWidth * ratio));
    }
    setWidth(newWidth);
  };

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value);
    if (keepRatio && originalWidth && originalHeight) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(newHeight * ratio));
    }
    setHeight(newHeight);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0 || width <= 0 || height <= 0) {
      alert("유효한 해상도를 입력해주세요.");
      return;
    }

    setConverting(true);
    const zip = new JSZip();

    for (const file of selectedFiles) {
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.name.toLowerCase().endsWith(".png");
          const format = isPng ? "image/png" : "image/jpeg";
          const ext = isPng ? "png" : "jpg";

          canvas.toBlob((blob) => {
            if (blob) {
              const newName = file.name.replace(/\.[^.]+$/, `_${width}x${height}.${ext}`);
              zip.file(newName, blob);
            }
            resolve();
          }, format);
        };
        img.src = url;
      });

      URL.revokeObjectURL(url);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `resized_images_${width}x${height}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);

    setConverting(false);
    setClearFiles(true);
    setUploadCompleted(false);

    await fetch("/backend/log.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_visit: 0,
          use_pdftojpg: 0,
          use_pdftopng: 0,
          use_imgtopdf: 0,
          use_changeimg: 0,
          use_imgresizer: 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("🔁 로그 응답:", data))
        .catch((err) => console.error("❌ 요청 실패:", err));
  };

  return (
    <div>
      <FileUploader
        onFilesUpload={handleFilesUpload}
        accept="image/jpeg, image/png"
        clearFiles={clearFiles}
        multiple={true}
      />

      <div style={{ marginTop: "10px" }}>
        <label>가로(px): </label>
        <input
          type="number"
          value={width}
          onChange={(e) => handleWidthChange(e.target.value)}
          style={{ width: "80px", marginRight: "20px" }}
        />
        <label>세로(px): </label>
        <input
          type="number"
          value={height}
          onChange={(e) => handleHeightChange(e.target.value)}
          style={{ width: "80px" }}
        />
      </div>
      <label style={{ marginLeft: "20px", display:"block" }}>
        <input
        type="checkbox"
        checked={keepRatio}
        onChange={(e) => {
            setKeepRatio(e.target.checked);
            if (e.target.checked && originalWidth && originalHeight) {
            setWidth(originalWidth);
            setHeight(originalHeight);
            }
        }}
        />{" "}
        원본 비율 유지
    </label>

      {converting && <p>🔄 리사이징 중...</p>}

      {uploadCompleted && !converting && (
        <button
          onClick={handleConvert}
          style={{ marginTop: "30px" }}
        >
          리사이징해서 저장하기
        </button>
      )}
    </div>
  );
}
