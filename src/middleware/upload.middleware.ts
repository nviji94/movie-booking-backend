import multer from "multer";
import path from "path";
import fs from "fs";

const sanitizeFileName = (name: string) => {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
};

// Absolute path to uploads folder
const uploadDir = path.join(__dirname, "../uploads");

// Ensure the uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const safeName = sanitizeFileName(name);
    cb(null, `${Date.now()}_${safeName}${ext}`);
  },
});

export const upload = multer({ storage });
