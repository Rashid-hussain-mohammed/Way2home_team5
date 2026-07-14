export function getPlaceholderAvatar(gender: string) {
  switch (gender?.toLowerCase()) {
    case "male":
      return "https://img.icons8.com/color/512/user-male-circle.png"; // Blue background
    case "female":
      return "https://img.icons8.com/color/512/user-female-circle.png"; // Pink background
    default:
      return "https://img.icons8.com/color/512/user-male-circle.png"; // Neutral background
  }
};
