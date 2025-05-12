document.addEventListener("DOMContentLoaded", () => {
  const quizMeta = document.getElementById("quizMeta");
  const correctAnswer = quizMeta.dataset.correct;
  const feedbackCorrect = quizMeta.dataset.feedback;
  const hintWrong = quizMeta.dataset.hint;
  const relatedTopic = quizMeta.dataset.related;
  const topicId = parseInt(quizMeta.dataset.topic);
  const currentQ = parseInt(quizMeta.dataset.current);

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
    e.preventDefault();
    const selectedRadio = document.querySelector('input[name="choice"]:checked');
    if (!selectedRadio) return;

    // Lock choices
    document.querySelectorAll('input[name="choice"]').forEach((r) => {
      r.disabled = true;
    });

    // Clear old feedback
    choiceContainers.forEach((c) => c.classList.remove("correct", "incorrect"));
    correctBubble.style.display = "none";
    hintBar.style.display = "none";

    // Evaluate correctness
    const chosenValue = selectedRadio.value;
    const chosenContainer = document.querySelector(
      `.choice-container[data-choice="${chosenValue}"]`
    );
    const isCorrect = chosenValue === correctAnswer;

    // Show feedback
    if (isCorrect) {
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

    // Hide submit, show next
    document.getElementById("nextRow").style.display = "block";
    document.querySelector(".submit-row").style.display = "none";
  });

  // "Got it" buttons
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

  // NEXT button => re-submit form
  document.getElementById("btnNext").addEventListener("click", () => {
    quizForm.submit();
  });

  // Position bubble
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
      const imgSrc = z.getAttribute("data-img");
      document.getElementById("zoomModalImg").src = imgSrc;
      new bootstrap.Modal(document.getElementById("zoomModal")).show();
    });
  });
});
