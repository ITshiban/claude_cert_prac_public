"""SQLite の読み書き（回答履歴と現在のステータス）。SQL はこのファイルに集約する。"""
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "user.sqlite3"


def connect(path=None):
    conn = sqlite3.connect(path or DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id TEXT NOT NULL,
            selected TEXT NOT NULL,      -- 選んだ key をカンマ区切り（例: "A,C"）
            is_correct INTEGER NOT NULL,
            answered_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS status (
            question_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,        -- correct / incorrect / unanswered
            updated_at TEXT NOT NULL
        );
        -- 利用者のプロフィール（現在は1人分のみ。将来の複数ユーザー対応に備えて分けておく）
        CREATE TABLE IF NOT EXISTS profile (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        """
    )
    return conn


def _now():
    return datetime.now().isoformat(timespec="seconds")


def record_answer(conn, question_id, selected, correct):
    """回答を履歴に追加し、ステータスをその回の結果で更新する。"""
    now = _now()
    with conn:
        conn.execute(
            "INSERT INTO answers (question_id, selected, is_correct, answered_at) VALUES (?, ?, ?, ?)",
            (question_id, ",".join(sorted(selected)), int(correct), now),
        )
        _upsert_status(conn, question_id, "correct" if correct else "incorrect", now)


def set_status(conn, question_id, status):
    """ステータスを手動で変更する。"""
    with conn:
        _upsert_status(conn, question_id, status, _now())


def _upsert_status(conn, question_id, status, now):
    conn.execute(
        "INSERT INTO status (question_id, status, updated_at) VALUES (?, ?, ?) "
        "ON CONFLICT(question_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at",
        (question_id, status, now),
    )


def get_statuses(conn):
    """{question_id: status}。記録のない問題は含まない（呼び出し側で未回答扱い）。"""
    return {r["question_id"]: r["status"] for r in conn.execute("SELECT question_id, status FROM status")}


def get_history(conn):
    rows = conn.execute(
        "SELECT question_id, selected, is_correct, answered_at FROM answers ORDER BY id"
    ).fetchall()
    return [dict(r) for r in rows]


def get_nickname(conn):
    row = conn.execute("SELECT value FROM profile WHERE key = 'nickname'").fetchone()
    return row["value"] if row else ""


def set_nickname(conn, nickname):
    with conn:
        conn.execute(
            "INSERT INTO profile (key, value) VALUES ('nickname', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (nickname,),
        )


def reset(conn):
    """回答履歴とステータスをすべて削除する（ニックネームは残す）。"""
    with conn:
        conn.execute("DELETE FROM answers")
        conn.execute("DELETE FROM status")
