/**
 * quiz.js
 * Handles all quiz functionality: selection, submission, feedback, zoom, and navigation
 */

 document.addEventListener("DOMContentLoaded", () => {
    // Load dynamic values from HTML data attributes
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
  
    correctBubble.style.display = "none";
    hintBar.style.display = "none";
  
    // 1. Radio button selection styling
    choiceContainers.forEach((container) => {
      const radio = container.querySelector('input[type="radio"]');
      if (radio) {
        radio.addEventListener("change", () => {
          choiceContainers.forEach((c) => c.classList.remove("selected"));
          container.classList.add("selected");
        });
      }
    });
  
    // 2. On Submit
    quizForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const selectedRadio = document.querySelector(
        'input[name="choice"]:checked'
      );
      if (!selectedRadio) return;
  
      const chosenValue = selectedRadio.value;
      const chosenContainer = document.querySelector(
        '.choice-container[data-choice="' + chosenValue + '"]'
      );
  
      // Lock answers
      document.querySelectorAll('input[name="choice"]').forEach((r) => {
        r.disabled = true;
      });
  
      // Reset feedback state
      choiceContainers.forEach((c) =>
        c.classList.remove("correct", "incorrect")
      );
      correctBubble.style.display = "none";
      hintBar.style.display = "none";
  
      // Mark correct container
      const correctContainer = document.querySelector(
        '.choice-container[data-choice="' + correctAnswer + '"]'
      );
      if (correctContainer) {
        correctContainer.classList.add("correct");
      }
  
      if (chosenValue === correctAnswer) {
        chosenContainer.classList.remove("selected");
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
    });
  
    // 3. Position correct feedback bubble
    function positionCorrectBubble(container) {
      const rect = container.getBoundingClientRect();
      const bubbleRect = correctBubble.getBoundingClientRect();
      const pageMid = window.innerWidth / 2;
      const containerCenter = rect.left + rect.width / 2;
  
      let topPos = rect.top + window.scrollY + 30;
      let leftPos;
  
      if (containerCenter < pageMid) {
        correctBubble.classList.remove("arrow-right");
        leftPos = rect.right + window.scrollX + 10;
      } else {
        correctBubble.classList.add("arrow-right");
        leftPos = rect.left + window.scrollX - bubbleRect.width - 10;
      }
  
      correctBubble.style.top = `${topPos}px`;
      correctBubble.style.left = `${leftPos}px`;
    }
  
    // 4. Got It buttons — hide feedback, show Next
    document
      .getElementById("btnBubbleGotIt")
      .addEventListener("click", () => {
        correctBubble.style.display = "none";
        document.getElementById("nextRow").style.display = "block";
        document.querySelector(".submit-row").style.display = "none";
      });
  
    document.getElementById("btnHintGotIt").addEventListener("click", () => {
      hintBar.style.display = "none";
      document.getElementById("nextRow").style.display = "block";
      document.querySelector(".submit-row").style.display = "none";
    });
  
    // 5. Next Question
    document.getElementById("btnNext").addEventListener("click", () => {
      const nextQ = currentQ + 1;
      window.location.href = `/quiz/${nextQ}`;
    });
  
    // 6. Zoom modal logic
    document.querySelectorAll(".zoom-text").forEach((z) => {
      z.addEventListener("click", (e) => {
        e.preventDefault();
        const imgSrc = z.getAttribute("data-img");
        document.getElementById("zoomModalImg").src = imgSrc;
        new bootstrap.Modal(document.getElementById("zoomModal")).show();
      });
    });
  });
  