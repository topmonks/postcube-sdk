const fs = require("fs");
const path = require("path");
const buildDir = path.join(__dirname, "../build");

require("recursive-readdir")(buildDir, (err, files) => {
  files.forEach((file) => {
    const newFilePath = file.replace(/_/g, "");
    if (file.includes("/_")) {
      fs.rename(file, newFilePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }

    if (
      file.endsWith(".html") ||
      file.endsWith(".css") ||
      file.endsWith(".js")
    ) {
      const content = fs.readFileSync(file, "utf8");
      const newContent = content.replace(
        /_commonjsHelpers/g,
        "commonjsHelpers"
      );
      fs.writeFileSync(file, newContent, "utf8");
    }
  });
});
