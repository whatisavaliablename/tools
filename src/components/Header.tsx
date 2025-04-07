import styles from "./Header.module.css";

export default function Header() {
  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left} onClick={() => window.location.reload()}>
        <img src="http://10.103.201.115:5102/logo.png" alt="logo" className={styles.logo} />
        <span className={styles.title}>현대백화점 사내망 문서변환 프로그램</span>
      </div>
      <nav className={styles.nav}>
        <button onClick={() => scrollToSection("document-tools")}>문서변환</button>
        <button onClick={() => scrollToSection("feedback-board")}>게시판</button>
      </nav>
    </header>
  );
}
