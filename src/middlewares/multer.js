import multer from "multer";

const storage = multer.memoryStorage(); // Files will be in req.file.buffer

const upload = multer({ storage });

export default upload;
