import multer from "multer";
import path from "path";

const sanitizeFileName = (name: string) => {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const safeName = sanitizeFileName(name);
    cb(null, `${Date.now()}_${safeName}${ext}`);
  },
});

export const upload = multer({ storage });
