import PdfToJpg from "./components/PdfToJpg";
import PdfToPng from "./components/PdfToPng";
import JpgPngToPdf from "./components/JpgPngToPdf";
import ChangeImg from "./components/ChangeImg";
import ImgResizer from "./components/ImgResizer";
import FeedbackBoard from "./components/FeedbackBoard";


import {useEffect} from "react";

export default function App() {

    const sendLog = async () => {
        try {
            await fetch("/backend/log.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    total_visit: 1,
                    use_pdftojpg: 0,
                    use_pdftopng: 0,
                    use_imgtopdf: 0,
                    use_changeimg: 0,
                    use_imgresizer: 0,
                }),
            }).then(res => res.json())
            .then(data => console.log("🔁 로그 응답:", data))
            .catch(err => console.error("❌ 요청 실패:", err));
            
            sessionStorage.setItem("logSent", "true");
        } catch (error) {
            console.error("로그 저장 실패:", error);
        }
    };
    
    useEffect(() => {
        if (!sessionStorage.getItem("logSent")) {
            sendLog();
        }
    }, []);
    

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>📄Tools : 사내망 전용 문서변환 프로그램</h1>
            <p>PDF문서와 이미지 문서를 안전하고 편하게 변환하세요</p>
            <div style={{display:"flex", justifyContent:"space-around",maxWidth:"1000px",margin:"0 auto"}}>
                <div style={{ display: "flex", flexDirection : "column" ,justifyContent: "center", marginTop: "20px" }}>
                    <div>
                        <h3>PDF → JPG 변환</h3>
                        <PdfToJpg />
                    </div>
                    <div>
                        <h3>PDF → PNG 변환</h3>
                        <PdfToPng />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection : "column" ,justifyContent: "center", marginTop: "20px" }}>
                    <div>
                        <h3>이미지<span style={{fontSize:"12px"}}>(jpg,png)</span> → PDF변환</h3>
                        <JpgPngToPdf />
                    </div>
                    <div>
                        <h3>이미지 확장자<span style={{fontSize:"12px"}}>(jpg ↔ png)</span> 변환</h3>
                        <ChangeImg />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection : "column" ,justifyContent: "top", marginTop: "20px" }}>
                    <div>
                        <h3>이미지 사이즈 조정 <span style={{fontSize:"12px"}}>(jpg, png)</span></h3>
                        <ImgResizer />
                    </div>
                </div>
            </div>
            <FeedbackBoard />
        </div>
    );
}
