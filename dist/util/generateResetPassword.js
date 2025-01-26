import crypto from "crypto";
export const generateResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    return { hashedToken, resetTokenExpiry };
};
