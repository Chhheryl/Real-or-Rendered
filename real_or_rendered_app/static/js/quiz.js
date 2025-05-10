/**
 * quiz.js
 * Handles all quiz functionality: selection, submission, feedback, zoom, and navigation
 * also includes persistent progress tracking with localStorage
 */

 document.addEventListener("DOMContentLoaded", () => {
    // === GET QUIZ METADATA ===
    const quizMeta = document.getElementById("quizMeta");
    const correctAnswer = quizMeta.dataset.correct;
    const feedbackCorrect = quizMeta.dataset.feedback;
    const hintWrong = quizMeta.dataset.hint;
    const relatedTopic = quizMeta.dataset.related;
    const currentQ = parseInt(quizMeta.dataset.current);
    const topicId = parseInt(quizMeta.dataset.topic);
  
    const choiceContainers = document.querySelectorAll(".choice-container");
    const quizForm = document.getElementById("quizForm");
    const correctBubble = document.getElementById("correctBubble");
    const correctBubbleText = document.getElementById("correctBubbleText");
    const hintBar = document.getElementById("hintBar");
  
    // === RESTORE PRIOR SUBMISSION IF EXISTS ===
    const savedAnswers = JSON.parse(localStorage.getItem("quizAnswers") || "{}");
    const saved = savedAnswers[currentQ];
  
    if (saved) {
      // Pre-check the selected option
      const selectedContainer = document.querySelector(
        `.choice-container[data-choice="${saved.choice}"]`
      );
      if (selectedContainer) {
        selectedContainer.classList.add(saved.correct ? "correct" : "incorrect");
        selectedContainer
          .querySelector('input[type="radio"]')
          .setAttribute("checked", "true");
  
        // Lock all radios
        document
          .querySelectorAll('input[name="choice"]')
          .forEach((r) => (r.disabled = true));
  
        // Show correct or hint UI
        if (saved.correct) {
          positionCorrectBubble(selectedContainer);
          correctBubbleText.innerText = feedbackCorrect;
          correctBubble.style.display = "block";
        } else {
          document.getElementById("hintText").innerText = hintWrong;
          document.getElementById("hintLink").innerText = relatedTopic;
          document.getElementById("hintLink").href = `/learn/${topicId}`;
          hintBar.style.display = "block";
        }
  
        // Show next button and hide submit
        document.getElementById("nextRow").style.display = "block";
        document.querySelector(".submit-row").style.display = "none";
      }
    }
  
    // === CHOICE HIGHLIGHTING ===
    choiceContainers.forEach((container) => {
      const radio = container.querySelector('input[type="radio"]');
      if (radio) {
        radio.addEventListener("change", () => {
          choiceContainers.forEach((c) => c.classList.remove("selected"));
          container.classList.add("selected");
        });
      }
    });
  
    // === SUBMISSION HANDLER ===
    quizForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const selectedRadio = document.querySelector(
        'input[name="choice"]:checked'
      );
      if (!selectedRadio) return;
  
      const chosenValue = selectedRadio.value;
      const chosenContainer = document.querySelector(
        `.choice-container[data-choice="${chosenValue}"]`
      );
  
      // Lock answers
      document.querySelectorAll('input[name="choice"]').forEach((r) => {
        r.disabled = true;
      });
  
      // Remove old highlights
      choiceContainers.forEach((c) =>
        c.classList.remove("correct", "incorrect")
      );
      correctBubble.style.display = "none";
      hintBar.style.display = "none";
  
      // Save the result
      const isCorrect = chosenValue === correctAnswer;
      savedAnswers[currentQ] = {
        choice: chosenValue,
        correct: isCorrect,
      };
      localStorage.setItem("quizAnswers", JSON.stringify(savedAnswers));
  
      // Show feedback
      if (isCorrect) {
        chosenContainer.classList.remove("selected");
        chosenContainer.classList.add("correct");
        positionCorrectBubble(chosenContainer);
        correctBubbleText.innerText = feedbackCorrect;
        correctBubble.style.display = "block";
      } else {
        chosenContainer.classList.remove("selected");
        chosenContainer.classList.add("incorrect");
        document.getElementById("hintText").innerText = hintWrong;
        document.getElementById("hintLink").innerText = relatedTopic;
        document.getElementById("hintLink").href = `/learn/${topicId}`;
        hintBar.style.display = "block";
      }
  
      // Hide submit + show next
      document.getElementById("nextRow").style.display = "block";
      document.querySelector(".submit-row").style.display = "none";
    });
  
    // === POSITION FEEDBACK BUBBLE ===
    function positionCorrectBubble(container) {
      const rect = container.getBoundingClientRect();
      const bubbleRect = correctBubble.getBoundingClientRect();
      const pageMid = window.innerWidth / 2;
      const containerCenter = rect.left + rect.width / 2;
      let topPos = rect.top + window.scrollY + 30;
      let leftPos =
        containerCenter < pageMid
          ? rect.right + window.scrollX + 10
          : rect.left + window.scrollX - bubbleRect.width - 10;
  
      correctBubble.style.top = `${topPos}px`;
      correctBubble.style.left = `${leftPos}px`;
    }
  
    // === “GOT IT” BUTTONS ===
    document.getElementById("btnBubbleGotIt").addEventListener("click", () => {
      correctBubble.style.display = "none";
      document.getElementById("nextRow").style.display = "block";
      document.querySelector(".submit-row").style.display = "none";
    });
  
    document.getElementById("btnHintGotIt").addEventListener("click", () => {
      hintBar.style.display = "none";
      document.getElementById("nextRow").style.display = "block";
      document.querySelector(".submit-row").style.display = "none";
    });
  
    // === NEXT BUTTON ===
    document.getElementById("btnNext").addEventListener("click", () => {
      sessionStorage.setItem("suppressFeedback", "true");
      const nextQ = currentQ + 1;
      window.location.href = `/quiz/${nextQ}`;
    });
  
    // === ZOOM MODAL ===
    document.querySelectorAll(".zoom-text").forEach((z) => {
      z.addEventListener("click", (e) => {
        e.preventDefault();
        const imgSrc = z.getAttribute("data-img");
        document.getElementById("zoomModalImg").src = imgSrc;
        new bootstrap.Modal(document.getElementById("zoomModal")).show();
      });
    });
  });
  