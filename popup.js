document.addEventListener('DOMContentLoaded', () => {
  const checkEmailButton = document.getElementById('checkEmail');
  const tips = [
    "Tip: Keep your subject lines clear and concise.",
    "Tip: Personalize your emails to engage your audience.",
    "Tip: Avoid using all caps or too many exclamation marks.",
    "Tip: Include a clear call-to-action in your email.",
    "Tip: Test your email on different devices before sending."
  ];

  document.getElementById('tip').innerText = tips[Math.floor(Math.random() * tips.length)];

  checkEmailButton.addEventListener('click', () => {
    const emailContentDiv = document.getElementById('emailContent');
    const emailContent = emailContentDiv.innerText;  // Use innerText to get plain text without HTML tags
    chrome.runtime.sendMessage({action: "checkEmail", emailContent}, response => {
      highlightContent(emailContentDiv, response.results);
      displayPerformanceScore(response.results);
    });
  });
});

function highlightContent(contentDiv, results) {
  let contentHTML = contentDiv.innerHTML;
  results.spamWords.sort((a, b) => b.index - a.index).forEach(spamWord => {
    const word = spamWord.word;
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    contentHTML = contentHTML.replace(regex, '<span class="highlight-yellow">$1</span>');
  });

  results.complianceIssues.forEach(issue => {
    const regex = new RegExp(`(${issue.word})`, 'gi');
    contentHTML = contentHTML.replace(regex, '<span class="highlight-red">$1</span>');
  });

  results.personalizationIssues.forEach(issue => {
    const regex = new RegExp(`(${issue.word})`, 'gi');
    contentHTML = contentHTML.replace(regex, '<span class="highlight-blue">$1</span>');
  });

  contentDiv.innerHTML = contentHTML;
}

function displayPerformanceScore(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "<h3>Results</h3>";

  let spamScore = results.spamWords.length * 2; // Adjusted scoring
  let complianceScore = results.complianceIssues.length * 15; // Adjusted scoring
  let personalizationScore = results.personalizationIssues.length * 5; // Adjusted scoring
  let totalScore = 100 - (spamScore + complianceScore + personalizationScore);
  totalScore = Math.max(totalScore, 0); // Ensure the score is not negative

  let performanceMessage = "";
  if (totalScore >= 80) {
    performanceMessage = "Good: This email is likely to perform well.";
  } else if (totalScore >= 50) {
    performanceMessage = "Average: This email may perform averagely. Consider reducing spammy words and addressing compliance issues.";
  } else {
    performanceMessage = "Poor: This email is likely to perform poorly due to high spam and compliance issues.";
  }

  const performanceDiv = document.createElement('div');
  performanceDiv.innerHTML = `<strong>Overall Performance Score:</strong> ${totalScore}/100 - ${performanceMessage}<br><strong>Suggestions:</strong> ${getSuggestions(totalScore)}`;
  performanceDiv.style.color = totalScore >= 80 ? "#5cb85c" : totalScore >= 50 ? "#f0ad4e" : "#d9534f";
  resultsDiv.appendChild(performanceDiv);

  createExpandableSection(resultsDiv, 'Spam Words Detected', results.spamWords.map(word => word.word));
  createExpandableSection(resultsDiv, 'Compliance Issues Detected', results.complianceIssues.map(issue => issue.issue));
  createExpandableSection(resultsDiv, 'Personalization Issues Detected', results.personalizationIssues.map(issue => issue.word));
}

function createExpandableSection(parentDiv, title, items) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'expandable';
  sectionDiv.innerHTML = `<div>${title}: ${items.length}<span class="expand-icon">▼</span></div>`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'expandable-content';
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.textContent = item;
    contentDiv.appendChild(itemDiv);
  });

  sectionDiv.appendChild(contentDiv);
  parentDiv.appendChild(sectionDiv);

  sectionDiv.addEventListener('click', () => {
    contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
    sectionDiv.classList.toggle('expanded');
  });

  // Ensure the content is initially hidden
  contentDiv.style.display = 'none';
}

function getSuggestions(score) {
  if (score >= 80) {
    return "Your email looks good! Keep up the good work.";
  } else if (score >= 50) {
    return "Consider reducing the number of spammy words and ensure compliance with regulations.";
  } else {
    return "Reduce the use of spammy words and address compliance issues to improve performance.";
  }
}
