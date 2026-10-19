import db


def test_record_answer_updates_history_and_status(tmp_path):
    conn = db.connect(tmp_path / "t.sqlite3")
    db.record_answer(conn, "Q001", ["C", "A"], True)
    db.record_answer(conn, "Q001", ["B"], False)
    history = db.get_history(conn)
    assert [(h["question_id"], h["selected"], h["is_correct"]) for h in history] == [
        ("Q001", "A,C", 1),
        ("Q001", "B", 0),
    ]
    assert db.get_statuses(conn) == {"Q001": "incorrect"}


def test_data_persists_after_reconnect(tmp_path):
    path = tmp_path / "t.sqlite3"
    conn = db.connect(path)
    db.record_answer(conn, "Q001", ["A"], True)
    db.set_status(conn, "Q002", "incorrect")
    conn.close()

    conn = db.connect(path)  # アプリ再起動に相当
    assert db.get_statuses(conn) == {"Q001": "correct", "Q002": "incorrect"}
    assert len(db.get_history(conn)) == 1


def test_manual_status_change_and_reset(tmp_path):
    conn = db.connect(tmp_path / "t.sqlite3")
    db.record_answer(conn, "Q001", ["A"], False)
    db.set_status(conn, "Q001", "unanswered")
    assert db.get_statuses(conn) == {"Q001": "unanswered"}
    assert len(db.get_history(conn)) == 1  # 手動変更は履歴を消さない

    db.reset(conn)
    assert db.get_statuses(conn) == {}
    assert db.get_history(conn) == []


def test_nickname_is_saved_and_kept_after_reset(tmp_path):
    path = tmp_path / "t.sqlite3"
    conn = db.connect(path)
    assert db.get_nickname(conn) == ""
    db.set_nickname(conn, "toya")
    db.set_nickname(conn, "とや")  # 上書き
    db.reset(conn)
    conn.close()
    assert db.get_nickname(db.connect(path)) == "とや"
