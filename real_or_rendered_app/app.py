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
    # Just an example "overview" page
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

@app.route('/transition_learn_quiz')
def transition_learn_quiz():
    return render_template('transition_learn_quiz.html')

@app.route('/quiz/<int:question_id>', methods=['GET', 'POST'])
def quiz(question_id):
    # Load the quiz data
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)

    # If user tries /quiz/6 or more, redirect to score
    if question_id > len(quiz_data):
        return redirect(url_for('score'))

    # Attempt to find the question object by ID
    question = next((q for q in quiz_data if q['id'] == question_id), None)
    if not question:
        # If no question found (e.g. ID mismatch), also go to score or 404
        return redirect(url_for('score'))

    if request.method == 'POST':
        choice = request.form.get('choice')
        session['answers'][str(question_id)] = choice

        # If question_id < total, go to next; else go to /score
        if question_id < len(quiz_data):
            return redirect(url_for('quiz', question_id=question_id + 1))
        else:
            return redirect(url_for('score'))

    return render_template('quiz.html', question=question)

@app.route('/score')
def score():
    # Show final results after question #5
    with open('data/quiz.json') as f:
        quiz_data = json.load(f)

    answers = session.get('answers', {})
    total_questions = len(quiz_data)  # e.g. 5

    score_value = 0
    feedback = []

    for q in quiz_data:
        qid = str(q['id'])
        user_choice = answers.get(qid)
        if user_choice == q['correct']:
            score_value += 1
        feedback.append({
            'id': qid,
            'selected': user_choice,
            'correct': q['correct'],
            'related': q['related']
        })

    # Save user data
    data = load_user_data()
    user_id = str(datetime.now().timestamp())
    data[user_id] = {
        'start_time': session.get('start_time'),
        'answers': answers,
        'score': score_value
    }
    save_user_data(data)

    return render_template(
        'score.html',
        score=score_value,
        total=total_questions,
        feedback=feedback
    )

if __name__ == '__main__':
    app.run(debug=True, port=5001)
