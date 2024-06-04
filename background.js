chrome.runtime.onInstalled.addListener(() => {
  console.log("SpamChecker installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkEmail") {
    const results = checkEmailContent(request.emailContent);
    sendResponse({results});
  }
  return true;  // Keep the messaging channel open for sendResponse
});

function checkEmailContent(emailContent) {
  // Define enhanced spam words and compliance rules
  const spamWords = [
    "free", "click here", "subscribe", "buy", "discount",
    "limited time offer", "exclusive deal", "lowest price",
    "save big", "special promotion", "act now", "risk-free",
    "guarantee", "urgent", "don't miss out", "offer", "best price",
    "cheap", "instant", "credit", "bonus"
  ];

  const complianceRules = {
    GDPR: "Does not include explicit consent mechanism.",
    CASL: "Does not include unsubscribe mechanism.",
    CAN_SPAM: "Does not include physical address."
  };

  const personalizationWords = [
    "Hi there", "Dear Customer", "Hello"
  ];

  // Check for spam words and their positions
  const foundSpamWords = [];
  spamWords.forEach(word => {
    let regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(emailContent)) !== null) {
      foundSpamWords.push({ word, index: match.index });
    }
  });

  // Check for compliance issues
  const complianceIssues = [];
  if (!emailContent.toLowerCase().includes("unsubscribe")) complianceIssues.push({ word: "unsubscribe", issue: complianceRules.CASL });
  if (!emailContent.toLowerCase().includes("physical address")) complianceIssues.push({ word: "physical address", issue: complianceRules.CAN_SPAM });
  if (!emailContent.toLowerCase().includes("consent")) complianceIssues.push({ word: "consent", issue: complianceRules.GDPR });

  // Check for personalization issues
  const personalizationIssues = [];
  personalizationWords.forEach(word => {
    let regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(emailContent)) !== null) {
      personalizationIssues.push({ word, index: match.index });
    }
  });

  return {
    spamWords: foundSpamWords,
    complianceIssues: complianceIssues,
    personalizationIssues: personalizationIssues
  };
}
