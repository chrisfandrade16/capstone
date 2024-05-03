/**
 * Checks the format of an inputted phone number in forms
 * @param raw initial phone number input
 * @returns 7-digit formatted phone string "XXX-XXX-XXXX" or null if input is invalid
 */
export const formatPhoneNum = (raw: string) => {
    let cleaned = raw.replace(/\D/g, "");
    let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return match[1] + "-" + match[2] + "-" + match[3];
    }
    return null;
};
