import { useState } from "react";
import FileUploader from "./FileUploader";
import JSZip from "jszip";

export default function ChangeImg() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [converting, setConverting] = useState(false);
    const [clearFiles, setClearFiles] = useState(false);

    const handleFilesUpload = async (files: File[]) => {
        const validFiles = files.filter(file => {
            const name = file.name.toLowerCase();
            return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png");
        });

        if (validFiles.length !== files.length) {
            alert("JPG 또는 PNG 파일만 업로드 가능합니다.");
            setClearFiles(true);
            return;
        }

        setSelectedFiles(validFiles);
        setUploadCompleted(true);
        setClearFiles(false);
    };

    const handleConvert = async () => {
        setConverting(true);
        const zip = new JSZip();

        for (const file of selectedFiles) {
            const img = new Image();
            const url = URL.createObjectURL(file);

            await new Promise<void>((resolve) => {
                img.onload = async () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0);

                    const targetFormat = file.name.toLowerCase().endsWith(".png") ? "image/jpeg" : "image/png";
                    const targetExt = targetFormat === "image/jpeg" ? "jpg" : "png";

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFileName = file.name.replace(/\.[^.]+$/, `.${targetExt}`);
                            zip.file(newFileName, blob);
                        }
                        resolve();
                    }, targetFormat);
                };
                img.src = url;
            });

            URL.revokeObjectURL(url);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = "converted_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);

        setConverting(false);
        setClearFiles(true);
        setUploadCompleted(false);

        // ✅ 로그 전송
        await fetch("/backend/log.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                total_visit: 0,
                use_pdftojpg: 0,
                use_pdftopng: 0,
                use_imgtopdf: 0,
                use_changeimg: 1,
                use_imgresizer: 0,
            }),
        }).then(res => res.json())
        .then(data => console.log("🔁 로그 응답:", data))
        .catch(err => console.error("❌ 요청 실패:", err));
    };

    return (
        <div>
            <FileUploader
                onFilesUpload={handleFilesUpload}
                accept="image/jpeg, image/png"
                clearFiles={clearFiles}
                multiple={true}
                isResizer={false}
            />
            {converting && <p
                style={{margin:"0",backgroundColor: "#0fb77e",
                color: "white",
                padding: "10px 20px",
                border : "2px solid #0fb77e",
                borderRadius: "0 0 6px 6px",
                display:"block",
                fontSize:"16px",
                height:"28px"
            }}>🔄 변환 중...</p>}
            {uploadCompleted && !converting && (
                <button style={{backgroundColor: "#0fb77e",
                    color: "white",
                    padding: "10px 20px",
                    border : "2px solid #0fb77e",
                    borderRadius: "0 0 6px 6px",
                    cursor: "pointer",
                    display:"block",
                    width: "100%",
                    height: "50px",
                    fontSize:"16px"
                }} onClick={handleConvert}>변환하기</button>
            )}
        </div>
    );
}
