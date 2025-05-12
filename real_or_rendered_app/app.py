# app.py
from flask import Flask, render_template, request, redirect, url_for, session
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'

DATA_PATH = 'data/users.json'

@app.before_request
def reset_on_start():
    if 'initialized' not in session:
        session.clear()
        session['initialized'] = True

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

@app.route('/transition_learn_quiz')
def transition_learn_quiz():
    return render_template('transition_learn_quiz.html')

@app.route('/quiz/<int:question_id>', methods=['GET', 'POST'])
def quiz(question_id):
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)

    if question_id > len(quiz_data):
        return redirect(url_for('score'))

    question = next((q for q in quiz_data if q['id'] == question_id), None)
    if not question:
        return redirect(url_for('score'))

    if request.method == 'POST':
        choice = request.form.get('choice')
        # pull out, mutate, then reassign so Flask knows to save it
        answers = session.get('answers', {})
        answers[str(question_id)] = choice
        session['answers'] = answers

        if question_id < len(quiz_data):
            return redirect(url_for('quiz', question_id=question_id + 1))
        else:
            return redirect(url_for('score'))

    return render_template('quiz.html', question=question)

@app.route('/score')
def score():
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)

    answers = session.get('answers', {})

    # split normal vs bonus by looking for "Bonus" in the question text
    normal_questions = [q for q in quiz_data if not q['question'].lower().startswith('bonus')]
    bonus_questions = [q for q in quiz_data if     q['question'].lower().startswith('bonus')]

    normal_total    = len(normal_questions)
    bonus_total     = len(bonus_questions)
    normal_correct  = sum(1 for q in normal_questions if answers.get(str(q['id'])) == q['correct'])
    bonus_correct   = sum(1 for q in bonus_questions  if answers.get(str(q['id'])) == q['correct'])

    # compute percent, guard against divide-by-zero
    normal_accuracy = round(normal_correct / normal_total * 100) if normal_total else 0
    bonus_accuracy  = round(bonus_correct  / bonus_total  * 100) if bonus_total  else 0

    # still log into users.json as before
    data    = load_user_data()
    user_id = str(datetime.now().timestamp())
    data[user_id] = {
      'start_time'   : session.get('start_time'),
      'answers'      : answers,
      'score'        : normal_correct + bonus_correct
    }
    save_user_data(data)

    return render_template(
      'score.html',
      normal_correct=normal_correct,
      normal_total=normal_total,
      normal_accuracy=normal_accuracy,
      bonus_correct=bonus_correct,
      bonus_total=bonus_total,
      bonus_accuracy=bonus_accuracy
    )


if __name__ == '__main__':
    app.run(debug=True, port=5001)
