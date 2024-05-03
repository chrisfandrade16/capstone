/**
 * Login tests
 */

import { test, expect } from "@playwright/test";
import { randomInt } from "crypto";

const EMAIL = (user: string) => `${user}@example.com`;
const USER = (role: string) => `${role}_${randomInt(1000)}`;
const HOST_URL = "http://localhost/";
const DEFAULT_USER = USER("customer");

// test.beforeEach(async ({ page }) => {
//     // Runs before each test and signs in each page.
//     await page.goto(`${HOST_URL}auth/login`);
//     await page.getByPlaceholder("username").fill(DEFAULT_USER);
//     await page.getByPlaceholder("password").fill(DEFAULT_USER);
//     await page.getByRole("button", { name: "Sign In" }).click();
//   });


test("Test Register Owner", async ({ page }) => {
    await page.goto(`${HOST_URL}auth/login`);
    await page.getByRole("link", { name: "Sign Up" }).click();

    const username = USER("owner");
    const email = EMAIL(username);
    console.log(`Registering username: ${username} password: ${username} email: ${EMAIL(username)}`)

    // Fill the form
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(username);
    await page.getByLabel("Password", { exact: true }).fill(username);
    await page.getByLabel("Password", { exact: true }).press("Tab");
    await page.getByLabel("Confirm password").fill(username);
    await page.getByLabel("Confirm password").press("Tab");
    await page.getByPlaceholder("firstName").fill("Playwright");
    await page.getByPlaceholder("firstName").press("Tab");
    await page.getByPlaceholder("lastName").fill("User");
    await page.getByPlaceholder("lastName").press("Tab");
    await page.getByPlaceholder("email").fill(email);
    await page.getByPlaceholder("email").press("Tab");
    await page.getByPlaceholder("phone").fill("123-531-1234");
    await page.getByPlaceholder("phone").press("Tab");
    await page.getByRole("combobox", { name: "Account type" }).selectOption("o");
    await page.getByRole("button", { name: "Register" }).click()
    await expect(page).toHaveURL("http://localhost/auth/login", { timeout: 10000 });

    // Ensure the login works
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(username);
    await page.getByPlaceholder("username").press("Tab");
    await page.getByPlaceholder("password").fill(username);
    await page.getByPlaceholder("password").press("Enter");

    //   Ensure login was successful
    await expect(page).toHaveURL("http://localhost/profile", { timeout: 10000 });
    await expect(page.getByPlaceholder(username, { exact: true })).toBeTruthy();
});


test("Test Register Customer", async ({ page }) => {
    await page.goto(`${HOST_URL}auth/login`);
    // await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("link", { name: "Sign Up" }).click();

    const username = USER("customer");
    const email = EMAIL(username);
    console.log(`Registering username: ${username} password: ${username} email: ${EMAIL(username)}`)

    // Fill the form
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(username);
    await page.getByLabel("Password", { exact: true }).fill(username);
    await page.getByLabel("Password", { exact: true }).press("Tab");
    await page.getByLabel("Confirm password").fill(username);
    await page.getByLabel("Confirm password").press("Tab");
    await page.getByPlaceholder("firstName").fill("Playwright");
    await page.getByPlaceholder("firstName").press("Tab");
    await page.getByPlaceholder("lastName").fill("User");
    await page.getByPlaceholder("lastName").press("Tab");
    await page.getByPlaceholder("email").fill(email);
    await page.getByPlaceholder("email").press("Tab");
    await page.getByPlaceholder("phone").fill("123-531-1234");
    await page.getByPlaceholder("phone").press("Tab");
    await page.getByRole("combobox", { name: "Account type" }).selectOption("c");
    await page.getByRole("button", { name: "Register" }).click()
    await expect(page).toHaveURL("http://localhost/auth/login", { timeout: 10000 });

    // Ensure the login works
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(username);
    await page.getByPlaceholder("username").press("Tab");
    await page.getByPlaceholder("password").fill(username);
    await page.getByPlaceholder("password").press("Enter");

    //   Ensure login was successful
    await expect(page).toHaveURL("http://localhost/profile", { timeout: 10000 });
    await expect(page.getByPlaceholder(username, { exact: true })).toBeTruthy();
});