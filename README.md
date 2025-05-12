# 🖼️ Real or Rendered?

**Real or Rendered?** is an interactive educational web app that teaches users how to spot the difference between AI-generated and human-created artworks using visual clues, zoom-ins, and quizzes.

---

## 🔍 Features

- **Five learning categories**: Anatomy, Lighting, Texture, Symmetry, and Symbolism
- **Interactive visual cues**: Hover hotspots with zoomed-in comparisons
- **Engaging quiz mode**: Test your knowledge with instant feedback and explanations
- **Track progress**: Quiz answers saved between pages and a final score shown
- **Replayable**: Users can reset their answers and try again anytime

---

## 🚀 Getting Started Locally

### ✅ Prerequisites

- Python 3.x
- `pip` package installer

---

### 📦 Installation

1. **Clone this repository**:

```bash
git clone https://github.com/your-username/real-or-rendered.git
cd real-or-rendered
```

2. **(Optional) Create and activate a virtual environment**:

```bash
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate       # Windows
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

If you don’t have a `requirements.txt`, simply run:

```bash
pip install flask
```

---

### ▶️ Run the App

From the root project folder:

```bash
python app.py
```

Open your browser and navigate to:

```
http://127.0.0.1:5001
```

---

## 📁 Project Structure

```
real-or-rendered/
├── static/
│   ├── css/style.css
│   ├── js/quiz.js
│   └── images/
├── templates/
│   ├── base.html
│   ├── home.html
│   ├── learn.html
│   ├── quiz.html
│   ├── result.html
│   └── nav-bar.html
├── data/
│   ├── lessons.json
│   ├── quiz.json
│   └── users.json
├── app.py
├── requirements.txt
└── README.md
```

---

## 📌 Notes

- User answers are stored in `users.json` at the end of each quiz
- Clicking **“Try it Again”** clears all prior answers
- Works entirely in-browser with Flask and vanilla JS — no external DB needed

---

## 🧠 Authors & Credits

Developed by Cheryl Yan & Yolanda Zhu.  
Framework: Flask • Frontend: Bootstrap + custom CSS

---

## 📜 License

This project is for educational and demonstration purposes only.
