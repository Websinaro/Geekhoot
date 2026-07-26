import express from "express";
import * as orderController from "../controllers/order.controller";

const router = express.Router();

// No `protect` here on purpose — this is the link opened from a WhatsApp
// message on a phone with no active session. It's secured by the token
// being an unguessable random string rather than by login.
router.get("/:token/download", orderController.downloadInvoiceFile);

export default router;
