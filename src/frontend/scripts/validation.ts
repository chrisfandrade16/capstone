/**
 * Checks for email validity in registration form
 * @param email the user-inputted email address to validate
 * @returns boolean value of email's validity
 */
export const isEmailValid = (email: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

/**
 * Checks for phone number validity in registration form
 * @param phone the user-inputted phone number to validate
 * @returns boolean value of phone number's validity
 */
export const isPhoneValid = (phone: string) => {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
}