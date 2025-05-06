function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

function showTooltip(tooltipId) {
  const tooltip = document.getElementById(tooltipId);
  if (tooltip) {
    tooltip.style.display = 'block';
  }
}

function hideTooltip(tooltipId) {
  const tooltip = document.getElementById(tooltipId);
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

export { showModal, hideModal, showTooltip, hideTooltip };
