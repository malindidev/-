// ===============================
// Milestone Road Animation Script
// ===============================

// Add your custom milestone messages here:
const milestones = [
    "Month 1 — Our story began 💗",
    "Month 2 — Our smiles grew brighter",
    "Month 3 — Every moment felt special",
    "Month 4 — Happy Anniversary 💞"
];

// Select the container from index.html
const container = document.querySelector('.milestones');

// Create and insert milestone cards
milestones.forEach((text, index) => {
    const card = document.createElement('div');
    card.className = 'milestone-card';
    card.style.animationDelay = `${index * 3}s`;
    card.textContent = text;
    container.appendChild(card);
});
