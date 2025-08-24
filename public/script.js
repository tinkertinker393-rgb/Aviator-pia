// Platform selector and prediction logic
let selectedPlatform = null;
document.addEventListener("DOMContentLoaded", function() {
  const bars = document.querySelectorAll('.platform-bar');
  const predictBtn = document.getElementById('predict-btn');
  const resultDiv = document.getElementById('prediction-result');

  bars.forEach(bar => {
    bar.onclick = () => {
      bars.forEach(b => b.classList.remove('selected'));
      bar.classList.add('selected');
      selectedPlatform = bar.getAttribute('data-platform');
      predictBtn.disabled = false;
      resultDiv.textContent = '';
    };
  });

  if (predictBtn) {
    predictBtn.onclick = () => {
      if (!selectedPlatform) return;
      predictBtn.disabled = true;
      resultDiv.textContent = "Predicting...";
      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          resultDiv.textContent = "Predicted next crash: " + result.value;
        } else {
          resultDiv.textContent = "Error: " + (result.error || "Prediction failed.");
        }
        predictBtn.disabled = false;
      })
      .catch(() => {
        resultDiv.textContent = "Prediction failed (network/server error).";
        predictBtn.disabled = false;
      });
    };
  }
});
