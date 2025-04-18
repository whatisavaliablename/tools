import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import JSZip from "jszip";
import FileUploader from "./FileUploader";

export default function PdfToPng() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [converting, setConverting] = useState(false);
    const [clearFiles, setClearFiles] = useState(false);

    const handleFilesUpload = async (files: File[]) => {
        if (files.length > 1) {
            alert("PDF to PNG 파일 변환은 하나씩만 가능합니다.");
            return;
        }
        setSelectedFiles(files);
        setUploadCompleted(true);
        setClearFiles(false);
    };

    const handleConvert = async () => {
        if (!uploadCompleted || selectedFiles.length === 0) return;
        setConverting(true);
        setUploadCompleted(false);

        const file = selectedFiles[0];
        const zip = new JSZip();

        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                try {
                    const pdfData = new Uint8Array(reader.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

                    const imagePromises = Array.from({ length: pdf.numPages }, async (_, i) => {
                        const page = await pdf.getPage(i + 1);
                        const viewport = page.getViewport({ scale: 2 });
                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d")!;
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({ canvasContext: context, viewport }).promise;

                        return new Promise<Blob | null>((resolve) => {
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    zip.file(`page-${i + 1}.png`, blob);
                                    resolve(blob);
                                } else {
                                    resolve(null);
                                }
                            }, "image/png");
                        });
                    });

                    await Promise.all(imagePromises);

                    const zipBlob = await zip.generateAsync({ type: "blob" });
                    const zipUrl = URL.createObjectURL(zipBlob);
                    const link = document.createElement("a");
                    link.href = zipUrl;
                    link.download = "converted_images_png.zip";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(zipUrl);

                    setConverting(false);
                    setClearFiles(true);

                    // ✅ 로그 전송
                    await fetch("/backend/log.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            total_visit: 0,
                            use_pdftojpg: 0,
                            use_pdftopng: 1,
                            use_imgtopdf: 0,
                            use_changeimg: 0,
                            use_imgresizer: 0,
                        }),
                    }).then(res => res.json())
                    .then(data => console.log("🔁 로그 응답:", data))
                    .catch(err => console.error("❌ 요청 실패:", err));

                } catch (error) {
                    console.error("PDF 변환 오류:", error);
                    alert("PDF 변환 중 오류가 발생했습니다.");
                    setConverting(false);
                    setClearFiles(true);
                }
            };
        } catch (error) {
            console.error("파일 읽기 오류:", error);
            alert("파일을 읽는 중 오류가 발생했습니다.");
            setConverting(false);
            setClearFiles(true);
        }
    };

    return (
        <div>
            <FileUploader
                onFilesUpload={handleFilesUpload}
                accept="application/pdf"
                clearFiles={clearFiles}
                multiple={false}
                isResizer={false}
            />
            {converting && <p style={{margin:"0",backgroundColor: "#0fb77e",
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
                    padding: "9px 20px 11px",
                    border : "2px solid #0fb77e",
                    borderRadius: "0 0 6px 6px",
                    cursor: "pointer",
                    display:"block",
                    width: "100%",
                    height: "50px",
                    fontSize:"16px"
                }} onClick={handleConvert} >변환하기</button>
            )}
        </div>
    );
}
