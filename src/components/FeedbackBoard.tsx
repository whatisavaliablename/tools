import { useState } from "react";
import styles from "./FeedbackBoard.module.css";

interface Feedback {
  id: number;
  author: string;
  content: string;
  password: string;
  votes: number;
}

export default function FeedbackBoard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newEntry, setNewEntry] = useState(false);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const handleAddClick = () => {
    setNewEntry(true);
    setAuthor("");
    setContent("");
    setPassword("");
  };

  const handleSubmit = () => {
    if (!author || !content || !password) {
      alert("모든 입력란을 작성해주세요.");
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now(),
      author,
      content,
      password,
      votes: 0,
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setNewEntry(false);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id);
    setDeletePassword("");
  };

  const confirmDelete = (id: number) => {
    const target = feedbacks.find((f) => f.id === id);
    if (!target) return;

    if (deletePassword === target.password) {
      setFeedbacks(feedbacks.filter((f) => f.id !== id));
      setDeleteTarget(null);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleVote = (id: number) => {
    const key = `voted_${id}`;
    if (sessionStorage.getItem(key)) {
      alert("이미 추천하셨습니다.");
      return;
    }
    sessionStorage.setItem(key, "1");

    setFeedbacks(
      feedbacks.map((f) =>
        f.id === id ? { ...f, votes: f.votes + 1 } : f
      )
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>남기고 싶은 의견이 있으신가요?</h3>

      <button onClick={handleAddClick} className={styles.addButton}>
        ➕ 의견 작성
      </button>

      <div className={styles.board}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>작성자</th>
              <th className={styles.tableCell}>내용</th>
              <th className={styles.tableCell}>기능</th>
            </tr>
          </thead>
          <tbody>
            {newEntry && (
              <tr className={styles.row}>
                <td className={styles.tableCell}>
                  <input
                    maxLength={10}
                    placeholder="작성자"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={styles.input}
                  />
                </td>
                <td className={styles.tableCell}>
                  <input
                    maxLength={50}
                    placeholder="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={styles.input}
                  />
                </td>
                <td className={styles.tableCell}>
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.passwordInput}
                  />
                  <button onClick={handleSubmit} className={styles.submitButton}>
                    등록
                  </button>
                </td>
              </tr>
            )}

            {feedbacks.map((fb) => (
              <tr
                key={fb.id}
                className={styles.row}
                onMouseLeave={() => setDeleteTarget(null)}
              >
                <td className={styles.tableCell}>{fb.author}</td>
                <td className={styles.tableCell}>{fb.content}</td>
                <td className={styles.tableCell} style={{ textAlign: "right" }}>
                  {deleteTarget === fb.id ? (
                    <>
                      <input
                        type="password"
                        placeholder="비밀번호"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className={styles.passwordInput}
                      />
                      <button onClick={() => confirmDelete(fb.id)}>
                        확인
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleVote(fb.id)}
                        className={styles.voteButton}
                      >
                        👍 추천 {fb.votes}
                      </button>
                      <span
                        onClick={() => handleDeleteClick(fb.id)}
                        className={styles.deleteButton}
                      >
                        ⒳
                      </span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
