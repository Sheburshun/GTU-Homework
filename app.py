import sqlite3
from datetime import date
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def get_db():
    db = sqlite3.connect('tasks.db')
    db.row_factory = sqlite3.Row
    return db


def create_table():
    db = get_db()
    db.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        deadline TEXT,
        semester INTEGER NOT NULL,
        completed INTEGER DEFAULT 0
    )''')
    db.commit()
    db.close()


def check_task(data):
    if not isinstance(data, dict):
        return 'Invalid task data'
    title = data.get('title', '')
    description = data.get('description', '')
    deadline = data.get('deadline')
    semester = data.get('semester')

    if not isinstance(title, str) or not 1 <= len(title.strip()) <= 128:
        return 'Title must be between 1 and 128 characters'
    if not isinstance(description, str) or len(description.strip()) > 500:
        return 'Description must be 500 characters or less'
    if type(semester) != int or semester not in [1, 2]:
        return 'Choose first or second semester'
    if deadline:
        try:
            if not isinstance(deadline, str) or date.fromisoformat(deadline).isoformat() != deadline:
                return 'Invalid deadline'
        except ValueError:
            return 'Invalid deadline'
    elif deadline is not None and deadline != '':
        return 'Invalid deadline'
    return None


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    db = get_db()
    tasks = db.execute('SELECT * FROM tasks ORDER BY semester, id DESC').fetchall()
    result = [dict(task) for task in tasks]
    db.close()
    return jsonify(result)


@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json(silent=True)
    error = check_task(data)
    if error:
        return jsonify({'error': error}), 400

    db = get_db()
    db.execute('INSERT INTO tasks (title, description, deadline, semester) VALUES (?, ?, ?, ?)',
               (data['title'].strip(), data.get('description', '').strip(), data.get('deadline') or None, data['semester']))
    db.commit()
    db.close()
    return jsonify({'message': 'Task added'}), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    data = request.get_json(silent=True)
    error = check_task(data)
    if error:
        return jsonify({'error': error}), 400

    db = get_db()
    result = db.execute('UPDATE tasks SET title=?, description=?, deadline=?, semester=? WHERE id=?',
                        (data['title'].strip(), data.get('description', '').strip(), data.get('deadline') or None, data['semester'], task_id))
    db.commit()
    found = result.rowcount
    db.close()
    if not found:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({'message': 'Task updated'})


@app.route('/api/tasks/<int:task_id>/status', methods=['PATCH'])
def change_status(task_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or type(data.get('completed')) != bool:
        return jsonify({'error': 'Invalid status'}), 400

    db = get_db()
    result = db.execute('UPDATE tasks SET completed=? WHERE id=?', (int(data['completed']), task_id))
    db.commit()
    found = result.rowcount
    db.close()
    if not found:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({'message': 'Status changed'})


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    db = get_db()
    result = db.execute('DELETE FROM tasks WHERE id=?', (task_id,))
    db.commit()
    found = result.rowcount
    db.close()
    if not found:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({'message': 'Task deleted'})


if __name__ == '__main__':
    create_table()
    app.run(debug=True)
