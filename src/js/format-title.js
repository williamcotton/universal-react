module.exports = function(defaultTitle, title) {
  return defaultTitle + (title ? " - " + title : "");
};