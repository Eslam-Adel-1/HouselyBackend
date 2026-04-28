export const cloudinaryPublicId = (url) => {
  // Extract public_id from the URL
  // Example: https://res.cloudinary.com/.../v1234567/housely/chat/image_name.jpg
  // publicId would be: housely/chat/image_name
  const publicId = url.split("/").slice(-3).join("/").split(".")[0];
  return publicId;
};
