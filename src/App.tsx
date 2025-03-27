import PdfToJpg from "./components/PdfToJpg";
import PdfToPng from "./components/PdfToPng";
import JpgPngToPdf from "./components/JpgPngToPdf";
import ChangeImg from "./components/ChangeImg";
import ImgResizer from "./components/ImgResizer";

import {useEffect} from "react";

export default function App() {

    const sendLog = async () => {
        try {
            await fetch("/backend/log.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    total: 1,
                    usepdftojpg: 0,
                    usejpgtopdf: 0,
                }),
            });
            // 세션에 로그 기록 여부 저장
            sessionStorage.setItem("logSent", "true");
        } catch (error) {
            console.error("로그 저장 실패:", error);
        }
    };

    useEffect(() => {
        // 세션 스토리지에서 이전에 기록했는지 확인
        if (!sessionStorage.getItem("logSent")) {
            sendLog();
        }
    }, []); // 빈 deps 배열을 유지하여 최초 마운트 시만 실행

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>📄 현대백화점 Tools</h1>
            <p>PDF문서와 이미지 문서를 안전하고 편하게 변환하세요</p>
            <div style={{display:"flex", justifyContent:"space-around"}}>
                <div style={{ display: "flex", flexDirection : "column" ,justifyContent: "center", gap: "50px", marginTop: "20px" }}>
                    <div>
                        <h3>PDF → JPG 변환</h3>
                        <PdfToJpg />
                    </div>
                    <div>
                        <h3>PDF → PNG 변환</h3>
                        <PdfToPng />
                    </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-start", marginTop:"20px"}}>
                    <h3>이미지<span style={{fontSize:"12px"}}>(jpg,png)</span> → PDF변환</h3>
                    <JpgPngToPdf />
                </div>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-start", marginTop:"20px"}}>
                    <h3>이미지 확장자<span style={{fontSize:"12px"}}>(jpg ↔ png)</span> 변환</h3>
                    <ChangeImg />
                </div>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-start", marginTop:"20px"}}>
                    <h3>이미지 사이즈 조정 <span style={{fontSize:"12px"}}>(jpg, png)</span></h3>
                    <ImgResizer />
                </div>
            </div>
        </div>
    );
}
