import { test, expect } from '@playwright/test';

const PageAddress = 'https://gdsd-new.norwayeast.cloudapp.azure.com/';
// const PageAddress = 'http://localhost:3000/';

test('Signup - Login - Student', async ({ page }) => {
    await page.goto(PageAddress);
  
    const StudentUserEmail = "johndoe4@informatik.hs-fulda.de";
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Way2Home');
    await page.click('a:text("Register")'); // Using text selector
    await page.click('button:text("Sign Up")'); // Using text selector

    // Fill out the form fields
    await page.fill('input#firstName', 'John'); 
    await page.fill('input#lastName', 'Doe');
    await page.fill('input#email', StudentUserEmail); 
    await page.selectOption('select#gender', 'Female');
    await page.selectOption('select[name="role"]', 'Student'); 
    await page.type('input#birthDate', '01/01/1990'); 
    await page.fill('input#phone', '1234567890'); 
    await page.fill('input#password', 'click123'); 
    await page.fill('input#confirmPassword', 'click123'); 
    await page.fill('textarea#about', 'About me'); 

    // Click the Sign Up button
    await page.click('button[type="submit"]');

    await page.waitForLoadState('networkidle');

    // Fill out the form fields
    await page.fill('input#email', StudentUserEmail); 
    await page.fill('input#password', 'click123'); 

    // Click the Login button
    await page.click('button[type="submit"]');

    //Wait for navigation or next step
    await page.waitForLoadState('networkidle');

  
  });
  

  test('Signup Landlord, Login', async ({ page }) => {
    await page.goto(PageAddress);
  
    const LandlordUserEmail = "johndoelandlord5@gmail.com";
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Way2Home');
    await page.click('a:text("Register")'); // Using text selector

    //Signup Flow
    await page.click('button:text("Sign Up")'); // Using text selector
    // Fill out the form fields
    await page.fill('input#firstName', 'John'); 
    await page.fill('input#lastName', 'Doe Landlord');
    await page.fill('input#email', LandlordUserEmail); 
    await page.selectOption('select#gender', 'Male');
    await page.selectOption('select[name="role"]', 'Landlord'); 
    await page.type('input#birthDate', '01/01/1990'); 
    await page.fill('input#phone', '1234567890'); 
    await page.fill('input#password', 'click123'); 
    await page.fill('input#confirmPassword', 'click123'); 
    await page.fill('textarea#about', 'I am a landlord in the Fulda Area. I have many Properties for rent.'); 
    // Click the Sign Up button
    await page.click('button[type="submit"]');

    //Login Flow
    // Fill out the form fields
    await page.fill('input#email', LandlordUserEmail); 
    await page.fill('input#password', 'click123'); 
    // Click the Login button
    await page.click('button[type="submit"]');

});


test('Landlord Login, Create Property', async ({ page }) => {
    await page.goto(PageAddress);
  
    const LandlordUserEmail = "landlord@gmail.com";
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Way2Home');
    await page.click('a:text("Register")'); // Using text selector
;

    //Login Flow
    // Fill out the form fields
    await page.fill('input#email', LandlordUserEmail); 
    await page.fill('input#password', 'click123'); 
    // Click the Login button
    await page.click('button[type="submit"]');
    //Wait for navigation or next step
    await page.waitForLoadState('networkidle');

    //Create Property Flow
    await page.click('a[href="/add-listing"]');
    await page.waitForLoadState('networkidle');
    // Fill in text fields
    await page.fill('input[name="name"]', 'Test Apartment');
    await page.fill('input[name="location"]', 'Berlin, Germany');
    await page.fill('textarea[name="description"]', 'A beautiful apartment in the city center.');
    // Upload a file 
    const filePath = 'apps/backend/public/profiles/images/propertyimage.jpg'; 
    await page.setInputFiles('input[type="file"]', filePath);
    // Select type from dropdown
    await page.selectOption('select[name="type"]', 'Apartment');
    // Fill in numeric fields
    await page.fill('input[name="size"]', '75');
    await page.fill('#coldRent', '1200');
    await page.fill('input[name="deposit"]', '2400');
    await page.fill('#additionalCosts', '200');
    // Set dates
    await page.fill('#availabilityFrom', '2025-03-01');
    await page.fill('#availabilityTo', '2025-12-31');
    // Handle the pets allowed field (assuming it's a checkbox)
    await page.check('#arePetsAllowed');
    // Submit the form
    await page.click('button[type="submit"]');

    //Wait for navigation or next step
    await page.pause();


});

    
  
