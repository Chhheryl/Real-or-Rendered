
from flask import Flask, render_template, request, redirect, url_for, session
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'

DATA_PATH = 'data/users.json'

# Ensure user data exists


def load_user_data():
    if not os.path.exists(DATA_PATH):
        with open(DATA_PATH, 'w') as f:
            json.dump({}, f)
    with open(DATA_PATH, 'r') as f:
        return json.load(f)


def save_user_data(data):
    with open(DATA_PATH, 'w') as f:
        json.dump(data, f, indent=2)


@app.route('/')
def home():
    session['start_time'] = str(datetime.now())
    session['answers'] = {}
    return render_template('home.html')


@app.route('/transition')
def transition():
    with open('data/lessons.json') as f:
        lessons = json.load(f)
    return render_template('transition.html', lessons=lessons)


@app.route('/learn/<int:lesson_id>')
def learn(lesson_id):
    with open('data/lessons.json') as f:
        lessons = json.load(f)
    lesson = next((l for l in lessons if l['id'] == lesson_id), None)
    next_id = lesson_id + 1 if lesson_id < len(lessons) else None
    prev_id = lesson_id - 1 if lesson_id > 1 else None

    # Track completed lessons in session
    completed = session.get('completed_lessons', [])
    if lesson_id not in completed:
        completed.append(lesson_id)
        session['completed_lessons'] = completed

    return render_template(
        'learn.html',
        lesson=lesson,
        next_id=next_id,
        prev_id=prev_id,
        lessons=lessons,
        unlocked=len(completed)
    )


@app.route('/quiz/<int:question_id>', methods=['GET', 'POST'])
def quiz(question_id):
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)
    question = next((q for q in quiz_data if q['id'] == question_id), None)

    if request.method == 'POST':
        choice = request.form.get('choice')
        session['answers'][str(question_id)] = choice
        return redirect(url_for('quiz', question_id=question_id + 1) if question_id < len(quiz_data) else url_for('result'))

    return render_template('quiz.html', question=question)


@app.route('/result')
def result():
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)

    score = 0
    answers = session.get('answers', {})
    feedback = []

    for q in quiz_data:
        qid = str(q['id'])
        selected = answers.get(qid)
        correct = q['correct']
        if selected == correct:
            score += 1
        feedback.append({
            'id': qid,
            'selected': selected,
            'correct': correct,
            'related': q['related']
        })

    # Save user session
    data = load_user_data()
    user_id = str(datetime.now().timestamp())
    data[user_id] = {
        'start_time': session.get('start_time'),
        'answers': answers,
        'score': score
    }
    save_user_data(data)

    return render_template('result.html', score=score, feedback=feedback)


if __name__ == '__main__':
    app.run(debug=True, port=5001)
