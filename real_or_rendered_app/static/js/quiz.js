// static/js/quiz.js
document.addEventListener("DOMContentLoaded", () => {
  let hasCheckedAnswer = false;

  const quizMeta = document.getElementById("quizMeta");
  const correctAnswer = quizMeta.dataset.correct;
  const feedbackCorrect = quizMeta.dataset.feedback;
  const hintWrong = quizMeta.dataset.hint;
  const relatedTopic = quizMeta.dataset.related;
  const topicId = parseInt(quizMeta.dataset.topic);

  const choiceContainers = document.querySelectorAll(".choice-container");
  const quizForm = document.getElementById("quizForm");
  const correctBubble = document.getElementById("correctBubble");
  const correctBubbleText = document.getElementById("correctBubbleText");
  const hintBar = document.getElementById("hintBar");

  // CHOICE SELECTION UI
  choiceContainers.forEach((container) => {
    const radio = container.querySelector('input[type="radio"]');
    if (radio) {
      radio.addEventListener("change", () => {
        choiceContainers.forEach((c) => c.classList.remove("selected"));
        container.classList.add("selected");
      });
    }
  });

  // SUBMIT HANDLER
  quizForm.addEventListener("submit", (e) => {
    if (!hasCheckedAnswer) {
      e.preventDefault();
      const selectedRadio = document.querySelector('input[name="radio_choice"]:checked');
      if (!selectedRadio) return;

      // Clear old feedback
      choiceContainers.forEach((c) => c.classList.remove("correct", "incorrect"));
      correctBubble.style.display = "none";
      hintBar.style.display = "none";

      // Evaluate and show feedback
      const chosenValue = selectedRadio.value;

      // Lock choices
      document.querySelectorAll('input[name="radio_choice"]').forEach((r) => {
        r.disabled = true;
      });

      const chosenContainer = document.querySelector(`.choice-container[data-choice="${chosenValue}"]`);
      if (chosenValue === correctAnswer) {
        chosenContainer.classList.add("correct");
        correctBubbleText.innerText = feedbackCorrect;
        positionCorrectBubble(chosenContainer);
        correctBubble.style.display = "block";
      } else {
        chosenContainer.classList.add("incorrect");
        document.getElementById("hintText").innerText = hintWrong;
        document.getElementById("hintLink").innerText = relatedTopic;
        document.getElementById("hintLink").href = `/learn/${topicId}`;
        hintBar.style.display = "block";
      }

      // Show Next button
      document.getElementById("nextRow").style.display = "block";
      document.querySelector(".submit-row").style.display = "none";

      hasCheckedAnswer = true;
    }
    // second submit (via Next) will POST normally
  });

  // Next-button handler: re-enable & rename radios so their value goes as "choice"
  document.getElementById("btnNext").addEventListener("click", () => {
    document.querySelectorAll('input[name="radio_choice"]').forEach((r) => {
      r.disabled = false;
      r.name = 'choice';
    });
    quizForm.submit();
  });

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

  // Zoom logic
  document.querySelectorAll(".zoom-text").forEach((z) => {
    z.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("zoomModalImg").src = z.dataset.img;
      new bootstrap.Modal(document.getElementById("zoomModal")).show();
    });
  });
});
