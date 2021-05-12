export const getBorderColorForTranslationForm = (
  isSameAsOriginal,
  isEdited
) => {
  if (isEdited) {
    return "orange";
  }

  if (isSameAsOriginal) {
    return "red";
  }

  return "green";
};

export const getDisplayForTranslationForm = (
  isSameAsOriginal,
  completedHidden,
  display
) => {
  if (completedHidden) {
    if (!isSameAsOriginal) {
      return "none";
    }
  } else if (display === "none") {
    return "flex";
  }
};
